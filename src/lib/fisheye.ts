// Port of the math from the original mo.js "Apple Watch" home screen.
export const BUBBLE = 150;
export const BASE_BLOB = 1.6;
const PERSPECTIVE = 500;
const DEPTH = 150;
const MIN_SCALE = 0.03;

export const cubicIn = (t: number) => {
  'worklet';
  return t * t * t;
};
export const cubicOut = (t: number) => {
  'worklet';
  const u = 1 - t;
  return 1 - u * u * u;
};
export const cubicInOut = (t: number) => {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const expoOut = (t: number) => {
  'worklet';
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};
export const quadOut = (t: number) => {
  'worklet';
  return 1 - (1 - t) * (1 - t);
};
export const linear = (t: number) => {
  'worklet';
  return t;
};
export const elasticOut = (t: number) => {
  'worklet';
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
};
export const bounceOut = (t: number) => {
  'worklet';
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};
export const bounceIn = (t: number) => {
  'worklet';
  return 1 - bounceOut(1 - t);
};

export const clamp = (v: number, lo: number, hi: number) => {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
};

export type Projection = { x: number; y: number; scale: number; delta: number };

// dx/dy: bubble centre relative to the viewport centre (virtual px).
export function project(dx: number, dy: number, blob: number, shift: number, size: number): Projection {
  'worklet';
  const r = Math.sqrt(dx * dx + dy * dy);
  const delta = clamp(cubicIn(blob - (2 * r) / size), MIN_SCALE, 1);
  const deltaShift = clamp(cubicIn(shift - (2 * r) / size), MIN_SCALE, 1);
  const z = -DEPTH * cubicIn(1 - deltaShift);
  const f = PERSPECTIVE / (PERSPECTIVE - z);
  return { x: dx * f, y: dy * f, scale: delta * f, delta };
}
