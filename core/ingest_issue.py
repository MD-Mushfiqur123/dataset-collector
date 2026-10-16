"""
GitHub Issue Dataset Ingestion Engine
Author: Md. Mushfiqur Rahim & L
Workspace: projects/dataset_collector/core/ingest_issue.py

Runs inside GitHub Actions when an issue is opened or labeled 'dataset-submission'.
1. Reads issue payload from GITHUB_EVENT_PATH.
2. Extracts and parses JSON dataset submissions.
3. Validates required fields (prompt, reasoning/thinking, solution/response).
4. Enforces the 83% Duplicate Gatekeeper (rejects spam/duplicates).
5. Appends verified records to data/shards/<domain>_verified.jsonl.
6. Updates dedup_signatures.json.
7. Commits changes and comments back to close the issue.
"""

import os
import sys
import json
import re
import subprocess
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from core.gatekeeper import DuplicateGatekeeper

def extract_json_from_text(text: str):
    """Extract JSON object or array from markdown or plain text."""
    # First attempt: find markdown code blocks with ```json ... ``` or ``` ... ```
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
    if code_block_match:
        try:
            return json.loads(code_block_match.group(1).strip())
        except Exception:
            pass

    # Second attempt: find raw JSON array or object
    array_match = re.search(r'(\[\s*\{[\s\S]*\}\s*\])', text)
    if array_match:
        try:
            return json.loads(array_match.group(1).strip())
        except Exception:
            pass

    obj_match = re.search(r'(\{\s*"[\s\S]*"\s*:\s*[\s\S]*\})', text)
    if obj_match:
        try:
            return json.loads(obj_match.group(1).strip())
        except Exception:
            pass

    # Direct parse attempt
    try:
        return json.loads(text.strip())
    except Exception:
        return None

def normalize_record(raw: dict, default_domain: str = "general") -> dict:
    """Normalize fields into unified format."""
    prompt = raw.get("prompt") or raw.get("instruction") or raw.get("question") or ""
    thinking = raw.get("thinking") or raw.get("reasoning") or raw.get("cot") or ""
    solution = raw.get("solution") or raw.get("response") or raw.get("answer") or ""
    domain = raw.get("domain") or default_domain

    if not prompt or not solution:
        return None

    return {
        "id": raw.get("id") or f"sub_{os.urandom(4).hex()}",
        "domain": str(domain).lower().strip(),
        "prompt": str(prompt).strip(),
        "thinking": str(thinking).strip(),
        "solution": str(solution).strip(),
        "timestamp": raw.get("timestamp") or raw.get("created_at") or "",
        "contributor": raw.get("contributor") or "community"
    }

def run_cmd(cmd, cwd=None):
    res = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    return res.returncode == 0, res.stdout.strip(), res.stderr.strip()

