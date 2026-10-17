// Swiss Minimalist Dataset Collector Client Logic (Dual-Mode: Static Web & Local Server)
// Author: Md. Mushfiqur Rahim & L
// Target: GitHub Pages (https://md-mushfiqur123.github.io/dataset-collector/) & Localhost

const DEFAULT_DOMAINS = {
    "physics": {
        "id": "physics",
        "name": "পদার্থবিজ্ঞান",
        "name_en": "Physics",
        "category": "STEM / Science",
        "icon": "atom",
        "accent": "#38BDF8",
        "description": "বলবিদ্যা, তাপগতিবিদ্যা, তড়িৎচুম্বকত্ব, আধুনিক পদার্থবিজ্ঞান ও কোয়ান্টাম মেকানিক্স।",
        "master_prompt": `[নির্দেশনা: তোমার সম্পূর্ণ অভ্যন্তরীণ চিন্তা (Internal Reasoning/Thinking Process) এবং চূড়ান্ত সমাধান—উভয়ই ১০০% বিশুদ্ধ প্রমিত বাংলাতে সম্পন্ন করতে হবে। কোনো ইংরেজি বাক্য বা অপব্যাখ্যা ব্যবহার করবে না।]

তুমি একজন বিশ্বমানের পদার্থবিজ্ঞানী, তাত্ত্বিক গবেষক ও শিক্ষক।
পদার্থবিজ্ঞানের নিচের বিষয়বস্তুর ওপর একটি উচ্চমানের, গভীর, বাস্তবসম্মত এবং চ্যালেঞ্জিং গাণিতিক/ধারণাগত সমস্যা তৈরি করো এবং প্রথম মূলনীতি (First Principles) থেকে ধাপে ধাপে গভীর চিন্তা (Deep Chain-of-Thought Reasoning) করে বাংলায় একটি নিখুঁত, তথ্যবহুল সমাধান প্রস্তুত করো:

পদ্ধতি ও আবশ্যিক শর্তাবলী:
১. <think> ট্যাগের ভেতর সম্পূর্ণ অভ্যন্তরীণ চিন্তা বাংলায় সাজাও। প্রতিটি ভৌত সূত্রের উৎপত্তি, চলক, ভেক্টর রূপ ও মাত্রিক শুদ্ধতা যাচাই করো।
২. সমস্যাটি বাস্তব জীবনের ভৌত ঘটনা বা উচ্চতর অলিম্পিয়াড/বিশ্ববিদ্যালয় পরীক্ষার ধারণাগত গভীরতায় সাজাও।
৩. প্রতিটি সূত্র, ডেরিভেশন ও ক্যালকুলাস ভিত্তিক ব্যবকলন বাংলায় যুক্তিসহ বুঝিয়ে বলো।
৪. সমাপনী উত্তরে চূড়ান্ত ফলাফল, বৈজ্ঞানিক তাৎপর্য ও একক স্পষ্ট করে বোল্ড/বক্সড করো।`
    },
    "chemistry": {
        "id": "chemistry",
        "name": "রসায়ন",
        "name_en": "Chemistry",
        "category": "STEM / Science",
        "icon": "flask",
        "accent": "#10B981",
        "description": "জৈব রসায়ন মেকানিজম, রাসায়নিক বন্ধন, সংকরায়ন, রাসায়নিক সাম্যাবস্থা ও স্টয়কিওমেট্রি।",
        "master_prompt": `[নির্দেশনা: তোমার সম্পূর্ণ অভ্যন্তরীণ চিন্তা (Internal Reasoning) এবং চূড়ান্ত আউটপুট ১০০% বিশুদ্ধ প্রমিত বাংলায় সম্পন্ন করতে হবে।]

তুমি একজন প্রথিতযশা রসায়নবিদ ও বিশ্ববিদ্যালয়ের অধ্যাপক।
রসায়নের একটি অত্যন্ত গুরুত্বপূর্ণ, জটিল ও গভীর ধারণাগত সমস্যা অথবা বিক্রিয়া মেকানিজম উপস্থাপন করো এবং ধাপে ধাপে গভীর বৈজ্ঞানিক যুক্তিসহকারে (Deep Chain-of-Thought Reasoning) বাংলায় সম্পূর্ণ সমাধান প্রস্তুত করো:

পদ্ধতি ও আবশ্যিক শর্তাবলী:
১. <think> ট্যাগের ভেতর সম্পূর্ণ চিন্তা বাংলায় করো। বিক্রিয়ার প্রতিটি ইলেকট্রন স্থানান্তর, ইলেকট্রোফাইল/নিউক্লিওফাইল ভূমিকা, অরবিটাল সংকরায়ন (Hybridization), ও মুক্ত শক্তি বা এনথালপির পরিবর্তন (ΔH, ΔG) বিশ্লেষণ করো।
২. সমতাকৃত রাসায়নিক সমীকরণ, প্রতিটি অন্তর্বর্তী যৌগ (Intermediate state) এবং বিক্রিয়া মেকানিজমের প্রতিটি তীরচিহ্ন যুক্তিযুক্তভাবে বাংলায় ব্যাখ্যা করো।
৩. কোনো আনুমানিক বা ভুল বিক্রিয়া দেওয়া যাবে না—কেবল পরীক্ষিত বিজ্ঞানভিত্তিক তথ্য ও সত্য উপস্থাপন করো।
৪. পরিশেষে উৎপাদ ও এর বৈশিষ্ট্য পরিষ্কারভাবে উল্লেখ করো।`
    },
    "mathematics": {
        "id": "mathematics",
        "name": "উচ্চতর গণিত",
        "name_en": "Higher Mathematics",
        "category": "STEM / Formal Science",
        "icon": "sigma",
        "accent": "#F59E0B",
        "description": "ক্যালকুলাস (লিমিট, ব্যবকলন, সমাকলন), স্থানাঙ্ক জ্যামিতি, বীজগণিত, ধারা ও সম্ভাবনা।",
        "master_prompt": `[নির্দেশনা: তোমার সম্পূর্ণ অভ্যন্তরীণ চিন্তা (Internal Reasoning) এবং চূড়ান্ত প্রমাণ/সমাধান ১০০% বিশুদ্ধ প্রমিত বাংলায় সম্পন্ন করতে হবে।]

তুমি একজন আন্তর্জাতিক গণিত অলিম্পিয়াড ট্রেইনার ও বিশুদ্ধ গণিতবিদ।
উচ্চতর গণিতের একটি গভীর, চিত্তাকর্ষক এবং অলিম্পিয়াড/বিশ্ববিদ্যালয় মানের সমস্যা তৈরি করো এবং ধাপে ধাপে নিখুঁত গাণিতিক যুক্তি সহকারে বাংলায় সমাধান করো:

পদ্ধতি ও আবশ্যিক শর্তাবলী:
১. <think> ট্যাগের ভেতর সম্পূর্ণ চিন্তা বাংলায় করো। সমস্যাটিকে ভেঙে মৌলিক উপপাদ্য, শর্ত ও লেম্মায় বিশ্লেষণ করো।
২. প্রতিটি বীজগণিতীয় রূপান্তর, ব্যবকলনীয় কৌশল, জ্যামিতিক বৈশিষ্ট্য এবং প্রমাণ পুঙ্খানুপুঙ্খভাবে স্পষ্ট করো। কোনো স্টেপ স্কিপ করবে না।
৩. সম্ভাব্য ভুল সমাধান (Common Pitfalls) এবং এজ কেসগুলো বিশ্লেষণ করে দেখাও।
৪. চূড়ান্ত উত্তরটি স্পষ্ট, নিখুঁত এবং বক্সড/বোল্ড আকারে চিহ্নিত করো।`
    },
    "biology": {
        "id": "biology",
        "name": "জীববিজ্ঞান",
        "name_en": "Biology",
        "category": "Life Sciences",
        "icon": "dna",
        "accent": "#A855F7",
        "description": "কোষ ও আণবিক জীববিজ্ঞান, জিনতত্ত্ব, মানব শারীরতত্ত্ব, এনজাইমোলজি এবং ইকোলজি।",
        "master_prompt": `[নির্দেশনা: তোমার সম্পূর্ণ অভ্যন্তরীণ চিন্তা (Internal Reasoning) এবং চূড়ান্ত আউটপুট ১০০% বিশুদ্ধ প্রমিত বাংলায় সম্পন্ন করতে হবে।]

তুমি একজন বিশেষজ্ঞ আণবিক জীববিজ্ঞানী ও শারীরতত্ত্ববিদ।
জীববিজ্ঞানের একটি জটিল শারীরবৃত্তীয় বা জিনগত মেকানিজমভিত্তিক প্রশ্ন উপস্থাপন করো এবং কোষীয়/আণবিক স্তরের গভীর বৈজ্ঞানিক যুক্তিসহকারে (Deep Chain-of-Thought Reasoning) বাংলায় বিশ্লেষণ করো:

পদ্ধতি ও আবশ্যিক শর্তাবলী:
১. <think> ট্যাগের ভেতর সম্পূর্ণ চিন্তা বাংলায় সাজাও। কোষের অভ্যন্তরে অণুসমূহের আন্তঃক্রিয়া ও শক্তি রূপান্তরের গতিপ্রকৃতি বিশ্লেষণ করো।
২. জৈব রাসায়নিক চক্র, এনজাইম কার্যপ্রণালী, সংকেত প্রেরণ (Signal Transduction) ও জিন প্রকাশের (Transcription & Translation) ধাপে ধাপে বৈজ্ঞানিক বর্ণনা দাও।
৩. চিকিৎসাবিজ্ঞান বা বাস্তুতন্ত্রে এই জৈবিক প্রক্রিয়ার বাস্তব গুরুত্ব স্পষ্টভাবে ব্যাখ্যা করো।`
    }
};

