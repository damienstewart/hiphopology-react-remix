import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AlbumThumb } from '@/components/AlbumThumb';
import { ArtistBubble } from '@/components/ArtistBubble';
import { Block } from '@/components/Block';
import { MetricStat, TrendBadge } from '@/components/MetricStat';
import { PieChart } from '@/components/PieChart';
import { ProgressRing } from '@/components/ProgressRing';
import { RecordPlayer } from '@/components/RecordPlayer';
import { Col, Row } from '@/components/ResponsiveGrid';
import { SeriesChart } from '@/components/SeriesChart';
import { SwearChip } from '@/components/SwearChip';
import { artistImage, artists, averages, getArtist } from '@/lib/data';
import { pickRandom, shuffle } from '@/lib/random';
import { swearMetric, totalDrugReferences, uniqueWordMetric, vocabularyMetrics } from '@/lib/stats';
import { colors, fonts, rgba } from '@/lib/theme';
import type { Artist } from '@/lib/types';

const PIE_COLORS = [colors.red, colors.yellow, colors.green, colors.purple, colors.orange];
const DRUG_COLORS = { marijuana: colors.green, cocaine: colors.yellow, opiates: colors.red };
const SWEAR_COLORS = [colors.red, colors.yellow, colors.green];
const WIDE_BREAKPOINT = 1100;
const COMPACT_BREAKPOINT = 800;

