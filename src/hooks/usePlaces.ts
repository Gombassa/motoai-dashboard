import { useCallback, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config';

export type PlaceType = 'gas_station' | 'restaurant';

export interface Place {
  name: string;
  address: string;
  straight_line_distance: number;
  road_distance_km: number | null;
  road_duration_mins: number | null;
  latitude: number;
  longitude: number;
}

interface PlacesState {
  places: Place[];
  loading: boolean;
  error: string | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function usePlaces() {
  const [state, setState] = useState<PlacesState>({ places: [], loading: false, error: null });

  const search = useCallback(
    async (latitude: number, longitude: number, type: PlaceType) => {
      setState({ places: [], loading: true, error: null });
      try {
        console.log('[Places] Searching nearby', type, 'at', latitude, longitude);

        const nearbyUrl =
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
          `?location=${latitude},${longitude}&rankby=distance&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;
        const nearbyRes = await fetch(nearbyUrl);
        const nearbyJson = await nearbyRes.json();

        if (nearbyJson.status !== 'OK' && nearbyJson.status !== 'ZERO_RESULTS') {
          throw new Error(`Places API: ${nearbyJson.status}`);
        }

        const results: any[] = (nearbyJson.results ?? []).slice(0, 5);
        console.log('[Places] Got', results.length, 'nearby results');

        if (results.length === 0) {
          setState({ places: [], loading: false, error: null });
          return;
        }

        const destinations = results
          .map((r: any) => `${r.geometry.location.lat},${r.geometry.location.lng}`)
          .join('|');

        const matrixUrl =
          `https://maps.googleapis.com/maps/api/distancematrix/json` +
          `?origins=${latitude},${longitude}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`;
        const matrixRes = await fetch(matrixUrl);
        const matrixJson = await matrixRes.json();

        console.log('[Places] Distance Matrix status:', matrixJson.status);

        const places: Place[] = results.map((r: any, i: number) => {
          const plat = r.geometry.location.lat;
          const plng = r.geometry.location.lng;
          const element = matrixJson.rows?.[0]?.elements?.[i];
          const roadDistKm =
            element?.status === 'OK' ? element.distance.value / 1000 : null;
          const roadDurMins =
            element?.status === 'OK' ? Math.round(element.duration.value / 60) : null;

          return {
            name: r.name,
            address: r.vicinity ?? '',
            straight_line_distance: haversineKm(latitude, longitude, plat, plng),
            road_distance_km: roadDistKm,
            road_duration_mins: roadDurMins,
            latitude: plat,
            longitude: plng,
          };
        });

        setState({ places, loading: false, error: null });
      } catch (err: any) {
        console.log('[Places] Error:', err?.message);
        setState({ places: [], loading: false, error: 'Search failed, check connection' });
      }
    },
    [],
  );

  return { ...state, search };
}
