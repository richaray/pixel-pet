# 🎮 Pixel Pet — Coding Habit Tracker

A retro-styled virtual pet that grows as you code. Log your coding sessions, watch your pet evolve through 7 stages, earn achievements, and build streaks — all without an account or internet connection.

**[Live Demo →](https://pixel-pet.netlify.app)**

---

## What is this?

Pixel Pet is a productivity tool dressed up as a Tamagotchi. Every minute you code is an XP point. Your pet evolves as your XP grows. Stop coding for too long and it gets hungry. It's a low-friction way to stay consistent.

All data is stored in your browser — no account, no server, no tracking. Install it as a PWA and it works fully offline.

---

## Features

### 🐣 Pet Evolution
7 stages driven entirely by logged coding time:

| Stage | XP Required | Time Equivalent |
|---|---|---|
| Egg | 0 | — |
| Hatchling | 30 XP | ~30 min |
| Sprout | 100 XP | ~1.7 hrs |
| Adept | 250 XP | ~4 hrs |
| Architect | 500 XP | ~8 hrs |
| Master | 900 XP | ~15 hrs |
| Legend | 1500 XP | ~25 hrs |

Each evolution triggers a jump animation, sparkle particles, and a screen flash.

### ⏱️ Session Timer
Built-in start/stop timer so you don't have to estimate minutes after the fact. Persists across page reloads — close the tab mid-session and it picks back up when you return.

### 📊 Habit Tracking
- GitHub-style contribution heatmap (last 10 weeks)
- Session history styled as `git log`
- Hunger bar that drifts down over time — a soft nudge, never a punishment
- Streak counter with personal best

### 🏆 Achievements
21 achievements across 5 categories — sessions, stages, streaks, total hours, and special conditions like Night Owl (coded after 11pm) and Marathon (3+ hour session).

### 📱 PWA — Works Like an App
- Installable on desktop and mobile (no app store)
- Fully offline after first visit
- Feels native — no browser chrome, no address bar

---

## Tech Stack

No frameworks. No build tools. No npm install.

- **Vanilla JS** (ES Modules)
- **CSS** (custom properties, keyframe animations)
- **Canvas API** for pixel art sprites
- **Web Audio** — *(coming soon)*
- **localStorage** for persistence
- **Service Worker** for offline / PWA

---

## Project Structure

```
pixel-pet/
├── index.html              # App shell
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline caching)
├── serve.js                # Local dev server (node serve.js)
│
├── css/
│   └── styles.css          # All styles + animation keyframes
│
├── js/
│   ├── main.js             # Entry point, event handlers
│   ├── sprites.js          # Pixel art grids + canvas draw
│   ├── state.js            # localStorage, date helpers
│   ├── render.js           # All DOM rendering
│   ├── animate.js          # Log + evolution animations
│   ├── timer.js            # Session timer logic
│   └── achievements.js     # Definitions + unlock checking
│
├── icons/
│   ├── icon.svg            # Scalable PWA icon
│   ├── icon-192.png        # Generated PNG icon
│   └── icon-512.png        # Generated PNG icon
│
└── scripts/
    └── build-icons.js      # PNG icon generator (pure Node, no deps)
```

---

## Running Locally

Requires **Node.js** (any recent version). No npm install needed.

```bash
git clone https://github.com/richaray/pixel-pet.git
cd pixel-pet
node serve.js
```

Open **http://localhost:3000**.

> ES Modules require a server — opening `index.html` directly via `file://` won't work.

To use a different port:
```bash
node serve.js 3001
```

### Regenerate icons
If you modify the sprite data and want to update the PNG icons:
```bash
node scripts/build-icons.js
```

---

## How Data Works

Everything is stored in `localStorage` — private to your browser and device. No data leaves your machine.

| Action | Result |
|---|---|
| Log a session | XP added, session saved locally |
| Clear browser storage | Pet data is lost |
| Open on a different device | Fresh start (data doesn't sync) |
| Share the link with someone | They get their own independent pet |

Cloud sync across devices is planned for a future version.

---

## Roadmap

- [ ] Daily coding goal with progress ring
- [ ] Retro chiptune sound effects (Web Audio API)
- [ ] Pet mood sprites (happy / sleepy / thriving faces)
- [ ] Stats dashboard (avg session, best day, hours by type)
- [ ] Export / import data as JSON
- [ ] Weekly challenges
- [ ] Backend + accounts for cross-device sync

---

## License

MIT — do whatever you want with it.
