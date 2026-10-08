import { artists, averages } from './data';
import { compare, median, roundDown, totalDrugReferences, vocabularyMetrics } from './stats';

describe('stats helpers', () => {
  it('compare', () => {
    expect(compare(2, 1)).toBe('above');
    expect(compare(1, 2)).toBe('below');
    expect(compare(2, 2)).toBe('equal');
  });

  it('roundDown truncates', () => {
    expect(roundDown(1.2789, 3)).toBe(1.278);
    expect(roundDown(-1.2789, 2)).toBe(-1.27);
  });

  it('median handles odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('bundled data', () => {
  it('has 50 artists with albums and consistent album counts', () => {
    expect(artists).toHaveLength(50);
    for (const a of artists) expect(a.albums).toHaveLength(a.albumCount);
  });

  it('computes Jay-Z vocabulary metrics like the legacy site', () => {
    const jayz = artists.find((a) => a.slug === 'jay-z')!;
    const m = Object.fromEntries(vocabularyMetrics(jayz, averages).map((x) => [x.key, x]));
    expect(m.vocab.value).toBe(17747);
    expect(m.density.value).toBe(161);
    expect(m.syllablesPerWord.value).toBe(1.272);
    expect(m.vocab.trend).toBe('above');
    expect(totalDrugReferences(jayz).cocaine).toBeGreaterThan(0);
  });
});
