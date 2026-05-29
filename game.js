// ===================================================================
//  LEXICON NOIR — game.js
// ===================================================================

// ===== WORD BANK =====

const WORD_BANK = {
  animals: {
    easy:   ['cat','dog','fox','owl','bat','pig','ant','bee','elk','yak','ram','emu','jay','koi','gnu','cub','asp','boa','doe','cow'],
    normal: ['tiger','horse','shark','eagle','koala','panda','gecko','llama','hyena','cobra','bison','otter','raven','viper','moose','zebra','camel','rhino','sloth','squid','crane','quail','snail','trout','robin'],
    hard:   ['platypus','chameleon','wolverine','orangutan','salamander','narwhal','pangolin','capybara','axolotl','albatross','barracuda','porcupine','tarantula','wildebeest','chimpanzee','crocodile','flamingo','jellyfish','woodpecker']
  },
  countries: {
    easy:   ['peru','cuba','iraq','fiji','iran','laos','mali','oman','togo','chad','india','spain','japan','italy','china','egypt','nepal','ghana','kenya','chile'],
    normal: ['brazil','france','mexico','canada','greece','turkey','sweden','norway','poland','israel','jordan','angola','kuwait','bhutan','latvia','serbia','malawi','zambia','panama','albania'],
    hard:   ['madagascar','mozambique','kyrgyzstan','zimbabwe','switzerland','afghanistan','azerbaijan','bangladesh','cameroon','indonesia','philippines','liechtenstein','turkmenistan','luxembourg','tajikistan']
  },
  tech: {
    easy:   ['byte','code','loop','file','data','port','chip','disk','bug','api','url','git','hex','cpu','ram','int','css','dom','php','sql'],
    normal: ['server','kernel','python','docker','cookie','router','binary','syntax','buffer','thread','module','plugin','widget','parser','shader','query','socket','canvas','deploy','branch'],
    hard:   ['algorithm','encryption','recursive','javascript','framework','blockchain','typescript','middleware','deployment','kubernetes','polymorphism','concurrency','abstraction','refactoring','asynchronous','microservice']
  },
  movies: {
    easy:   ['jaws','alien','dune','thor','coco','soul','her','rush','nope','tron','cars','hugo','mash'],
    normal: ['avatar','rocky','titanic','batman','matrix','frozen','shrek','psycho','tenet','dunkirk','inception','arrival','parasite','moonlight','oldboy','gravity','sicario'],
    hard:   ['interstellar','whiplash','gladiator','braveheart','shawshank','goodfellas','trainspotting','mulholland','nightcrawler','capernaum','synecdoche','adaptation','apocalypse']
  },
  science: {
    easy:   ['atom','cell','gene','mass','wave','acid','base','ion','dna','rna','heat','lens','rust','coal','bone','lava','mold','volt'],
    normal: ['proton','neuron','galaxy','photon','osmosis','plasma','fungus','virus','quartz','enzyme','fossil','magnet','oxygen','carbon','fission','reflex','helium','sodium','copper','gravity'],
    hard:   ['chromosome','photosynthesis','mitochondria','relativity','ecosystem','metabolism','hypothesis','thermodynamics','electromagnetism','spectroscopy','stratigraphy','crystallography','nanotechnology']
  },
  sports: {
    easy:   ['golf','polo','judo','ski','run','box','row','swim','surf','bowl','dart','luge','shot'],
    normal: ['tennis','soccer','hockey','boxing','rowing','karate','rugby','squash','fencing','cycling','archery','cricket','diving','sprint','hurdles','lacrosse'],
    hard:   ['basketball','volleyball','badminton','wrestling','gymnastics','skateboard','trampoline','equestrian','weightlifting','orienteering','paddleboarding','powerlifting','pentathlon']
  }
};

// ===== BODY PARTS PER DIFFICULTY =====

const BODY_PARTS = {
  easy:   ['head','body','left-arm','right-arm','left-leg','right-leg','left-foot','right-foot'],
  normal: ['head','body','left-arm','right-arm','left-leg','right-leg'],
  hard:   ['head','body','left-arm','right-arm']
};

// ===== STATE =====

let secretWord   = '';
let guesses      = [];
let wrongCount   = 0;
let maxWrong     = 6;
let gameActive   = false;
let hintUsed     = false;
let category     = 'random';
let difficulty   = 'normal';
let gameMode     = 'classic';
let currentParts = [];
let gameStartTime = null;

// ===== DOM REFS =====

