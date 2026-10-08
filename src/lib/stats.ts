import type { Artist, Averages, DrugReferences } from './types';

export type Trend = 'above' | 'below' | 'equal';

export type Metric = {
  key: string;
  label: string;
  value: number;
  benchmark: number;
  trend: Trend;
  decimals?: number;
};

export function compare(value: number, benchmark: number): Trend {
  if (value > benchmark) return 'above';
  if (value < benchmark) return 'below';
  return 'equal';
}

// Truncates (never rounds up) so figures match the original site's presentation.
export function roundDown(value: number, precision: number): number {
  const base = 10 ** precision;
  return (Math.floor(Math.abs(value) * base) / base) * (value < 0 ? -1 : 1);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor((sorted.length - 1) / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid] + sorted[mid + 1]) / 2;
}

const metric = (key: string, label: string, value: number, benchmark: number, decimals?: number): Metric => ({
  key,
  label,
  value,
  benchmark,
  trend: compare(value, benchmark),
  decimals,
});

export function vocabularyMetrics(a: Artist, avg: Averages): Metric[] {
  return [
    metric('vocab', 'Vocabulary Size', a.uniqueWordCount, avg.medianVocabSize),
    metric('density', 'Word Density', Math.round(a.wordCount / a.verseCount), avg.medianWordsPerVerse),
    metric(
      'uniqueDensity',
      'Unique Word Density',
      Math.round(a.uniqueWordCount / a.verseCount),
      avg.medianUniqueWordsPerVerse,
    ),
    metric(
      'versesPerAlbum',
      'Avg. Verses Per Album',
      Math.round(a.verseCount / a.albumCount),
      avg.medianVersesPerAlbum,
    ),
    metric(
      'syllablesPerWord',
      'Avg. Syllables Per Word',
      roundDown(a.syllableCount / a.wordCount, 3),
      avg.avgSyllablesPerWord,
      3,
    ),
    metric(
      'syllablesPerVerse',
      'Avg. Syllables Per Verse',
      Math.round(a.syllableCount / a.verseCount),
      avg.avgSyllablesPerVerse,
    ),
  ];
}

export function uniqueWordMetric(a: Artist, avg: Averages): Metric {
  return metric('uniquePct', 'Unique Word Percentage', Math.round(a.uniqueWordPercentage), avg.avgUniqueWordPercentage);
}

export function swearMetric(a: Artist, avg: Averages): Metric {
  return metric('swears', 'Total Swear Count', a.swearCount, avg.medianSwearCount);
}

export function totalDrugReferences(a: Artist): DrugReferences {
  return a.albums.reduce<DrugReferences>(
    (sum, al) => ({
      marijuana: sum.marijuana + al.drugReferences.marijuana,
      cocaine: sum.cocaine + al.drugReferences.cocaine,
      opiates: sum.opiates + al.drugReferences.opiates,
    }),
    { marijuana: 0, cocaine: 0, opiates: 0 },
  );
}