let currentDomain = "physics";
let currentMode = "smart";
let domainsData = DEFAULT_DOMAINS;
let duplicateDebounceTimer = null;
const isLocalServer = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// DOM Elements
const masterPromptBox = document.getElementById("masterPromptBox");
const activeDomainHeading = document.getElementById("activeDomainHeading");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");
const copyBtnText = document.getElementById("copyBtnText");

const smartFieldsGroup = document.getElementById("smartFieldsGroup");
const manualFieldsGroup = document.getElementById("manualFieldsGroup");
const transcriptGroup = document.getElementById("transcriptGroup");

const inputRawPaste = document.getElementById("inputRawPaste");
const splitStatusText = document.getElementById("splitStatusText");
const splitPrompt = document.getElementById("splitPrompt");
const splitReasoning = document.getElementById("splitReasoning");
const splitResponse = document.getElementById("splitResponse");
const splitPromptCount = document.getElementById("splitPromptCount");
const splitReasoningCount = document.getElementById("splitReasoningCount");
const splitResponseCount = document.getElementById("splitResponseCount");

const inputPrompt = document.getElementById("inputPrompt");
const inputReasoning = document.getElementById("inputReasoning");
const inputResponse = document.getElementById("inputResponse");
const thinkWordCount = document.getElementById("thinkWordCount");
const responseWordCount = document.getElementById("responseWordCount");

const inputTranscript = document.getElementById("inputTranscript");
const transcriptWordCount = document.getElementById("transcriptWordCount");

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
const ghRepoName = document.getElementById("ghRepoName");
const targetRepoLink = document.getElementById("targetRepoLink");

