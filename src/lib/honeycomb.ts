import { colors } from './theme';
import type { Artist } from './types';

export const COL = 175;
export const ROW = 137.5;
const COLS = 24;
const ROWS = 25;
// Artists closer than this to a cell are not reused for it.
const NEAR = 620;
// The phone version only keeps the top-left part of the grid.
const COMPACT_MAX_X = 1750;
const COMPACT_MAX_Y = 1375;
// Offset from a cell's top-left corner to its bubble centre (half of the 150px bubble).
const CENTER_OFFSET = 75;

export const PALETTE = [colors.green, colors.orange, colors.yellow, colors.purple, colors.red] as const;

export type Cell = { id: number; x: number; y: number; artist: Artist; color: string };

export type Field = { cells: Cell[]; minX: number; maxX: number; minY: number; maxY: number };

// Offset-row honeycomb of bubble centres. The phone version is the original's smaller subset.
export function makeField(artists: Artist[], compact: boolean): Field {
  const positions: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const left = c * COL + (r % 2 ? COL / 2 : 0);
      const top = r * ROW;
      if (compact && (left > COMPACT_MAX_X || top > COMPACT_MAX_Y)) continue;
      positions.push({ x: left + CENTER_OFFSET, y: top + CENTER_OFFSET });
    }
  }

  // Spread artists out: prefer the least-used artists that don't already appear nearby.
  const used = new Map<number, number>();
  const placed: Cell[] = [];
  for (const [id, p] of positions.entries()) {
    const nearby = new Set(placed.filter((c) => Math.hypot(c.x - p.x, c.y - p.y) < NEAR).map((c) => c.artist.id));
    const minUse = Math.min(...artists.map((a) => used.get(a.id) ?? 0));
    let candidates = artists.filter((a) => !nearby.has(a.id) && (used.get(a.id) ?? 0) <= minUse + 1);
    if (candidates.length === 0) candidates = artists;
    const artist = candidates[Math.floor(Math.random() * candidates.length)];
    used.set(artist.id, (used.get(artist.id) ?? 0) + 1);
    placed.push({ id, ...p, artist, color: PALETTE[Math.floor(Math.random() * PALETTE.length)] });
  }

  const xs = placed.map((c) => c.x);
  const ys = placed.map((c) => c.y);
  return {
    cells: placed,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}
