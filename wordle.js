/* ===== Config ===== */
const WIDTH = 5;         // columns / word length
const HEIGHT = 6;        // guesses

/* ===== Word Lists (5-letter) ===== */
// Curated lists (you can expand as large as you like)
const EASY = [
  "apple","table","chair","light","plant","bread","smile","tiger","grape","house",
  "candy","stone","music","water","sweet","green","beach","pilot","quiet","lemon",
  "angel","party","train","zebra","clock","flute","piano","teeth","toast","brave",
  "sunny","happy","mouse","panda","eagle","crown","sugar","cloud","river","dream",
  "scale","sauce","pearl","honey","pizza","spice","jelly","shirt","spoon","couch",
  "earth","tease","short","press","score","blend","siren","pride","frost","coast",
  "flame","sweep","brown","mount","north","south","grand","globe","paper","proud",
  "dance","plant","clean","smoke","store","wrist","march","bloom","prism","chase",
  "sound","pilot","magic","lucky","smell","angel","tasty","local","fruit","value"
];

const MEDIUM = [
  "arise","ratio","admir","acorn","amber","apart","arena","asset","audio","banjo",
  "basic","birth","brace","brisk","cabin","camel","cargo","carve","cause","chain",
  "chaos","cheap","chess","cider","civic","claim","class","clear","cliff","close",
  "coach","coral","craft","crane","crest","crown","daily","debut","delta","diner",
  "drink","eager","elite","epoch","equal","fiber","fifth","flair","flock","flora",
  "forge","frame","frost","gauge","giant","glide","gloss","golem","grace","graph",
  "grave","greed","habit","haste","haunt","hinge","humor","index","infer","irony",
  "ivory","judge","knack","label","laser","later","layer","lobby","logic","loyal",
  "lumen","maker","mango","metal","micro","model","moral","mossy","needy","niche",
  "ocean","olive","orbit","organ","other","oxide","panel","phase","photo","pixel",
  "pride","prime","prize","pulse","quiet","quota","radii","radio","range","rebel",
  "refer","relax","rhyme","ridge","rigid","riser","route","royal","ruler","saint",
  "salad","scout","serve","shade","sharp","sheer","shelf","shiny","sigma","skirt",
  "solar","solid","spare","spice","spine","spite","split","sport","stage","stare",
  "stark","steam","stern","stork","story","swirl","their","thick","thorn","tidal",
  "tiger","toast","topic","tower","trace","trend","trial","trophy","ultra","valid",
  "vapor","velar","vivid","vocal","waltz","weary","wharf","wider","yacht","zonal"
];

const HARD = [
  "aphid","askew","azure","banal","baton","belie","bland","brine","cadet","caper",
  "cavil","chafe","chute","cider","cinch","civic","clack","cleft","clout","coyly",
  "crass","crypt","cubic","cumin","cutie","deign","detox","dirge","droit","droll",
  "dross","dully","dwarf","ennui","epoxy","epoch","ethic","fetid","fjord","fleck",
  "frock","gaffe","gawky","giddy","gipsy","glyph","gnash","gouge","groin","guile",
  "haute","hinge","hyena","icily","idyll","inert","irate","joust","kiosk","knoll",
  "knife","kudos","lager","lapel","lilac","limbo","lingo","lithe","lucid","lurch",
  "macho","madam","magma","manor","maxim","masse","miser","modal","nadir","nymph",
  "obese","octal","omega","onset","oxide","parse","patio","pearl","pecan","pesky",
  "piety","pivot","plaid","pleat","prism","quail","quart","quirk","rabid","radii",
  "raven","recut","rehab","relic","ripen","rivet","rogue","rough","rumba","sally",
  "scald","scorn","shire","sieve","skein","sleek","sloop","sloth","smite","snare",
  "snout","sooty","spear","squad","stave","stilt","suave","sushi","swath","tacit",
  "taint","taper","terse","thorn","trice","tryst","umbra","unmet","usurp","vigor",
  "vixen","vodka","vouch","waltz","wharf","wrung","xerox","yodel","zesty","zonal"
];

const ALL_ALLOWED = new Set([...EASY, ...MEDIUM, ...HARD].map(w => w.toLowerCase()));

/* ===== State ===== */
let answer = "";
let row = 0, col = 0;
let gameOver = false;
let difficulty = localStorage.getItem('difficulty') || 'easy';

/* ===== DOM ===== */
const $ = (q) => document.querySelector(q);
const board = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toast = document.getElementById('toast');