function ArtistPage({ artist }: { artist: Artist }) {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const compact = width < COMPACT_BREAKPOINT;
  const uniqueMetric = uniqueWordMetric(artist, averages);
  const swears = swearMetric(artist, averages);
  const drugs = totalDrugReferences(artist);
  const metrics = vocabularyMetrics(artist, averages);
  const [recommended] = useState(() => pickRandom(artist.albums));
  const [more] = useState(() => shuffle(artists.filter((a) => a.slug !== artist.slug)).slice(0, 5));

  const albumLabel = (i: number) => <AlbumThumb album={artist.albums[i]} size={36} />;
  const drugSeries = (['marijuana', 'cocaine', 'opiates'] as const).map((k) => ({
    label: k[0].toUpperCase() + k.slice(1),
    color: DRUG_COLORS[k],
    values: artist.albums.map((a) => a.drugReferences[k]),
  }));
  const bubble = wide ? 160 : 120;
  const bubbleCols = compact ? 2 : 5;

  return (
    <View style={[styles.page, { paddingTop: wide ? 40 : 20 }]}>
      <Row wide={wide}>
        <Col wide={wide}>
          <Block title={artist.stageName} accent="purple" stretch>
            <View style={styles.center}>
              <Image
                source={artistImage(artist.slug)}
                style={styles.headshot}
                contentFit="cover"
                accessibilityLabel={`Headshot of hip-hop artist ${artist.stageName}`}
              />
              <Text style={styles.born}>
                Born {artist.governmentName} in the year {artist.birthYear}
              </Text>
              <Text style={styles.lwTitle}>Longest Word Used:</Text>
              <Text style={styles.longestWord}>{artist.longestWord}</Text>
            </View>
          </Block>
        </Col>
        <Col wide={wide}>
          <Block title="Unique Word Percentage" accent="red" stretch>
            <View style={styles.center}>
              <ProgressRing percent={uniqueMetric.value}>
                <TrendBadge metric={uniqueMetric} />
              </ProgressRing>
            </View>
            <View style={styles.albumRow}>
              {artist.albums.map((al) => (
                <View key={al.id} style={styles.albumPct}>
                  <AlbumThumb album={al} size={50} />
                  <View style={styles.pctChip}>
                    <Text style={styles.pct}>{al.uniqueWordPercentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </Block>
        </Col>
        <Col wide={wide}>
          <Block title="Verses per album" accent="green" stretch>
            <PieChart
              donut
              maxSize={240}
              data={artist.albums.map((al, i) => ({
                label: al.name,
                value: al.verseCount,
                color: PIE_COLORS[i % PIE_COLORS.length],
              }))}
            />
          </Block>
        </Col>
      </Row>

      <Row wide={wide}>
        <Col wide={wide}>
          <Block title="Drug References" accent="orange" stretch>
            <PieChart
              maxSize={240}
              data={[
                { label: 'Marijuana', value: drugs.marijuana, color: rgba(DRUG_COLORS.marijuana, 0.6) },
                { label: 'Cocaine', value: drugs.cocaine, color: rgba(DRUG_COLORS.cocaine, 0.6) },
                { label: 'Opiates', value: drugs.opiates, color: rgba(DRUG_COLORS.opiates, 0.6) },
              ]}
            />
          </Block>
        </Col>
        <Col wide={wide} span={2}>
          <Block title="Drug References by Album" accent="purple" stretch>
            <SeriesChart
              kind="bar"
              series={drugSeries}
              count={artist.albums.length}
              renderLabel={albumLabel}
              height={220}
            />
          </Block>
        </Col>
      </Row>

      <Row wide={wide}>
        <Col wide={wide} span={2}>
          <Block title="Top Curse Word Stats" accent="red" stretch>
            <SeriesChart
              kind="line"
              count={artist.albums.length}
              renderLabel={albumLabel}
              height={220}
              series={artist.swearsByAlbum.map((s, i) => ({
                label: s.word,
                color: SWEAR_COLORS[i % SWEAR_COLORS.length],
                values: s.counts,
              }))}
            />
          </Block>
        </Col>
        <Col wide={wide}>
          <Block title="Top Curse Words by Album" accent="green" stretch bodyStyle={styles.swearBody}>
            {artist.albums.map((al) => (
              <View key={al.id} style={styles.swearCard}>
                <AlbumThumb album={al} size={50} />
                <View style={styles.swearInfo}>
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {al.name}
                  </Text>
                  <View style={styles.chips}>
                    {al.topSwears.map((s) => (
                      <SwearChip key={s.word} word={s.word} count={s.count} />
                    ))}
                  </View>
                </View>
              </View>
            ))}
            <View style={[styles.swearCard, styles.totalCard]}>
              <Text style={styles.totalSwears}>
                Total Swear Count: <Text style={styles.totalSwearsNum}>{artist.swearCount.toLocaleString()}</Text>
              </Text>
              <TrendBadge metric={swears} />
            </View>
          </Block>
        </Col>
      </Row>

      <Row wide={wide}>
        <Col wide={wide}>
          <Block title="🤖 Recommended Album" accent="orange" stretch>
            <View style={styles.center}>
              <RecordPlayer albumId={recommended.id} />
              <Text style={styles.recName}>{recommended.name}</Text>
              <Text style={styles.recYear}>{recommended.year}</Text>
            </View>
          </Block>
        </Col>
        <Col wide={wide} span={2}>
          <Block title="Vocabulary Stats" accent="purple" stretch>
            <View style={styles.statGrid}>
              {metrics.map((m) => (
                <MetricStat key={m.key} metric={m} columns={compact ? 2 : 3} />
              ))}
            </View>
          </Block>
        </Col>
      </Row>

      <Block title="View More Artists" accent="red" bodyStyle={styles.moreBody}>
        {more.slice(0, compact ? 4 : 5).map((a, i) => (
          <View key={a.slug} style={{ width: `${100 / bubbleCols}%`, alignItems: 'center', paddingVertical: 8 }}>
            <ArtistBubble artist={a} index={i} size={bubble} />
          </View>
        ))}
      </Block>
    </View>
  );
}

export default function ArtistScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const artist = getArtist(slug);

  useEffect(() => {
    navigation.setOptions({ title: artist?.stageName ?? 'Artist' });
  }, [navigation, artist]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {artist ? (
        <ArtistPage key={artist.slug} artist={artist} />
      ) : (
        <View style={[styles.center, styles.page]}>
          <Text style={styles.born}>Artist not found.</Text>
          <Link href="/artists" style={styles.link}>
            Browse all artists
          </Link>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  page: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 16 },
  center: { alignItems: 'center' },
  headshot: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 5,
    borderColor: colors.purple,
    backgroundColor: colors.surfaceSolid,
  },
  born: { color: colors.muted, fontFamily: fonts.body, marginTop: 16, textAlign: 'center', maxWidth: 240 },
  lwTitle: { color: colors.yellow, fontFamily: fonts.body, fontSize: 14, marginTop: 16 },
  longestWord: {
    color: colors.yellow,
    fontFamily: fonts.heading,
    fontSize: 16,
    textTransform: 'uppercase',
    backgroundColor: rgba(colors.green, 0.4),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  albumRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 28 },
  albumPct: { alignItems: 'center' },
  pctChip: { marginTop: 8, backgroundColor: rgba(colors.red, 0.4), borderRadius: 6, paddingHorizontal: 6 },
  pct: { color: colors.yellow, fontFamily: fonts.heading, fontSize: 20, textAlign: 'center' },
  swearBody: { padding: 12, justifyContent: 'flex-start' },
  swearCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: rgba(colors.purple, 0.3),
    borderRadius: 6,
    margin: 8,
    padding: 8,
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
  },
  totalCard: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, paddingVertical: 12 },
  swearInfo: { flex: 1 },
  albumTitle: { color: colors.yellow, fontFamily: fonts.heading, fontSize: 14, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  totalSwears: { color: colors.yellow, fontFamily: fonts.heading, fontSize: 18, textTransform: 'uppercase' },
  totalSwearsNum: { color: colors.red },
  recName: { color: colors.yellow, fontFamily: fonts.heading, fontSize: 18, marginTop: 20, textTransform: 'uppercase' },
  recYear: { color: colors.muted, fontFamily: fonts.body },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  moreBody: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 24 },
  link: { color: colors.yellow, fontFamily: fonts.body, marginTop: 12 },
});
