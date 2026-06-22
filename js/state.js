const STORAGE_KEY = 'pixelpet:state';

let _state = null;

export function getState() { return _state; }

export function defaultState() {
  return {
    name: 'Pixel',
    totalXP: 0,
    lastLogISO: null,
    sessions: [],
    longestStreak: 0,
    createdAt: new Date().toISOString(),
    timerStartISO: null,
    timerElapsedMs: 0,
    usedTimer: false,
    unlockedAchievements: []
  };
}

export function initState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    _state = raw ? JSON.parse(raw) : defaultState();
    // Migrate saves that predate newer fields
    if (_state.timerStartISO        === undefined) _state.timerStartISO        = null;
    if (_state.timerElapsedMs       === undefined) _state.timerElapsedMs       = 0;
    if (_state.usedTimer            === undefined) _state.usedTimer            = false;
    if (!Array.isArray(_state.unlockedAchievements)) _state.unlockedAchievements = [];
  } catch (e) {
    _state = defaultState();
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.error('Could not save locally', e);
  }
}

export function resetState() {
  _state = defaultState();
  saveState();
}

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function calcStreak(sessions) {
  const days = new Set(sessions.map(s => s.dateStr));
  const today = new Date();
  let cursor = new Date(today);
  if (!days.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toDateStr(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(toDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calcHunger(lastLogISO) {
  if (!lastLogISO) return 100;
  const hours = (Date.now() - new Date(lastLogISO).getTime()) / 36e5;
  const val = 100 - hours * (100 / 96);
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function moodFor(hunger, streak) {
  if (hunger >= 70) return streak >= 3 ? 'thriving — great streak!' : 'happy and alert';
  if (hunger >= 40) return 'content';
  if (hunger >= 15) return 'a little sleepy…';
  return 'dozing — log a session to wake them up';
}

export function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function shortHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(6, '0').slice(0, 6);
}
