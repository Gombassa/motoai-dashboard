import {
  Gauge,
  Mountain,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
  Zap,
  CircleGauge,
  Navigation,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertBar, type AlertType } from './src/components/AlertBar';
import { ConnectivityPanel } from './src/components/ConnectivityPanel';
import { DataCard } from './src/components/DataCard';
import { Header } from './src/components/Header';
import { MapPanel } from './src/components/MapPanel';
import { POIPanel } from './src/components/POIPanel';
import { RpmGauge } from './src/components/RpmGauge';
import { useElevationData } from './src/hooks/useElevationData';
import { useFormattedData } from './src/hooks/useFormattedData';
import { useGpsData } from './src/hooks/useGpsData';
import type { Place } from './src/hooks/usePlaces';
import { useMockData } from './src/hooks/useMockData';
import { Colors, Spacing } from './src/theme';

function useAlertType(speed: number): AlertType {
  const [alertType, setAlertType] = React.useState<AlertType>('none');
  React.useEffect(() => {
    const id = setInterval(() => {
      if (speed > 80 && Math.random() < 0.05) {
        setAlertType('hazard_ahead');
        setTimeout(() => setAlertType('none'), 4000);
      }
    }, 500);
    return () => clearInterval(id);
  }, [speed]);
  return alertType;
}

function App(): React.JSX.Element {
  const gps = useGpsData();
  const mock = useMockData();
  const fmt = useFormattedData(gps, mock);
  const elevation = useElevationData(gps);
  const alertType = useAlertType(fmt.speedDisplay);
  const [poiMarker, setPoiMarker] = useState<Place | null>(null);

  const engineColor =
    fmt.engineTempRaw > 100 ? Colors.danger : Colors.white;
  const alternatorColor =
    fmt.alternatorRaw < 13.0 ? Colors.warning : Colors.white;

  const gradientValue = elevation.gradient;
  const gradientDisplay =
    gradientValue == null
      ? '—'
      : `${gradientValue >= 0 ? '+' : ''}${gradientValue.toFixed(1)}%`;
  const gradientColor =
    gradientValue != null && Math.abs(gradientValue) > 5
      ? Colors.warning
      : Colors.white;
  const GradientIcon =
    gradientValue != null && gradientValue < 0 ? TrendingDown : TrendingUp;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgPrimary} />
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AlertBar alertType={alertType} />

        {/* Speed — full width */}
        <DataCard
          icon={<Gauge size={16} color={Colors.accent} />}
          label="Speed"
          value={fmt.speedDisplay}
          unit="km/h"
          color={Colors.accent}
          flex={0}
        />

        {/* Temp row */}
        <View style={styles.row}>
          <DataCard
            icon={<Thermometer size={14} color={engineColor} />}
            label="Engine"
            value={fmt.engineTempDisplay}
            unit="°C"
            color={engineColor}
          />
          <DataCard
            icon={<Wind size={14} color={Colors.white} />}
            label="Air Temp"
            value={fmt.airTempDisplay}
            unit="°C"
          />
        </View>

        {/* RPM gauge */}
        <RpmGauge rpm={fmt.rpmDisplay} />

        {/* Data cards row */}
        <View style={styles.row}>
          <DataCard
            icon={<Navigation size={14} color={Colors.white} />}
            label="Mileage"
            value={fmt.mileageDisplay}
            unit="km"
          />
          <DataCard
            icon={<Zap size={14} color={alternatorColor} />}
            label="Alternator"
            value={fmt.alternatorDisplay}
            unit="V"
            color={alternatorColor}
          />
          <DataCard
            icon={<CircleGauge size={14} color={Colors.white} />}
            label="Front Tire"
            value={fmt.frontPsiDisplay}
            unit="PSI"
          />
          <DataCard
            icon={<CircleGauge size={14} color={Colors.white} />}
            label="Rear Tire"
            value={fmt.rearPsiDisplay}
            unit="PSI"
          />
        </View>

        {/* Elevation cards */}
        <View style={styles.row}>
          <DataCard
            icon={<Mountain size={14} color={Colors.white} />}
            label="Altitude"
            value={elevation.altitude != null ? elevation.altitude.toFixed(0) : '—'}
            unit="m"
          />
          <DataCard
            icon={<GradientIcon size={14} color={gradientColor} />}
            label="Gradient"
            value={gradientDisplay}
            color={gradientColor}
          />
        </View>

        {/* Map */}
        <MapPanel
          latitude={gps.latitude}
          longitude={gps.longitude}
          poiMarker={poiMarker}
        />

        {/* POI search */}
        <POIPanel
          latitude={gps.latitude}
          longitude={gps.longitude}
          onShowOnMap={place => setPoiMarker(place)}
        />

        {/* Devices */}
        <ConnectivityPanel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.pagePadding,
    gap: Spacing.gap,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.gap,
    flexWrap: 'wrap',
  },
});

export default App;
