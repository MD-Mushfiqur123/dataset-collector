"""
Sharding, 1 GB Buffer Guard & GitHub CLI Auto-Pusher
Author: Md. Mushfiqur Rahim & L
Workspace: projects/dataset_collector/core/pusher.py

Implements:
1. Sharding into compressed chunks (.jsonl.gz).
2. 1 GB Disk Guard: If local buffer reaches 1 GB, or after every 5 submissions, flushes and pushes.
3. Automated GitHub CLI (gh) pushing to https://github.com/<username>/Dataset.
4. Auto-Pruning: Deletes local uploaded shards immediately after successful push, freeing disk space.
"""

import os
import sys
import json
import gzip
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Any, List

MAX_BUFFER_BYTES = 1024 * 1024 * 1024  # 1 GB
AUTO_PUSH_COUNT_THRESHOLD = 5         # Auto-push every 5 submissions

class ShardPusher:
    def __init__(self, root_dir: Path):
        self.root_dir = Path(root_dir)
        self.buffer_dir = self.root_dir / "data" / "buffer"
        self.shards_dir = self.root_dir / "data" / "shards"
        self.state_file = self.root_dir / "data" / "pusher_state.json"
        
        self.buffer_dir.mkdir(parents=True, exist_ok=True)
        self.shards_dir.mkdir(parents=True, exist_ok=True)
        
        self.state = self._load_state()

    def _load_state(self) -> dict:
        if self.state_file.exists():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "unpushed_count": 0,
            "total_pushed_shards": 0,
            "total_pushed_samples": 0,
            "total_disk_freed_bytes": 0,
            "github_username": "",
            "github_repo": "Dataset"
        }

    def _save_state(self):
        try:
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2)
        except Exception:
            pass

    def get_buffer_size(self) -> int:
        """Returns total bytes in the local buffer directory."""
        total = 0
        for f in self.buffer_dir.glob("**/*"):
            if f.is_file():
                total += f.stat().st_size
        return total

    def append_sample(self, sample: dict) -> Dict[str, Any]:
        """
        Appends sample to local buffer and checks upload conditions:
        Condition A: Every 5 submissions.
        Condition B: Local buffer reaches 1 GB limit.
        """
        raw_domain = sample.get("domain", "general")
        # Strict sanitization against path traversal
        import re
        clean_domain = re.sub(r'[^a-zA-Z0-9_]', '', raw_domain) or "general"
        domain_buffer = (self.buffer_dir / f"current_{clean_domain}.jsonl").resolve()

        # Defense-in-depth: Ensure path is strictly within buffer_dir
        if not str(domain_buffer).startswith(str(self.buffer_dir.resolve())):
            raise ValueError("Security violation: path traversal detected in buffer routing")
        
        with open(domain_buffer, "a", encoding="utf-8") as f:
            f.write(json.dumps(sample, ensure_ascii=False) + "\n")

        self.state["unpushed_count"] += 1
        self._save_state()

        curr_bytes = self.get_buffer_size()
        trigger_reason = None

        if self.state["unpushed_count"] >= AUTO_PUSH_COUNT_THRESHOLD:
            trigger_reason = f"count_threshold ({self.state['unpushed_count']}/{AUTO_PUSH_COUNT_THRESHOLD})"
        elif curr_bytes >= MAX_BUFFER_BYTES:
            trigger_reason = f"disk_threshold ({curr_bytes / (1024*1024):.1f} MB / 1024 MB)"

        return {
            "unpushed_count": self.state["unpushed_count"],
            "buffer_bytes": curr_bytes,
            "buffer_mb": round(curr_bytes / (1024 * 1024), 2),
            "max_mb": 1024.0,
            "auto_trigger": bool(trigger_reason),
            "trigger_reason": trigger_reason
        }

    def compress_buffer_to_shards(self) -> List[Path]:
        """
        Compresses active buffer files into .jsonl.gz shards ready for GitHub upload.
        """
        created_shards = []
        raw_files = list(self.buffer_dir.glob("current_*.jsonl"))

        for rf in raw_files:
            domain = rf.stem.replace("current_", "")
            shard_num = self.state["total_pushed_shards"] + len(created_shards) + 1
            shard_name = f"mushfiqur_{domain}_shard_{shard_num:05d}.jsonl.gz"
            shard_path = self.shards_dir / shard_name

            # Read raw lines, compress with gzip
            with open(rf, "rb") as f_in:
                with gzip.open(shard_path, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)

            created_shards.append(shard_path)
            # Remove raw uncompressed buffer
            try:
                rf.unlink()
            except Exception:
                pass

        return created_shards

    def get_github_identity(self) -> str:
        """Inspects custom set username or gh CLI logged-in username."""
        custom = self.state.get("github_username")
        if custom:
            return custom
        try:
            res = subprocess.run(["gh", "api", "user", "--jq", ".login"], capture_output=True, text=True, timeout=10)
            if res.returncode == 0 and res.stdout.strip():
                uname = res.stdout.strip()
                self.state["github_username"] = uname
                self._save_state()
                return uname
        except Exception:
            pass
        return "MD-Mushfiqur123"

    def set_github_config(self, username: str, repo: str = "Dataset", token: str = "") -> dict:
        """Allows any user worldwide to connect their own GitHub account."""
        import re
        username = username.strip().lstrip("@")
        repo = (repo or "Dataset").strip()
        token = token.strip()

        if not username:
            return {"success": False, "message": "GitHub username cannot be empty"}

        # Strict validation: prevent argument/option injection & path characters
        if not re.match(r'^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$', username):
            return {
                "success": False,
                "message": "Invalid GitHub username. Must contain only alphanumeric characters or single hyphens, and cannot start with a hyphen."
            }

        if not re.match(r'^[a-zA-Z0-9_.-]{1,100}$', repo) or repo.startswith(("-", ".")):
            return {
                "success": False,
                "message": "Invalid repository name. Cannot start with a hyphen/period and must be valid GitHub repo format."
            }

        if token and not re.match(r'^[a-zA-Z0-9_]{1,128}$', token):
            return {
                "success": False,
                "message": "Invalid GitHub token format."
            }

        # Validate with GitHub API if token provided
        if token:
            import urllib.request
            try:
                req = urllib.request.Request("https://api.github.com/user")
                req.add_header("Authorization", f"Bearer {token}")
                req.add_header("User-Agent", "Mushfiqur-Dataset-Forge")
                with urllib.request.urlopen(req, timeout=8) as res:
                    u_data = json.loads(res.read().decode())
                    actual_login = u_data.get("login")
                    if actual_login:
                        username = actual_login
            except Exception as e:
                return {"success": False, "message": f"GitHub Token validation error: {str(e)}"}

        self.state["github_username"] = username
        self.state["github_repo"] = repo
        if token:
            self.state["github_token"] = token
        self._save_state()

        return {
            "success": True,
            "username": username,
            "repo": repo,
            "has_token": bool(self.state.get("github_token")),
            "message": f"Connected to GitHub as @{username}/{repo}!"
        }

    def autodetect_github_cli(self) -> dict:
        """Runs gh CLI to detect authenticated username immediately."""
        try:
            res = subprocess.run(["gh", "api", "user", "--jq", ".login"], capture_output=True, text=True, timeout=8)
            if res.returncode == 0 and res.stdout.strip():
                uname = res.stdout.strip()
                self.state["github_username"] = uname
                self._save_state()
                return {
                    "success": True,
                    "username": uname,
                    "repo": self.state.get("github_repo", "Dataset"),
                    "message": f"Successfully auto-detected and connected GitHub as @{uname}!"
                }
            # Fallback to git config user.name
            git_user = subprocess.run(["git", "config", "user.name"], capture_output=True, text=True, timeout=5)
            if git_user.returncode == 0 and git_user.stdout.strip():
                uname = git_user.stdout.strip()
                self.state["github_username"] = uname
                self._save_state()
                return {
                    "success": True,
                    "username": uname,
                    "repo": self.state.get("github_repo", "Dataset"),
                    "message": f"Auto-detected Git account @{uname}!"
                }
        except Exception as e:
            return {"success": False, "message": f"Auto-detect error: {str(e)}"}
        return {"success": False, "message": "gh CLI not logged in. Run 'gh auth login' or enter username manually."}


    def push_to_github(self) -> Dict[str, Any]:
        """
        Executes GitHub CLI workflow:
        1. Compresses buffer to shards.
        2. Copies/stages shards into repository.
        3. Pushes to https://github.com/<username>/Dataset using gh/git.
        4. Auto-prunes local shards after successful push!
        """
        uname = self.get_github_identity()
        shards = self.compress_buffer_to_shards()
        
        if not shards:
            return {
                "success": True,
                "message": "Buffer was empty, nothing to push.",
                "shards_pushed": 0,
                "freed_mb": 0.0
            }

        repo_name = self.state.get("github_repo", "Dataset")
        repo_dir = self.root_dir / "projects" / "dataset_repo"
        repo_dir.mkdir(parents=True, exist_ok=True)

        # Ensure repo git initialized and remote points to active user
        token = self.state.get("github_token", "")
        if token:
            git_target_url = f"https://{token}@github.com/{uname}/{repo_name}.git"
        else:
            git_target_url = f"https://github.com/{uname}/{repo_name}.git"

        # Initialize or update origin
        subprocess.run(["git", "init"], cwd=repo_dir, capture_output=True)
        subprocess.run(["git", "remote", "remove", "origin"], cwd=repo_dir, capture_output=True)
        subprocess.run(["git", "remote", "add", "origin", git_target_url], cwd=repo_dir, capture_output=True)

        # Check if repo exists on GitHub, if not create
        try:
            check_repo = subprocess.run(["gh", "repo", "view", f"{uname}/{repo_name}"], capture_output=True, text=True)
            if check_repo.returncode != 0:
                print(f"Creating repository {uname}/{repo_name} on GitHub...")
                subprocess.run(["gh", "repo", "create", f"{uname}/{repo_name}", "--public", "--confirm"], capture_output=True)
        except Exception:
            pass

        # Move shards to repo shards folder
        dest_shards_dir = repo_dir / "shards"
        dest_shards_dir.mkdir(parents=True, exist_ok=True)

        bytes_to_prune = 0
        for s in shards:
            bytes_to_prune += s.stat().st_size
            shutil.copy2(s, dest_shards_dir / s.name)

        # Stage, Commit, and Push
        try:
            subprocess.run(["git", "add", "shards/"], cwd=repo_dir, capture_output=True)
            commit_msg = f"Auto-Push: {len(shards)} compressed dataset shards via Swiss Minimalist Collector"
            subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_dir, capture_output=True)
            
            # Push via git or gh
            push_res = subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, capture_output=True, text=True, timeout=60)
            
            if push_res.returncode == 0:
                # SUCCESS! Execute AUTO-PRUNING to free user disk space!
                for s in shards:
                    try:
                        s.unlink()
                    except Exception:
                        pass

                self.state["total_pushed_shards"] += len(shards)
                self.state["total_pushed_samples"] += self.state["unpushed_count"]
                self.state["total_disk_freed_bytes"] += bytes_to_prune
                self.state["unpushed_count"] = 0
                self._save_state()

                freed_mb = round(bytes_to_prune / (1024 * 1024), 2)
                # Sensitive Credential Sanitization: Mask token in return URL
                masked_repo_url = f"https://github.com/{uname}/{repo_name}.git"
                return {
                    "success": True,
                    "message": f"Successfully pushed {len(shards)} shards to https://github.com/{uname}/{repo_name}! Auto-pruned {freed_mb} MB from local disk.",
                    "shards_pushed": len(shards),
                    "freed_mb": freed_mb,
                    "target_repo": masked_repo_url
                }
            else:
                # Sanitize error message to prevent token exposure in stack trace or git output
                import re
                clean_err = re.sub(r'https://[^@]+@', 'https://***@', push_res.stderr.strip())
                return {
                    "success": False,
                    "message": f"Git push failed: {clean_err}",
                    "shards_pushed": 0,
                    "freed_mb": 0.0
                }
        except Exception as e:
            import re
            clean_err = re.sub(r'https://[^@]+@', 'https://***@', str(e))
            return {
                "success": False,
                "message": f"Push error: {clean_err}",
                "shards_pushed": 0,
                "freed_mb": 0.0
            }

    def get_telemetry(self) -> dict:
        curr_bytes = self.get_buffer_size()
        return {
            "unpushed_count": self.state.get("unpushed_count", 0),
            "total_pushed_shards": self.state.get("total_pushed_shards", 0),
            "total_pushed_samples": self.state.get("total_pushed_samples", 0),
            "total_disk_freed_mb": round(self.state.get("total_disk_freed_bytes", 0) / (1024 * 1024), 2),
            "buffer_bytes": curr_bytes,
            "buffer_mb": round(curr_bytes / (1024 * 1024), 2),
            "buffer_percent": round((curr_bytes / MAX_BUFFER_BYTES) * 100, 2),
            "github_username": self.get_github_identity(),
            "github_repo": self.state.get("github_repo", "Dataset")
        }
