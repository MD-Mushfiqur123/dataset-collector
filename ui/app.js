// Swiss Minimalist Dataset Collector Client Logic with 1-Paste Intelligent Auto-Split
// Author: Md. Mushfiqur Rahim & L

let currentDomain = "physics";
let currentMode = "smart"; // default: "smart" (1-Paste Auto-Split)
let domainsData = {};
let duplicateDebounceTimer = null;

// Security Sanitization Helper against DOM XSS
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// DOM Elements
const masterPromptBox = document.getElementById("masterPromptBox");
const activeDomainHeading = document.getElementById("activeDomainHeading");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");
const copyBtnText = document.getElementById("copyBtnText");

// Mode Groups
const smartFieldsGroup = document.getElementById("smartFieldsGroup");
const manualFieldsGroup = document.getElementById("manualFieldsGroup");
const transcriptGroup = document.getElementById("transcriptGroup");

// Smart Auto-Split Elements
const inputRawPaste = document.getElementById("inputRawPaste");
const splitStatusText = document.getElementById("splitStatusText");
const splitPrompt = document.getElementById("splitPrompt");
const splitReasoning = document.getElementById("splitReasoning");
const splitResponse = document.getElementById("splitResponse");
const splitPromptCount = document.getElementById("splitPromptCount");
const splitReasoningCount = document.getElementById("splitReasoningCount");
const splitResponseCount = document.getElementById("splitResponseCount");

// Manual Mode Elements
const inputPrompt = document.getElementById("inputPrompt");
const inputReasoning = document.getElementById("inputReasoning");
const inputResponse = document.getElementById("inputResponse");
const thinkWordCount = document.getElementById("thinkWordCount");
const responseWordCount = document.getElementById("responseWordCount");

// Transcript Elements
const inputTranscript = document.getElementById("inputTranscript");
const transcriptWordCount = document.getElementById("transcriptWordCount");

// Telemetry & Gatekeeper Metrics
const tokenMetric = document.getElementById("tokenMetric");
const wordMetric = document.getElementById("wordMetric");
const gatekeeperStatus = document.getElementById("gatekeeperStatus");
const radarBadge = document.getElementById("radarBadge");
const radarText = document.getElementById("radarText");

const bufferDisplay = document.getElementById("bufferDisplay");
const pushStatusPill = document.getElementById("pushStatusPill");
const diskFreedTotal = document.getElementById("diskFreedTotal");
const shardsList = document.getElementById("shardsList");
const ghUser = document.getElementById("ghUser");
const targetRepoLink = document.getElementById("targetRepoLink");

// Buttons
const btnSubmit = document.getElementById("btnSubmit");
const btnForcePush = document.getElementById("btnForcePush");
const btnClear = document.getElementById("btnClear");
const toast = document.getElementById("toast");

// GitHub Modal Elements
const btnOpenGhModal = document.getElementById("btnOpenGhModal");
const ghModal = document.getElementById("ghModal");
const btnCloseGhModal = document.getElementById("btnCloseGhModal");
const btnCancelGhModal = document.getElementById("btnCancelGhModal");
const btnSaveGhConfig = document.getElementById("btnSaveGhConfig");
const btnAutoDetectGh = document.getElementById("btnAutoDetectGh");
const ghUsernameInput = document.getElementById("ghUsernameInput");
const ghRepoInput = document.getElementById("ghRepoInput");
const ghTokenInput = document.getElementById("ghTokenInput");
const modalTargetUrl = document.getElementById("modalTargetUrl");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadDomains();
    setupEventListeners();
    fetchStats();
    setInterval(fetchStats, 6000);
});

// Load Domains from Backend
async function loadDomains() {
    try {
        const res = await fetch("/api/domains");
        domainsData = await res.json();
        updateDomainView(currentDomain);
    } catch (e) {
        console.error("Failed to load domains", e);
    }
}

