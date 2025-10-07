/* ===== Config ===== */
const WIDTH = 5;
const HEIGHT = 6;

/* ===== Dictionary (loaded from words.txt) ===== */
let WORDS = [];
let ALL_ALLOWED = new Set();
let wordsReady = false;

// bump this if you change words.txt so cache invalidates
const CACHE_KEY = "wordlist_cache_v4";

/* ===== State ===== */
let answer = "";
let row = 0, col = 0;
let gameOver = false;

/* ===== DOM ===== */
const $ = (q) => document.querySelector(q);
const board = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toast = document.getElementById('toast');

/* ===== Init ===== */
window.addEventListener('DOMContentLoaded', () => {
  // theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.toggle('theme-dark', savedTheme === 'dark');
  document.documentElement.classList.toggle('theme-light', savedTheme !== 'dark');

  // controls
  $('#new-game').addEventListener('click', () => { if (wordsReady) newGame(); });
  $('#theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    document.documentElement.classList.toggle('theme-dark', !isDark);
    document.documentElement.classList.toggle('theme-light', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  // draw UI immediately
  drawKeyboard();
  buildBoard();
  toastMsg('Loading dictionary…');

  // input
  document.addEventListener('keydown', onKey);

  // load the big list, then start
  loadWordList().then(() => {
    wordsReady = true;
    toastMsg('');
    newGame();
  }).catch(err => {
    console.error(err);
    toastMsg('Could not load words.txt');
  });
});

/* ===== Dictionary loading ===== */
async function loadWordList() {
  // try cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length) {
        WORDS = list;
        ALL_ALLOWED = new Set(WORDS);
        return;
      }
    } catch {}
  }

  // fetch fresh
  const res = await fetch('words.txt', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`words.txt HTTP ${res.status}`);

  const text = await res.text();

  // Your file already contains only 5-letter words, one per line.
  // Normalize + drop empty lines (no regex filtering needed).
  const list = text.split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(Boolean);

  if (!list.length) throw new Error('words.txt is empty');

  WORDS = list;
  ALL_ALLOWED = new Set(WORDS);

  // cache for faster next loads
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(WORDS)); } catch {}
}

/* ===== Board / Keyboard ===== */
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

/* ===== Game ===== */
function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function newGame() {
  if (!WORDS.length) return;
  gameOver = false;
  row = 0; col = 0;
  toastMsg('');
  buildBoard();
  // clear key states
  keyboardEl.querySelectorAll('.key').forEach(k => k.classList.remove('correct','present','absent'));
  answer = pickWord();
  // console.log('ANSWER', answer);
}

/* ===== Input Handling ===== */
function onKey(e) {
  if (!wordsReady || gameOver) return;
  const raw = e.key || '';
  const key = raw.length === 1 ? raw.toLowerCase() : raw; // keep Enter/Backspace names

  if (key === 'Enter') return submit();
  if (key === 'Backspace' || key === 'Delete') return backspace();

  if (/^[a-z]$/.test(key)) {
    if (col < WIDTH) {
      const t = tile(row, col);
      t.textContent = key;
      t.classList.add('filled');
      col++;
    }
  }
}

function backspace() {
  if (col > 0) {
    col--;
    const t = tile(row, col);
    t.textContent = '';
    t.classList.remove('filled');
  }
}

function submit() {
  if (col < WIDTH) { shakeRow(row); return toastMsg('Not enough letters'); }

  const guess = rowWord(row);
  if (!ALL_ALLOWED.has(guess)) { shakeRow(row); return toastMsg('Not in word list'); }

  const res = evaluate(guess, answer);
  revealRow(row, res);

  if (res.every(s => s === 'correct')) {
    gameOver = true;
    toastMsg('You got it!');
    return;
  }

  row++; col = 0;
  if (row >= HEIGHT) {
    gameOver = true;
    toastMsg(answer.toUpperCase());
  }
}

/* ===== Helpers ===== */
function tile(r,c){ return document.getElementById(`t-${r}-${c}`); }
function rowWord(r){ let s=''; for (let c=0;c<WIDTH;c++) s+=tile(r,c).textContent.toLowerCase(); return s; }

function evaluate(guess,target){
  const res = Array(WIDTH).fill('absent');
  const counts = {};
  for (let i=0;i<WIDTH;i++) counts[target[i]] = (counts[target[i]]||0)+1;
  for (let i=0;i<WIDTH;i++) if (guess[i]===target[i]) { res[i]='correct'; counts[guess[i]]--; }
  for (let i=0;i<WIDTH;i++) if (res[i]!=='correct' && counts[guess[i]]>0) { res[i]='present'; counts[guess[i]]--; }
  return res;
}

function revealRow(r, states){
  for (let c=0;c<WIDTH;c++){
    const t = tile(r,c);
    const s = states[c];
    setTimeout(()=>{
      t.classList.add(s);
      updateKey(t.textContent, s);
    }, c*120);
  }
}

function updateKey(letter,state){
  const k = keyboardEl.querySelector(`[data-key="${letter}"]`);
  if (!k) return;
  const priority = {correct:3, present:2, absent:1};
  const current = k.classList.contains('correct') ? 'correct' :
                  (k.classList.contains('present') ? 'present' :
                  (k.classList.contains('absent') ? 'absent' : null));
  if (!current || priority[state] > priority[current]) {
    k.classList.remove('correct','present','absent');
    k.classList.add(state);
  }
}

function shakeRow(r){
  for (let c=0;c<WIDTH;c++) tile(r,c).classList.add('shake');
  setTimeout(()=>{ for (let c=0;c<WIDTH;c++) tile(r,c).classList.remove('shake'); }, 420);
}

function toastMsg(msg){
  toast.textContent = msg || '';
  toast.classList.toggle('show', !!msg);
  if (msg) setTimeout(()=> toast.classList.remove('show'), 1400);
}