const btnSubmit = document.getElementById("btnSubmit");
const btnForcePush = document.getElementById("btnForcePush");
const btnExportShard = document.getElementById("btnExportShard");
const btnClear = document.getElementById("btnClear");
const toast = document.getElementById("toast");

// Dual-Stage Rolling Storage Telemetry Elements
const s1CapacityText = document.getElementById("s1CapacityText");
const s1ProgressFill = document.getElementById("s1ProgressFill");
const s1PercentText = document.getElementById("s1PercentText");
const s2CapacityText = document.getElementById("s2CapacityText");
const s2ProgressFill = document.getElementById("s2ProgressFill");
const s2PercentText = document.getElementById("s2PercentText");
const btnCompressNow = document.getElementById("btnCompressNow");
const btnDownloadZipQuick = document.getElementById("btnDownloadZipQuick");
const milestoneZipBanner = document.getElementById("milestoneZipBanner");
const btnDownloadMilestoneZip = document.getElementById("btnDownloadMilestoneZip");

const btnOpenGhModal = document.getElementById("btnOpenGhModal");
const ghModal = document.getElementById("ghModal");
const btnCloseGhModal = document.getElementById("btnCloseGhModal");
const btnCancelGhModal = document.getElementById("btnCancelGhModal");
const btnSaveGhConfig = document.getElementById("btnSaveGhConfig");
const btnAutoDetectGh = document.getElementById("btnAutoDetectGh");
const autodetectBanner = document.getElementById("autodetectBanner");
const ghUsernameInput = document.getElementById("ghUsernameInput");
const ghRepoInput = document.getElementById("ghRepoInput");
const ghTokenInput = document.getElementById("ghTokenInput");
const modalTargetUrl = document.getElementById("modalTargetUrl");

// ==========================================================================
// 🛡️ CLIENT-SIDE 83% DUPLICATE GATEKEEPER ENGINE (datas.paint spec)
// ==========================================================================
const SIMILARITY_THRESHOLD = 0.83; // 83% max repeat allowed

function normalizeText(text) {
    return (text || "")
        .replace(/[\s\n\r\t]+/g, ' ')
        .replace(/[^\w\s\u0980-\u09FF]/g, '')
        .trim()
        .toLowerCase();
}

function extractShingles(text, k = 4) {
    if (text.length > 50000) text = text.substring(0, 50000);
    const norm = normalizeText(text);
    if (norm.length < k) return new Set([norm]);
    const shingles = new Set();
    for (let i = 0; i <= norm.length - k; i++) {
        shingles.add(norm.substring(i, i + k));
    }
    return shingles;
}

