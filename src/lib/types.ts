export type Swear = { word: string; count: number };

export type DrugReferences = { marijuana: number; cocaine: number; opiates: number };

export type Album = {
  id: number;
  name: string;
  year: number;
  verseCount: number;
  uniqueWordPercentage: number;
  topSwears: Swear[];
  drugReferences: DrugReferences;
};

export type Artist = {
  id: number;
  slug: string;
  stageName: string;
  governmentName: string;
  birthYear: number;
  longestWord: string;
  wordCount: number;
  uniqueWordCount: number;
  uniqueWordPercentage: number;
  swearCount: number;
  verseCount: number;
  syllableCount: number;
  albumCount: number;
  topSwearWords: string[];
  swearsByAlbum: { word: string; counts: number[] }[];
  albums: Album[];
};

export type Averages = {
  avgSyllablesPerWord: number;
  avgSyllablesPerVerse: number;
  avgUniqueWordPercentage: number;
  medianSwearCount: number;
  medianVocabSize: number;
  medianWordsPerVerse: number;
  medianUniqueWordsPerVerse: number;
  medianVersesPerAlbum: number;
};
