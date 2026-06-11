import { Battery, Rss, Wifi } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';

export function Header(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MotoAI Dashboard</Text>
      <View style={styles.icons}>
        <Rss size={18} color={Colors.accent} />
        <Wifi size={18} color={Colors.accent} style={styles.iconGap} />
        <Text style={styles.batteryText}>95%</Text>
        <Battery size={18} color={Colors.accent} style={styles.iconGap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgHeader,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconGap: {
    marginLeft: 10,
  },
  batteryText: {
    color: Colors.muted,
    fontSize: 13,
    marginLeft: 10,
  },
});