function jaccardSimilarity(setA, setB) {
    if (!setA.size || !setB.size) return 0.0;
    let intersection = 0;
    for (const item of setA) {
        if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union > 0 ? (intersection / union) : 0.0;
}

function getStoredSignatures() {
    try {
        const raw = localStorage.getItem("mushfiqur_dedup_signatures");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveSignature(sampleId, text, domain) {
    try {
        const signatures = getStoredSignatures();
        const shingles = Array.from(extractShingles(text));
        signatures.push({
            id: sampleId,
            domain: domain,
            timestamp: new Date().toISOString(),
            shingles: shingles
        });
        // Keep last 10,000 in local storage
        if (signatures.length > 10000) signatures.splice(0, signatures.length - 10000);
        localStorage.setItem("mushfiqur_dedup_signatures", JSON.stringify(signatures));
    } catch (e) {
        console.warn("Could not save signature to localStorage", e);
    }
}

function checkClientSimilarity(text) {
    if (!text || text.trim().length < 15) {
        return { allowed: true, similarity: 0.0, matchedId: null };
    }
    const incoming = extractShingles(text);
    const signatures = getStoredSignatures();
    let maxSim = 0.0;
    let matchedId = null;

    for (const record of signatures) {
        const existing = new Set(record.shingles);
        const sim = jaccardSimilarity(incoming, existing);
        if (sim > maxSim) {
            maxSim = sim;
            matchedId = record.id;
            if (maxSim >= SIMILARITY_THRESHOLD) break;
        }
    }

    return {
        allowed: maxSim < SIMILARITY_THRESHOLD,
        similarity: Math.round(maxSim * 10000) / 10000,
        matchedId: matchedId
    };
}

// ==========================================================================
// 📦 CLIENT-SIDE SHARD BUFFER (LOCAL STORAGE)
// ==========================================================================
function getLocalBuffer() {
    try {
        const raw = localStorage.getItem("mushfiqur_dataset_buffer");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveToLocalBuffer(record) {
    const buffer = getLocalBuffer();
    buffer.push(record);
    localStorage.setItem("mushfiqur_dataset_buffer", JSON.stringify(buffer));
    updateLocalStats();
}

function clearLocalBuffer() {
    localStorage.removeItem("mushfiqur_dataset_buffer");
    updateLocalStats();
}

function renderStorageTelemetry(s1Bytes, s2Bytes) {
    const target1GB = 1024 * 1024 * 1024; // 1 GB in bytes
    const s1MB = (s1Bytes / (1024 * 1024)).toFixed(2);
    const s1Pct = Math.min(100, (s1Bytes / target1GB) * 100).toFixed(1);

    const s2MB = (s2Bytes / (1024 * 1024)).toFixed(2);
    const s2Pct = Math.min(100, (s2Bytes / target1GB) * 100).toFixed(1);

    if (s1CapacityText) s1CapacityText.textContent = `${s1MB} MB / 1 GB`;
    if (s1ProgressFill) s1ProgressFill.style.width = `${s1Pct}%`;
    if (s1PercentText) s1PercentText.textContent = `${s1Pct}%`;

    if (s2CapacityText) s2CapacityText.textContent = `${s2MB} MB / 1 GB`;
    if (s2ProgressFill) s2ProgressFill.style.width = `${s2Pct}%`;
    if (s2PercentText) s2PercentText.textContent = `${s2Pct}%`;

    // When S2 reaches 1 GB (or 100%), reveal milestone banner
    if (milestoneZipBanner) {
        if (s2Bytes >= target1GB || parseFloat(s2Pct) >= 100.0) {
            milestoneZipBanner.style.display = "flex";
        } else {
            milestoneZipBanner.style.display = "none";
        }
    }
}

async function fetchServerStats() {
    if (!isLocalServer) return;
    try {
        const res = await fetch("/api/stats");
        if (res.ok) {
            const data = await res.json();
            renderStorageTelemetry(data.s1_uncomp_bytes || 0, data.s2_comp_bytes || 0);
            if (bufferDisplay) {
                bufferDisplay.textContent = `${data.s1_uncomp_mb || 0} MB / 1024 MB (${data.s1_uncomp_percent || 0}%)`;
            }
            if (pushStatusPill) {
                pushStatusPill.textContent = `SHARDS: ${data.total_pushed_shards || 0} | SAMPLES: ${data.total_pushed_samples || 0}`;
            }
        }
    } catch (e) {
        // silent fallback
    }
}

function updateLocalStats() {
    const buffer = getLocalBuffer();
    const count = buffer.length;
    const jsonStr = JSON.stringify(buffer);
    const bytes = new Blob([jsonStr]).size;
    const kb = (bytes / 1024).toFixed(1);
    const mb = (bytes / (1024 * 1024)).toFixed(3);

    bufferDisplay.textContent = `${kb} KB / 1024 MB (${((bytes / (1024 * 1024 * 1024)) * 100).toFixed(2)}%)`;
    pushStatusPill.textContent = `LOCAL SHARDS: ${count}`;

    if (isLocalServer) {
        fetchServerStats();
    } else {
        const rawBytes = bytes;
        const compBytes = Math.round(rawBytes * 0.053); // ~18.8x compression ratio for gzip Bengali text
        renderStorageTelemetry(rawBytes, compBytes);
    }

    if (count === 0) {
        shardsList.innerHTML = `<div class="shard-item empty">Zero setup required. Your submissions are preserved locally and pushed directly to GitHub.</div>`;
    } else {
        shardsList.innerHTML = buffer.slice(-5).reverse().map((rec, i) => `
            <div class="shard-card">
                <span class="shard-tag">${escapeHtml(rec.domain.toUpperCase())}</span>
                <span class="shard-title">${escapeHtml(rec.prompt.substring(0, 45))}...</span>
                <span class="shard-tokens">~${Math.round((rec.response.length / 4) * 1.35)} tok</span>
            </div>
        `).join("");
    }
}

// GitHub Config Management
function getGhConfig() {
    try {
        const raw = localStorage.getItem("mushfiqur_gh_config");
        return raw ? JSON.parse(raw) : { username: "MD-Mushfiqur123", repo: "scientific-reasoning-dataset", token: "" };
    } catch (e) {
        return { username: "MD-Mushfiqur123", repo: "scientific-reasoning-dataset", token: "" };
    }
}

function saveGhConfigLocal(username, repo, token) {
    localStorage.setItem("mushfiqur_gh_config", JSON.stringify({ username, repo, token }));
    applyGhConfigUI();
}

function applyGhConfigUI() {
    const cfg = getGhConfig();
    const user = cfg.username || "MD-Mushfiqur123";
    const repo = cfg.repo || "scientific-reasoning-dataset";
    if (ghUser) ghUser.textContent = user;
    if (ghRepoName) ghRepoName.textContent = repo;
    if (targetRepoLink) targetRepoLink.href = `https://github.com/${user}/${repo}`;
}

// ==========================================================================
// 🚀 INITIALIZE APPLICATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    applyGhConfigUI();
    loadDomains();
    setupEventListeners();
    updateLocalStats();

    if (!isLocalServer && autodetectBanner) {
        autodetectBanner.style.display = "none"; // Hide CLI autodetect on static web
    }
});

async function loadDomains() {
    if (isLocalServer) {
        try {
            const res = await fetch("/api/domains");
            if (res.ok) domainsData = await res.json();
        } catch (e) {
            console.log("Using static default domains fallback.");
        }
    } else {
        try {
            const res = await fetch("./domains.json");
            if (res.ok) domainsData = await res.json();
        } catch (e) {
            domainsData = DEFAULT_DOMAINS;
        }
    }
    updateDomainView(currentDomain);
}

function updateDomainView(domainKey) {
    currentDomain = domainKey;
    document.body.dataset.activeDomain = domainKey;
    const dom = domainsData[domainKey] || DEFAULT_DOMAINS[domainKey];
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

// ==========================================================================
// 🧠 INTELLIGENT AUTO-SPLITTER ALGORITHM
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

function updateMetrics() {
    let totalWords = 0;

    if (currentMode === "smart") {
        totalWords = countWords(splitPrompt.value) + countWords(splitReasoning.value) + countWords(splitResponse.value);
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

// 83% Duplicate Radar Check
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

        if (isLocalServer) {
            try {
                const res = await fetch("/api/check_similarity", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: textToCheck })
                });
                if (res.ok) {
                    const data = await res.json();
                    renderRadarResult(data.allowed, data.similarity);
                    return;
                }
            } catch (e) {
                // fallback to client check
            }
        }

        // Static Client-side Check
        const clientResult = checkClientSimilarity(textToCheck);
        renderRadarResult(clientResult.allowed, clientResult.similarity);
    }, 300);
}

