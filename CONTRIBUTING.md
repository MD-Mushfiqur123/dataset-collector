# 🤝 Contributing to Mushfiqur Dataset Forge

Thank you for your interest in contributing to the **Sovereign Scientific Bengali Dataset Distillation** initiative!

---

## 🎯 How It Works

1. **Launch the Studio:**
   - **In your Browser (0 Setup):** Click [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MD-Mushfiqur123/dataset-collector)
   - **On Windows (1 Line):** `irm https://raw.githubusercontent.com/MD-Mushfiqur123/dataset-collector/main/install.ps1 | iex`
   - **On Linux / Mac (1 Line):** `curl -fsSL https://raw.githubusercontent.com/MD-Mushfiqur123/dataset-collector/main/install.sh | bash`
   - **On Google Colab (Mobile / Tablet):** [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/MD-Mushfiqur123/dataset-collector/blob/main/colab_launcher.ipynb)

2. **Select Domain:**
   Choose from:
   - ⚡ Physics (পদার্থবিজ্ঞান)
   - 🧪 Chemistry (রসায়ন)
   - 📐 Higher Mathematics (উচ্চতর গণিত)
   - 🧬 Biology (জীববিজ্ঞান)

3. **Copy the Master Meta-Prompt:**
   Click **`COPY PROMPT`** in the Master Prompt card. Each domain has 1 carefully engineered system prompt designed to guide frontier models (DeepSeek-R1, o1, o3, Claude 3.7) to generate rigorous step-by-step mathematical reasoning.

4. **Paste Raw Model Output:**
   Paste the raw output directly into the **1-Paste Intelligent Auto-Split** box. The built-in parser automatically extracts:
   - User Prompt
   - `<think>` Reasoning trace
   - Final verified solution

5. **Submit & Auto-Push:**
   - The **83% Duplicate Gatekeeper** checks uniqueness in sub-millisecond time.
   - Valid records are saved to the local compressed buffer.
   - Every 5 submissions (or at 1 GB buffer), shards are automatically pushed to your connected GitHub repository.

---

## 🛡️ Guidelines for High Quality Data

- **Language:** Clear, authentic Bengali academic terminology (NCTB / Olympiad / University standard).
- **Depth:** Must include complete, transparent mathematical equations and theoretical explanations in the reasoning block.
- **Accuracy:** The Sacred `/truth` Law applies. All equations, chemical formulas, and proofs must be mathematically and scientifically sound.
