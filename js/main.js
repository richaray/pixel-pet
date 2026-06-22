import { initState, getState, saveState, resetState, toDateStr, calcStreak } from './state.js';
import { renderAll, renderVitals, renderHistory, toggleBlink, renderSprite } from './render.js';
import { stageIndexFor, STAGES } from './sprites.js';
import { playLogAnimation } from './animate.js';
import {
  startTimer, stopTimer, discardTimer,
  getElapsedMs, isTimerRunning, formatElapsed
} from './timer.js';
import { ACHIEVEMENTS, checkAchievements, renderAchievements } from './achievements.js';

/* ── Idle blink ────────────────────────────────────────────────── */
setInterval(() => { toggleBlink(); renderSprite(); }, 2400);

/* ── Toast ─────────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, duration = 2600) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

/* ── Achievement notifications (staggered) ─────────────────────── */
function notifyAchievements(newAchs) {
  newAchs.forEach((ach, i) => {
    setTimeout(() => showToast(`🏆 ${ach.label} unlocked!`, 3000), i * 1800 + 500);
  });
}

/* ── Timer UI helpers ───────────────────────────────────────────── */
function setTimerRunningUI(running) {
  const btn     = document.getElementById('timerBtn');
  const clock   = document.getElementById('timerClock');
  const discard = document.getElementById('timerDiscard');
  const screenT = document.getElementById('screenTimer');
  const mood    = document.getElementById('moodLine');
  const led     = document.getElementById('led');

  btn.textContent = running ? '■ STOP + LOG' : '▶ START';
  btn.classList.toggle('running', running);
  clock.classList.toggle('visible', running);
  discard.classList.toggle('visible', running);
  screenT.classList.toggle('visible', running);
  mood.classList.toggle('hidden', running);
  led.classList.toggle('recording', running);
}

function updateTimerDisplay() {
  if (!isTimerRunning()) return;
  const fmt = formatElapsed(getElapsedMs());
  document.getElementById('timerClock').textContent  = fmt;
  document.getElementById('screenTimer').textContent = fmt;
}

/* ── Timer: start / stop / discard ─────────────────────────────── */
document.getElementById('timerBtn').addEventListener('click', () => {
  if (isTimerRunning()) {
    const { minutes, ms } = stopTimer();
    setTimerRunningUI(false);
    document.getElementById('minutesInput').value = minutes;
    setTimeout(() => {
      document.getElementById('typeInput').focus();
      document.getElementById('logForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
    showToast(`${formatElapsed(ms)} — pick a type and log!`);
  } else {
    startTimer();
    // Mark timer as used for the achievement
    const state = getState();
    if (!state.usedTimer) {
      state.usedTimer = true;
      saveState();
      const newAchs = checkAchievements(state);
      if (newAchs.length) { saveState(); renderAchievements(state, newAchs); notifyAchievements(newAchs); }
    }
    setTimerRunningUI(true);
    updateTimerDisplay();
    showToast('timer started — go code!');
  }
});

document.getElementById('timerDiscard').addEventListener('click', () => {
  const elapsed = formatElapsed(getElapsedMs());
  if (!window.confirm(`Discard ${elapsed} of tracked time? This cannot be undone.`)) return;
  discardTimer();
  setTimerRunningUI(false);
  showToast('timer discarded');
});

/* ── 1-second tick ──────────────────────────────────────────────── */
setInterval(updateTimerDisplay, 1000);

/* ── Session log ────────────────────────────────────────────────── */
document.getElementById('logForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const minutesInput = document.getElementById('minutesInput');
  const typeInput    = document.getElementById('typeInput');
  const noteInput    = document.getElementById('noteInput');

  const minutes = Math.max(1, Math.min(600, Math.round(Number(minutesInput.value))));
  if (!minutes) { minutesInput.focus(); return; }

  const state        = getState();
  const prevStageIdx = stageIndexFor(state.totalXP);
  const now          = new Date();

  state.sessions.push({
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dateStr:   toDateStr(now),
    timestamp: now.toISOString(),
    minutes,
    type:      typeInput.value,
    note:      noteInput.value.trim()
  });
  state.totalXP       += minutes;
  state.lastLogISO     = now.toISOString();
  state.longestStreak  = Math.max(state.longestStreak, calcStreak(state.sessions));

  // Check achievements before saving
  const newAchs     = checkAchievements(state);
  saveState();
  renderAll();
  renderAchievements(state, newAchs);

  const newStageIdx = stageIndexFor(state.totalXP);
  const evolved     = newStageIdx > prevStageIdx;
  playLogAnimation(evolved);
  showToast(evolved ? `✨ evolved → ${STAGES[newStageIdx].label}!` : `+${minutes} XP logged`);
  if (newAchs.length) notifyAchievements(newAchs);

  minutesInput.value = '';
  noteInput.value    = '';
  minutesInput.focus();
});

/* ── Pet name ───────────────────────────────────────────────────── */
document.getElementById('petName').addEventListener('change', (e) => {
  const state    = getState();
  state.name     = e.target.value.trim() || 'Pixel';
  e.target.value = state.name;
  saveState();
});

/* ── Help popup ─────────────────────────────────────────────────── */
document.getElementById('helpBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('helpPop').classList.toggle('show');
});
document.addEventListener('click', (e) => {
  const pop = document.getElementById('helpPop');
  if (pop.classList.contains('show') && !pop.contains(e.target)) pop.classList.remove('show');
});

/* ── Reset ──────────────────────────────────────────────────────── */
function doReset() {
  if (!window.confirm('Reset all pet data? This clears your XP, sessions, streak, and achievements — it cannot be undone.')) return;
  resetState();
  renderAll();
  renderAchievements(getState());
  showToast('reset complete');
}
document.getElementById('resetBtn').addEventListener('click', doReset);
document.getElementById('resetLink').addEventListener('click', doReset);

/* ── Periodic refresh ───────────────────────────────────────────── */
setInterval(() => { renderVitals(); renderHistory(); }, 60_000);

/* ── Service worker (PWA) ───────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pixel-pet/sw.js', { scope: '/pixel-pet/' }).catch(() => {});
}

/* ── Init ───────────────────────────────────────────────────────── */
(function init() {
  document.getElementById('stageLabel').textContent = 'LOADING';
  document.getElementById('moodLine').textContent   = 'waking up…';
  initState();
  renderAll();
  renderAchievements(getState());
  if (isTimerRunning()) { setTimerRunningUI(true); updateTimerDisplay(); }
})();
