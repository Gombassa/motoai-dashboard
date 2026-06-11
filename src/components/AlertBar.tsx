import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type AlertType = 'none' | 'hazard_ahead';

interface Props {
  alertType: AlertType;
}

const ALERT_CONFIG: Record<AlertType, { bg: string; icon: React.ReactNode; label: string }> = {
  none: {
    bg: '#16A34A',
    icon: <CheckCircle size={16} color="#fff" />,
    label: 'All Systems Clear',
  },
  hazard_ahead: {
    bg: '#F59E0B',
    icon: <AlertTriangle size={16} color="#fff" />,
    label: 'HAZARD AHEAD',
  },
};

export function AlertBar({ alertType }: Props): React.JSX.Element {
  const cfg = ALERT_CONFIG[alertType];
  return (
    <View style={[styles.bar, { backgroundColor: cfg.bg }]}>
      {cfg.icon}
      <Text style={styles.text}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
