import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

const GAP = 16;

// A three-column grid row on wide screens; a single stacked column otherwise.
export function Row({ wide, children }: { wide: boolean; children: ReactNode }) {
  return <View style={wide ? styles.row : styles.stack}>{children}</View>;
}

// span is the column's share of the row (1 = a third, 2 = two thirds), as in the original 3-column grid.
export function Col({ wide, span = 1, children }: { wide: boolean; span?: number; children: ReactNode }) {
  // A span-n column is n thirds plus the (n-1) gaps it swallows, so edges line up with the 3-up rows above.
  const style = wide ? { flexGrow: span, flexShrink: 1, flexBasis: (span - 1) * GAP, minWidth: 0 } : undefined;
  return <View style={style}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: GAP, marginBottom: GAP, alignItems: 'stretch' },
  stack: { maxWidth: 800, width: '100%', alignSelf: 'center' },
});