function renderRadarResult(allowed, similarity) {
    const simPct = (similarity * 100).toFixed(1);
    const uniqPct = (100 - simPct).toFixed(1);

    if (allowed) {
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
}

// ==========================================================================
// 💾 SUBMISSION & EXPORT ENGINE
// ==========================================================================
const DOMAIN_SAMPLES = {
    "physics": `[প্রশ্ন] একটি বস্তুর ভর ১০ কেজি এবং এটি ২০ মি/সে বেগে গতিশীল। বস্তুটির গতিশক্তি কত?

<think>
আমি পদার্থবিজ্ঞানের চিরায়ত বলবিদ্যার নিয়ম বিবেচনা করব।
গতিশক্তির সমীকরণ: E_k = 1/2 * m * v^2।
এখানে ভর m = 10 kg, বেগ v = 20 m/s।
তাহলে E_k = 0.5 * 10 * (20)^2 = 0.5 * 10 * 400 = 2000 জুল।
মাত্রিক সমীকরণ [M L^2 T^-2] এবং একক জুল (J) ঠিক আছে।
</think>

চূড়ান্ত সমাধান:
প্রদত্ত বস্তুটির মোট গতিশক্তি ২০০০ জুল (2000 J)।`,

    "chemistry": `[প্রশ্ন] ইথিনের সাথে ব্রোমিন পানির বিক্রিয়ার সমীকরণ ও মেকানিজম বাংলায় ব্যাখ্যা করো।

<think>
ইথিন (CH2=CH2) একটি অসম্পৃক্ত হাইড্রোকার্বন।
ব্রোমিন পানির (Br2 in H2O) সাথে বিক্রিয়ায় দ্বিবন্ধনের পাই ইলেকট্রন দ্বারা ব্রোমিন অণুর মেরুকরণ ঘটে।
একটি ব্রোমাইড আয়ন মুক্ত হয় এবং অন্তর্বর্তী ব্রোমোনিয়াম আয়ন গঠিত হয়।
পরবর্তীতে বিপরীত দিক থেকে নিউক্লিওফিলিক আক্রমণ হয়ে ১,২-ডাইব্রোমোইথেন (CH2Br-CH2Br) তৈরি হয়।
এর ফলে ব্রোমিন পানির লাল বর্ণ দূরীভূত হয়ে বর্ণহীন হয়।
</think>

চূড়ান্ত সমাধান:
ইথিনের সাথে লাল বর্ণের ব্রোমিন পানি যুক্ত করলে ব্রোমিনের লাল বর্ণ বর্ণহীন হয়ে যায় এবং বর্ণহীন ১,২-ডাইব্রোমোইথেন উৎপন্ন হয়। এটি অ্যালকিনের অসম্পৃক্ততা পরীক্ষার একটি প্রধান বিক্রিয়া।`,

    "mathematics": `[সমস্যা] সমাকলন নির্ণয় করো: ∫ x * e^x dx

<think>
আমরা ইন্টিগ্রেশন বাই পার্টস (Integration by Parts) সূত্র ব্যবহার করব:
∫ u v dx = u ∫ v dx - ∫ (u' ∫ v dx) dx
এখানে LIATE নিয়ম অনুসারে u = x (বীজগাণিতিক) এবং v = e^x (সূচকীয়)।
তাহলে:
1. u' = d/dx(x) = 1
2. ∫ v dx = ∫ e^x dx = e^x
মান বসিয়ে পাই:
∫ x * e^x dx = x * e^x - ∫ 1 * e^x dx = x * e^x - e^x + C = e^x (x - 1) + C
যেখানে C একটি সমাকলন ধ্রুবক।
</think>

চূড়ান্ত সমাধান:
প্রদত্ত রাশির সমাকলিত রূপ: e^x (x - 1) + C, যেখানে C হলো একটি সমাকলন ধ্রুবক।`,

    "biology": `[প্রশ্ন] কোষীয় শ্বসনে গ্লাইকোলাইসিস প্রক্রিয়ার মূল পর্যায় ও নিট শক্তি উৎপাদন বাংলায় ব্যাখ্যা করো।

<think>
গ্লাইকোলাইসিস সাইটোপ্লাজমে সম্পন্ন হয়। এটি সবাত ও অবাত উভয় শ্বসনেরই প্রাথমিক ধাপ।
এক অণু গ্লুকোজ (৬ কার্বন) ক্রমান্বয়ে ভেঙে দুই অণু পাইরুভিক অ্যাসিডে (৩ কার্বন) পরিণত হয়।
প্রক্রিয়াটিতে মোট ৪ অণু ATP এবং ২ অণু NADH+H+ উৎপন্ন হয়।
কিন্তু প্রাথমিক ফসফোরাইলেশনে ২ অণু ATP ব্যয় হয়ে যায়।
সুতরাং নিট লাভ = (৪ - ২) = ২ অণু ATP এবং ২ অণু NADH+H+।
</think>

চূড়ান্ত সমাধান:
গ্লাইকোলাইসিস প্রক্রিয়ায় সাইটোপ্লাজমে ১ অণু গ্লুকোজ জারিত হয়ে ২ অণু পাইরুভিক অ্যাসিড উৎপন্ন করে এবং নিট শক্তি হিসেবে ২ অণু ATP ও ২ অণু NADH+H+ অর্জিত হয়।`
};

function loadDomainSample() {
    const sample = DOMAIN_SAMPLES[currentDomain] || DOMAIN_SAMPLES["physics"];
    inputRawPaste.value = sample;
    handleRawPasteAutoSplit();
    showToast(`✓ Loaded sample ${currentDomain.toUpperCase()} record!`);
}

async function submitRecord() {
    let payload = {};

    if (currentMode === "smart") {
        const prompt = splitPrompt.value.trim();
        const reasoning = splitReasoning.value.trim();
        const response = splitResponse.value.trim();
        const raw = inputRawPaste.value.trim();

        if (!response && !raw) {
            showToast("অনুগ্রহ করে আপনার AI আউটপুট পেস্ট করুন বা 'LOAD SAMPLE' চাপুন!");
            inputRawPaste.focus();
            return;
        }

        payload = {
            id: `mushfiqur_${currentDomain}_${Date.now()}`,
            timestamp: new Date().toISOString(),
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
            id: `mushfiqur_${currentDomain}_${Date.now()}`,
            timestamp: new Date().toISOString(),
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
            id: `mushfiqur_${currentDomain}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            domain: currentDomain,
            mode: "transcript",
            prompt: `Transcribed educational content for ${currentDomain}`,
            reasoning: "",
            response: transcript
        };
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="radar-dot"></span> PUSHING...`;

    // 1. Try local server if running locally
    if (isLocalServer) {
        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const result = await res.json();
                showToast(result.message || "Record successfully validated and pushed!");
                saveSignature(payload.id, `${payload.prompt} ${payload.response}`, payload.domain);
                clearForm();
                await fetchServerStats();
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> 🚀 SUBMIT &amp; PUSH TO DATASET`;
                return;
            }
        } catch (e) {
            console.log("Local server unavailable, executing web push.");
        }
    }

    // 2. Client-side storage & instant push to GitHub
    saveToLocalBuffer(payload);
    saveSignature(payload.id, `${payload.prompt} ${payload.response}`, payload.domain);
    updateLocalStats();

    const cfg = getGhConfig();
    if (cfg.token) {
        showToast("🚀 Pushing record directly to GitHub via Token...");
        await pushRecordToGitHub(payload);
    } else {
        showToast("🚀 Opening 1-Click Ingestion on GitHub...");
        submitViaGitHubIssue([payload]);
    }

    clearForm();
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> 🚀 SUBMIT &amp; PUSH TO DATASET`;
}

// Push a single record directly to GitHub repository via REST API
async function pushRecordToGitHub(record) {
    const cfg = getGhConfig();
    const user = cfg.username || "MD-Mushfiqur123";
    const repo = cfg.repo || "scientific-reasoning-dataset";

    try {
        const dateStr = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15);
        const filename = `shards/mushfiqur_${record.domain}_shard_${dateStr}.jsonl`;
        const content = JSON.stringify(record) + "\n";
        const b64Content = btoa(unescape(encodeURIComponent(content)));

        const url = `https://api.github.com/repos/${user}/${repo}/contents/${filename}`;
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${cfg.token}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `feat(dataset): add 1 verified ${record.domain} CoT record [distilled]`,
                content: b64Content
            })
        });

        if (res.ok) {
            showToast(`✓ Successfully pushed directly to ${user}/${repo}!`);
        } else {
            const err = await res.json();
            showToast(`GitHub Error: ${err.message || "Failed to commit"}`);
            submitViaGitHubIssue([record]);
        }
    } catch (e) {
        showToast("Network error. Opening GitHub Issue fallback...");
        submitViaGitHubIssue([record]);
    }
}

