# 🇧🇩 Mushfiqur Dataset Collector & Distillation Forge
> Minimalist, Zero-Dependency Offline Dataset Ingestion Engine for Bengali Scientific Reasoning AI.

🌐 **Live Web Studio (Zero Setup):** [https://md-mushfiqur123.github.io/dataset-collector/](https://md-mushfiqur123.github.io/dataset-collector/)

---

## ⚡ Quick Start & Installation Guide

Requires **Python 3.8+** (Uses standard library only — **no `pip install` required**).

### 🪟 Windows (1-Click Run)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/MD-Mushfiqur123/dataset-collector.git
   cd dataset-collector
   ```
2. Double-click **`run.bat`** (or run `.\run.bat` in PowerShell / CMD).
3. The UI will automatically launch in your default browser at:
   ```
   http://localhost:7860/
   ```

---

### 🐧 Linux & macOS
1. Clone the repository:
   ```bash
   git clone https://github.com/MD-Mushfiqur123/dataset-collector.git
   cd dataset-collector
   ```
2. Start the local server:
   ```bash
   python3 server.py
   ```
3. Open your browser and navigate to `http://localhost:7860`.

---

### 📦 Docker / DevContainer (Optional)
If you prefer running inside a container:
```bash
docker build -t dataset-collector .
docker run -p 7860:7860 dataset-collector
```

---

## 🚀 Key Highlights

- **100% Offline Vault:** Runs completely offline without internet or API keys.
- **1-Paste Auto-Split:** Automatically extracts Question, `<think>` Reasoning, and Solution from AI outputs.
- **83% Duplicate Gatekeeper:** Declines repetitive or duplicate submissions in real time.
- **Dual Storage ($S_1 \to S_2$):** Auto-compresses raw data into `.jsonl.gz` to prevent disk bloat.
- **⚡ 1-Click Compressed Export:** Export your compressed data (`.zip` / `.jsonl.gz`) at any stage for easy sharing via Google Drive.

---

### 👤 Author & Maintainer
- **Md. Mushfiqur Rahim** ([GitHub: @MD-Mushfiqur123](https://github.com/MD-Mushfiqur123))
