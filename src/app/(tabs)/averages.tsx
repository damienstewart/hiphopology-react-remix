import { StyleSheet, Text, View } from 'react-native';
import { Block } from '@/components/Block';
import { Screen } from '@/components/Screen';
import { averages } from '@/lib/data';
import { colors, fonts } from '@/lib/theme';

const rows = [
  { label: 'Vocabulary Size', note: 'Median unique words', value: averages.medianVocabSize.toLocaleString() },
  { label: 'Word Density', note: 'Median words per verse', value: averages.medianWordsPerVerse },
  { label: 'Unique Word Density', note: 'Median unique words per verse', value: averages.medianUniqueWordsPerVerse },
  { label: 'Verses Per Album', note: 'Median', value: averages.medianVersesPerAlbum },
  { label: 'Syllables Per Word', note: 'Average', value: averages.avgSyllablesPerWord.toFixed(3) },
  { label: 'Syllables Per Verse', note: 'Average', value: averages.avgSyllablesPerVerse },
  { label: 'Unique Word Percentage', note: 'Average', value: `${averages.avgUniqueWordPercentage}%` },
  { label: 'Total Swear Count', note: 'Median', value: averages.medianSwearCount.toLocaleString() },
];

export default function AveragesScreen() {
  return (
    <Screen>
      <Block title="Across all 50 artists" accent="green">
        <Text style={styles.intro}>
          Artist pages compare each stat against these benchmarks. They are not a ranking — below average does not mean
          less talented.
        </Text>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.note}>{r.note}</Text>
            </View>
            <Text style={styles.value}>{r.value}</Text>
          </View>
        ))}
      </Block>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.muted, fontFamily: fonts.body, lineHeight: 22, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  rowText: { flex: 1 },
  label: { color: colors.yellow, fontFamily: fonts.body, fontSize: 15 },
  note: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  value: { color: colors.green, fontFamily: fonts.heading, fontSize: 26 },
});
