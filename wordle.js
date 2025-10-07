let WORDS = [];
let ALL_ALLOWED = new Set();

async function loadWordList() {
  try {
    const res = await fetch("words.txt");
    const text = await res.text();
    // Keep only 5-letter alphabetic words
    WORDS = text.split(/\r?\n/)
                .map(w => w.toLowerCase().trim())
                .filter(w => /^[a-z]{5}$/.test(w));
    ALL_ALLOWED = new Set(WORDS);
    console.log(`Loaded ${WORDS.length} words`);
    newGame(); // Start the game after loading
  } catch (err) {
    console.error("Error loading words.txt:", err);
    toastMsg("Could not load words.txt");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("theme-dark", savedTheme === "dark");
  document.documentElement.classList.toggle("theme-light", savedTheme !== "dark");

  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("theme-dark");
    document.documentElement.classList.toggle("theme-dark", !isDark);
    document.documentElement.classList.toggle("theme-light", isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  });

  document.addEventListener("keydown", onKey);
  drawKeyboard();
  loadWordList(); // Load your local words.txt file
});
