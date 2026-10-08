import artistsJson from '@/data/artists.json';
import averagesJson from '@/data/averages.json';
import { albumImages, artistImages } from '@/data/images';
import type { Artist, Averages } from './types';

export const artists: Artist[] = artistsJson as Artist[];
export const averages: Averages = averagesJson;

export const getArtist = (slug: string) => artists.find((a) => a.slug === slug);
export const artistImage = (slug: string) => artistImages[slug];
export const albumImage = (id: number) => albumImages[String(id)];

export function searchArtists(query: string): Artist[] {
  const q = query.trim().toLowerCase();
  return q ? artists.filter((a) => a.stageName.toLowerCase().includes(q)) : artists;
}
