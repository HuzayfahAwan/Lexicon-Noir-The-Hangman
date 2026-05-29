// ===== HOMEPAGE SCRIPT =====

const DIFF_DESCRIPTIONS = {
  easy:   'Short, common words. 8 lives.',
  normal: 'Medium-length words. 6 lives.',
  hard:   'Complex, longer words. 4 lives.'
};

let selectedCategory   = 'random';
let selectedDifficulty = 'normal';
let selectedMode       = 'classic';

// ===== STATS =====

function getScore() {
  return JSON.parse(localStorage.getItem('lexicon-noir-score') || '{"wins":0,"losses":0,"streak":0,"best":0}');
}

function getHistory() {
  return JSON.parse(localStorage.getItem('lexicon-noir-history') || '[]');
}

function loadStats() {
  const s = getScore();
  document.getElementById('stat-wins').textContent   = s.wins;
  document.getElementById('stat-losses').textContent = s.losses;
  document.getElementById('stat-streak').textContent = s.streak;
  document.getElementById('stat-best').textContent   = s.best;
}

// ===== MODE SELECTION =====

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMode = btn.dataset.mode;

    const twoPlayerSection = document.getElementById('twoplayer-section');
    const diffSection      = document.getElementById('difficulty-section');
    const catSection       = document.getElementById('category-section');

    if (selectedMode === 'twoplayer') {
      twoPlayerSection.classList.remove('is-hidden');
      diffSection.classList.add('is-hidden');
      catSection.classList.add('is-hidden');
    } else if (selectedMode === 'daily') {
      twoPlayerSection.classList.add('is-hidden');
      diffSection.classList.add('is-hidden');
      catSection.classList.remove('is-hidden');
    } else {
      twoPlayerSection.classList.add('is-hidden');
      diffSection.classList.remove('is-hidden');
      catSection.classList.remove('is-hidden');
    }
  });
});

// ===== CATEGORY SELECTION =====

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = btn.dataset.category;
  });
});

// ===== DIFFICULTY SELECTION =====

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.difficulty;
    document.getElementById('diff-description').textContent = DIFF_DESCRIPTIONS[selectedDifficulty];
  });
});

// ===== RULES TOGGLE =====

document.getElementById('rulesbutton').addEventListener('click', () => {
  document.getElementById('rulesdiv').classList.toggle('is-hidden');
});

// ===== LAUNCH GAME =====

function launchGame() {
  if (selectedMode === 'twoplayer') {
    const input = document.getElementById('twoplayer-input').value.trim();
    if (!/^[a-zA-Z]{2,15}$/.test(input)) {
      const hint = document.getElementById('twoplayer-hint');
      hint.textContent = 'Invalid! Letters only, 2-15 characters.';
      hint.style.color = '#FF3131';
      setTimeout(() => {
        hint.textContent = 'Letters only — 2 to 15 characters';
        hint.style.color = '';
      }, 2500);
      return;
    }
    sessionStorage.setItem('twoplayer-word', input.toUpperCase());
  }

  sessionStorage.setItem('category',   selectedCategory);
  sessionStorage.setItem('difficulty', selectedDifficulty);
  sessionStorage.setItem('mode',       selectedMode);
  window.location.href = 'game.html';
}

// ===== STATS MODAL =====

document.getElementById('statsbutton').addEventListener('click', openStatsModal);
document.getElementById('stats-close-btn').addEventListener('click', closeStatsModal);
document.getElementById('stats-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('stats-modal')) closeStatsModal();
});

document.getElementById('reset-stats-btn').addEventListener('click', () => {
  if (confirm('Reset all stats? This cannot be undone.')) {
    localStorage.removeItem('lexicon-noir-score');
    localStorage.removeItem('lexicon-noir-history');
    localStorage.removeItem('lexicon-noir-daily');
    loadStats();
    renderStatsModal();
  }
});

function openStatsModal() {
  renderStatsModal();
  document.getElementById('stats-modal').classList.remove('is-hidden');
}

