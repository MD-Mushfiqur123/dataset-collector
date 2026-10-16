#!/usr/bin/env bash
# ==============================================================================
# 🇨🇭 MUSHFIQUR DATASET FORGE // 1-COMMAND LINUX & MACOS LAUNCHER
# Author: Md. Mushfiqur Rahim & L
# Repo: https://github.com/MD-Mushfiqur123/dataset-collector
# ==============================================================================

set -e

echo ""
echo "==========================================================================="
echo "🇨🇭 MUSHFIQUR DATASET FORGE // DISTRIBUTED SCIENTIFIC COLLECTIVE"
echo "==========================================================================="
echo "[*] Checking Python environment..."

# Detect Python 3
if command -v python3 >/dev/null 2>&1; then
    PY_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PY_CMD="python"
else
    echo "❌ Error: Python 3 is required but not installed."
    echo "👉 Please install Python 3 (e.g., sudo apt install python3) and try again."
    exit 1
fi

PY_VER=$($PY_CMD -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "[✓] Found Python $PY_VER ($PY_CMD)"

TARGET_DIR="dataset-collector"

# Check if we are already inside the dataset-collector directory
if [ -f "server.py" ] && [ -d "core" ] && [ -d "ui" ]; then
    echo "[*] Already inside Dataset Forge workspace."
else
    echo "[*] Preparing repository in ./${TARGET_DIR}..."
    if [ -d "$TARGET_DIR" ]; then
        echo "[*] Existing folder found. Updating via git or running directly..."
        cd "$TARGET_DIR"
        if [ -d ".git" ] && command -v git >/dev/null 2>&1; then
            git pull --quiet || true
        fi
    else
        if command -v git >/dev/null 2>&1; then
            echo "[*] Cloning via Git..."
            git clone --depth 1 https://github.com/MD-Mushfiqur123/dataset-collector.git "$TARGET_DIR"
            cd "$TARGET_DIR"
        else
            echo "[*] Git not detected. Downloading lightweight archive via curl..."
            mkdir -p "$TARGET_DIR"
            curl -fsSL https://github.com/MD-Mushfiqur123/dataset-collector/archive/refs/heads/main.tar.gz | tar -xz -C "$TARGET_DIR" --strip-components=1
            cd "$TARGET_DIR"
        fi
    fi
fi

# Auto-open browser in background after 1.5s
(
    sleep 1.5
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:7860" >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open "http://localhost:7860" >/dev/null 2>&1 || true
    fi
) &

echo "==========================================================================="
echo "🚀 STARTING DATASET FORGE AT http://localhost:7860"
echo "==========================================================================="
exec $PY_CMD server.py
