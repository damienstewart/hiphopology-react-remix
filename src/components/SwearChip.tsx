import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';

// A swear word that reveals its count in a tooltip on hover (web) or tap (touch).
export function SwearChip({ word, count }: { word: string; count: number }) {
  const [showCount, setShowCount] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setShowCount(true)}
      onHoverOut={() => setShowCount(false)}
      onPress={() => setShowCount((v) => !v)}
      style={styles.chip}
    >
      {showCount && (
        <View style={styles.tip}>
          <Text style={styles.tipText}>{count}</Text>
          <View style={styles.tipArrow} />
        </View>
      )}
      <Text style={styles.word}>{word}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.yellow, borderRadius: 4, paddingHorizontal: 6 },
  word: { color: colors.background, fontFamily: fonts.body, fontSize: 14 },
  tip: {
    position: 'absolute',
    top: -34,
    left: 0,
    minWidth: 24,
    zIndex: 20,
    alignItems: 'center',
    backgroundColor: colors.purple,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    boxShadow: '0 0 7px rgba(0,0,0,0.75)',
  },
  tipText: { color: colors.yellow, fontFamily: fonts.body, fontSize: 13 },
  tipArrow: {
    position: 'absolute',
    top: '100%',
    right: 6,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: colors.purple,
  },
});