const toastContainer  = document.getElementById('toast-container');
const wrongCounter    = document.getElementById('wrong-counter');
const hintBtn         = document.getElementById('hint-btn');
const definitionSec   = document.getElementById('definition-section');
const resultMsg       = document.getElementById('result-message');
const playAgainBtn    = document.getElementById('play-again-btn');
const shareBtn        = document.getElementById('share-btn');
const categoryDisplay = document.getElementById('category-display');
const diffDisplay     = document.getElementById('difficulty-display');
const modeDisplay     = document.getElementById('mode-display');
const dashesEl        = document.getElementById('dashesflex');
const lettersEl       = document.getElementById('lettersflex');
const alphabetGrid    = document.getElementById('alphabet-grid');
const timerSection    = document.getElementById('timer-section');
const timerBar        = document.getElementById('timer-bar');
const timerDisplay    = document.getElementById('timer-display');

// ===================================================================
//  SOUND SYSTEM  (Web Audio API — no files needed)
// ===================================================================

let audioCtx = null;

function getAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return audioCtx;
}

function playTone(freq, dur, type = 'sine', vol = 0.18, attack = 0.01) {
  const ctx = getAudio();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  } catch {}
}

function sfxCorrect() {
  playTone(523, 0.1, 'sine', 0.18);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.15), 70);
}

function sfxWrong() {
  playTone(160, 0.28, 'sawtooth', 0.14);
}

function sfxWin() {
  const melody = [523, 659, 784, 1047];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.32, 'sine', 0.22), i * 130));
}

function sfxLose() {
  const melody = [330, 277, 220, 174];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.38, 'sawtooth', 0.18), i * 110));
}

function sfxHint() {
  playTone(440, 0.14, 'triangle', 0.18);
  setTimeout(() => playTone(370, 0.14, 'triangle', 0.12), 90);
}

// ===================================================================
//  CONFETTI
// ===================================================================

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const palette = ['#00FF41','#FFD700','#00FFFF','#FF3131','#FFFFFF','#FF00FF'];
  const pieces  = Array.from({ length: 130 }, () => ({
    x:     Math.random() * canvas.width,
    y:    -10 - Math.random() * 120,
    r:     3 + Math.random() * 5,
    speed: 2.5 + Math.random() * 3.5,
    drift: (Math.random() - 0.5) * 1.5,
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.12,
    color: palette[Math.floor(Math.random() * palette.length)]
  }));

  let frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.y   += p.speed;
      p.x   += p.drift;
      p.rot += p.rotV;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 200) requestAnimationFrame(draw);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  })();
}

// ===================================================================
//  SCREEN SHAKE
// ===================================================================

