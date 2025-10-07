/* ===== Word sources ===== */
let WORDS = [];                 // allowed guesses
let ALL_ALLOWED = new Set();    // Set for O(1) lookups

// Optional: a small curated set for ANSWERS (so the target isn't too obscure)
const CURATED_ANSWERS = ["apple","train","light","sound","grain","crane","pride","clean","spice","pilot"];
const USE_BIG_LIST_FOR_ANSWERS = true; // set false to pick from CURATED_ANSWERS

/* ===== Load big dictionary with caching ===== */
const WORDLIST_CACHE_KEY = "wordlist_v1";   // bump to v2 if you change filter logic
const WORDLIST_CACHE_COUNT = "wordlist_v1_count";

async function loadWordList() {
  // 1) Try cache first
  const cached = localStorage.getItem(WORDLIST_CACHE_KEY);
  if (cached) {
    try {
      WORDS = JSON.parse(cached);
      ALL_ALLOWED = new Set(WORDS);
      console.log(`Loaded ${localStorage.getItem(WORDLIST_CACHE_COUNT)} words from cache`);
      // Start a new game (if one isn't already running)
      if (!answer) newGame();
      // Also refresh cache in the background (non-blocking)
      refreshWordListInBackground();
      return;
    } catch {}
  }

  // 2) Fetch and parse words.txt
  await refreshWordListInBackground(true);
}

async function refreshWordListInBackground(startGameAfter = false) {
  try {
    const res = await fetch("words.txt", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    // Filter: keep only 5-letter a-z and de-dup
    // (This yields ~#lines where each line is one word)
    const seen = new Set();
    const list = [];
    for (const line of text.split(/\r?\n/)) {
      const w = line.trim().toLowerCase();
      if (w.length === 5 && /^[a-z]{5}$/.test(w) && !seen.has(w)) {
        seen.add(w);
        list.push(w);
      }
    }

    // Cache
    localStorage.setItem(WORDLIST_CACHE_KEY, JSON.stringify(list));
    localStorage.setItem(WORDLIST_CACHE_COUNT, String(list.length));

    WORDS = list;
    ALL_ALLOWED = new Set(list);
    console.log(`Parsed & cached ${list.length} 5-letter words from words.txt`);

    if (startGameAfter) newGame();        // first load
    else if (USE_BIG_LIST_FOR_ANSWERS) {  // if already playing & you want new words immediately
      // optional: don’t interrupt current game;
      // next New Game will use the big list automatically.
    }
  } catch (e) {
    console.error("Failed to load words.txt", e);
    // Keep whatever we had (maybe fallback) so the game stays playable.
  }
}

/* ===== Picking an answer ===== */
function pickWord() {
  if (USE_BIG_LIST_FOR_ANSWERS && WORDS.length > 0) {
    // Cryptographically-strong random index (nice to have for big lists)
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const idx = buf[0] % WORDS.length;
    return WORDS[idx];
  }
  // fallback to curated if big list not ready
  return CURATED_ANSWERS[Math.floor(Math.random() * CURATED_ANSWERS.length)];
}

/* ===== Init (simplified) ===== */
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("theme-dark", savedTheme === "dark");
  document.documentElement.classList.toggle("theme-light", savedTheme !== "dark");

  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.addEventListener("keydown", onKey);

  drawKeyboard();
  buildBoard();

  // Start with curated so it’s instantly playable, then swap to big list
  ALL_ALLOWED = new Set(CURATED_ANSWERS);
  WORDS = [...CURATED_ANSWERS];
  newGame();

  loadWordList(); // will replace WORDS/ALL_ALLOWED + cache
});