// Export Local Shard as .jsonl file
function exportLocalShard() {
    const buffer = getLocalBuffer();
    if (buffer.length === 0) {
        showToast("No submissions in buffer to export yet! Add some records first.");
        return;
    }
    const jsonlContent = buffer.map(rec => JSON.stringify(rec)).join("\n");
    const blob = new Blob([jsonlContent], { type: "application/x-ndjson;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15);
    a.href = url;
    a.download = `mushfiqur_${currentDomain}_shard_${dateStr}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${buffer.length} records as .jsonl!`);
}

// Manual Compress Trigger (Prunes raw buffer & creates .jsonl.gz shard)
async function triggerManualCompress() {
    if (isLocalServer) {
        try {
            showToast("⚡ র' বাফার সংকুচিত ও ডিলিট করা হচ্ছে...");
            const res = await fetch("/api/compress_now", { method: "POST" });
            const data = await res.json();
            showToast(data.message || "বাফার সংকুচিত হয়েছে এবং র' ফাইল ডিলিট হয়েছে!");
            await fetchServerStats();
        } catch (e) {
            showToast("Compression request failed.");
        }
    } else {
        exportLocalShard();
        showToast("Static Web: Local shard exported as .jsonl!");
    }
}

// ==========================================================================
// ⚡ UNIVERSAL ANY-STAGE COMPRESSED EXPORT ENGINE (.ZIP / .JSONL.GZ)
// Works 100% offline at ANY stage (1 sample, 10 samples, or thousands!)
// ==========================================================================
async function exportCompressedData() {
    const btns = [
        document.getElementById("btnExportCompressed"),
        document.getElementById("btnExportCompressedS1"),
        document.getElementById("btnDownloadZipQuick"),
        document.getElementById("btnDownloadMilestoneZip")
    ].filter(Boolean);

    btns.forEach(b => {
        b.dataset.origHtml = b.innerHTML;
        b.disabled = true;
        b.innerHTML = `<svg class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg> COMPRESSING...`;
    });

    try {
        if (isLocalServer) {
            // Local Python Server Mode:
            // Triggers on-the-fly compression of any active buffer, packages all .jsonl.gz into zip!
            showToast("⚡ সংকুচিত জিপ প্রস্তুত হচ্ছে (বাফার কম্প্রেস + শার্ড প্যাকেজিং)...");
            window.location.href = "/api/export_compressed";
            setTimeout(async () => {
                await fetchServerStats();
                showToast("✓ ১-ক্লিক সংকুচিত জিপ (.zip) সফলভাবে ডাউনলোড শুরু হয়েছে!");
            }, 800);
            return;
        }

        // Client-Side Browser Mode (GitHub Pages / Offline Web Studio):
        const buffer = getLocalBuffer();
        if (!buffer || buffer.length === 0) {
            showToast("⚠️ এক্সপোর্ট করার মতো কোনো ডাটা পাওয়া যায়নি। আগে কোনো স্যাম্পল ইনজেস্ট করুন!");
            return;
        }

        const dateStr = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15);
        const jsonlContent = buffer.map(rec => JSON.stringify(rec)).join("\n");
        const rawBytes = new TextEncoder().encode(jsonlContent);
        const rawSizeKB = (rawBytes.length / 1024).toFixed(1);

        // Native Browser GZIP Compression via CompressionStream API
        if (typeof CompressionStream !== "undefined") {
            showToast(`⚡ ${buffer.length} টি রেকর্ড সংকুচিত করা হচ্ছে (GZIP CompressionStream)...`);
            const stream = new Blob([rawBytes]).stream();
            const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
            const compressedResponse = new Response(compressedStream);
            const blob = await compressedResponse.blob();
            const compressedSizeKB = (blob.size / 1024).toFixed(1);
            const savings = Math.max(1, Math.round((1 - (blob.size / rawBytes.length)) * 100));

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mushfiqur_${currentDomain}_compressed_${dateStr}.jsonl.gz`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast(`✓ সংকুচিত এক্সপোর্ট সফল! ${rawSizeKB} KB → ${compressedSizeKB} KB (${savings}% সাইজ সাশ্রয়) [${buffer.length} records]`);
        } else {
            // Fallback for browsers without CompressionStream
            exportLocalShard();
        }
    } catch (err) {
        console.error("Export compressed error:", err);
        showToast("এক্সপোর্ট করতে সমস্যা হয়েছে: " + (err.message || err));
        exportLocalShard(); // Safe fallback
    } finally {
        setTimeout(() => {
            btns.forEach(b => {
                b.disabled = false;
                if (b.dataset.origHtml) b.innerHTML = b.dataset.origHtml;
            });
        }, 1200);
    }
}

// Download 1 GB ZIP Archive
function downloadZipArchive() {
    exportCompressedData();
}

// Push buffer to GitHub
async function forcePush() {
    const buffer = getLocalBuffer();
    if (buffer.length === 0 && !isLocalServer) {
        showToast("Buffer is currently empty. Submit records first!");
        return;
    }

    btnForcePush.disabled = true;
    btnForcePush.textContent = "PUSHING...";

    if (isLocalServer) {
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            const result = await res.json();
            showToast(result.message);
        } catch (e) {
            showToast("Local sync failed!");
        } finally {
            btnForcePush.disabled = false;
            btnForcePush.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> PUSH NOW`;
        }
        return;
    }

    // Client GitHub Push via REST API
    const cfg = getGhConfig();
    const user = cfg.username || "MD-Mushfiqur123";
    const repo = cfg.repo || "scientific-reasoning-dataset";

    if (!cfg.token) {
        showToast("🚀 Zero-Token Ingestion: Opening automated GitHub submission...");
        submitViaGitHubIssue(buffer);
        btnForcePush.disabled = false;
        btnForcePush.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> PUSH NOW`;
        return;
    }

    try {
        const dateStr = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "").slice(0, 15);
        const filename = `shards/mushfiqur_${currentDomain}_shard_${dateStr}.jsonl`;
        const content = buffer.map(r => JSON.stringify(r)).join("\n");
        const b64Content = btoa(unescape(encodeURIComponent(content)));

        const url = `https://api.github.com/repos/${user}/${repo}/contents/${filename}`;
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${cfg.token}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `feat(dataset): add ${buffer.length} verified ${currentDomain} CoT records [distilled]`,
                content: b64Content
            })
        });

        if (res.ok) {
            showToast(`✓ Successfully pushed ${buffer.length} records to ${user}/${repo}!`);
            clearLocalBuffer();
        } else {
            const err = await res.json();
            showToast(`GitHub Error: ${err.message || "Failed to commit"}`);
            submitViaGitHubIssue(buffer);
        }
    } catch (e) {
        showToast("Network error pushing to GitHub API");
    } finally {
        btnForcePush.disabled = false;
        btnForcePush.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> PUSH NOW`;
    }
}

// 1-Click Community Issue Submission directly to scientific-reasoning-dataset
function submitViaGitHubIssue(buffer) {
    if (!buffer || buffer.length === 0) return;
    const cfg = getGhConfig();
    const user = cfg.username || "MD-Mushfiqur123";
    const repo = cfg.repo || "scientific-reasoning-dataset";

    const title = encodeURIComponent(`[Dataset Submission] ${currentDomain.toUpperCase()} (${buffer.length} records)`);
    const bodyContent = `### 🧬 Community Dataset Submission (${currentDomain.toUpperCase()})
**Records in batch:** ${buffer.length}
**Contributor:** Web Studio User
**Timestamp:** ${new Date().toISOString()}

\`\`\`json
${JSON.stringify(buffer, null, 2)}
\`\`\`

*(🤖 Note: This submission will be automatically verified by Mushfiqur's GitHub Actions Bot. Valid unique records [<83% similarity] will be auto-merged into official shards in ${user}/${repo} and this issue will be closed automatically.)*`;

    // GitHub Fastly/Nginx rejects URLs > ~2KB with ERR_CONNECTION_CLOSED.
    // Safe Production Spec: Automatically copy payload to clipboard and open clean issue URL!
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(bodyContent);
        }
    } catch (e) {
        console.log("Clipboard write fallback");
    }

    showToast("📋 ডেটা ক্লিপবোর্ডে কপি হয়েছে! নতুন পেইজে শুধু Ctrl+V চেপে Submit করুন।");

    const cleanIssueUrl = `https://github.com/${user}/${repo}/issues/new?title=${title}&labels=dataset-submission,bengali-reasoning`;
    window.open(cleanIssueUrl, "_blank");
}