// Switch Domain
function updateDomainView(domainKey) {
    currentDomain = domainKey;
    document.body.dataset.activeDomain = domainKey;
    const dom = domainsData[domainKey];
    if (!dom) return;

    activeDomainHeading.textContent = `${dom.name.toUpperCase()} // MASTER META-PROMPT`;
    masterPromptBox.textContent = dom.master_prompt;

    document.querySelectorAll(".domain-tab").forEach(tab => {
        if (tab.dataset.domain === domainKey) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Domain tabs
    document.querySelectorAll(".domain-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            updateDomainView(tab.dataset.domain);
        });
    });

    // Copy Prompt Button
    btnCopyPrompt.addEventListener("click", () => {
        const text = masterPromptBox.textContent;
        navigator.clipboard.writeText(text).then(() => {
            copyBtnText.textContent = "COPIED!";
            showToast("Master Prompt copied to clipboard!");
            setTimeout(() => {
                copyBtnText.textContent = "COPY";
            }, 2000);
        });
    });

    // Mode toggles (smart vs manual vs transcript)
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentMode = btn.dataset.mode;

            if (currentMode === "smart") {
                smartFieldsGroup.style.display = "block";
                manualFieldsGroup.style.display = "none";
                transcriptGroup.style.display = "none";
            } else if (currentMode === "manual") {
                smartFieldsGroup.style.display = "none";
                manualFieldsGroup.style.display = "block";
                transcriptGroup.style.display = "none";
            } else {
                smartFieldsGroup.style.display = "none";
                manualFieldsGroup.style.display = "none";
                transcriptGroup.style.display = "block";
            }
            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    // ⚡ 1-PASTE AUTO-SPLIT LISTENER (The Core Feature!)
    inputRawPaste.addEventListener("input", handleRawPasteAutoSplit);
    inputRawPaste.addEventListener("paste", () => {
        setTimeout(handleRawPasteAutoSplit, 50);
    });

    // Sub-field editing listeners in Smart mode
    [splitPrompt, splitReasoning, splitResponse].forEach(el => {
        el.addEventListener("input", () => {
            updateSmartCounts();
            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    // Manual field listeners
    [inputPrompt, inputReasoning, inputResponse, inputTranscript].forEach(el => {
        el.addEventListener("input", () => {
            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    // Submit Record Button
    btnSubmit.addEventListener("click", submitRecord);

    // Force Push Button
    btnForcePush.addEventListener("click", forcePush);

    // Clear Button
    btnClear.addEventListener("click", clearForm);

    // GitHub Modal open / close / save / autodetect
    btnOpenGhModal.addEventListener("click", openGhModal);
    btnCloseGhModal.addEventListener("click", closeGhModal);
    btnCancelGhModal.addEventListener("click", closeGhModal);
    btnSaveGhConfig.addEventListener("click", saveGhConfig);
    btnAutoDetectGh.addEventListener("click", autoDetectGh);

    // Live target URL preview update
    [ghUsernameInput, ghRepoInput].forEach(inp => {
        inp.addEventListener("input", updateModalUrlPreview);
    });

    // Close modal on escape or backdrop click
    ghModal.addEventListener("click", (e) => {
        if (e.target === ghModal) closeGhModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !ghModal.classList.contains("hidden")) {
            closeGhModal();
        }
    });
}

// ==========================================================================
// 🧠 INTELLIGENT AUTO-SPLITTER ALGORITHM
// User khali paste korbe, algorithm nijei vag korbe!
// ==========================================================================
function parseRawAIText(rawText) {
    rawText = (rawText || "").trim();
    if (!rawText) return { prompt: "", reasoning: "", response: "" };

    let prompt = "";
    let reasoning = "";
    let response = "";

    // 1. Standard DeepSeek / R1 / QwQ <think>...</think>
    const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
    const match = rawText.match(thinkRegex);

    if (match) {
        reasoning = match[1].trim();
        prompt = rawText.substring(0, match.index).trim();
        response = rawText.substring(match.index + match[0].length).trim();
    } else {
        // 2. Unclosed <think> tag
        const unclosedRegex = /<think>([\s\S]*)/i;
        const unclosedMatch = rawText.match(unclosedRegex);
        if (unclosedMatch) {
            prompt = rawText.substring(0, unclosedMatch.index).trim();
            const rest = unclosedMatch[1].trim();
            // Look for common solution separator headers
            const solHeaderRegex = /(?:\n\s*|\A)(?:#{1,3}\s*)?(?:Solution|সমাধান|চূড়ান্ত সমাধান|Final Answer|Answer|উত্তর)(?::|\n)([\s\S]*)/i;
            const solMatch = rest.match(solHeaderRegex);
            if (solMatch) {
                reasoning = rest.substring(0, solMatch.index).trim();
                response = solMatch[1].trim();
            } else {
                reasoning = rest;
                response = rest;
            }
        } else {
            // 3. Markdown Thought Process headers
            const thoughtHeader = /(?:^|\n)(?:#{1,3}\s*)?(?:Thought Process|Thinking Process|Reasoning|চিন্তন প্রক্রিয়া|চিন্তা)(?::|\n)([\s\S]*?)(?=(?:\n#{1,3}\s*(?:Solution|Answer|সমাধান|চূড়ান্ত সমাধান|উত্তর))|$)/i;
            const tMatch = rawText.match(thoughtHeader);
            if (tMatch) {
                reasoning = tMatch[1].trim();
                prompt = rawText.substring(0, tMatch.index).trim();
                response = rawText.substring(tMatch.index + tMatch[0].length).trim();
            } else {
                // 4. Fallback: Split leading question paragraph from answer
                const paragraphs = rawText.split(/\n\s*\n/);
                if (paragraphs.length >= 2) {
                    prompt = paragraphs[0].trim();
                    response = paragraphs.slice(1).join("\n\n").trim();
                } else {
                    response = rawText;
                }
            }
        }
    }

    // If prompt is still blank, extract leading Question/Problem header from response if any
    if (!prompt) {
        const qHeader = response.match(/^(?:(?:Problem|Question|প্রশ্ন|সমস্যা)\s*[:\-\d\.]*\s*)([\s\S]*?)(?=\n\n|\n[A-Z0-9#])/i);
        if (qHeader) {
            prompt = qHeader[1].trim();
            response = response.substring(qHeader[0].length).trim();
        } else {
            prompt = `প্রশ্ন (${currentDomain.toUpperCase()} বিষয়ক সমস্যা)`;
        }
    }

    return { prompt, reasoning, response };
}

// Triggered on paste/input in 1-Paste box
function handleRawPasteAutoSplit() {
    const raw = inputRawPaste.value.trim();
    if (!raw) {
        splitPrompt.value = "";
        splitReasoning.value = "";
        splitResponse.value = "";
        splitStatusText.textContent = "Awaiting paste...";
        updateSmartCounts();
        updateMetrics();
        return;
    }

    const { prompt, reasoning, response } = parseRawAIText(raw);

    splitPrompt.value = prompt;
    splitReasoning.value = reasoning;
    splitResponse.value = response;

    // Mirror to manual boxes in case user switches tabs
    inputPrompt.value = prompt;
    inputReasoning.value = reasoning;
    inputResponse.value = response;

    const rWords = countWords(reasoning);
    const sWords = countWords(response);
    const pWords = countWords(prompt);

    splitStatusText.innerHTML = `⚡ <strong>AUTO-SPLIT SUCCESS:</strong> ${pWords}w Prompt, ${rWords}w Reasoning (&lt;think&gt;), ${sWords}w Solution.`;

    updateSmartCounts();
    updateMetrics();
    triggerDuplicateRadarCheck();
}

function updateSmartCounts() {
    splitPromptCount.textContent = `${countWords(splitPrompt.value)} words`;
    splitReasoningCount.textContent = `${countWords(splitReasoning.value)} words`;
    splitResponseCount.textContent = `${countWords(splitResponse.value)} words`;
}

// Calculate Metrics (Tokens, Words)
function updateMetrics() {
    let totalWords = 0;

    if (currentMode === "smart") {
        const pWords = countWords(splitPrompt.value);
        const rWords = countWords(splitReasoning.value);
        const sWords = countWords(splitResponse.value);
        totalWords = pWords + rWords + sWords;
    } else if (currentMode === "manual") {
        const thinkWords = countWords(inputReasoning.value);
        const respWords = countWords(inputResponse.value);
        const promptWords = countWords(inputPrompt.value);
        thinkWordCount.textContent = `${thinkWords} words`;
        responseWordCount.textContent = `${respWords} words`;
        totalWords = promptWords + thinkWords + respWords;
    } else {
        totalWords = countWords(inputTranscript.value);
        transcriptWordCount.textContent = `${totalWords} words`;
    }

    const estimatedTokens = Math.round(totalWords * 1.35);
    wordMetric.textContent = totalWords.toLocaleString();
    tokenMetric.textContent = `~${estimatedTokens.toLocaleString()}`;
}

function countWords(str) {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).length;
}

// Trigger Debounced 83% Duplicate Check
function triggerDuplicateRadarCheck() {
    clearTimeout(duplicateDebounceTimer);
    duplicateDebounceTimer = setTimeout(async () => {
        let textToCheck = "";

        if (currentMode === "smart") {
            textToCheck = `${splitPrompt.value} ${splitResponse.value}`.trim();
        } else if (currentMode === "manual") {
            textToCheck = `${inputPrompt.value} ${inputResponse.value}`.trim();
        } else {
            textToCheck = inputTranscript.value.trim();
        }

        if (textToCheck.length < 25) {
            radarBadge.className = "radar-badge pristine";
            radarText.textContent = "UNIQUENESS: 100% (PRISTINE)";
            gatekeeperStatus.innerHTML = `GATEKEEPER: <strong class="text-safe">PASS (&lt;83%)</strong>`;
            btnSubmit.disabled = false;
            return;
        }

        try {
            const res = await fetch("/api/check_similarity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textToCheck })
            });
            const data = await res.json();
            
            const simPct = (data.similarity * 100).toFixed(1);
            const uniqPct = (100 - simPct).toFixed(1);

            if (data.allowed) {
                radarBadge.className = "radar-badge safe";
                radarText.textContent = `UNIQUENESS: ${uniqPct}% (SAFE)`;
                gatekeeperStatus.innerHTML = `GATEKEEPER: <strong class="text-safe">PASS (&lt;83%)</strong>`;
                btnSubmit.disabled = false;
            } else {
                radarBadge.className = "radar-badge declined";
                radarText.textContent = `SIMILARITY: ${simPct}% (DECLINED: ≥83%)`;
                gatekeeperStatus.innerHTML = `GATEKEEPER: <strong class="text-declined">DECLINED (≥83% MATCH)</strong>`;
                btnSubmit.disabled = true;
            }
        } catch (e) {
            console.error("Duplicate check error", e);
        }
    }, 350);
}

// Submit Record
async function submitRecord() {
    let payload = {};

    if (currentMode === "smart") {
        const prompt = splitPrompt.value.trim();
        const reasoning = splitReasoning.value.trim();
        const response = splitResponse.value.trim();
        const raw = inputRawPaste.value.trim();

        if (!response && !raw) {
            showToast("অনুগ্রহ করে আপনার AI আউটপুট পেস্ট করুন!");
            inputRawPaste.focus();
            return;
        }

        payload = {
            domain: currentDomain,
            mode: "smart_cot",
            prompt: prompt || `সমস্যা (${currentDomain})`,
            reasoning: reasoning,
            response: response,
            raw_text: raw
        };
    } else if (currentMode === "manual") {
        const prompt = inputPrompt.value.trim();
        const response = inputResponse.value.trim();
        const reasoning = inputReasoning.value.trim();

        if (!response) {
            showToast("Please provide the final response!");
            inputResponse.focus();
            return;
        }

        payload = {
            domain: currentDomain,
            mode: "manual_cot",
            prompt: prompt,
            reasoning: reasoning,
            response: response
        };
    } else {
        const transcript = inputTranscript.value.trim();
        if (!transcript) {
            showToast("Transcript box is empty!");
            inputTranscript.focus();
            return;
        }
        payload = {
            domain: currentDomain,
            mode: "transcript",
            prompt: `Transcribed educational content for ${currentDomain}`,
            reasoning: "",
            response: transcript
        };
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="radar-dot"></span> SAVING...`;

    try {
        const res = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
            showToast(result.message || "Record successfully validated and buffered!");
            clearForm();
            fetchStats();
        } else {
            showToast(`Submission rejected: ${result.message}`);
        }
    } catch (e) {
        showToast("Error submitting record!");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> SUBMIT RECORD`;
    }
}

// Force GitHub Push Now
async function forcePush() {
    btnForcePush.disabled = true;
    btnForcePush.textContent = "PUSHING...";

    try {
        const res = await fetch("/api/sync", { method: "POST" });
        const result = await res.json();
        showToast(result.message);
        fetchStats();
    } catch (e) {
        showToast("Sync request failed!");
    } finally {
        btnForcePush.disabled = false;
        btnForcePush.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> PUSH NOW`;
    }
}

// Fetch Stats from Backend
async function fetchStats() {
    try {
        const res = await fetch("/api/stats");
        const stats = await res.json();

        // Update telemetry pills
        bufferDisplay.textContent = `${stats.buffer_mb} MB / ${stats.max_mb} MB (${stats.buffer_percent}%)`;
        pushStatusPill.textContent = `UNPUSHED: ${stats.unpushed_count} / 5`;
        diskFreedTotal.textContent = `DISK FREED VIA PRUNING: ${stats.total_disk_freed_mb} MB`;

        if (stats.github_username) {
            ghUser.textContent = stats.github_username;
            targetRepoLink.href = `https://github.com/${stats.github_username}/${stats.github_repo || "Dataset"}`;
        }

        // Render recent shards if any (XSS-safe via escapeHtml)
        if (stats.recent_shards && stats.recent_shards.length > 0) {
            shardsList.innerHTML = stats.recent_shards.map(s => `
                <div class="shard-item">
                    📦 ${escapeHtml(s.shard)} (${escapeHtml(s.samples)} samples, ~${escapeHtml(s.tokens)} tokens, ${escapeHtml(s.size_kb)} KB)
                </div>
            `).join("");
        } else {
            shardsList.innerHTML = `<div class="shard-item empty">Local buffer pruned after successful GitHub push. Zero disk space wasted.</div>`;
        }
    } catch (e) {
        // quiet
    }
}

// Clear Form
function clearForm() {
    inputRawPaste.value = "";
    splitPrompt.value = "";
    splitReasoning.value = "";
    splitResponse.value = "";
    splitStatusText.textContent = "Awaiting paste...";
    updateSmartCounts();

    inputPrompt.value = "";
    inputReasoning.value = "";
    inputResponse.value = "";
    inputTranscript.value = "";

    updateMetrics();
    radarBadge.className = "radar-badge pristine";
    radarText.textContent = "UNIQUENESS: 100% (PRISTINE)";
    gatekeeperStatus.innerHTML = `GATEKEEPER: <strong class="text-safe">PASS (&lt;83%)</strong>`;
    btnSubmit.disabled = false;
}

// Show Toast
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

// GitHub Connection Modal Functions
async function openGhModal() {
    try {
        const res = await fetch("/api/github_config");
        const config = await res.json();
        ghUsernameInput.value = config.username || "";
        ghRepoInput.value = config.repo || "Dataset";
        if (config.has_token) {
            ghTokenInput.placeholder = "•••••••••••• (Active Token Configured)";
        } else {
            ghTokenInput.placeholder = "ghp_xxxxxxxxxxxx (Optional if 'gh auth login' is done)";
        }
        ghTokenInput.value = "";
        updateModalUrlPreview();
    } catch (e) {
        console.error("Failed to load GitHub config", e);
    }
    ghModal.classList.remove("hidden");
    ghUsernameInput.focus();
}

function closeGhModal() {
    ghModal.classList.add("hidden");
}

function updateModalUrlPreview() {
    const u = ghUsernameInput.value.trim() || "<username>";
    const r = ghRepoInput.value.trim() || "Dataset";
    modalTargetUrl.textContent = `https://github.com/${u}/${r}`;
}

async function saveGhConfig() {
    const username = ghUsernameInput.value.trim();
    const repo = ghRepoInput.value.trim() || "Dataset";
    const token = ghTokenInput.value.trim();

    if (!username) {
        showToast("Please enter a valid GitHub username!");
        ghUsernameInput.focus();
        return;
    }

    btnSaveGhConfig.disabled = true;
    btnSaveGhConfig.innerHTML = `<span class="radar-dot"></span> SAVING...`;

    try {
        const res = await fetch("/api/github_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, repo, token })
        });
        const result = await res.json();

        if (result.success) {
            showToast(`Connected to github.com/${username}/${repo}`);
            ghUser.textContent = username;
            targetRepoLink.href = `https://github.com/${username}/${repo}`;
            closeGhModal();
            fetchStats();
        } else {
            showToast(`Failed: ${result.message || "Invalid configuration"}`);
        }
    } catch (e) {
        showToast("Error updating GitHub config!");
    } finally {
        btnSaveGhConfig.disabled = false;
        btnSaveGhConfig.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> SAVE & CONNECT`;
    }
}

// 1-Click Auto-Detect via Local gh CLI
async function autoDetectGh() {
    btnAutoDetectGh.disabled = true;
    btnAutoDetectGh.innerHTML = `<span class="radar-dot"></span> DETECTING...`;

    try {
        const res = await fetch("/api/github_autodetect", { method: "POST" });
        const result = await res.json();

        if (result.success) {
            showToast(`Connected via CLI: @${result.username}/${result.repo || "Dataset"}`);
            ghUsernameInput.value = result.username;
            ghRepoInput.value = result.repo || "Dataset";
            ghUser.textContent = result.username;
            targetRepoLink.href = `https://github.com/${result.username}/${result.repo || "Dataset"}`;
            updateModalUrlPreview();
            setTimeout(() => {
                closeGhModal();
                fetchStats();
            }, 500);
        } else {
            showToast(result.message || "Could not auto-detect. Please enter manually.");
        }
    } catch (e) {
        showToast("Auto-detect failed. Please enter username manually.");
    } finally {
        btnAutoDetectGh.disabled = false;
        btnAutoDetectGh.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> AUTO-DETECT FROM CLI`;
    }
}
