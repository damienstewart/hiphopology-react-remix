import { artists } from './data';
import { BASE_BLOB, project } from './fisheye';
import { makeField } from './honeycomb';

describe('honeycomb field', () => {
  it('builds the original desktop (600) and phone subsets', () => {
    expect(makeField(artists, false).cells).toHaveLength(600);
    const compact = makeField(artists, true);
    expect(compact.cells.length).toBeGreaterThan(100);
    expect(compact.maxX).toBeLessThanOrEqual(1750 + 75);
  });

  it('does not repeat an artist among close neighbours', () => {
    const { cells } = makeField(artists, true);
    for (const a of cells) {
      for (const b of cells) {
        if (a.id < b.id && Math.hypot(a.x - b.x, a.y - b.y) < 300) {
          expect(a.artist.id).not.toBe(b.artist.id);
        }
      }
    }
  });
});

describe('fisheye projection', () => {
  it('is full size at the centre and shrinks to dots at the edge', () => {
    expect(project(0, 0, BASE_BLOB, BASE_BLOB, 900).scale).toBeCloseTo(1);
    expect(project(800, 0, BASE_BLOB, BASE_BLOB, 900).delta).toBeCloseTo(0.03);
  });

  it('pulls distant bubbles towards the centre (perspective)', () => {
    const p = project(600, 0, BASE_BLOB, BASE_BLOB, 900);
    expect(p.x).toBeLessThan(600);
  });
});
