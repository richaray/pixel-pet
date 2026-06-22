import { getState, saveState } from './state.js';

export function startTimer() {
  const state          = getState();
  state.timerStartISO  = new Date().toISOString();
  state.timerElapsedMs = 0;
  saveState();
}

/** Returns { minutes, ms } and clears timer state. */
export function stopTimer() {
  const ms             = getElapsedMs();
  const state          = getState();
  state.timerStartISO  = null;
  state.timerElapsedMs = 0;
  saveState();
  return { minutes: Math.max(1, Math.round(ms / 60000)), ms };
}

export function discardTimer() {
  const state          = getState();
  state.timerStartISO  = null;
  state.timerElapsedMs = 0;
  saveState();
}

export function getElapsedMs() {
  const state = getState();
  const base  = state.timerElapsedMs || 0;
  if (!state.timerStartISO) return base;
  return base + (Date.now() - new Date(state.timerStartISO).getTime());
}

export function isTimerRunning() {
  return !!getState().timerStartISO;
}

export function formatElapsed(ms) {
  const s   = Math.floor(ms / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm  = String(m).padStart(2, '0');
  const ss  = String(sec).padStart(2, '0');
  return h > 0 ? `${String(h).padStart(2,'0')}:${mm}:${ss}` : `${mm}:${ss}`;
}
