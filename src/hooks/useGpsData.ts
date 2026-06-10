import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const DEFAULT_LATITUDE = 47.26;
const DEFAULT_LONGITUDE = 8.71;

interface GpsState {
  speed: number;
  latitude: number;
  longitude: number;
  hasLocationPermission: boolean;
  locationError: string | null;
}

export function useGpsData(): GpsState {
  const [state, setState] = useState<GpsState>({
    speed: 0,
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    hasLocationPermission: false,
    locationError: null,
  });

  const watchId = useRef<number | null>(null);

  useEffect(() => {
    async function requestAndWatch() {
      console.log('[GPS] Requesting ACCESS_FINE_LOCATION permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'MotoAI Location Permission',
          message: 'MotoAI needs access to your location for speed and map data.',
          buttonPositive: 'Allow',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[GPS] Permission denied');
        setState(prev => ({
          ...prev,
          hasLocationPermission: false,
          locationError: 'Location permission denied',
        }));
        return;
      }

      console.log('[GPS] Permission granted — starting watchPosition');
      setState(prev => ({ ...prev, hasLocationPermission: true, locationError: null }));

      watchId.current = Geolocation.watchPosition(
        position => {
          const { latitude, longitude, speed: rawSpeed } = position.coords;
          const speedKmh =
            rawSpeed == null || rawSpeed < 0 ? 0 : rawSpeed * 3.6;
          console.log(
            `[GPS] Position — lat: ${latitude}, lon: ${longitude}, speed: ${speedKmh.toFixed(1)} km/h`,
          );
          setState(prev => ({
            ...prev,
            speed: speedKmh,
            latitude,
            longitude,
            locationError: null,
          }));
        },
        error => {
          console.log(`[GPS] Error — code: ${error.code}, message: ${error.message}`);
          setState(prev => ({
            ...prev,
            locationError: error.message,
          }));
        },
        {
          interval: 1000,
          fastestInterval: 500,
          enableHighAccuracy: true,
        },
      );
    }

    requestAndWatch();

    return () => {
      if (watchId.current !== null) {
        console.log('[GPS] Clearing watch');
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  return state;
}
