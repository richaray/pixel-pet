export const EGG = [
  "....####....",
  "...######...",
  "..########..",
  "..########..",
  ".##########.",
  ".##########.",
  ".##########.",
  ".##########.",
  ".##########.",
  "..########..",
  "..########..",
  "...######..."
];

export const HATCH_A = [
  "....####....",
  "...######...",
  "..########..",
  "..##.##.##..",
  ".##########.",
  ".##########.",
  ".##########.",
  "..########..",
  "..########..",
  "...######...",
  "...######...",
  "....####...."
];
export const HATCH_B = HATCH_A.map((r, i) => i === 3 ? "..########.." : r);

export const SPROUT_A = [
  ".....##.....",
  ".....##.....",
  "...######...",
  "..##.##.##..",
  ".##########.",
  ".##########.",
  ".##########.",
  ".##########.",
  "..########..",
  "..########..",
  "...######...",
  "...######..."
];
export const SPROUT_B = SPROUT_A.map((r, i) => i === 3 ? "..########.." : r);

export const ADEPT_A = [
  ".....##.....",
  ".....##.....",
  "...######...",
  "..##.##.##..",
  ".##########.",
  ".##########.",
  ".##########.",
  "############",
  "..########..",
  "..########..",
  "...######...",
  "...######..."
];
export const ADEPT_B = ADEPT_A.map((r, i) => i === 3 ? "..########.." : r);

export const ARCHITECT_A = [
  "....#..#....",
  "...######...",
  "..########..",
  "..#......#..",
  ".##########.",
  ".##########.",
  ".##########.",
  "############",
  "..########..",
  "..########..",
  "...######...",
  "...######..."
];

// Extra stages beyond Architect
export const MASTER_A = [
  "...#....#...",
  "....######..",
  "..########..",
  ".#.......#..",
  "############",
  ".##########.",
  "############",
  "############",
  "..########..",
  "..########..",
  "...######...",
  "....####...."
];
export const MASTER_B = MASTER_A.map((r, i) => i === 3 ? ".##......##." : r);

export const LEGEND_A = [
  "..#......#..",
  "...########.",
  ".##########.",
  "#.........#.",
  "############",
  "############",
  "############",
  "############",
  "..########..",
  "..########..",
  "....######..",
  ".....####..."
];
export const LEGEND_B = LEGEND_A.map((r, i) => i === 3 ? "##.......##." : r);

export const STAGES = [
  { key: 'egg',        label: 'Egg',        threshold: 0,    frames: [EGG],                    scale: 11  },
  { key: 'hatchling',  label: 'Hatchling',  threshold: 30,   frames: [HATCH_A, HATCH_B],       scale: 12  },
  { key: 'sprout',     label: 'Sprout',     threshold: 100,  frames: [SPROUT_A, SPROUT_B],     scale: 13  },
  { key: 'adept',      label: 'Adept',      threshold: 250,  frames: [ADEPT_A, ADEPT_B],       scale: 14.5},
  { key: 'architect',  label: 'Architect',  threshold: 500,  frames: [ARCHITECT_A],             scale: 16  },
  { key: 'master',     label: 'Master',     threshold: 900,  frames: [MASTER_A, MASTER_B],     scale: 17  },
  { key: 'legend',     label: 'Legend',     threshold: 1500, frames: [LEGEND_A, LEGEND_B],     scale: 18  },
];

export function stageIndexFor(xp) {
  let idx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (xp >= STAGES[i].threshold) idx = i;
  }
  return idx;
}

export function drawSprite(canvas, grid, scale, ink) {
  const ctx = canvas.getContext('2d');
  canvas.width = Math.round(12 * scale);
  canvas.height = Math.round(12 * scale);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = ink;
  for (let r = 0; r < 12; r++) {
    const row = grid[r];
    for (let c = 0; c < 12; c++) {
      if (row[c] === '#') ctx.fillRect(Math.round(c * scale), Math.round(r * scale), Math.round(scale), Math.round(scale));
    }
  }
}