function shakeScreen() {
  const el = document.getElementById('game-area');
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // force reflow
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

// ===================================================================
//  TIMER  (timed mode)
// ===================================================================

let timerInterval = null;
let timeLeft      = 90;
const TIMER_TOTAL = 90;
const WRONG_PENALTY = 8;

function startTimer() {
  timeLeft = TIMER_TOTAL;
  updateTimerUI();
  timerSection.classList.remove('is-hidden');
  timerInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (gameActive) {
        // Force game over
        wrongCount = maxWrong;
        currentParts.forEach((_, i) => {
          const el = document.getElementById(currentParts[i]);
          if (el) el.classList.add('visible');
        });
        onLoss();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerUI() {
  if (!timerDisplay || !timerBar) return;
  timerDisplay.textContent = timeLeft + 's';
  const pct = (timeLeft / TIMER_TOTAL) * 100;
  timerBar.style.width = pct + '%';
  if (timeLeft <= 15) {
    timerBar.style.background = '#FF3131';
    timerDisplay.style.color  = '#FF3131';
  } else if (timeLeft <= 30) {
    timerBar.style.background = '#FFD700';
    timerDisplay.style.color  = '#FFD700';
  } else {
    timerBar.style.background = '#00FF41';
    timerDisplay.style.color  = '#00FF41';
  }
}

// ===================================================================
//  SEEDED RNG  (daily challenge)
// ===================================================================

function seededRng(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function getDailyWord() {
  const d    = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rng  = seededRng(seed);
  const pool = Object.values(WORD_BANK).flatMap(c => c.normal);
  return pool[Math.floor(rng() * pool.length)].toUpperCase();
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

// ===================================================================
//  SHARE RESULT
// ===================================================================

function buildShareText() {
  const symbols = guesses.map(g => secretWord.includes(g) ? '[O]' : '[X]').join('');
  const result  = wrongCount >= maxWrong ? 'LOST' : 'WON';
  const modeTag = { classic:'Classic', daily:'Daily', timed:'Timed', twoplayer:'2P' }[gameMode] || '';
  return [
    'LEXICON NOIR',
    `${secretWord}  —  ${capitalize(category)} / ${difficulty.toUpperCase()} / ${modeTag}`,
    symbols,
    `${result}  |  ${wrongCount}/${maxWrong} wrong`
  ].join('\n');
}

function shareResult() {
  const text = buildShareText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Result copied to clipboard!', 'win'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity  = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Result copied!', 'win');
  } catch {
    showToast('Copy not supported — try manually', 'warn');
  }
  document.body.removeChild(ta);
}

// ===================================================================
//  SCORE / HISTORY
// ===================================================================

function getScore() {
  return JSON.parse(localStorage.getItem('lexicon-noir-score') || '{"wins":0,"losses":0,"streak":0,"best":0}');
}

function updateScore(won) {
  const s = getScore();
  if (won) { s.wins++; s.streak++; if (s.streak > s.best) s.best = s.streak; }
  else     { s.losses++; s.streak = 0; }
  localStorage.setItem('lexicon-noir-score', JSON.stringify(s));
}

function saveToHistory(won) {
  const duration = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;
  const history  = JSON.parse(localStorage.getItem('lexicon-noir-history') || '[]');
  history.push({ word: secretWord, category, difficulty, mode: gameMode, won, wrongCount, duration, date: todayKey() });
  if (history.length > 100) history.shift();
  localStorage.setItem('lexicon-noir-history', JSON.stringify(history));
}

function updateScoreDisplay() {
  const s = getScore();
  animateCounter('stat-wins',   s.wins);
  animateCounter('stat-losses', s.losses);
  animateCounter('stat-streak', s.streak);
  animateCounter('stat-best',   s.best);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const dur = 400, t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(start + (target - start) * p);
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
}

// ===================================================================
//  INIT
// ===================================================================

function init() {
  category     = sessionStorage.getItem('category')   || 'random';
  difficulty   = sessionStorage.getItem('difficulty') || 'normal';
  gameMode     = sessionStorage.getItem('mode')       || 'classic';
  currentParts = BODY_PARTS[difficulty] || BODY_PARTS.normal;
  maxWrong     = currentParts.length;

  categoryDisplay.textContent = capitalize(category);
  diffDisplay.textContent     = difficulty.toUpperCase();
  modeDisplay.textContent     = { classic:'CLASSIC', daily:'DAILY', timed:'TIMED', twoplayer:'2 PLAYER' }[gameMode] || 'CLASSIC';

  updateScoreDisplay();
  buildAlphabetGrid();
  startGame();
}

// ===================================================================
//  WORD SELECTION
// ===================================================================

function pickWord() {
  if (gameMode === 'twoplayer') {
    const w = sessionStorage.getItem('twoplayer-word');
    return (w && /^[A-Z]{2,15}$/.test(w)) ? w : 'HANGMAN';
  }
  if (gameMode === 'daily') {
    return getDailyWord();
  }
  let pool;
  if (category === 'random') {
    pool = Object.values(WORD_BANK).flatMap(c => c[difficulty] || c.normal);
  } else {
    const cat = WORD_BANK[category];
    pool = (cat && cat[difficulty]) ? cat[difficulty] : Object.values(WORD_BANK).flatMap(c => c[difficulty] || c.normal);
  }
  return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
}

// ===================================================================
//  START / RESET GAME
// ===================================================================

function startGame() {
  stopTimer();

  // Check if daily challenge already completed today
  if (gameMode === 'daily') {
    const daily = JSON.parse(localStorage.getItem('lexicon-noir-daily') || 'null');
    if (daily && daily.date === todayKey() && daily.completed) {
      showDailyComplete(daily);
      return;
    }
  }

  secretWord   = pickWord();
  guesses      = [];
  wrongCount   = 0;
  gameActive   = true;
  hintUsed     = false;
  gameStartTime = Date.now();

  // Reset SVG
  document.querySelectorAll('.body-part').forEach(el => el.classList.remove('visible','dead'));

  // Reset alphabet
  document.querySelectorAll('.alpha-btn').forEach(btn => {
    btn.classList.remove('used-correct','used-wrong');
    btn.disabled = false;
  });

  // Build word display
  dashesEl.innerHTML  = '';
  lettersEl.innerHTML = '';
  for (let i = 0; i < secretWord.length; i++) {
    dashesEl.innerHTML  += `<span class="dash noselect">_</span>`;
    lettersEl.innerHTML += `<span class="${secretWord[i]} alpha has-text-black noselect">${secretWord[i]}</span>`;
  }

  // Reset UI
  wrongCounter.textContent = `0 / ${maxWrong}`;
  wrongCounter.classList.remove('danger');
  hintBtn.disabled = false;
  hintBtn.classList.remove('used');
  resultMsg.className   = 'is-hidden';
  resultMsg.textContent = '';
  playAgainBtn.classList.add('is-hidden');
  shareBtn.classList.add('is-hidden');
  definitionSec.classList.add('is-hidden');
  definitionSec.innerHTML = '';

  if (gameMode === 'timed') startTimer();
  else timerSection.classList.add('is-hidden');

  updateScoreDisplay();
}

function showDailyComplete(daily) {
  gameActive = false;
  resultMsg.innerHTML = `Daily challenge already completed today! Come back tomorrow.`;
  resultMsg.className = daily.won ? 'result-win' : 'result-loss';
  shareBtn.classList.remove('is-hidden');
  // Rebuild board state for display
  secretWord = getDailyWord();
  dashesEl.innerHTML  = '';
  lettersEl.innerHTML = '';
  for (let i = 0; i < secretWord.length; i++) {
    dashesEl.innerHTML  += `<span class="dash noselect">_</span>`;
    lettersEl.innerHTML += `<span class="${secretWord[i]} alpha noselect" style="color:${daily.won ? '#00FF41' : '#FF3131'}">${secretWord[i]}</span>`;
  }
}

// ===================================================================
//  ALPHABET GRID
// ===================================================================

function buildAlphabetGrid() {
  alphabetGrid.innerHTML = '';
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const btn    = document.createElement('button');
    btn.id        = `alpha-${letter}`;
    btn.className = 'alpha-btn';
    btn.textContent = letter;
    btn.addEventListener('click', () => handleGuess(letter));
    alphabetGrid.appendChild(btn);
  }
}

// ===================================================================
//  GUESS HANDLER
// ===================================================================

function handleGuess(letter) {
  if (!gameActive) return;
  letter = letter.toUpperCase();

  if (guesses.includes(letter)) {
    showToast(`Already guessed: ${letter}`, 'warn');
    return;
  }

  guesses.push(letter);
  const btn = document.getElementById(`alpha-${letter}`);
  if (btn) btn.disabled = true;

  if (secretWord.includes(letter)) {
    if (btn) btn.classList.add('used-correct');
    document.querySelectorAll(`.${letter}.alpha`).forEach(el => {
      el.classList.remove('has-text-black');
      el.style.color = '#00FF41';
    });
    sfxCorrect();
    if (checkWin()) onWin();
  } else {
    if (btn) btn.classList.add('used-wrong');
    wrongCount++;
    wrongCounter.textContent = `${wrongCount} / ${maxWrong}`;
    if (wrongCount >= Math.ceil(maxWrong * 0.6)) wrongCounter.classList.add('danger');
    revealBodyPart(wrongCount - 1);
    // Timed mode: each wrong guess costs extra time
    if (gameMode === 'timed') timeLeft = Math.max(0, timeLeft - WRONG_PENALTY);
    sfxWrong();
    if (wrongCount >= maxWrong) onLoss();
  }
}

function checkWin() {
  return secretWord.split('').every(l => guesses.includes(l));
}

function revealBodyPart(index) {
  const id = currentParts[index];
  const el = id ? document.getElementById(id) : null;
  if (el) el.classList.add('visible');
}

// ===================================================================
//  WIN
// ===================================================================

function onWin() {
  gameActive = false;
  stopTimer();
  updateScore(true);
  saveToHistory(true);
  if (gameMode === 'daily') saveDailyResult(true);

  document.querySelectorAll('.alpha').forEach(el => {
    el.classList.remove('has-text-black');
    if (!el.style.color || el.style.color === 'rgb(0, 0, 0)') el.style.color = '#00FF41';
  });

  resultMsg.textContent = 'YOU WIN!';
  resultMsg.className   = 'result-win';
  playAgainBtn.classList.remove('is-hidden');
  shareBtn.classList.remove('is-hidden');
  updateScoreDisplay();
  animateWin();
  sfxWin();
  launchConfetti();
  showToast('Keep the streak alive!', 'win');
}

// ===================================================================
//  LOSS
// ===================================================================

function onLoss() {
  gameActive = false;
  stopTimer();
  updateScore(false);
  saveToHistory(false);
  if (gameMode === 'daily') saveDailyResult(false);

  document.querySelectorAll('.body-part.visible').forEach(el => el.classList.add('dead'));

  document.querySelectorAll('.alpha').forEach(el => {
    if (el.classList.contains('has-text-black')) {
      el.classList.remove('has-text-black');
      el.style.color = '#FF3131';
    }
  });

  resultMsg.innerHTML = `GAME OVER &mdash; The word was <span style="color:#00FFFF;letter-spacing:3px">${secretWord}</span>`;
  resultMsg.className = 'result-loss';
  playAgainBtn.classList.remove('is-hidden');
  shareBtn.classList.remove('is-hidden');
  updateScoreDisplay();
  shakeScreen();
  sfxLose();
  fetchDefinition(secretWord.toLowerCase());
}

// ===================================================================
//  DAILY SAVE
// ===================================================================

function saveDailyResult(won) {
  localStorage.setItem('lexicon-noir-daily', JSON.stringify({
    date: todayKey(),
    completed: true,
    won,
    wrongCount,
    word: secretWord
  }));
}

// ===================================================================
//  WIN ANIMATION
// ===================================================================

function animateWin() {
  document.querySelectorAll('.alpha').forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('bounce');
      setTimeout(() => el.classList.remove('bounce'), 600);
    }, i * 85);
  });
}

