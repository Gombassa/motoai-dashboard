import { AlertCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { useRoute } from '../hooks/useRoute';
import type { Place } from '../hooks/usePlaces';
import { Colors, Spacing } from '../theme';

interface Props {
  latitude: number;
  longitude: number;
  poiMarker: Place | null;
}

function MapErrorFallback({ error }: { error: string }): React.JSX.Element {
  return (
    <View style={styles.errorFallback}>
      <AlertCircle size={28} color={Colors.danger} />
      <Text style={styles.errorTitle}>Map unavailable</Text>
      <Text style={styles.errorMsg}>{error}</Text>
      <Text style={styles.errorHint}>Ensure a Google APIs emulator is running and the API key is valid.</Text>
    </View>
  );
}

export function MapPanel({ latitude, longitude, poiMarker }: Props): React.JSX.Element {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const route = useRoute();

  // Animate map to current GPS position
  useEffect(() => {
    if (!mapReady) { return; }
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
      1000,
    );
  }, [latitude, longitude, mapReady]);

  // Animate to POI marker when selected
  useEffect(() => {
    if (!mapReady || poiMarker == null) { return; }
    mapRef.current?.animateToRegion(
      {
        latitude: poiMarker.latitude,
        longitude: poiMarker.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      800,
    );
  }, [poiMarker, mapReady]);

  const geocodeAndRoute = useCallback(async () => {
    if (!query.trim()) { return; }
    setGeocodeError(null);
    try {
      console.log('[Map] Geocoding:', query);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== 'OK' || !json.results?.length) {
        throw new Error('Location not found');
      }
      const loc = json.results[0].geometry.location;
      const label: string = json.results[0].formatted_address;
      console.log('[Map] Geocoded to', loc.lat, loc.lng);
      setDestination({ lat: loc.lat, lng: loc.lng, label });
      route.compute({ lat: latitude, lng: longitude }, { lat: loc.lat, lng: loc.lng });
    } catch (err: any) {
      setGeocodeError(err?.message ?? 'Geocoding failed');
    }
  }, [query, latitude, longitude, route]);

  function clearRoute() {
    setDestination(null);
    setQuery('');
    setGeocodeError(null);
    route.clear();
  }

  const hasRoute = route.polyline.length > 0;

  return (
    <View style={styles.wrapper}>
      {/* Search bar */}
      <View style={[styles.searchRow, inputFocused && styles.searchRowFocused]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Navigate to..."
          placeholderTextColor={Colors.muted}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onSubmitEditing={geocodeAndRoute}
          returnKeyType="search"
        />
        {hasRoute && (
          <TouchableOpacity onPress={clearRoute} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {geocodeError != null && (
        <Text style={styles.geocodeError}>{geocodeError}</Text>
      )}

      {/* Route info bar */}
      {(hasRoute || route.loading) && (
        <View style={styles.routeInfoBar}>
          {route.loading ? (
            <ActivityIndicator size="small" color={Colors.accent} />
          ) : (
            <>
              <Text style={styles.routeInfoText}>
                {route.distanceKm?.toFixed(1)} km
              </Text>
              <Text style={styles.routeInfoSep}>·</Text>
              <Text style={styles.routeInfoText}>
                {route.durationMins} min ETA
              </Text>
              {destination != null && (
                <>
                  <Text style={styles.routeInfoSep}>·</Text>
                  <Text style={styles.routeDestLabel} numberOfLines={1}>
                    {destination.label}
                  </Text>
                </>
              )}
            </>
          )}
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        {mapError != null ? (
          <MapErrorFallback error={mapError} />
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider="google"
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              onMapReady={() => {
                console.log('[Map] Ready');
                setMapReady(true);
              }}>
              {/* Current position */}
              <Marker
                coordinate={{ latitude, longitude }}
                title="You are here"
                pinColor={Colors.accent}
              />

              {/* Destination marker */}
              {destination != null && (
                <Marker
                  coordinate={{ latitude: destination.lat, longitude: destination.lng }}
                  title={destination.label}
                  pinColor={Colors.warning}
                />
              )}

              {/* POI marker */}
              {poiMarker != null && (
                <Marker
                  coordinate={{ latitude: poiMarker.latitude, longitude: poiMarker.longitude }}
                  title={poiMarker.name}
                  description={poiMarker.address}
                  pinColor="#A78BFA"
                />
              )}

              {/* Route polyline */}
              {hasRoute && (
                <Polyline
                  coordinates={route.polyline}
                  strokeColor={Colors.accent}
                  strokeWidth={4}
                />
              )}
            </MapView>

            {!mapReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={styles.loadingText}>Loading Map...</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgHeader,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  searchRowFocused: {
    borderColor: Colors.accent,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearBtn: {
    paddingLeft: 10,
  },
  clearBtnText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  geocodeError: {
    color: Colors.warning,
    fontSize: 12,
    marginBottom: 4,
  },
  routeInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgHeader,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    gap: 6,
    flexWrap: 'wrap',
  },
  routeInfoText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  routeInfoSep: {
    color: Colors.muted,
    fontSize: 13,
  },
  routeDestLabel: {
    color: Colors.muted,
    fontSize: 12,
    flex: 1,
  },
  mapContainer: {
    height: 300,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: Colors.muted,
    fontSize: 14,
  },
  errorFallback: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  errorTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorMsg: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  errorHint: {
    color: Colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
