"""
Central Registry & Manifest Generator
Author: Md. Mushfiqur Rahim & L
Workspace: projects/dataset_collector/core/registry.py

Tracks:
1. Every compressed shard (.jsonl.gz) across all 4 domains.
2. Token estimations and sample metrics.
3. Generates REGISTRY.md and registry.json for public inspection.
4. Provides beacon payload for centralized tracking across contributors worldwide.
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class DatasetRegistry:
    def __init__(self, root_dir: Path):
        self.root_dir = Path(root_dir)
        self.registry_file = self.root_dir / "data" / "registry.json"
        self.manifest_md = self.root_dir / "projects" / "dataset_repo" / "REGISTRY.md"
        self.data = self._load()

    def _load(self) -> dict:
        if self.registry_file.exists():
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "version": "1.0.0",
            "project": "Worldwide Sovereign Scientific Bengali Dataset",
            "last_updated": datetime.now().isoformat(),
            "domains": {
                "physics": {"samples": 0, "tokens": 0, "shards": 0},
                "chemistry": {"samples": 0, "tokens": 0, "shards": 0},
                "mathematics": {"samples": 0, "tokens": 0, "shards": 0},
                "biology": {"samples": 0, "tokens": 0, "shards": 0}
            },
            "shards": [],
            "contributors": []
        }

    def _save(self):
        self.data["last_updated"] = datetime.now().isoformat()
        try:
            with open(self.registry_file, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass
        self._generate_markdown_manifest()

    def register_shard(self, shard_name: str, domain: str, sample_count: int, token_count: int, file_size_bytes: int):
        shard_entry = {
            "shard": shard_name,
            "domain": domain,
            "samples": sample_count,
            "tokens": token_count,
            "size_bytes": file_size_bytes,
            "size_kb": round(file_size_bytes / 1024, 2),
            "timestamp": datetime.now().isoformat()
        }
        self.data["shards"].append(shard_entry)
        
        if domain in self.data["domains"]:
            self.data["domains"][domain]["samples"] += sample_count
            self.data["domains"][domain]["tokens"] += token_count
            self.data["domains"][domain]["shards"] += 1
            
        self._save()

    def _generate_markdown_manifest(self):
        total_samples = sum(d["samples"] for d in self.data["domains"].values())
        total_tokens = sum(d["tokens"] for d in self.data["domains"].values())
        total_shards = len(self.data["shards"])

        lines = [
            "# 📜 Worldwide Sovereign Bengali Dataset Registry",
            "",
            f"> **Last Synchronized:** `{self.data['last_updated']}`  ",
            f"> **Total Shards:** `{total_shards}` | **Total Samples:** `{total_samples:,}` | **Estimated Tokens:** `~{total_tokens:,}`",
            "",
            "## 🔬 Domain Telemetry Breakdown",
            "",
            "| Domain | Department | Total Samples | Total Tokens | Shards |",
            "| :--- | :--- | :---: | :---: | :---: |"
        ]

        domain_names = {
            "physics": "⚛️ পদার্থবিজ্ঞান (Physics)",
            "chemistry": "🧪 রসায়ন (Chemistry)",
            "mathematics": "📐 উচ্চতর গণিত (Higher Math)",
            "biology": "🌿 জীববিজ্ঞান (Biology)"
        }

        for d_key, info in self.data["domains"].items():
            name = domain_names.get(d_key, d_key)
            lines.append(f"| `{d_key}` | **{name}** | {info['samples']:,} | ~{info['tokens']:,} | {info['shards']} |")

        lines.extend([
            "",
            "## 📦 Compressed Shard Inventory (.jsonl.gz)",
            "",
            "| Shard Filename | Domain | Samples | Tokens | Compressed Size | Timestamp |",
            "| :--- | :---: | :---: | :---: | :---: | :---: |"
        ])

        for s in reversed(self.data["shards"][-25:]):  # Show latest 25 shards
            lines.append(f"| `{s['shard']}` | `{s['domain']}` | {s['samples']} | ~{s['tokens']} | {s['size_kb']} KB | {s['timestamp'][:19]} |")

        lines.extend([
            "",
            "---",
            "*Maintained autonomously via Mushfiqur's Worldwide Dataset Distill Engine (datas.paint spec)*"
        ])

        try:
            self.manifest_md.parent.mkdir(parents=True, exist_ok=True)
            with open(self.manifest_md, "w", encoding="utf-8") as f:
                f.write("\n".join(lines))
        except Exception:
            pass

    def get_summary(self) -> dict:
        return self.data
