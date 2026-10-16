# ==============================================================================
# MUSHFIQUR DATASET FORGE // 1-COMMAND WINDOWS POWERSHELL LAUNCHER
# Author: Md. Mushfiqur Rahim & L
# Repo: https://github.com/MD-Mushfiqur123/dataset-collector
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "  MUSHFIQUR DATASET FORGE // DISTRIBUTED SCIENTIFIC COLLECTIVE" -ForegroundColor White
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "[*] Checking Python environment..." -ForegroundColor Yellow

# Detect Python
$PyCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PyCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PyCmd = "py -3"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $PyCmd = "python3"
} else {
    Write-Host "[!] Error: Python 3 was not found in PATH." -ForegroundColor Red
    Write-Host "    Please install Python from https://www.python.org or the Microsoft Store and try again." -ForegroundColor Yellow
    Exit 1
}

$PyVer = & $PyCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
Write-Host "[OK] Found Python $PyVer ($PyCmd)" -ForegroundColor Green

$TargetDir = "dataset-collector"

# Check if already inside repository
if ((Test-Path "server.py") -and (Test-Path "core") -and (Test-Path "ui")) {
    Write-Host "[*] Already inside Dataset Forge workspace." -ForegroundColor Cyan
} else {
    Write-Host "[*] Preparing repository in ./${TargetDir}..." -ForegroundColor Yellow
    if (Test-Path $TargetDir) {
        Write-Host "[*] Existing folder found. Entering..." -ForegroundColor Cyan
        Set-Location $TargetDir
        if ((Test-Path ".git") -and (Get-Command git -ErrorAction SilentlyContinue)) {
            try { git pull --quiet } catch {}
        }
    } else {
        if (Get-Command git -ErrorAction SilentlyContinue) {
            Write-Host "[*] Cloning via Git..." -ForegroundColor Cyan
            git clone --depth 1 https://github.com/MD-Mushfiqur123/dataset-collector.git $TargetDir
            Set-Location $TargetDir
        } else {
            Write-Host "[*] Git not detected. Downloading lightweight ZIP package..." -ForegroundColor Cyan
            $ZipUrl = "https://github.com/MD-Mushfiqur123/dataset-collector/archive/refs/heads/main.zip"
            $ZipFile = "$env:TEMP\dataset-collector-main.zip"
            Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipFile -UseBasicParsing
            Expand-Archive -Path $ZipFile -DestinationPath "$env:TEMP\dataset_extracted" -Force
            Move-Item -Path "$env:TEMP\dataset_extracted\dataset-collector-main" -Destination $TargetDir -Force
            Remove-Item $ZipFile -Force -ErrorAction SilentlyContinue
            Remove-Item "$env:TEMP\dataset_extracted" -Recurse -Force -ErrorAction SilentlyContinue
            Set-Location $TargetDir
        }
    }
}

# Auto-open browser in background
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:7860"
} | Out-Null

Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host ">> STARTING DATASET FORGE AT http://localhost:7860" -ForegroundColor Green
Write-Host "===========================================================================" -ForegroundColor Cyan

& $PyCmd server.py