def process_issue():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path):
        print("[ERROR] GITHUB_EVENT_PATH not found. Run inside GitHub Actions.")
        return 1

    with open(event_path, "r", encoding="utf-8") as f:
        event = json.load(f)

    issue = event.get("issue")
    if not issue:
        print("[SKIP] No issue object found in event payload.")
        return 0

    issue_number = issue.get("number")
    title = issue.get("title", "")
    body = issue.get("body", "")
    author = issue.get("user", {}).get("login", "unknown")
    labels = [l.get("name") for l in issue.get("labels", [])]

    # Verify if this issue is meant for dataset ingestion
    is_dataset_issue = (
        "dataset-submission" in labels or 
        "[dataset submission]" in title.lower() or 
        "community dataset submission" in body.lower()
    )

    if not is_dataset_issue:
        print(f"[SKIP] Issue #{issue_number} is not labeled or titled as a dataset submission.")
        return 0

    print(f"[INGEST] Processing Issue #{issue_number} by @{author}...")

    # Extract JSON data
    payload = extract_json_from_text(body)
    if not payload:
        msg = (
            f"❌ **Invalid Submission Format**\n\n"
            f"Hi @{author}! The bot could not parse valid JSON records from your issue body.\n"
            f"Please ensure you submit data formatted as a JSON array inside ```json codeblock."
        )
        run_cmd(f'gh issue comment {issue_number} --body "{msg}"')
        return 1

    records_raw = payload if isinstance(payload, list) else [payload]
    if isinstance(payload, dict) and "records" in payload and isinstance(payload["records"], list):
        records_raw = payload["records"]

    domain = "general"
    if isinstance(payload, dict) and "domain" in payload:
        domain = payload["domain"]

    # Deduplication Gatekeeper
    gatekeeper = DuplicateGatekeeper(PROJECT_ROOT / "data")
    
    verified_records = []
    rejected_count = 0

    for item in records_raw:
        if not isinstance(item, dict):
            continue
        record = normalize_record(item, default_domain=domain)
        if not record:
            continue

        # Combine text for deduplication check
        full_text = f"{record['prompt']} {record['thinking']} {record['solution']}"
        allowed, sim, matched_id = gatekeeper.check_similarity(full_text)

        if allowed:
            record["contributor"] = f"github:@{author}"
            gatekeeper.register_sample(record["id"], full_text, domain=record["domain"])
            verified_records.append(record)
        else:
            rejected_count += 1
            print(f"[GATEKEEPER] Rejected sample: similarity={sim*100:.1f}% with existing '{matched_id}'")

    if not verified_records:
        msg = (
            f"⚠️ **Submission Declined by 83% Gatekeeper**\n\n"
            f"Hi @{author}! All {len(records_raw)} submitted records were either invalid or had "
            f"**>= 83% similarity / overlap** with existing dataset samples.\n\n"
            f"Please ensure new prompts and solutions are unique and high-quality."
        )
        run_cmd(f'gh issue comment {issue_number} --body "{msg}"')
        run_cmd(f'gh issue close {issue_number} --reason "not planned"')
        return 0

    # Save to local shards in dataset repo
    shards_dir = PROJECT_ROOT / "shards"
    shards_dir.mkdir(parents=True, exist_ok=True)
    
    target_shard = shards_dir / f"{verified_records[0]['domain']}_verified.jsonl"
    with open(target_shard, "a", encoding="utf-8") as f:
        for r in verified_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"[SUCCESS] Appended {len(verified_records)} records to {target_shard.name}")

    # Commit directly to MD-Mushfiqur123/dataset repository
    run_cmd('git config user.name "github-actions[bot]"')
    run_cmd('git config user.email "github-actions[bot]@users.noreply.github.com"')
    run_cmd('git add shards/ core/')
    run_cmd(f'git commit -m "feat(dataset): ingest {len(verified_records)} verified records from issue #{issue_number} by @{author} [skip ci]"')
    run_cmd('git push')

    # Success comment on the issue and auto-close
    comment_body = (
        f"### 🚀 **Dataset Submission Successfully Verified & Ingested!**\n\n"
        f"Thank you @{author}! Your submission has been processed by **Mushfiqur's Dataset Bot**.\n\n"
        f"- **Domain:** `{verified_records[0]['domain'].upper()}`\n"
        f"- **Verified Records Accepted:** `{len(verified_records)}`\n"
        f"- **Duplicates Rejected (< 83% gatekeeper):** `{rejected_count}`\n"
        f"- **Committed into Official Shards:** `shards/{target_shard.name}`\n\n"
        f"✨ Your contribution is now part of the sovereign AI dataset."
    )
    comment_file = PROJECT_ROOT / f"comment_{issue_number}.md"
    with open(comment_file, "w", encoding="utf-8") as f:
        f.write(comment_body)
    run_cmd(f'gh issue comment {issue_number} --body-file "{comment_file}"')
    if comment_file.exists():
        comment_file.unlink()
    run_cmd(f'gh issue close {issue_number} --reason "completed"')
    run_cmd(f'gh issue edit {issue_number} --add-label "verified-dataset"')

    return 0

if __name__ == "__main__":
    sys.exit(process_issue())
