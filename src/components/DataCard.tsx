import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../theme';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  flex?: number;
}

export function DataCard({ icon, label, value, unit, color = Colors.white, flex = 1 }: Props): React.JSX.Element {
  return (
    <View style={[styles.card, { flex }]}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {unit != null && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Spacing.cardRadius,
    padding: 12,
    minWidth: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    color: Colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  unit: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