function closeStatsModal() {
  document.getElementById('stats-modal').classList.add('is-hidden');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderStatsModal() {
  const score   = getScore();
  const history = getHistory();
  const container = document.getElementById('stats-modal-content');

  const totalGames = score.wins + score.losses;
  const winRate    = totalGames > 0 ? Math.round((score.wins / totalGames) * 100) : 0;

  // Per-category stats
  const categories = ['animals','countries','tech','movies','science','sports','random'];
  const catStats = {};
  categories.forEach(c => { catStats[c] = { wins: 0, total: 0 }; });
  history.forEach(g => {
    if (!catStats[g.category]) catStats[g.category] = { wins: 0, total: 0 };
    catStats[g.category].total++;
    if (g.won) catStats[g.category].wins++;
  });

  // Records
  let longestWord  = '';
  let fastestWin   = null;
  let leastWrong   = null;
  history.forEach(g => {
    if (g.won) {
      if (g.word.length > longestWord.length) longestWord = g.word;
      if (fastestWin === null || g.duration < fastestWin) fastestWin = g.duration;
      if (leastWrong === null || g.wrongCount < leastWrong) leastWrong = g.wrongCount;
    }
  });

  const catRows = categories
    .filter(c => catStats[c].total > 0)
    .map(c => {
      const pct = Math.round((catStats[c].wins / catStats[c].total) * 100);
      return `<div class="cat-row">
        <span class="cat-row-name">${capitalize(c)}</span>
        <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
        <span class="cat-row-pct">${pct}%</span>
      </div>`;
    }).join('') || '<p style="font-family:\'Fira Mono\',monospace;font-size:12px;color:#444">No games yet.</p>';

  const recent = history.slice(-30).reverse();
  const historyDots = recent.map(g =>
    `<div class="history-dot ${g.won ? 'win' : 'loss'}" title="${g.word} (${g.won ? 'WIN' : 'LOSS'})"></div>`
  ).join('') || '<span style="font-family:\'Fira Mono\',monospace;font-size:12px;color:#444">No games yet.</span>';

  container.innerHTML = `
    <div>
      <p class="stats-section-title">OVERALL</p>
      <div class="stats-overview-grid">
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:#00FF41">${score.wins}</span>
          <span class="stats-overview-label">WINS</span>
        </div>
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:#FF3131">${score.losses}</span>
          <span class="stats-overview-label">LOSSES</span>
        </div>
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:#FFD700">${winRate}%</span>
          <span class="stats-overview-label">WIN RATE</span>
        </div>
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:#FFD700">${score.streak}</span>
          <span class="stats-overview-label">STREAK</span>
        </div>
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:#00FFFF">${score.best}</span>
          <span class="stats-overview-label">BEST STREAK</span>
        </div>
        <div class="stats-overview-item">
          <span class="stats-overview-val" style="color:white">${totalGames}</span>
          <span class="stats-overview-label">TOTAL GAMES</span>
        </div>
      </div>
    </div>

    <div>
      <p class="stats-section-title">BY CATEGORY</p>
      ${catRows}
    </div>

    <div>
      <p class="stats-section-title">RECORDS</p>
      <div class="record-row">
        <span class="record-label">Longest word guessed</span>
        <span class="record-value">${longestWord || '—'}</span>
      </div>
      <div class="record-row">
        <span class="record-label">Fastest win</span>
        <span class="record-value">${fastestWin !== null ? fastestWin + 's' : '—'}</span>
      </div>
      <div class="record-row">
        <span class="record-label">Fewest wrong guesses</span>
        <span class="record-value">${leastWrong !== null ? leastWrong + ' wrong' : '—'}</span>
      </div>
      <div class="record-row">
        <span class="record-label">Games played</span>
        <span class="record-value">${totalGames}</span>
      </div>
    </div>

    <div>
      <p class="stats-section-title">LAST 30 GAMES</p>
      <div class="history-row">${historyDots}</div>
    </div>
  `;
}

// ===== INIT =====

loadStats();
