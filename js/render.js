import { STAGES, stageIndexFor, drawSprite } from './sprites.js';
import {
  getState, calcHunger, calcStreak, moodFor,
  relTime, shortHash, daysAgo, toDateStr
} from './state.js';

let blinkOn = false;

export function setBlinkOn(v) { blinkOn = v; }
export function getBlinkOn()  { return blinkOn; }
export function toggleBlink() { blinkOn = !blinkOn; }

const canvas = document.getElementById('petCanvas');

function inkColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function renderSprite() {
  const state = getState();
  const idx   = stageIndexFor(state.totalXP);
  const stage = STAGES[idx];
  const frame = stage.frames.length > 1 && blinkOn ? stage.frames[1] : stage.frames[0];
  drawSprite(canvas, frame, stage.scale, inkColor());
  document.getElementById('stageLabel').textContent = stage.label.toUpperCase();
  return stage;
}

export function renderVitals() {
  const state = getState();
  const idx   = stageIndexFor(state.totalXP);
  const stage = STAGES[idx];
  const next  = STAGES[idx + 1];
  const floor   = stage.threshold;
  const ceiling = next ? next.threshold : floor + 1;
  const pct = next
    ? Math.min(100, Math.round(((state.totalXP - floor) / (ceiling - floor)) * 100))
    : 100;

  document.getElementById('xpFill').style.width  = pct + '%';
  document.getElementById('xpNum').textContent   = next
    ? `${state.totalXP}/${ceiling}`
    : `${state.totalXP} ★`;

  const hunger = calcHunger(state.lastLogISO);
  document.getElementById('hungerFill').style.width = hunger + '%';
  document.getElementById('hungerNum').textContent  = hunger;

  const streak = calcStreak(state.sessions);
  document.getElementById('streakNum').textContent  = streak;
  document.getElementById('bestStreak').textContent = Math.max(state.longestStreak, streak);

  document.getElementById('moodLine').textContent = moodFor(hunger, streak);
  document.getElementById('petName').value        = state.name;
}

export function renderHistory() {
  const state = getState();
  const el    = document.getElementById('history');
  if (state.sessions.length === 0) {
    el.innerHTML = '<div class="empty-state">No commits yet. Log your first session above and your pet will hatch.</div>';
    return;
  }
  const rows = [...state.sessions]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 30);
  el.innerHTML = rows.map(s => {
    const hash = shortHash(s.id);
    const note = s.note ? escapeHtml(s.note) : '<i style="opacity:.5">no note</i>';
    return `<div class="history-row">
      <span class="history-hash">${hash}</span>
      <span class="history-type">${escapeHtml(s.type)}</span>
      <span class="history-note">${note}</span>
      <span class="history-meta">${s.minutes}m · ${relTime(s.timestamp)}</span>
    </div>`;
  }).join('');
}

export function renderGraph() {
  const state  = getState();
  const totals = {};
  state.sessions.forEach(s => {
    totals[s.dateStr] = (totals[s.dateStr] || 0) + s.minutes;
  });

  const today        = new Date();
  const startAligned = daysAgo(69);
  startAligned.setDate(startAligned.getDate() - startAligned.getDay());

  const weeks  = [];
  let   cursor = new Date(startAligned);
  while (cursor <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const ds  = toDateStr(cursor);
      week.push({ ds, mins: totals[ds] || 0, future: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  function bucket(mins) {
    if (mins <= 0)   return 0;
    if (mins < 30)   return 1;
    if (mins < 60)   return 2;
    if (mins < 120)  return 3;
    return 4;
  }
  const shades = [
    'rgba(244,239,230,0.06)',
    'rgba(232,163,61,0.25)',
    'rgba(232,163,61,0.5)',
    'rgba(232,163,61,0.75)',
    'rgba(232,163,61,1)'
  ];

  document.getElementById('graph').innerHTML = weeks.map(week =>
    `<div class="graph-week">${week.map(day => {
      if (day.future) return `<div class="graph-cell" style="visibility:hidden"></div>`;
      const b = bucket(day.mins);
      return `<div class="graph-cell" title="${day.ds} — ${day.mins} min" style="background:${shades[b]}"></div>`;
    }).join('')}</div>`
  ).join('');
}

export function renderAll() {
  renderSprite();
  renderVitals();
  renderHistory();
  renderGraph();
}
