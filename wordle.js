/* ===== Config ===== */
const WIDTH = 6;         // columns / word length
const HEIGHT = 6;        // guesses

/* ===== Word Lists (6-letter) ===== */
// Expand these freely — kept moderate here so the file stays readable.
const EASY = [
  "animal","banana","planet","silver","little","spring","forest","castle","orange","bridge","cotton","bright","market","butter","window","simple","rocket","sudden","wonder","basket","poetry","school","nature","island","travel","cookie","social","yellow","violet","dragon","throat","button","stream","beauty","magnet","rental","safari","pepper","violet","socket","cheese","smooth","flight","camera","shield","flower","pillow","bucket","silent","gentle","friend","letter","family","honest","sunset","circle","garden","father","mother"
];

const MEDIUM = [
  "abrupt","admire","almost","anchor","anyone","archer","attack","beacon","behold","binder","boring","breath","cactus","camera","candle","casino","cattle","chance","charge","cipher","client","coffee","column","copper","costly","credit","cruise","danger","dealer","decent","define","demand","depart","device","differ","digital","dinner","doctor","donate","editor","empire","engine","escape","estate","export","fabric","factor","famous","figure","flavor","future","garage","genius","gentle","global","goblin","guitar","hammer","hazard","helmet","hidden","hinge","humble","impact","injury","insert","invite","irony","isomer","jungle","kingly","legend","letter","liquid","logger","magnet","marble","martyr","matrix","medium","memory","mentor","metallic","meteor","module","moment","museum","native","nobody","object","octave","oppose","oracle","packet","palace","pantry","parade","parent","permit","photon","picket","pirate","planet","plasma","poetry","police","powder","profit","puzzle","quartz","rabbit","random","ranger","reason","record","redeem","regain","remedy","rescue","rocket","roster","savage","scarce","screen","script","server","shadow","shrimp","signal","silent","singer","socket","sodium","spider","spirit","stable","stereo","stream","strong","symbol","temple","throne","ticket","tomato","tunnel","turkey","twenty","utopia","vacuum","velvet","victim","virtual","vision","voyage","wallet","weaver","whisky","window","winter","wizard","wonder","yellow","zipper"
];

const HARD = [
  "abjure","accede","accrue","admix","afflux","agogic","albite","alcove","alkane","alpaca","alpaca","ambush","ambery","amulet","anther","aphids","archly","argute","armory","astrag","augury","avulse","axilla","azuric","babble","ballad","bandit","baryon","bayous","bedlam","befoul","beluga","bemoan","bereft","blench","blight","borzoi","brumal","buxoms","byplay","calked","camber","canker","canzon","carmel","carnal","cartel","cation","cervid","chitin","choral","cipher","clayey","cleave","cloche","cloyed","coerce","corymb","creche","credal","cymbal","daedal","dagger","dainty","debris","decant","defied","deform","demote","depose","deputy","deride","descry","detain","dextro","diadem","dibble","dingle","dioxin","discos","disown","dither","docile","dourly","dovish","dreggy","dreich","drupes","dubbin","duende","dulcet","dulled","dumkas","eagled","earwax","echini","effigy","efflux","effuse","elapid","elides","eluvia","embank","embody","emboli","emetic","endive","enrols","entrap","estrin","ethoxy","evince","exilic","exilic","extant","fagots","faience","fauves","fealty","feints","felled","felony","ferule","fescue","festal","fetish","fetors","fettle","feudal","fibros","fibril","fibrin","ficain","fiscal","fizgig","flench","flocci","floret","flueys","fluish","foehns","foetid","forams","forged","fossae","foveae","fratch","frigid","friseé","frowst","fusees","gabion","gaddis","galeid","gamuts","ganoid","garote","gasmic","gaufre","gavels","gelato","gelcap","geminal","gemmry","ghazal","ghibli","gibing","gingko","glaire","glioma","glitch","gluons","gnomon","gourde","gramme","gravid","griset","groats","guerre","gulden","gundog","guyots","gyttja","halide","halite","hancek","hapten","harrow","heliac","helion","henbane","hermit","hexane","hexing","hexose","hoagie","hodads","hombre","holmia","hydria","ikaros","imaret","imbeds","imbued","immure","inepta","inepts","ingots","iambus","intent","iodate","iambic","irrupt","isogon","jesses","jicama","jejune","jinked","jocose","jotuns","judder","kanban","karsts","kebabs","kelvin","kermis","ketone","khakis","kibitz","klaxon","koalas","kroner","kshirs","kumiss","lacuna","lactam","lagena","larvae","lazuli","legume","lemmas","lemurs","lesion","lepton","liqueur","lithic","lutron","lyceum","lycras","macron","madras","mafias","maglev","magmas","mantra","marcel","marque","mastic","mastix","matrix","megrim","megohm","menhir","merlon","miasma","micros","midrib","mignon","mimesis","minyan","mislay","mizzen","moiety","mollah","mollus","muonic","myrtal","myxoma","nectar","nectin","ningbo","nitrid","nixies","nodule","noyade","nubuck","nudest","nuptia","nylons","octopi","oculus","oilman","olefin","omegas","ondine","onyxes","oozier","opaque","ophite","oppugn","oracle","orache","orgone","ossify","overdo","owler","oxeyes","oxides","oximes","oxygen","oxymel","oxygen","pablum","pacify","packet","padauk","paella","paiute","palter","panzer","papaws","papaya","papule","parens","parian","parlay","parley","parlor","parred","parsec","parson","parton","paschal","paeans"
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
  revealRow(row, res);

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
  for (let c = 0; c < WIDTH; c++) {
    const t = tile(r,c);
    const s = states[c];
    setTimeout(() => {
      t.classList.add('flip');
      setTimeout(() => { t.classList.add(s); updateKey(t.textContent, s); }, 300);
    }, c * 180);
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
