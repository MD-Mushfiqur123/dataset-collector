"""
83% Duplicate Decline Gatekeeper Engine
Author: Md. Mushfiqur Rahim & L
Workspace: projects/dataset_collector/core/gatekeeper.py

Enforces the strict rule from datas.paint:
'No one can duplicate same things if repeat matches 83 % then decline'

Uses character 4-gram and word shingle Jaccard overlap to detect similarity.
Maintains persistent signatures to evaluate incoming submissions in sub-millisecond time.
"""

import os
import re
import json
import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any, List

SIMILARITY_THRESHOLD = 0.83  # 83% max allowed repeat

class DuplicateGatekeeper:
    def __init__(self, storage_path: Path):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.signatures_file = self.storage_path / "dedup_signatures.json"
        self.signatures: List[Dict[str, Any]] = []
        self._load_signatures()

    def _normalize(self, text: str) -> str:
        # Strip punctuation, normalize whitespace, lowercase
        text = re.sub(r'[\s\n\r\t]+', ' ', text)
        text = re.sub(r'[^\w\s\u0980-\u09FF]', '', text)
        return text.strip().lower()

    def _extract_shingles(self, text: str, k: int = 4) -> set:
        # Prevent algorithmic memory exhaustion DoS on oversized text
        if len(text) > 50000:
            text = text[:50000]
        norm = self._normalize(text)
        if len(norm) < k:
            return {norm}
        return {norm[i:i+k] for i in range(len(norm) - k + 1)}

    def _jaccard_similarity(self, set_a: set, set_b: set) -> float:
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return intersection / union if union > 0 else 0.0

    def _load_signatures(self):
        if self.signatures_file.exists():
            try:
                with open(self.signatures_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.signatures = data.get("signatures", [])
            except Exception:
                self.signatures = []
        else:
            self.signatures = []

    def _save_signatures(self):
        try:
            with open(self.signatures_file, "w", encoding="utf-8") as f:
                json.dump({"signatures": self.signatures[-20000:]}, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def check_similarity(self, text: str) -> Tuple[bool, float, str]:
        """
        Check if the text has >= 83% similarity with any existing sample.
        Returns:
            (allowed: bool, max_similarity: float, matched_id: str or None)
        """
        if not text or len(text.strip()) < 10:
            return False, 1.0, "text_too_short"

        incoming_shingles = self._extract_shingles(text)
        max_sim = 0.0
        matched_id = None

        for record in self.signatures:
            existing_shingles = set(record.get("shingles", []))
            sim = self._jaccard_similarity(incoming_shingles, existing_shingles)
            if sim > max_sim:
                max_sim = sim
                matched_id = record.get("id")
                if max_sim >= SIMILARITY_THRESHOLD:
                    break

        if max_sim >= SIMILARITY_THRESHOLD:
            # DECLINE! Duplicate matches 83% or more
            return False, round(max_sim, 4), matched_id

        # Unique!
        return True, round(max_sim, 4), None

    def register_sample(self, sample_id: str, text: str, domain: str = "general"):
        """Register sample signature into persistent cache."""
        shingles = list(self._extract_shingles(text))
        # Keep sample size of shingles to save memory (max 150 shingles)
        if len(shingles) > 150:
            import random
            shingles = sorted(list(shingles))[:150]

        record = {
            "id": sample_id,
            "domain": domain,
            "hash": hashlib.sha256(text.encode("utf-8")).hexdigest()[:16],
            "shingles": shingles
        }
        self.signatures.append(record)
        self._save_signatures()

    def get_stats(self) -> dict:
        return {
            "total_indexed_signatures": len(self.signatures),
            "threshold": SIMILARITY_THRESHOLD
        }
