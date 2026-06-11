import { useCallback, useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config';

interface ElevationState {
  altitude: number | null;
  gradient: number | null;
}

interface PositionSnapshot {
  lat: number;
  lng: number;
  elevation: number;
}

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useElevationData(coords: { latitude: number; longitude: number }): ElevationState {
  const [state, setState] = useState<ElevationState>({ altitude: null, gradient: null });
  const lastFetchRef = useRef<number>(0);
  const prevSnapshotRef = useRef<PositionSnapshot | null>(null);

  const fetchElevation = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      console.log('[Elevation] Fetching elevation for', lat, lng);
      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== 'OK' || !json.results?.length) {
        console.log('[Elevation] Bad response status:', json.status);
        return;
      }

      const elevation: number = json.results[0].elevation;
      console.log('[Elevation] Altitude:', elevation.toFixed(1), 'm');

      let gradient: number | null = null;
      const prev = prevSnapshotRef.current;
      if (prev !== null) {
        const dist = haversineMetres(prev.lat, prev.lng, lat, lng);
        if (dist > 1) {
          gradient = ((elevation - prev.elevation) / dist) * 100;
          console.log('[Elevation] Gradient:', gradient.toFixed(2), '%');
        }
      }

      prevSnapshotRef.current = { lat, lng, elevation };
      setState({ altitude: elevation, gradient });
    } catch (err) {
      console.log('[Elevation] Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;
    fetchElevation(coords.latitude, coords.longitude);
  }, [coords.latitude, coords.longitude, fetchElevation]);

  return state;
}
