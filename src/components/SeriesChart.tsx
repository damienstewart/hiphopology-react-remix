import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colors, fonts, rgba } from '@/lib/theme';

export type Series = { label: string; color: string; values: number[] };

type Props = {
  kind: 'bar' | 'line';
  series: Series[];
  renderLabel: (index: number) => ReactNode;
  count: number;
  groupWidth?: number;
  height?: number;
};

const AXIS_WIDTH = 36;
const PAD_TOP = 12;
const PAD_BOTTOM = 6;
const DIVISIONS = 4;

// Smallest "nice" integer step so DIVISIONS gridlines cover the max value.
function niceStep(max: number) {
  const raw = Math.max(max, 1) / DIVISIONS;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
}

export function SeriesChart({ kind, series, renderLabel, count, groupWidth: minGroupWidth = 64, height = 180 }: Props) {
  const [available, setAvailable] = useState(0);
  const step = niceStep(Math.max(0, ...series.flatMap((s) => s.values)));
  const max = step * DIVISIONS;
  const ticks = Array.from({ length: DIVISIONS + 1 }, (_, i) => i * step);
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  // Stretch groups to fill the card when there is room; scroll otherwise.
  const groupWidth = Math.max(minGroupWidth, available / count);
  const width = count * groupWidth;
  const y = (v: number) => PAD_TOP + plotH - (v / max) * plotH;
  const barW = Math.min(26, (groupWidth - 16) / series.length);

  return (
    <View>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        <Svg width={AXIS_WIDTH} height={height}>
          {ticks.map((t) => (
            <SvgText key={t} x={AXIS_WIDTH - 6} y={y(t) + 4} fontSize={10} fill={colors.muted} textAnchor="end">
              {t}
            </SvgText>
          ))}
        </Svg>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          onLayout={(e) => setAvailable(e.nativeEvent.layout.width)}
        >
          <View>
            <Svg width={width} height={height}>
              {ticks.map((t) => (
                <Line key={t} x1={0} x2={width} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.08)" />
              ))}
              {kind === 'bar'
                ? series.map((s, si) =>
                    s.values.map((v, i) => {
                      const x = i * groupWidth + (groupWidth - barW * series.length) / 2 + si * barW;
                      return (
                        <Rect
                          key={`${s.label}-${i}`}
                          x={x}
                          y={y(v)}
                          width={barW - 2}
                          height={Math.max(0, PAD_TOP + plotH - y(v))}
                          fill={rgba(s.color, 0.25)}
                          stroke={s.color}
                          strokeWidth={1}
                        />
                      );
                    }),
                  )
                : series.map((s) => {
                    const pts = s.values.map((v, i) => [i * groupWidth + groupWidth / 2, y(v)] as const);
                    return (
                      <G key={s.label}>
                        <Polygon
                          points={`${pts[0][0]},${PAD_TOP + plotH} ${pts.map((p) => p.join(',')).join(' ')} ${pts[pts.length - 1][0]},${PAD_TOP + plotH}`}
                          fill={rgba(s.color, 0.1)}
                        />
                        <Polyline
                          points={pts.map((p) => p.join(',')).join(' ')}
                          fill="none"
                          stroke={s.color}
                          strokeWidth={2}
                        />
                        {pts.map(([px, py], i) => (
                          <Circle key={i} cx={px} cy={py} r={4} fill={s.color} />
                        ))}
                      </G>
                    );
                  })}
            </Svg>
            <View style={styles.labels}>
              {Array.from({ length: count }, (_, i) => (
                <View key={i} style={{ width: groupWidth, alignItems: 'center' }}>
                  {renderLabel(i)}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  scroll: { flex: 1 },
  labels: { flexDirection: 'row', marginTop: 6 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 28, height: 10, borderRadius: 2 },
  legendText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
});
