import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { ArtistTile } from '@/components/ArtistTile';
import { searchArtists } from '@/lib/data';
import { colors, fonts } from '@/lib/theme';

const GAP = 12;
const PADDING = 16;
const MAX_WIDTH = 1100;

function columnCount(width: number) {
  if (width >= 1000) return 6;
  if (width >= 700) return 4;
  if (width >= 480) return 3;
  return 2;
}

export default function ArtistsScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const columns = columnCount(width);
  const tileWidth = (Math.min(width, MAX_WIDTH) - PADDING * 2 - GAP * (columns - 1)) / columns;
  const results = searchArtists(query);

  return (
    <View style={styles.root}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search Artists"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        key={columns}
        data={results}
        numColumns={columns}
        keyExtractor={(a) => a.slug}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => <ArtistTile artist={item} index={index} width={tileWidth} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: PADDING,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 16, paddingVertical: 12 },
  list: { padding: PADDING, alignSelf: 'center', width: '100%', maxWidth: MAX_WIDTH },
});
