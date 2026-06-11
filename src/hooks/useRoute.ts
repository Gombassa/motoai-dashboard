import { useCallback, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config';

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface RouteState {
  polyline: LatLng[];
  distanceKm: number | null;
  durationMins: number | null;
  steps: string[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: RouteState = {
  polyline: [],
  distanceKm: null,
  durationMins: null,
  steps: [],
  loading: false,
  error: null,
};

function decodePolyline(encoded: string): LatLng[] {
  const coords: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

export function useRoute() {
  const [state, setState] = useState<RouteState>(INITIAL_STATE);

  const compute = useCallback(
    async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        console.log('[Route] Computing route from', origin, 'to', destination);

        const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction',
          },
          body: JSON.stringify({
            origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
            destination: {
              location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
            },
            travelMode: 'DRIVE',
            polylineQuality: 'HIGH_QUALITY',
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.routes?.length) {
          throw new Error(json.error?.message ?? 'No route found');
        }

        const route = json.routes[0];
        const encoded: string = route.polyline.encodedPolyline;
        const distanceKm = route.distanceMeters / 1000;
        const durationMins = Math.round(parseInt(route.duration, 10) / 60);
        const steps: string[] = (route.legs?.[0]?.steps ?? [])
          .map((s: any) => s.navigationInstruction?.instructions ?? '')
          .filter(Boolean);

        console.log('[Route] Distance:', distanceKm.toFixed(1), 'km  Duration:', durationMins, 'min');

        setState({
          polyline: decodePolyline(encoded),
          distanceKm,
          durationMins,
          steps,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.log('[Route] Error:', err?.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err?.message ?? 'Route calculation failed',
        }));
      }
    },
    [],
  );

  const clear = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, compute, clear };
}
