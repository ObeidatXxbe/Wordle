/* ===== Config ===== */
const WIDTH = 5;
const HEIGHT = 6;

/* ===== Dictionary (loaded async) ===== */
let WORDS = [];                 // filled from words.txt
let ALL_ALLOWED = new Set();    // quick membership test
const CACHE_KEY = "wordlist_cache_v1";

/* Small fallback so a game can start before the big list loads */
const FALLBACK = ["about","after","again","apple","audio","badge","beach","brown","clean","clock","earth","elite","favor","focus","front","grain","green","happy","hotel","image","judge","laser","light","local","magic","match","model","money","novel","olive","pasta","phase","pilot","plant","pride","queen","quick","radio","range","ratio","ready","robot","rough","royal","scale","scene","score","serve","smart","smile","smoke","solar","solid","sound","south","spice","spike","sport","stamp","stand","start","state","steel","stone","story","stove","style","table","tiger","title","total","touch","track","trend","trial","truck","trust","ultra","under","union","urban","value","video","vivid","vocal","watch","water","where","which","while","white","world","write","young","zonal"];

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
  document.documentElement.classList.remove('theme-light','theme-dark');
  document.documentElement.classList.add(savedTheme === 'dark' ? 'theme-dark' : 'theme-light');

  // controls
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    document.documentElement.classList.toggle('theme-dark', !isDark);
    document.documentElement.classList.toggle('theme-light', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  document.addEventListener('keydown', onKey);

  // draw UI immediately
  drawKeyboard();
  buildBoard();
  // start with fallback so it's playable right away
  if (WORDS.length === 0) {
    WORDS = [...FALLBACK];
    ALL_ALLOWED = new Set(WORDS);
  }
  newGame();

  // load the large dictionary in background (and cache it)
  loadWordList();
});

/* ===== Dictionary loading ===== */
async function loadWordList() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length) {
        WORDS = list;
        ALL_ALLOWED = new Set(WORDS);
        return; // already upgraded
      }
    }

    const res = await fetch('words.txt', { cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const list = text
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{5}$/.test(w));

    if (list.length) {
      WORDS = list;
      ALL_ALLOWED = new Set(WORDS);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(WORDS)); } catch {}
      // If a fallback answer was active, silently choose a new one from big list next game
    }
  } catch (e) {
    console.warn('Word list load failed, using fallback only.', e);
  }
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
  const list = WORDS && WORDS.length ? WORDS : FALLBACK;
  return list[Math.floor(Math.random() * list.length)];
}

function newGame() {
  gameOver = false;
  row = 0; col = 0;
  toastMsg('');
  buildBoard();
  keyboardEl.querySelectorAll('.key').forEach(k => k.classList.remove('correct','present','absent'));
  answer = pickWord(); // console.log('ANSWER', answer);
}

/* ===== Input Handling ===== */
function onKey(e) {
  if (gameOver) return;
  const raw = e.key || '';
  const key = raw.length === 1 ? raw.toLowerCase() : raw; // keep "Enter"/"Backspace"

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
  // allow guess if big list not ready yet but still enforce 5 letters
  if (ALL_ALLOWED.size && !ALL_ALLOWED.has(guess)) {
    shakeRow(row); return toastMsg('Not in word list');
  }

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
