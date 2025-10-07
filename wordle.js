/* ===== Config ===== */
const WIDTH = 5;
const HEIGHT = 6;

/* ===== Word list ===== */
let WORDS = [];
let ALL_ALLOWED = new Set();

// fallback list (so the UI always renders)
const FALLBACK_WORDS = ["apple", "plane", "candy", "light", "train", "music", "smile", "sound", "watch", "water"];

/* ===== State ===== */
let answer = "";
let row = 0, col = 0;
let gameOver = false;

/* ===== DOM ===== */
const board = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toast = document.getElementById('toast');

/* ===== Init ===== */
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.toggle('theme-dark', savedTheme === 'dark');
  document.documentElement.classList.toggle('theme-light', savedTheme !== 'dark');

  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  drawKeyboard();     // always draw keyboard
  buildBoard();       // always draw tiles

  // start with fallback so it’s playable right away
  WORDS = [...FALLBACK_WORDS];
  ALL_ALLOWED = new Set(WORDS);
  newGame();

  // then load your big words.txt asynchronously
  loadWordList();
});

/* ===== Theme toggle ===== */
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('theme-dark');
  document.documentElement.classList.toggle('theme-dark', !isDark);
  document.documentElement.classList.toggle('theme-light', isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

/* ===== Load big dictionary ===== */
async function loadWordList() {
  try {
    const res = await fetch('words.txt'); // must be same folder as index.html
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const list = text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => /^[a-z]{5}$/.test(w));

    if (list.length > 0) {
      WORDS = list;
      ALL_ALLOWED = new Set(list);
      console.log(`Loaded ${list.length} words from words.txt`);
      newGame(); // restart game using your big dictionary
    } else {
      console.warn('words.txt contained no 5-letter words, using fallback.');
    }
  } catch (err) {
    console.error('Error loading words.txt:', err);
    toastMsg('Could not load words.txt');
  }
}

/* ===== Build board ===== */
function buildBoard() {
  board.style.setProperty('--rows', HEIGHT);
  board.style.setProperty('--cols', WIDTH);
  board.innerHTML = '';
  for (let r = 0; r < HEIGHT; r++) {
    for (let c = 0; c < WIDTH; c++) {
      const t = document.createElement('div');
      t.className = 'tile';
      t.id = `t-${r}-${c}`;
      board.appendChild(t);
    }
  }
}

/* ===== Draw keyboard ===== */
const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['Enter','z','x','c','v','b','n','m','Backspace']
];
function drawKeyboard() {
  keyboardEl.innerHTML = '';
  ROWS.forEach(r => {
    const rowEl = document.createElement('div');
    rowEl.className = 'k-row';
    r.forEach(key => {
      const k = document.createElement('button');
      k.className = 'key' + (key.length > 1 ? ' wide' : '');
      k.textContent = key === 'Backspace' ? '⌫' : key;
      k.dataset.key = key;
      k.addEventListener('click', () => onKey({ key }));
      rowEl.appendChild(k);
    });
    keyboardEl.appendChild(rowEl);
  });
}

/* ===== The rest of your game logic (onKey, backspace, submit, etc.) stays the same ===== */
