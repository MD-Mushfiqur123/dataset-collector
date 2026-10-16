"""
Zero-Dependency Swiss Minimalist Dataset Collector Server
Author: Md. Mushfiqur Rahim & L
Workspace: projects/dataset_collector/server.py

Port: 7860
Serves:
1. Swiss Minimalist Ingestion UI
2. 4 Domains with Single Master Meta-Prompts
3. 83% Duplicate Gatekeeper
4. 1 GB Disk Buffer Watchdog & Auto-Pusher (GitHub CLI)
5. Central Registry Ledger
"""

import os
import sys
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from pathlib import Path
from datetime import datetime

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

# Windows UTF-8 stdout
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).parent.parent.parent
PROJECT_DIR = Path(__file__).parent
UI_DIR = PROJECT_DIR / "ui"

# Add core to sys.path
sys.path.insert(0, str(PROJECT_DIR))
from core.domains import DOMAINS, list_domains
from core.gatekeeper import DuplicateGatekeeper
from core.pusher import ShardPusher
from core.registry import DatasetRegistry

# Initialize Engines
gatekeeper = DuplicateGatekeeper(PROJECT_DIR / "data")
pusher = ShardPusher(PROJECT_DIR)
registry = DatasetRegistry(PROJECT_DIR)

import re

def auto_split_ai_output(raw_text: str) -> dict:
    """Intelligently splits raw AI output into Prompt, <think> Reasoning, and Final Solution."""
    raw_text = raw_text.strip()
    if not raw_text:
        return {"prompt": "", "reasoning": "", "response": ""}

    # 1. Standard <think>...</think>
    think_match = re.search(r"<think>([\s\S]*?)</think>", raw_text, re.IGNORECASE)
    if think_match:
        reasoning = think_match.group(1).strip()
        before_think = raw_text[:think_match.start()].strip()
        after_think = raw_text[think_match.end():].strip()
        return {
            "prompt": before_think or "পদার্থবিজ্ঞান/গণিত/রসায়ন/জীববিজ্ঞান সমস্যা",
            "reasoning": reasoning,
            "response": after_think
        }

    # 2. Unclosed <think>
    unclosed = re.search(r"<think>([\s\S]*)", raw_text, re.IGNORECASE)
    if unclosed:
        before = raw_text[:unclosed.start()].strip()
        rest = unclosed.group(1).strip()
        sol_match = re.search(r"(?:##\s*(?:Solution|সমাধান|উত্তর|Final Solution)[\s\S]*)", rest, re.IGNORECASE)
        if sol_match:
            reasoning = rest[:sol_match.start()].strip()
            response = sol_match.group(0).strip()
        else:
            reasoning = rest
            response = rest
        return {
            "prompt": before or "পদার্থবিজ্ঞান/গণিত/রসায়ন/জীববিজ্ঞান সমস্যা",
            "reasoning": reasoning,
            "response": response
        }

    # 3. Fallback: Split leading question from answer
    parts = raw_text.split("\n\n", 1)
    if len(parts) == 2:
        return {
            "prompt": parts[0].strip(),
            "reasoning": "",
            "response": parts[1].strip()
        }

    return {
        "prompt": "সমস্যা / প্রশ্ন",
        "reasoning": "",
        "response": raw_text
    }

class CollectorHTTPHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Clean logging
        pass

    def _send_json(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_file(self, file_path: Path, content_type: str):
        try:
            resolved = file_path.resolve()
            if not resolved.is_relative_to(PROJECT_DIR.resolve()) or not resolved.is_file():
                self.send_error(404, "File Not Found")
                return
            with open(resolved, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(content)
        except Exception:
            self.send_error(500, "Internal Server Error")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/index.html"]:
            self._serve_file(UI_DIR / "index.html", "text/html; charset=utf-8")
        elif path == "/style.css":
            self._serve_file(UI_DIR / "style.css", "text/css; charset=utf-8")
        elif path == "/app.js":
            self._serve_file(UI_DIR / "app.js", "application/javascript; charset=utf-8")
        elif path == "/api/domains":
            self._send_json(200, DOMAINS)
        elif path == "/api/stats":
            telemetry = pusher.get_telemetry()
            reg_summary = registry.get_summary()
            
            telemetry["max_mb"] = 1024.0
            telemetry["recent_shards"] = reg_summary.get("shards", [])[-5:]
            telemetry["gatekeeper_stats"] = gatekeeper.get_stats()
            self._send_json(200, telemetry)
        elif path == "/api/registry":
            self._send_json(200, registry.get_summary())
        elif path == "/api/github_config":
            self._send_json(200, {
                "username": pusher.get_github_identity(),
                "repo": pusher.state.get("github_repo", "Dataset"),
                "has_token": bool(pusher.state.get("github_token"))
            })
        elif path == "/api/download_zip":
            import zipfile
            import io
            zip_buffer = io.BytesIO()
            shards = list(pusher.shards_dir.glob("*.jsonl.gz"))
            raw_buffers = list(pusher.buffer_dir.glob("*.jsonl"))

            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
                for s in shards:
                    zf.write(s, arcname=f"shards/{s.name}")
                for b in raw_buffers:
                    zf.write(b, arcname=f"buffer/{b.name}")
                registry_file = PROJECT_DIR / "data" / "registry.json"
                if registry_file.exists():
                    zf.write(registry_file, arcname="registry.json")

            zip_data = zip_buffer.getvalue()
            filename = f"mushfiqur_scientific_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
            self.send_response(200)
            self.send_header("Content-Type", "application/zip")
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            self.send_header("Content-Length", str(len(zip_data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(zip_data)
        else:
            self.send_error(404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        # Enforce Payload Size Limit (Max 10 MB) & Parse Content-Length Safely
        content_len_header = self.headers.get("Content-Length")
        try:
            length = int(content_len_header) if content_len_header is not None else 0
        except (ValueError, TypeError):
            self._send_json(400, {"success": False, "message": "Malformed Content-Length header."})
            return

        if length < 0:
            self._send_json(400, {"success": False, "message": "Negative Content-Length is not permitted."})
            return

        MAX_PAYLOAD_SIZE = 10 * 1024 * 1024  # 10 MB
        if length > MAX_PAYLOAD_SIZE:
            self._send_json(413, {
                "success": False,
                "message": f"Payload size ({length} bytes) exceeds maximum allowable limit of {MAX_PAYLOAD_SIZE} bytes."
            })
            return

        body_bytes = self.rfile.read(length) if length > 0 else b""

        try:
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            body = {}

        if path == "/api/auto_split":
            raw_text = body.get("raw_text", "")
            if len(raw_text) > 500000:  # 500KB cap for auto-split
                raw_text = raw_text[:500000]
            parsed = auto_split_ai_output(raw_text)
            self._send_json(200, parsed)

        elif path == "/api/check_similarity":
            text = body.get("text", "")
            if len(text) > 100000:
                text = text[:100000]
            allowed, max_sim, matched_id = gatekeeper.check_similarity(text)
            self._send_json(200, {
                "allowed": allowed,
                "similarity": max_sim,
                "matched_id": matched_id
            })

        elif path == "/api/submit":
            domain = body.get("domain", "physics")
            # Strict Domain Whitelist Validation: Prevents path traversal & stored XSS
            if not isinstance(domain, str) or domain not in DOMAINS:
                self._send_json(400, {
                    "success": False,
                    "message": f"Invalid domain '{domain}'. Allowed domains are: {list(DOMAINS.keys())}"
                })
                return

            mode = body.get("mode", "cot")
            prompt = body.get("prompt", "").strip()
            reasoning = body.get("reasoning", "").strip()
            response = body.get("response", "").strip()
            raw_text = body.get("raw_text", "").strip()

            if raw_text and not response:
                parsed = auto_split_ai_output(raw_text)
                prompt = parsed.get("prompt", "")
                reasoning = parsed.get("reasoning", "")
                response = parsed.get("response", "")

            if not response:
                self._send_json(400, {"success": False, "message": "Response content cannot be empty."})
                return

            full_text = f"{prompt} {reasoning} {response}".strip()

            # 🛡️ Step 1: 83% Duplicate Gatekeeper Check
            allowed, max_sim, matched_id = gatekeeper.check_similarity(full_text)
            if not allowed:
                sim_pct = round(max_sim * 100, 1)
                self._send_json(400, {
                    "success": False,
                    "message": f"Declined by Gatekeeper: Content is {sim_pct}% similar to existing record ({matched_id}). Exceeds 83% threshold!",
                    "similarity": max_sim
                })
                return

            # Compute words and tokens
            total_words = len(full_text.split())
            est_tokens = int(total_words * 1.35)
            sample_id = f"mushfiqur_{domain}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:21]}"

            sample_record = {
                "id": sample_id,
                "domain": domain,
                "mode": mode,
                "prompt": prompt,
                "reasoning": reasoning,
                "response": response,
                "words": total_words,
                "tokens": est_tokens,
                "timestamp": datetime.now().isoformat()
            }

            # 🛡️ Step 2: Register in Gatekeeper Signatures
            gatekeeper.register_sample(sample_id, full_text, domain)

            # 🛡️ Step 3: Append to Shard Pusher Buffer (100% Offline Local Vault)
            buffer_status = pusher.append_sample(sample_record)

            msg = "Record validated (<83% similarity) and saved to local S1 buffer."
            if buffer_status.get("compressed_now"):
                msg = "S1 hit 1 GB limit! Auto-compressed into S2 vault (.jsonl.gz) and purged raw buffer to save disk."

            self._send_json(200, {
                "success": True,
                "sample_id": sample_id,
                "domain": domain,
                "tokens": est_tokens,
                "buffer_status": buffer_status,
                "message": msg
            })

        elif path == "/api/sync":
            # Manual Force Push Trigger
            push_result = pusher.push_to_github()
            self._send_json(200, push_result)

        elif path == "/api/github_config":
            username = body.get("username", "")
            repo = body.get("repo", "Dataset")
            token = body.get("token", "")
            res = pusher.set_github_config(username=username, repo=repo, token=token)
            status_code = 200 if res.get("success") else 400
            self._send_json(status_code, res)

        elif path == "/api/github_autodetect":
            res = pusher.autodetect_github_cli()
            status_code = 200 if res.get("success") else 400
            self._send_json(status_code, res)

        elif path == "/api/compress_now":
            shards = pusher.compress_buffer_to_shards()
            telemetry = pusher.get_telemetry()
            self._send_json(200, {
                "success": True,
                "message": f"Successfully compressed buffer into {len(shards)} shard(s) and pruned raw buffer files!",
                "shards_created": len(shards),
                "telemetry": telemetry
            })

        else:
            self.send_error(404)

def run_server(port=7860):
    server = ThreadedHTTPServer(("0.0.0.0", port), CollectorHTTPHandler)
    print("=" * 70)
    print("🇧🇩 MUSHFIQUR WORLDWIDE DATASET DISTILL FORGE // SWISS MINIMAL")
    print("=" * 70)
    print(f"Target GitHub Repo  : https://github.com/{pusher.get_github_identity()}/Dataset")
    print(f"Core Domains        : Physics, Chemistry, Higher Mathematics, Biology")
    print(f"Deduplication Gate  : 83% Strict Repeat Decline (MinHash/Jaccard)")
    print(f"Local Disk Buffer   : Max 1 GB (Auto-Prune after upload)")
    print(f"Web UI Studio       : http://localhost:{port}/")
    print("=" * 70)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server gracefully...")
        server.server_close()

if __name__ == "__main__":
    port = 7860
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