// ===================================================================
//  DEFINITION FETCH
// ===================================================================

async function fetchDefinition(word) {
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) return;
    const data = await res.json();
    const meaning = data[0]?.meanings?.[0];
    const def     = meaning?.definitions?.[0]?.definition;
    const pos     = meaning?.partOfSpeech;
    if (!def) return;
    definitionSec.innerHTML = `
      <div class="def-card">
        <span class="def-word">${word.toUpperCase()}</span>
        ${pos ? `<span class="def-pos">${pos}</span>` : ''}
        <p class="def-text">&ldquo;${def}&rdquo;</p>
      </div>`;
    definitionSec.classList.remove('is-hidden');
  } catch {}
}

// ===================================================================
//  HINT
// ===================================================================

function useHint() {
  if (!gameActive || hintUsed) return;
  const pool = [...new Set(secretWord.split(''))].filter(l => !guesses.includes(l));
  if (!pool.length) return;

  const letter = pool[Math.floor(Math.random() * pool.length)];
  hintUsed = true;
  hintBtn.disabled = true;
  hintBtn.classList.add('used');

  wrongCount++;
  wrongCounter.textContent = `${wrongCount} / ${maxWrong}`;
  if (wrongCount >= Math.ceil(maxWrong * 0.6)) wrongCounter.classList.add('danger');
  revealBodyPart(wrongCount - 1);
  if (gameMode === 'timed') timeLeft = Math.max(0, timeLeft - WRONG_PENALTY);

  guesses.push(letter);
  const btn = document.getElementById(`alpha-${letter}`);
  if (btn) { btn.disabled = true; btn.classList.add('used-correct'); }
  document.querySelectorAll(`.${letter}.alpha`).forEach(el => {
    el.classList.remove('has-text-black');
    el.style.color = '#FFD700';
  });

  sfxHint();
  showToast(`Hint: "${letter}" revealed — costs 1 life`, 'info');

  if (wrongCount >= maxWrong) { onLoss(); return; }
  if (checkWin()) onWin();
}

