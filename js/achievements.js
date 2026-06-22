export const ACHIEVEMENTS = [
  // ── Session count ──────────────────────────────────────────────
  {
    id: 'first_log',
    icon: '🌱', label: 'First Commit',
    desc: 'Log your very first coding session',
    category: 'sessions',
    check: s => s.sessions.length >= 1
  },
  {
    id: 'ten_sessions',
    icon: '📦', label: 'Getting There',
    desc: 'Log 10 sessions',
    category: 'sessions',
    check: s => s.sessions.length >= 10
  },
  {
    id: 'fifty_sessions',
    icon: '🎯', label: 'Dedicated',
    desc: 'Log 50 sessions',
    category: 'sessions',
    check: s => s.sessions.length >= 50
  },
  {
    id: 'century_sessions',
    icon: '💯', label: 'Century',
    desc: 'Log 100 sessions',
    category: 'sessions',
    check: s => s.sessions.length >= 100
  },

  // ── Stage milestones ────────────────────────────────────────────
  {
    id: 'stage_hatchling',
    icon: '🐣', label: 'Hatchling',
    desc: 'Reach the Hatchling stage (30 XP)',
    category: 'stages',
    check: s => s.totalXP >= 30
  },
  {
    id: 'stage_sprout',
    icon: '🌿', label: 'Sprout',
    desc: 'Reach the Sprout stage (100 XP)',
    category: 'stages',
    check: s => s.totalXP >= 100
  },
  {
    id: 'stage_adept',
    icon: '⚡', label: 'Adept',
    desc: 'Reach the Adept stage (250 XP)',
    category: 'stages',
    check: s => s.totalXP >= 250
  },
  {
    id: 'stage_architect',
    icon: '🏗️', label: 'Architect',
    desc: 'Reach the Architect stage (500 XP)',
    category: 'stages',
    check: s => s.totalXP >= 500
  },
  {
    id: 'stage_master',
    icon: '🔮', label: 'Master',
    desc: 'Reach the Master stage (900 XP)',
    category: 'stages',
    check: s => s.totalXP >= 900
  },
  {
    id: 'stage_legend',
    icon: '👑', label: 'Legend',
    desc: 'Reach the Legend stage (1500 XP)',
    category: 'stages',
    check: s => s.totalXP >= 1500
  },

  // ── Streak ─────────────────────────────────────────────────────
  {
    id: 'streak_3',
    icon: '🔥', label: 'Hot Start',
    desc: 'Achieve a 3-day coding streak',
    category: 'streaks',
    check: s => s.longestStreak >= 3
  },
  {
    id: 'streak_7',
    icon: '🔥', label: 'Week Strong',
    desc: 'Achieve a 7-day coding streak',
    category: 'streaks',
    check: s => s.longestStreak >= 7
  },
  {
    id: 'streak_30',
    icon: '🔥', label: 'Iron Coder',
    desc: 'Achieve a 30-day coding streak',
    category: 'streaks',
    check: s => s.longestStreak >= 30
  },

  // ── Total hours ─────────────────────────────────────────────────
  {
    id: 'hours_10',
    icon: '⏰', label: '10h Club',
    desc: 'Log 10 total hours of coding',
    category: 'time',
    check: s => s.totalXP >= 600
  },
  {
    id: 'hours_50',
    icon: '🕐', label: '50h Club',
    desc: 'Log 50 total hours of coding',
    category: 'time',
    check: s => s.totalXP >= 3000
  },
  {
    id: 'hours_100',
    icon: '⌚', label: '100h Club',
    desc: 'Log 100 total hours of coding',
    category: 'time',
    check: s => s.totalXP >= 6000
  },

  // ── Special ─────────────────────────────────────────────────────
  {
    id: 'night_owl',
    icon: '🦉', label: 'Night Owl',
    desc: 'Log a session between 11pm and 5am',
    category: 'special',
    check: s => s.sessions.some(sess => {
      const h = new Date(sess.timestamp).getHours();
      return h >= 23 || h < 5;
    })
  },
  {
    id: 'early_bird',
    icon: '🌅', label: 'Early Bird',
    desc: 'Log a session before 7am',
    category: 'special',
    check: s => s.sessions.some(sess => new Date(sess.timestamp).getHours() < 7)
  },
  {
    id: 'marathon',
    icon: '🏃', label: 'Marathon',
    desc: 'Log a single session of 3 or more hours',
    category: 'special',
    check: s => s.sessions.some(sess => sess.minutes >= 180)
  },
  {
    id: 'well_rounded',
    icon: '🎨', label: 'Well Rounded',
    desc: 'Use all 6 session types at least once',
    category: 'special',
    check: s => {
      const types = new Set(s.sessions.map(sess => sess.type));
      return ['Feature', 'Bug fix', 'Refactor', 'Learning', 'Open source', 'Other']
        .every(t => types.has(t));
    }
  },
  {
    id: 'used_timer',
    icon: '⏱️', label: 'On the Clock',
    desc: 'Use the built-in session timer',
    category: 'special',
    check: s => s.usedTimer === true
  },
];

/**
 * Checks all achievements against current state.
 * Mutates state.unlockedAchievements and returns newly unlocked ones.
 */
export function checkAchievements(state) {
  const already = new Set(state.unlockedAchievements || []);
  const newly   = [];
  for (const ach of ACHIEVEMENTS) {
    if (!already.has(ach.id) && ach.check(state)) newly.push(ach);
  }
  if (newly.length) {
    state.unlockedAchievements = [...already, ...newly.map(a => a.id)];
  }
  return newly;
}

/** Renders the achievement grid into #achievementsGrid. */
export function renderAchievements(state, newlyUnlocked = []) {
  const grid    = document.getElementById('achievementsGrid');
  const counter = document.getElementById('achCount');
  if (!grid) return;

  const unlocked  = new Set(state.unlockedAchievements || []);
  const newIds    = new Set(newlyUnlocked.map(a => a.id));
  counter.textContent = `${unlocked.size} / ${ACHIEVEMENTS.length}`;

  grid.innerHTML = ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlocked.has(ach.id);
    const isNew      = newIds.has(ach.id);
    return `<div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}${isNew ? ' new-unlock' : ''}" title="${ach.desc}">
      <div class="ach-icon">${ach.icon}</div>
      <div class="ach-label">${ach.label}</div>
      <div class="ach-desc">${ach.desc}</div>
      ${isUnlocked ? '<div class="ach-check">✓</div>' : ''}
    </div>`;
  }).join('');
}
