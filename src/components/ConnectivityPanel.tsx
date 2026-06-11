import { CheckCircle, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing } from '../theme';

interface Device {
  id: string;
  name: string;
  type: string;
}

const DEVICES: Device[] = [
  { id: 'obd', name: 'OBD-II Scanner', type: 'Diagnostics' },
  { id: 'tpms', name: 'Motorcycle TPMS', type: 'Tire Pressure' },
  { id: 'gopro', name: 'GoPro Hero 12', type: 'Camera' },
  { id: 'hud', name: 'Rider HUD', type: 'Display' },
];

export function ConnectivityPanel(): React.JSX.Element {
  const [connected, setConnected] = useState<Record<string, boolean>>({
    obd: true,
    tpms: true,
    gopro: false,
    hud: true,
  });

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Connected Devices</Text>
      {DEVICES.map(device => (
        <View key={device.id} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{device.name}</Text>
            <Text style={styles.type}>{device.type}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setConnected(prev => ({ ...prev, [device.id]: !prev[device.id] }))}
            style={styles.toggle}>
            {connected[device.id] ? (
              <CheckCircle size={22} color={Colors.connected} />
            ) : (
              <XCircle size={22} color={Colors.danger} />
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.bgCard,
    borderRadius: Spacing.cardRadius,
    padding: 14,
  },
  heading: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgHeader,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  type: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  toggle: {
    padding: 4,
  },
});
