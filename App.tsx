import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFormattedData } from './src/hooks/useFormattedData';
import { useGpsData } from './src/hooks/useGpsData';
import { useMockData } from './src/hooks/useMockData';

function App(): React.JSX.Element {
  const gps = useGpsData();
  const mock = useMockData();
  const fmt = useFormattedData(gps, mock);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.text}>Speed: {fmt.speedDisplay} km/h</Text>
      <Text style={styles.text}>RPM: {fmt.rpmDisplay}</Text>
      <Text style={styles.text}>Engine: {fmt.engineTempDisplay}°C</Text>
      <Text style={styles.text}>Air Temp: {fmt.airTempDisplay}°C</Text>
      <Text style={styles.text}>Alternator: {fmt.alternatorDisplay} V</Text>
      <Text style={styles.text}>TPMS Front: {fmt.frontPsiDisplay} PSI</Text>
      <Text style={styles.text}>TPMS Rear: {fmt.rearPsiDisplay} PSI</Text>
      <Text style={styles.text}>Mileage: {fmt.mileageDisplay} km</Text>
      <Text style={styles.text}>
        GPS: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
      </Text>
      <Text style={styles.text}>
        Permission: {String(gps.hasLocationPermission)}
      </Text>
      {gps.locationError != null && (
        <Text style={styles.error}>Location error: {gps.locationError}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
  },
});

export default App;
