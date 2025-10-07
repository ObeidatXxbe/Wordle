/* ===== Config ===== */
const WIDTH = 5;
const HEIGHT = 6;
/* ===== Single Big Word List (5-letter) ===== */
const WORDS = ["about","above","abuse","actor","acute","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alert","alike","alive","allow","alone","along","alter","among","angel","anger","angle","angry","apart","apple","apply","arena","argue","arise","award","aware","badge","baker","based","basic","basis","beach","beard","begin","being","below","birth","black","blame","blind","block","blood","board","boost","booth","bound","brain","brand","bread","break","breed","brief","bring","broad","brown","buyer","cabin","cable","cadet","camel","candy","carry","carve","catch","cause","chain","chair","chart","chase","cheap","check","chess","chest","chief","child","choir","claim","clean","clear","clerk","cliff","climb","clock","close","cloth","cloud","coach","coast","color","comet","comic","comma","coral","cover","crack","craft","crane","crash","cream","creek","crest","crime","cross","crowd","crown","crude","cruel","crush","curve","cycle","daily","dairy","dance","dealt","death","decay","delay","depth","devil","diary","dirty","donor","drink","drive","drums","dying","eager","early","earth","eight","elbow","elder","elect","elite","empty","enter","entry","equal","error","event","every","exact","exist","extra","faith","false","fancy","fatal","favor","feast","feels","fence","ferry","fiber","field","fifth","fifty","fight","final","first","flame","flash","fleet","flesh","flour","fluid","flush","focus","force","forge","forum","found","frame","fraud","fresh","front","frost","fruit","fully","funds","gains","giant","given","glass","globe","glory","glove","grace","grade","grain","grand","grant","graph","grass","grave","great","green","greet","group","grown","guard","guess","guest","guide","guild","guilt","habit","happy","harsh","heart","heavy","hello","honey","honor","horse","hotel","house","human","humor","ideal","image","imply","index","infer","input","inner","irony","issue","ivory","jeans","jelly","judge","juice","juicy","knack","knife","knock","known","label","labor","lakes","large","later","laugh","layer","learn","lease","least","leave","legal","level","lever","light","limit","linen","liner","links","lions","lipid","lists","liver","lives","local","logic","loose","loyal","lucky","lunar","lunch","magic","major","maker","maple","march","match","maybe","mayor","media","medic","meets","melon","merit","metal","meter","might","minor","minus","mixed","model","money","month","moral","motor","mount","movie","music","naked","nerve","never","newer","newly","night","ninja","noble","noise","nomad","north","novel","nurse","ocean","offer","often","olive","omega","onion","opera","orbit","order","organ","other","outer","oxide","owner","paint","panel","paper","party","pasta","patch","paths","patio","pause","peace","pearl","pecan","penny","perch","phase","phone","photo","piano","piece","pilot","pixel","place","plain","plane","plant","plate","plays","plaza","pluck","point","polar","porch","pride","prime","print","prior","prize","probe","proud","prove","pulse","punch","pupil","puppy","queen","query","quiet","quilt","quota","quote","racer","radio","raise","range","rapid","ratio","reach","react","ready","realm","rebel","refer","relax","relay","renew","repay","reply","reset","retro","ridge","rigid","river","robot","rocks","rogue","roman","rough","round","route","royal","rugby","ruins","ruler","rumor","safer","saint","salad","sandy","scale","scare","scene","scent","score","scout","seedl","serve","seven","shade","shaft","shake","shame","shape","share","shark","sharp","sheep","sheer","shelf","shine","shirt","shock","shoot","shore","short","shown","siege","sight","sigma","silly","since","siren","sites","sixth","skill","skirt","skull","slack","slave","sleek","slice","slide","slope","small","smart","smell","smile","smoke","snack","snail","snake","sneak","solar","solid","solve","sonic","sooth","sorry","sound","south","space","spare","spark","spice","spike","spine","spite","split","spoil","spoke","spoon","sport","spout","spray","stack","stage","stain","stair","stake","stamp","stand","stark","start","state","steam","steel","steep","still","stock","stone","stool","store","storm","story","stove","strap","straw","strip","stuck","study","stuff","style","sugar","suite","super","surge","swear","sweat","sweep","sweet","swift","swirl","sword","table","taken","tally","tango","taper","teach","teeth","there","thick","thief","thing","think","third","thorn","those","three","thumb","tiger","tight","title","toast","token","tonic","topic","torch","total","touch","tough","tower","track","trade","trail","train","trait","trash","treat","trend","trial","tribe","truck","truly","trust","truth","tulip","twice","ultra","uncle","under","union","unity","until","upper","upset","urban","usage","usual","valid","value","vapor","vegan","velar","venue","verse","video","viral","visit","vital","vivid","vocal","voice","voter","vouch","wagon","waist","watch","water","weary","weigh","whale","wheat","wheel","where","which","while","white","whole","whose","witch","witty","woman","world","worry","worse","worth","wrath","write","wrong","yacht","yearn","yeast","young","youth","zesty","zonal"];
const ALL_ALLOWED = new Set(WORDS);
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
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.remove('theme-light','theme-dark');
  document.documentElement.classList.add(savedTheme === 'dark' ? 'theme-dark' : 'theme-light');
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('theme-dark');
    document.documentElement.classList.toggle('theme-dark', !isDark);
    document.documentElement.classList.toggle('theme-light', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
  document.addEventListener('keydown', onKey);
  drawKeyboard();
  newGame();
});
/* ===== Game ===== */
function pickWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
function newGame() {
  answer = pickWord();
  row = 0; col = 0; gameOver = false;
  toastMsg("");
  board.style.setProperty('--rows', HEIGHT);
  board.style.setProperty('--cols', WIDTH);
  board.innerHTML = "";
  for (let r = 0; r < HEIGHT; r++) {
    for (let c = 0; c < WIDTH; c++) {
      const t = document.createElement('div');
      t.className = 'tile'; t.id = `t-${r}-${c}`;
      board.appendChild(t);
    }
  }
  keyboardEl.querySelectorAll('.key').forEach(k => k.classList.remove('correct','present','absent'));
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
    const rowEl = document.createElement('div'); rowEl.className = 'k-row';
    r.forEach(key => {
      const k = document.createElement('button');
      k.className = 'key' + (key.length > 1 ? ' wide' : '');
      k.textContent = key === 'Backspace' ? '⌫' : key; k.dataset.key = key;
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
      const t = tile(row, col); t.textContent = key; t.classList.add('filled'); col++;
    }
  }
}
function backspace() {
  if (col > 0) { col--; const t = tile(row, col); t.textContent=''; t.classList.remove('filled'); }
}
function submit() {
  if (col < WIDTH) { shakeRow(row); return toastMsg('Not enough letters'); }
  const guess = rowWord(row);
  if (!ALL_ALLOWED.has(guess)) { shakeRow(row); return toastMsg('Not in word list'); }
  const res = evaluate(guess, answer);
  revealRow(row, res); // no flip animation
  if (res.every(s => s === 'correct')) { gameOver = true; toastMsg('You got it!'); return; }
  row++; col = 0;
  if (row >= HEIGHT) { gameOver = true; toastMsg(answer.toUpperCase()); }
}
/* ===== Helpers ===== */
function tile(r,c) { return document.getElementById(`t-${r}-${c}`); }
function rowWord(r) { let s=''; for (let c=0;c<WIDTH;c++) s+=tile(r,c).textContent.toLowerCase(); return s; }
function evaluate(guess,target) {
  const res = Array(WIDTH).fill('absent'); const counts = {};
  for (let i=0;i<WIDTH;i++) counts[target[i]] = (counts[target[i]]||0)+1;
  for (let i=0;i<WIDTH;i++) if (guess[i]===target[i]) { res[i]='correct'; counts[guess[i]]--; }
  for (let i=0;i<WIDTH;i++) if (res[i]!=='correct' && counts[guess[i]]>0) { res[i]='present'; counts[guess[i]]--; }
  return res;
}
function revealRow(r, states) { for (let c=0;c<WIDTH;c++) { const t=tile(r,c); const s=states[c]; setTimeout(()=>{ t.classList.add(s); updateKey(t.textContent,s); }, c*120); } }
function updateKey(letter,state) {
  const k = keyboardEl.querySelector(`[data-key="${letter}"]`); if (!k) return;
  const priority={correct:3,present:2,absent:1};
  const current = k.classList.contains('correct') ? 'correct' : (k.classList.contains('present') ? 'present' : (k.classList.contains('absent') ? 'absent' : null));
  if (!current || priority[state] > priority[current]) { k.classList.remove('correct','present','absent'); k.classList.add(state); }
}
function shakeRow(r) { for (let c=0;c<WIDTH;c++) tile(r,c).classList.add('shake'); setTimeout(()=>{ for (let c=0;c<WIDTH;c++) tile(r,c).classList.remove('shake'); },420); }
function toastMsg(msg) { toast.textContent = msg || ''; toast.classList.toggle('show', !!msg); if (msg) setTimeout(()=>toast.classList.remove('show'), 1400); }