/* ===== Init ===== */
window.addEventListener('DOMContentLoaded', () => {
  // Theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.remove('theme-light','theme-dark');
  document.documentElement.classList.add(savedTheme === 'dark' ? 'theme-dark' : 'theme-light');

  // Difficulty
  document.querySelectorAll('input[name="difficulty"]').forEach(r => {
    r.checked = (r.value === difficulty);
    r.addEventListener('change', () => { difficulty = r.value; localStorage.setItem('difficulty', difficulty); newGame(); });
  });

  $('#new-game').addEventListener('click', newGame);
  $('#theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    document.documentElement.classList.toggle('theme-dark', !isDark);
    document.documentElement.classList.toggle('theme-light', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });

  document.addEventListener('keydown', onKey);
  drawKeyboard();
  newGame();
});

function pickWord() {
  const pool = difficulty === 'hard' ? HARD : (difficulty === 'medium' ? MEDIUM : EASY);
  return pool[Math.floor(Math.random() * pool.length)].toLowerCase();
}

function newGame() {
  answer = pickWord();
  row = 0; col = 0; gameOver = false;
  toastMsg("");
  // Build board
  board.style.setProperty('--rows', HEIGHT);
  board.style.setProperty('--cols', WIDTH);
  board.innerHTML = "";
  for (let r = 0; r < HEIGHT; r++) {
    for (let c = 0; c < WIDTH; c++) {
      const t = document.createElement('div');
      t.className = 'tile';
      t.id = `t-${r}-${c}`;
      board.appendChild(t);
    }
  }
  // Reset keyboard state
  keyboardEl.querySelectorAll('.key').forEach(k => k.classList.remove('correct','present','absent'));
  // console.log('Answer:', answer);
}

/* ===== Keyboard ===== */
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
      k.addEventListener('click', () => onKey({key}));
      rowEl.appendChild(k);
    });
    keyboardEl.appendChild(rowEl);
  });
}

/* ===== Input Handling ===== */
function onKey(e) {
  if (gameOver) return;
  const key = (e.key || '').toLowerCase();

  if (key === 'enter') return submit();
  if (key === 'backspace' || key === 'delete') return backspace();

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
  if (col < WIDTH) {
    shakeRow(row);
    return toastMsg('Not enough letters');
  }
  const guess = rowWord(row);
  if (!ALL_ALLOWED.has(guess)) {
    shakeRow(row);
    return toastMsg('Not in word list');
  }

  // Evaluate
  const res = evaluate(guess, answer);
  revealRow(row, res); // no flip animation

  if (res.every(s => s === 'correct')) {
    gameOver = true; toastMsg('You got it!'); return;
  }

  row++; col = 0;
  if (row >= HEIGHT) {
    gameOver = true; toastMsg(answer.toUpperCase());
  }
}

/* ===== Helpers ===== */
function tile(r, c) { return document.getElementById(`t-${r}-${c}`); }
function rowWord(r) {
  let s = '';
  for (let c = 0; c < WIDTH; c++) s += tile(r,c).textContent.toLowerCase();
  return s;
}

function evaluate(guess, target) {
  const res = Array(WIDTH).fill('absent');
  const counts = {};
  for (let i=0;i<WIDTH;i++) counts[target[i]] = (counts[target[i]]||0)+1;

  // First pass: correct
  for (let i=0;i<WIDTH;i++) {
    if (guess[i] === target[i]) {
      res[i] = 'correct';
      counts[guess[i]]--;
    }
  }
  // Second pass: present
  for (let i=0;i<WIDTH;i++) {
    if (res[i] === 'correct') continue;
    const ch = guess[i];
    if (counts[ch] > 0) { res[i] = 'present'; counts[ch]--; }
  }
  return res;
}

function revealRow(r, states) {
  // No flip animation: just apply classes with a small stagger
  for (let c = 0; c < WIDTH; c++) {
    const t = tile(r,c);
    const s = states[c];
    setTimeout(() => { t.classList.add(s); updateKey(t.textContent, s); }, c * 120);
  }
}

function updateKey(letter, state) {
  const k = keyboardEl.querySelector(`[data-key="${letter}"]`);
  if (!k) return;
  const priority = { correct: 3, present: 2, absent: 1 };
  const current = k.classList.contains('correct') ? 'correct' : (k.classList.contains('present') ? 'present' : (k.classList.contains('absent') ? 'absent' : null));
  if (!current || priority[state] > priority[current]) {
    k.classList.remove('correct','present','absent');
    k.classList.add(state);
  }
}

function shakeRow(r) {
  for (let c=0;c<WIDTH;c++) tile(r,c).classList.add('shake');
  setTimeout(() => { for (let c=0;c<WIDTH;c++) tile(r,c).classList.remove('shake'); }, 420);
}

function toastMsg(msg) {
  toast.textContent = msg || '';
  toast.classList.toggle('show', !!msg);
  if (msg) setTimeout(() => toast.classList.remove('show'), 1400);
}