// ===================================================================
//  TOAST
// ===================================================================

function showToast(message, type = 'info') {
  const t = document.createElement('div');
  t.className   = `toast toast-${type}`;
  t.textContent = message;
  toastContainer.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('visible')));
  setTimeout(() => {
    t.classList.remove('visible');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, 2800);
}

// ===================================================================
//  HELPERS
// ===================================================================

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===================================================================
//  KEYBOARD SHORTCUTS
// ===================================================================

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const key = e.key.toUpperCase();

  // H = hint
  if (key === 'H' && gameActive && !hintUsed) { useHint(); return; }

  // Enter = play again (when game is over)
  if (e.key === 'Enter' && !gameActive && !playAgainBtn.classList.contains('is-hidden')) {
    startGame(); return;
  }

  // A-Z = guess
  if (gameActive && key.length === 1 && key >= 'A' && key <= 'Z') {
    handleGuess(key);
  }
});

// ===================================================================
//  EVENT LISTENERS
// ===================================================================

playAgainBtn.addEventListener('click', startGame);
shareBtn.addEventListener('click', shareResult);
hintBtn.addEventListener('click', useHint);

document.getElementById('go-home-btn').addEventListener('click', () => {
  if (!gameActive || confirm('Return to home? Current game progress will be lost.')) {
    window.location.href = 'index.html';
  }
});

// ===================================================================
//  BOOT
// ===================================================================

init();
