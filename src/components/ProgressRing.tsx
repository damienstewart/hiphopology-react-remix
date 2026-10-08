import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, rgba } from '@/lib/theme';

type Props = { percent: number; size?: number; children?: ReactNode };

// Mirrors the original CSS pie: a dark disc, a pink arc, and a lighter inner disc leaving a ~13px band.
export function ProgressRing({ percent, size = 200, children }: Props) {
  const stroke = size * 0.065;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, styles.start]}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={colors.background} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={rgba(colors.red, 0.7)}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
        />
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - stroke} fill={colors.surfaceSolid} />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { fontSize: size * 0.21 }]}>{Math.round(clamped)}%</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  start: { transform: [{ rotate: '-90deg' }] },
  center: { ...StyleSheet.flatten(StyleSheet.absoluteFill), alignItems: 'center', justifyContent: 'center' },
  percent: { color: colors.yellow, fontFamily: fonts.heading },
});