function clearForm() {
    inputRawPaste.value = "";
    splitPrompt.value = "";
    splitReasoning.value = "";
    splitResponse.value = "";
    splitStatusText.textContent = "Awaiting paste...";

    inputPrompt.value = "";
    inputReasoning.value = "";
    inputResponse.value = "";
    inputTranscript.value = "";

    updateSmartCounts();
    updateMetrics();
    triggerDuplicateRadarCheck();
}

// GitHub Modal
function openGhModal() {
    const cfg = getGhConfig();
    ghUsernameInput.value = cfg.username || "MD-Mushfiqur123";
    ghRepoInput.value = cfg.repo || "Dataset";
    ghTokenInput.value = cfg.token || "";
    updateModalUrlPreview();
    ghModal.classList.remove("hidden");
}

function closeGhModal() {
    ghModal.classList.add("hidden");
}

function updateModalUrlPreview() {
    const u = ghUsernameInput.value.trim() || "MD-Mushfiqur123";
    const r = ghRepoInput.value.trim() || "Dataset";
    modalTargetUrl.textContent = `https://github.com/${u}/${r}`;
}

function saveGhConfig() {
    const username = ghUsernameInput.value.trim() || "MD-Mushfiqur123";
    const repo = ghRepoInput.value.trim() || "Dataset";
    const token = ghTokenInput.value.trim();

    saveGhConfigLocal(username, repo, token);
    closeGhModal();
    showToast(`Target set to https://github.com/${username}/${repo}`);
}

