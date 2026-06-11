import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type Place, type PlaceType, usePlaces } from '../hooks/usePlaces';
import { Colors, Spacing } from '../theme';

interface Props {
  latitude: number;
  longitude: number;
  onShowOnMap: (place: Place) => void;
}

export function POIPanel({ latitude, longitude, onShowOnMap }: Props): React.JSX.Element {
  const [activeType, setActiveType] = useState<PlaceType | null>(null);
  const { places, loading, error, search } = usePlaces();

  function handlePress(type: PlaceType) {
    setActiveType(type);
    search(latitude, longitude, type);
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Nearby Places</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.typeBtn, activeType === 'gas_station' && styles.typeBtnActive]}
          onPress={() => handlePress('gas_station')}>
          <Text style={styles.typeBtnText}>⛽ Gas Stations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, activeType === 'restaurant' && styles.typeBtnActive]}
          onPress={() => handlePress('restaurant')}>
          <Text style={styles.typeBtnText}>🍽 Restaurants</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {error != null && !loading && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && error == null && places.length > 0 && (
        <View style={styles.resultsList}>
          {places.map((place, i) => (
            <View key={i} style={styles.placeCard}>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.placeAddress} numberOfLines={1}>
                  {place.address}
                </Text>
                <View style={styles.distRow}>
                  {place.road_distance_km != null ? (
                    <Text style={styles.distText}>
                      {place.road_distance_km.toFixed(1)} km · {place.road_duration_mins} min
                    </Text>
                  ) : (
                    <Text style={styles.distText}>
                      {place.straight_line_distance.toFixed(1)} km (straight line)
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity style={styles.mapBtn} onPress={() => onShowOnMap(place)}>
                <Text style={styles.mapBtnText}>Show on Map</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.muted,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: Colors.accent,
  },
  typeBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: Colors.muted,
    fontSize: 13,
  },
  errorText: {
    color: Colors.warning,
    fontSize: 13,
    paddingVertical: 8,
  },
  resultsList: {
    gap: 8,
  },
  placeCard: {
    backgroundColor: Colors.bgHeader,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
    marginRight: 8,
  },
  placeName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  placeAddress: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  distRow: {
    marginTop: 4,
  },
  distText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '500',
  },
  mapBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  mapBtnText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
