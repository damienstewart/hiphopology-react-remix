import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { accentColors, colors, fonts, rgba, type Accent } from '@/lib/theme';

type Props = {
  title: string;
  accent?: Accent;
  children: ReactNode;
  // Grow to the height of the row and vertically centre the content.
  stretch?: boolean;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
};

const TITLE_ALPHA: Record<Accent, number> = { purple: 0.4, red: 0.4, green: 0.4, yellow: 0.4, orange: 0.6 };

export function Block({ title, accent = 'purple', children, stretch = false, style, bodyStyle }: Props) {
  return (
    <View style={[styles.block, stretch && styles.blockStretch, style]}>
      <View style={[styles.title, { backgroundColor: rgba(accentColors[accent], TITLE_ALPHA[accent]) }]}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={[styles.body, stretch && styles.bodyStretch, bodyStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  blockStretch: { flex: 1, marginBottom: 0 },
  title: { paddingHorizontal: 16, paddingVertical: 10 },
  titleText: {
    fontFamily: fonts.heading,
    color: colors.yellow,
    fontSize: 18,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  body: { padding: 28 },
  bodyStretch: { flex: 1, justifyContent: 'center' },
});
