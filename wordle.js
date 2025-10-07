let WORDS = [];
let ALL_ALLOWED = new Set();

async function loadWordList() {
  const text = await fetch("words.txt").then(r => r.text());
  // keep only 5-letter alphabetic words
  WORDS = text.split(/\r?\n/).map(w => w.toLowerCase().trim())
              .filter(w => /^[a-z]{5}$/.test(w));
  ALL_ALLOWED = new Set(WORDS);
  newGame(); // start after loading
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("theme-dark", savedTheme === "dark");
  document.documentElement.classList.toggle("theme-light", savedTheme !== "dark");

  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.addEventListener("keydown", onKey);
  drawKeyboard();
  loadWordList(); // load big dictionary dynamically
});