async function autoDetectGh() {
    if (!isLocalServer) {
        showToast("Auto-detect is available when running local server via Python.");
        return;
    }
    try {
        const res = await fetch("/api/github_autodetect", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            ghUsernameInput.value = data.username;
            ghRepoInput.value = data.repo || "Dataset";
            updateModalUrlPreview();
            showToast(`Auto-detected from local CLI: @${data.username}`);
        }
    } catch (e) {
        showToast("Could not auto-detect CLI account.");
    }
}

// Helpers
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 3500);
}

// Setup Event Listeners
function setupEventListeners() {
    document.querySelectorAll(".domain-tab").forEach(tab => {
        tab.addEventListener("click", () => updateDomainView(tab.dataset.domain));
    });

    btnCopyPrompt.addEventListener("click", () => {
        const text = masterPromptBox.textContent;
        navigator.clipboard.writeText(text).then(() => {
            copyBtnText.textContent = "COPIED!";
            showToast("Master Prompt copied to clipboard!");
            setTimeout(() => { copyBtnText.textContent = "COPY"; }, 2000);
        });
    });

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentMode = btn.dataset.mode;

            smartFieldsGroup.style.display = currentMode === "smart" ? "block" : "none";
            manualFieldsGroup.style.display = currentMode === "manual" ? "block" : "none";
            transcriptGroup.style.display = currentMode === "transcript" ? "block" : "none";

            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    inputRawPaste.addEventListener("input", handleRawPasteAutoSplit);
    inputRawPaste.addEventListener("paste", () => setTimeout(handleRawPasteAutoSplit, 50));

    [splitPrompt, splitReasoning, splitResponse].forEach(el => {
        el.addEventListener("input", () => {
            updateSmartCounts();
            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    [inputPrompt, inputReasoning, inputResponse, inputTranscript].forEach(el => {
        el.addEventListener("input", () => {
            updateMetrics();
            triggerDuplicateRadarCheck();
        });
    });

    btnSubmit.addEventListener("click", submitRecord);
    btnForcePush.addEventListener("click", forcePush);
    btnExportShard.addEventListener("click", exportLocalShard);
    btnClear.addEventListener("click", clearForm);

    const btnExportCompressed = document.getElementById("btnExportCompressed");
    if (btnExportCompressed) {
        btnExportCompressed.addEventListener("click", exportCompressedData);
    }
    const btnExportCompressedS1 = document.getElementById("btnExportCompressedS1");
    if (btnExportCompressedS1) {
        btnExportCompressedS1.addEventListener("click", exportCompressedData);
    }

    if (btnCompressNow) {
        btnCompressNow.addEventListener("click", triggerManualCompress);
    }
    if (btnDownloadZipQuick) {
        btnDownloadZipQuick.addEventListener("click", downloadZipArchive);
    }
    if (btnDownloadMilestoneZip) {
        btnDownloadMilestoneZip.addEventListener("click", downloadZipArchive);
    }

    const btnLoadSample = document.getElementById("btnLoadSample");
    if (btnLoadSample) {
        btnLoadSample.addEventListener("click", loadDomainSample);
    }

    btnOpenGhModal.addEventListener("click", openGhModal);
    btnCloseGhModal.addEventListener("click", closeGhModal);
    btnCancelGhModal.addEventListener("click", closeGhModal);
    btnSaveGhConfig.addEventListener("click", saveGhConfig);
    btnAutoDetectGh.addEventListener("click", autoDetectGh);

    [ghUsernameInput, ghRepoInput].forEach(inp => {
        inp.addEventListener("input", updateModalUrlPreview);
    });

    ghModal.addEventListener("click", (e) => {
        if (e.target === ghModal) closeGhModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !ghModal.classList.contains("hidden")) closeGhModal();
    });
}
