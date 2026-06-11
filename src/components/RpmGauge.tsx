import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../theme';

const MAX_RPM = 10_000;
const REDLINE_FRACTION = 0.8;

interface Props {
  rpm: number;
}

export function RpmGauge({ rpm }: Props): React.JSX.Element {
  const fraction = Math.min(1, rpm / MAX_RPM);
  const isRedline = fraction >= REDLINE_FRACTION;
  const barColor = isRedline ? Colors.danger : Colors.accent;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>RPM</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: barColor }]} />
        <View style={[styles.redlineMarker, { left: `${REDLINE_FRACTION * 100}%` }]} />
      </View>
      <Text style={[styles.value, { color: barColor }]}>{rpm.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Spacing.cardRadius,
    padding: 14,
  },
  label: {
    color: Colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  track: {
    height: 12,
    backgroundColor: '#1F2937',
    borderRadius: 6,
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  redlineMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 16,
    backgroundColor: Colors.danger,
    borderRadius: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
});
