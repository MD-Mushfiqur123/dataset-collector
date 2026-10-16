# 🇨🇭 MUSHFIQUR DATASET FORGE // SWISS MINIMAL
### Autonomous Sovereign Scientific Bengali Dataset Distillation & Ingestion Engine

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MD-Mushfiqur123/dataset-collector)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/MD-Mushfiqur123/dataset-collector/blob/main/colab_launcher.ipynb)
[![Security Audit](https://img.shields.io/badge/Security%20Audit-6%2F6%20Pass%20(OWASP%20Top%2010)-22c55e?style=flat-square)](./WHITE_HAT_SECURITY_AUDIT.md)
[![Unit Tests](https://img.shields.io/badge/Unit%20Tests-11%2F11%20OK-blue?style=flat-square)](./tests/)
[![Architecture](https://img.shields.io/badge/Design-Swiss%20Minimal%20Monochrome-black?style=flat-square)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Standard%20Library%20Only-orange?style=flat-square)]()

---

## ⚡ 1-Click & 1-Command Universal Launch (Anyone, Anywhere)

Zero manual dependency installation, zero `pip install`, zero configuration. Pick your preferred method:

| Method | Target Platform | How To Run |
| :--- | :--- | :--- |
| 🌐 **Browser Studio (0 Setup)** | Any device with a browser | Click **[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MD-Mushfiqur123/dataset-collector)** |
| 📱 **Google Colab (Cloud)** | Phone / Tablet / Low-spec PC | Click **[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/MD-Mushfiqur123/dataset-collector/blob/main/colab_launcher.ipynb)** and run cell |
| 🪟 **Windows 1-Command** | PowerShell | `irm https://raw.githubusercontent.com/MD-Mushfiqur123/dataset-collector/main/install.ps1 \| iex` |
| 🪟 **Windows Double-Click** | File Explorer | Double click **`run.bat`** |
| 🐧 **Linux / macOS / WSL** | Terminal (Bash) | `curl -fsSL https://raw.githubusercontent.com/MD-Mushfiqur123/dataset-collector/main/install.sh \| bash` |

> **Note:** All automated launchers automatically verify Python 3, start the server at `http://localhost:7860/`, and open your default browser.

---

## 🏛️ Executive Overview

**Mushfiqur Dataset Forge** is a zero-external-dependency, distributed scientific dataset ingestion and distillation engine crafted under strict Swiss Minimalist design principles. Built specifically for high-reasoning frontier models (DeepSeek-R1, OpenAI o1/o3, Claude 3.7 Sonnet), it allows researchers and contributors to curate, validate, deduplicate, shard, and push scientific Bengali reasoning data directly to GitHub repositories.

Created by **Md. Mushfiqur Rahim** and autonomous engineering partner **L**.

---

## ✨ Core Pillars & Features

### 1. 🔬 4 Sovereign Scientific Domains
Strictly isolated into four core fundamental disciplines:
- **Physics (পদার্থবিজ্ঞান):** Mechanics, Electromagnetism, Quantum Phenomena, Thermodynamics, Vector calculus.
- **Chemistry (রসায়ন):** Physical, Organic, Inorganic, Coordination chemistry, Quantitative stoichiometry.
- **Higher Mathematics (উচ্চতর গণিত):** Real Analysis, Calculus, Linear Algebra, Number Theory, Differential Equations.
- **Biology (জীববিজ্ঞান):** Molecular Genetics, Cellular Physiology, Biochemistry, Evolutionary Dynamics.

Each domain features **1 Immutable Master Meta-Prompt** engineered for extreme Chain-of-Thought rigor, step-by-step mathematical proofs, and verified Bengali scientific terminology.

### 2. ⚡ 1-Paste Intelligent Auto-Split Workspace
Contributors no longer need to manually copy-paste into multiple form boxes:
- Paste raw, unformatted AI output directly into a single input box.
- The real-time heuristic & regex parser automatically separates:
  1. **User Prompt / Question**
  2. **`<think>` Internal Chain-of-Thought / Hidden Reasoning Trace**
  3. **Final Rigorous Bengali Solution**
- Features live token estimation (`1.35x` token-to-word multiplier) and real-time word counting.

### 3. 🛡️ 83% Duplicate Decline Gatekeeper
Enforces strict uniqueness using character 4-gram and word shingle Jaccard overlap:
- Sub-millisecond similarity computation against local persistent signature ledger.
- Any submission with **$\ge 83\%$ similarity** to an existing record is instantly declined with an explanation and similarity score.
- Prevents redundant training tokens and synthetic dataset collapse.

### 4. 📦 1 GB Local Disk Guard & GitHub CLI (`gh`) Auto-Pusher
- **Automatic Sharding:** Gzip-compressed `.jsonl.gz` format (typical $10\times$ compression ratio).
- **Auto-Push Trigger:** Automatically stages, commits, and pushes to GitHub every 5 submissions or when local buffer reaches 1 GB.
- **Zero Disk Waste Auto-Pruning:** Local uploaded shards are deleted immediately after successful GitHub confirmation, preserving machine storage.
- **1-Click CLI Auto-Detection:** Automatically discovers the active local `gh` identity (e.g. `@MD-Mushfiqur123`) without requiring manual Personal Access Tokens.

### 5. 🔒 Hardened White-Hat Security Posture
Audited by an autonomous White-Hat Hacker agent against OWASP Top 10 / CWE standards:
- **Threaded Non-Blocking Architecture:** `ThreadedHTTPServer` (`ThreadingMixIn`) prevents socket starvation.
- **Payload Limits:** Strict 10 MB payload ceiling (`HTTP 413`) with bounded shingle buffers (max 50k chars) to prevent ReDoS / memory exhaustion.
- **Path Traversal Defense:** Canonical path validation and domain whitelisting prevent buffer escapes.
- **Credential Protection:** GitHub tokens are automatically redacted and masked in all API responses and subprocess streams.
- **Stored DOM XSS Prevention:** Complete HTML entity encoding (`escapeHtml`) on all rendered telemetry attributes.

---

## 🏗️ Directory Architecture

```
projects/dataset_collector/
├── server.py                     # Threaded HTTP server & REST API (Port 7860)
├── WHITE_HAT_SECURITY_AUDIT.md   # Official CVSS v3.1 penetration testing report
├── core/
│   ├── domains.py                # 4 Scientific domains & Master Meta-Prompts
│   ├── gatekeeper.py             # 83% Jaccard / 4-gram deduplication engine
│   ├── pusher.py                 # Shard compression, 1 GB watchdog & gh CLI auto-pusher
│   ├── registry.py               # Shard telemetry and ledger tracking
│   └── security_poc_test.py      # Automated 6/6 security penetration test suite
├── ui/
│   ├── index.html                # Swiss Minimal light-theme workstation
│   ├── style.css                 # Porcelain canvas (#F8FAFC), obsidian text, scientific pastel accents
│   └── app.js                    # 1-Paste auto-split, reactive telemetry, modal routing
├── tests/
│   ├── test_domains.py           # Domain integrity unit tests
│   ├── test_gatekeeper.py        # Deduplication boundary tests
│   ├── test_pusher.py            # Sharding & disk guard unit tests
│   └── test_server_api.py        # End-to-end HTTP REST API tests
└── data/
    ├── dedup_signatures.json     # Persistent Jaccard signature cache
    └── pusher_state.json         # Pusher state and buffer metadata
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (Standard Library only — zero `pip install` required!)
- GitHub CLI (`gh`) authenticated (`gh auth login`) or Git credentials.

### 1. Launch the Server
```bash
python server.py
```
Default port is `7860`. You can also specify a custom port:
```bash
python server.py 8080
```

### 2. Access the Web Studio
Open your browser and navigate to:
```
http://localhost:7860/
```

### 3. Run Security & Unit Tests
To verify all security boundaries:
```bash
python core/security_poc_test.py
```
To run the full functional unit test suite:
```bash
python -m unittest discover tests
```

---

## 🎨 Swiss Minimal Design Language

The UI adheres strictly to Swiss International Typographic Style:
- **Canvas:** Crisp porcelain light background (`#F8FAFC`) with pure white card surfaces (`#FFFFFF`).
- **Typography:** High-legibility Geist Sans, Geist Mono, and Noto Sans Bengali.
- **Scientific Accents:**
  - Physics: Sapphire Blue (`#2563EB`)
  - Chemistry: Emerald Green (`#059669`)
  - Mathematics: Royal Violet (`#7C3AED`)
  - Biology: Warm Amber (`#D97706`)

---

## 🛡️ License & Integrity Policy

Crafted under **The Sacred `/truth` Law** — 100% verifiable implementation, zero stubs, zero mocks, zero technical fabrication.

Author: **Md. Mushfiqur Rahim** ([@MD-Mushfiqur123](https://github.com/MD-Mushfiqur123)) & **L**.
