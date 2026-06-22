import { renderSprite, setBlinkOn } from './render.js';

let animating = false;

/**
 * Plays the log animation on the pet canvas.
 * evolved = true triggers the full evolution sequence.
 */
export function playLogAnimation(evolved) {
  if (animating) return;
  animating = true;

  const canvas = document.getElementById('petCanvas');
  const screen = document.getElementById('screen');

  // Swap CSS animation class
  canvas.classList.remove('sprite-bob');
  canvas.classList.add(evolved ? 'sprite-evolve' : 'sprite-jump');

  // Rapid frame flicker while airborne
  let ticks = 0;
  const totalTicks = evolved ? 22 : 10;
  const tickMs     = evolved ? 75  : 120;
  const excite = setInterval(() => {
    setBlinkOn(ticks % 2 === 0);
    renderSprite();
    if (++ticks >= totalTicks) clearInterval(excite);
  }, tickMs);

  // Particle burst
  spawnSparkles(canvas, screen, evolved ? 14 : 7, evolved);

  // Full-screen flash on evolution
  if (evolved) flashScreen(screen);

  // Restore idle animation
  const duration = evolved ? 1400 : 720;
  setTimeout(() => {
    canvas.classList.remove('sprite-jump', 'sprite-evolve');
    canvas.classList.add('sprite-bob');
    setBlinkOn(false);
    renderSprite();
    animating = false;
  }, duration);
}

function flashScreen(screen) {
  const div = document.createElement('div');
  div.className = 'screen-flash';
  screen.appendChild(div);
  setTimeout(() => div.remove(), 650);
}

function spawnSparkles(canvas, container, count, big) {
  const canvasRect    = canvas.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const cx = canvasRect.left - containerRect.left + canvasRect.width  / 2;
  const cy = canvasRect.top  - containerRect.top  + canvasRect.height / 2;

  const chars = ['✦', '✧', '★', '◆', '✸', '·'];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el    = document.createElement('div');
      el.className = 'sparkle';
      el.textContent = chars[i % chars.length];

      // Distribute evenly around a circle with a little jitter
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      const dist  = (big ? 42 : 28) + Math.random() * 22;
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist;
      const size  = big ? 10 + Math.random() * 7 : 7 + Math.random() * 5;

      Object.assign(el.style, {
        position:      'absolute',
        left:          `${cx}px`,
        top:           `${cy}px`,
        fontSize:      `${size}px`,
        color:         'var(--ink)',
        pointerEvents: 'none',
        zIndex:        '10',
        transform:     'translate(-50%, -50%)',
        animation:     'sparkle-fly 0.75s ease-out forwards',
        '--dx':        `${dx}px`,
        '--dy':        `${dy}px`,
      });

      container.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, i * (big ? 55 : 65));
  }
}
