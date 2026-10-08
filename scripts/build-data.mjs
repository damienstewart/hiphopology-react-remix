// One-off migration: reads the legacy MySQL dump + image folders and emits
//   src/data/artists.json   (precomputed stats, no lyrics)
//   src/data/averages.json  (benchmark values)
//   src/data/images.ts      (static require() maps for Metro)
//   assets/artists, assets/albums (resized images)
//
// Usage: node scripts/build-data.mjs <path-to-backup-root>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backup = process.argv[2];
if (!backup) {
  console.error('Usage: node scripts/build-data.mjs <path-to-backup-root>');
  process.exit(1);
}
const dumpPath = path.join(backup, 'hiphopology_db.sql');
const imgRoot = path.join(backup, 'homedir', 'public_html', 'imgs');
const lexicon = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'lexicon.json'), 'utf8'));

// ---------- SQL dump parsing ----------
function parseValues(body) {
  const rows = [];
  let i = 0;
  const n = body.length;
  while (i < n) {
    while (i < n && body[i] !== '(') i++;
    if (i >= n) break;
    i++;
    const row = [];
    while (i < n) {
      while (body[i] === ' ' || body[i] === '\n') i++;
      let val;
      if (body[i] === "'") {
        i++;
        let s = '';
        while (i < n) {
          const c = body[i];
          if (c === '\\') {
            const e = body[i + 1];
            s += { n: '\n', r: '\r', t: '\t', 0: '\0' }[e] ?? e;
            i += 2;
          } else if (c === "'" && body[i + 1] === "'") {
            s += "'";
            i += 2;
          } else if (c === "'") {
            i++;
            break;
          } else {
            s += c;
            i++;
          }
        }
        val = s;
      } else {
        let j = i;
        while (j < n && body[j] !== ',' && body[j] !== ')') j++;
        const raw = body.slice(i, j).trim();
        val = raw === 'NULL' ? null : Number(raw);
        i = j;
      }
      row.push(val);
      while (body[i] === ' ') i++;
      if (body[i] === ',') {
        i++;
        continue;
      }
      if (body[i] === ')') {
        i++;
        break;
      }
    }
    rows.push(row);
  }
  return rows;
}

