import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Metric } from '@/lib/stats';
import { colors, fonts } from '@/lib/theme';

const icons = { above: 'chevron-up', below: 'chevron-down', equal: 'reorder-two' } as const;

export function TrendBadge({ metric, label = 'avg' }: { metric: Metric; label?: string }) {
  const good = metric.trend !== 'below';
  const fmt = (n: number) => (metric.decimals ? n.toFixed(metric.decimals) : n.toLocaleString());
  return (
    <View style={styles.badge} accessibilityLabel={`${metric.trend} ${label} ${fmt(metric.benchmark)}`}>
      <Ionicons name={icons[metric.trend]} size={14} color={good ? colors.up : colors.down} />
      <Text style={styles.badgeText}>
        {label}: <Text style={good ? styles.higher : undefined}>{fmt(metric.benchmark)}</Text>
      </Text>
    </View>
  );
}

export function MetricStat({ metric, columns = 2 }: { metric: Metric; columns?: 2 | 3 }) {
  const good = metric.trend !== 'below';
  const value = metric.decimals ? metric.value.toFixed(metric.decimals) : metric.value.toLocaleString();
  return (
    <View style={[styles.stat, { width: columns === 3 ? '33.33%' : '50%' }]}>
      <Text style={styles.label}>{metric.label}</Text>
      <Text style={[styles.value, { color: good ? colors.green : colors.red }]}>{value}</Text>
      <TrendBadge metric={metric} />
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center', paddingBottom: 22 },
  label: {
    color: colors.yellow,
    fontFamily: fonts.heading,
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  value: { fontFamily: fonts.heading, fontSize: 42, marginVertical: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { color: colors.yellow, fontFamily: fonts.body, fontSize: 12 },
  higher: { color: colors.green },
});
