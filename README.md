# Hiphopology (React Native)

Expo + TypeScript + Expo Router rewrite of the original PHP/MySQL Hiphopology site. Lyrical statistics for 50 hip-hop
artists, bundled offline — no backend, no lyrics shipped.

## Run

```sh
npm install
npx expo start        # press i / a / w for iOS, Android, web
npm test              # stats + bundled-data tests
npm run typecheck && npm run lint
npm run format         # Prettier; `npm run format:check` verifies without writing
```

Expo SDK 57 needs Node 20.19.4 or newer.

## Layout

- `src/app` — routes: `(tabs)/index` (home carousel), `artists`, `averages`, `about`, and `artist/[slug]`
- `src/components` — `Block`, `PieChart`, `SeriesChart` (bar/line), `ProgressRing`, `RecordPlayer`, ...
- `src/lib/stats.ts` — comparison logic (above/below the benchmark values)
- `src/data` — generated `artists.json`, `averages.json`, `images.ts`

## Regenerating data

`scripts/build-data.mjs` reads the legacy MySQL dump and image folders, computes every statistic from the lyrics
(swear words, drug references, top swears per album, ...), and writes the files above plus resized images into
`assets/`. Lyrics are never written to the app.

```sh
npm run build:data -- /path/to/backup-root   # folder containing hiphopology_db.sql and homedir/
```

Word lists live in `scripts/lexicon.json` (extracted from the old PHP).