function readTables(sql) {
  const tables = {};
  const re = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*/g;
  let m;
  while ((m = re.exec(sql))) {
    const cols = m[2].split(',').map((c) => c.trim().replace(/`/g, ''));
    // Statement ends at the first ";" that follows a closing paren outside a string.
    const start = re.lastIndex;
    let i = start;
    let inStr = false;
    for (; i < sql.length; i++) {
      const c = sql[i];
      if (inStr) {
        if (c === '\\') i++;
        else if (c === "'") {
          if (sql[i + 1] === "'") i++;
          else inStr = false;
        }
      } else if (c === "'") inStr = true;
      else if (c === ';') break;
    }
    const rows = parseValues(sql.slice(start, i)).map((r) => Object.fromEntries(cols.map((c, k) => [c, r[k]])));
    (tables[m[1]] ||= []).push(...rows);
    re.lastIndex = i;
  }
  return tables;
}

// ---------- stats ----------
const sets = Object.fromEntries(Object.entries(lexicon).map(([k, v]) => [k, new Set(v)]));

function countWords(tokens) {
  const counts = new Map();
  for (const t of tokens) if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

function topSwears(counts, limit = 3) {
  return lexicon.swears
    .filter((w) => counts.get(w))
    .map((word) => ({ word, count: counts.get(word) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function categoryTotal(counts, category) {
  let total = 0;
  for (const w of sets[category]) total += counts.get(w) ?? 0;
  return total;
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const baseName = (url) => decodeURIComponent(url.split('/').pop());

function resize(src, dest, size) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '70', '-Z', String(size), src, '--out', dest], {
    stdio: 'ignore',
  });
  return true;
}

// ---------- main ----------
const tables = readTables(fs.readFileSync(dumpPath, 'utf8'));
const { artists, albums, tracks } = tables;
const latestAverages = [...tables.averages].sort((a, b) => String(b.entry_date).localeCompare(String(a.entry_date)))[0];

const tracksByAlbum = new Map();
for (const t of tracks) {
  if (!tracksByAlbum.has(t.album_id)) tracksByAlbum.set(t.album_id, []);
  tracksByAlbum.get(t.album_id).push(t);
}

const artistImages = {};
const albumImages = {};
const missing = [];

const out = artists
  .map((a) => {
    const artistAlbums = albums.filter((al) => al.artist_id === a.artist_id);
    const albumData = artistAlbums.map((al) => {
      const albumTracks = tracksByAlbum.get(al.album_id) ?? [];
      const tokens = albumTracks.flatMap((t) => (t.track_lyrics ?? '').split(' '));
      const counts = countWords(tokens);
      const imgKey = String(al.album_id);
      if (
        resize(
          path.join(imgRoot, 'albums', baseName(al.album_img_url ?? '')),
          path.join(root, 'assets', 'albums', `${imgKey}.jpg`),
          360,
        )
      ) {
        albumImages[imgKey] = `${imgKey}.jpg`;
      } else missing.push(`album ${al.album_id} ${al.album_name}`);
      return {
        id: al.album_id,
        name: al.album_name,
        year: al.album_year,
        verseCount: albumTracks.reduce((s, t) => s + (t.track_verse_count ?? 0), 0),
        uniqueWordPercentage: al.album_word_count ? Math.round((al.album_unique_words * 100) / al.album_word_count) : 0,
        topSwears: topSwears(counts),
        drugReferences: {
          marijuana: categoryTotal(counts, 'marijuana'),
          cocaine: categoryTotal(counts, 'cocaine'),
          opiates: categoryTotal(counts, 'opiates'),
        },
        counts,
      };
    });

    const allCounts = new Map();
    for (const al of albumData) for (const [w, c] of al.counts) allCounts.set(w, (allCounts.get(w) ?? 0) + c);
    const topWords = topSwears(allCounts).map((s) => s.word);

    const slug = a.artist_slug || slugify(a.stage_name);
    if (
      resize(
        path.join(imgRoot, 'artists', baseName(a.artist_img_url ?? '')),
        path.join(root, 'assets', 'artists', `${slug}.jpg`),
        720,
      )
    ) {
      artistImages[slug] = `${slug}.jpg`;
    } else missing.push(`artist ${a.stage_name}`);

    return {
      id: a.artist_id,
      slug,
      stageName: a.stage_name,
      governmentName: a.government_name,
      birthYear: a.birth_year,
      longestWord: a.longest_word,
      wordCount: a.word_count,
      uniqueWordCount: a.unique_word_count,
      uniqueWordPercentage: Number(a.unique_word_percentage),
      swearCount: a.swear_count,
      verseCount: a.verse_count,
      syllableCount: a.syllable_count,
      albumCount: a.album_count,
      topSwearWords: topWords,
      swearsByAlbum: topWords.map((word) => ({ word, counts: albumData.map((al) => al.counts.get(word) ?? 0) })),
      albums: albumData.map(({ counts, ...rest }) => rest),
    };
  })
  .sort((a, b) => a.stageName.localeCompare(b.stageName));

const dataDir = path.join(root, 'src', 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'artists.json'), JSON.stringify(out));
fs.writeFileSync(
  path.join(dataDir, 'averages.json'),
  JSON.stringify({
    avgSyllablesPerWord: Number(latestAverages.avg_syllables_per_word),
    avgSyllablesPerVerse: latestAverages.avg_syllables_per_verse,
    avgUniqueWordPercentage: latestAverages.avg_unique_word_percentage,
    medianSwearCount: latestAverages.median_swear_count,
    medianVocabSize: latestAverages.median_vocab_size,
    medianWordsPerVerse: latestAverages.median_words_per_verse,
    medianUniqueWordsPerVerse: latestAverages.median_unique_words_per_verse,
    medianVersesPerAlbum: latestAverages.median_verses_per_album,
  }),
);

const requireMap = (name, dir, map) =>
  `export const ${name}: Record<string, number> = {\n${Object.entries(map)
    .map(([k, f]) => `  ${JSON.stringify(k)}: require('../../assets/${dir}/${f}'),`)
    .join('\n')}\n};\n`;
fs.writeFileSync(
  path.join(dataDir, 'images.ts'),
  `// Generated by scripts/build-data.mjs — do not edit.\n${requireMap('artistImages', 'artists', artistImages)}\n${requireMap('albumImages', 'albums', albumImages)}`,
);

for (const f of ['hiphopology-logo-wide.png', 'hiphopology-vinyl.png']) {
  fs.mkdirSync(path.join(root, 'assets', 'images'), { recursive: true });
  fs.copyFileSync(path.join(imgRoot, 'general', f), path.join(root, 'assets', 'images', f));
}

console.log(`artists: ${out.length}, albums: ${Object.keys(albumImages).length}, tracks: ${tracks.length}`);
if (missing.length) console.warn('Missing images:\n  ' + missing.join('\n  '));
