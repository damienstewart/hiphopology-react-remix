import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

export type Slice = { label: string; value: number; color: string };

type Props = { data: Slice[]; maxSize?: number; donut?: boolean };

function arcPath(cx: number, cy: number, r: number, inner: number, start: number, end: number) {
  const point = (radius: number, angle: number) => `${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`;
  const large = end - start > Math.PI ? 1 : 0;
  if (inner === 0) {
    return `M${cx} ${cy} L${point(r, start)} A${r} ${r} 0 ${large} 1 ${point(r, end)} Z`;
  }
  return `M${point(r, start)} A${r} ${r} 0 ${large} 1 ${point(r, end)} L${point(inner, end)} A${inner} ${inner} 0 ${large} 0 ${point(inner, start)} Z`;
}

export function PieChart({ data, maxSize = 300, donut = false }: Props) {
  const [available, setAvailable] = useState(0);
  const size = Math.max(0, Math.min(maxSize, available));
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2;
  const inner = donut ? r * 0.6 : 0;
  const slices = data
    .filter((d) => d.value > 0)
    .reduce<{ d: Slice; start: number; end: number }[]>((acc, d) => {
      const start = acc.length ? acc[acc.length - 1].end : -Math.PI / 2;
      // A full circle can't be drawn as a single arc.
      const sweep = Math.min((d.value / total) * Math.PI * 2, Math.PI * 2 - 0.0001);
      return [...acc, { d, start, end: start + sweep }];
    }, []);

  return (
    <View style={styles.wrap} onLayout={(e) => setAvailable(e.nativeEvent.layout.width)}>
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>{d.label}</Text>
          </View>
        ))}
      </View>
      {size > 0 && (
        <Svg width={size} height={size}>
          {total === 0 ? (
            <Circle cx={r} cy={r} r={r - 1} fill="none" stroke={colors.muted} strokeWidth={1} />
          ) : (
            slices.map(({ d, start, end }) => (
              <Path key={d.label} d={arcPath(r, r, r, inner, start, end)} fill={d.color} />
            ))
          )}
        </Svg>
      )}
      <Text style={styles.total}>{total.toLocaleString()} total</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 14, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 28, height: 10, borderRadius: 2 },
  legendText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  total: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 12 },
});
