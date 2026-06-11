# MotoAI Dashboard — Migration Prompt

Use this document as a base prompt when rebuilding this app from scratch in a new project.

---

## Current Status

- **Phase 1** ✅ Complete and running on Android emulator (Pixel 7, API 34, Google APIs)
- **Phase 2** ✅ Complete and running — elevation, POI search, routing, component refactor

---

## What to Build

A **React Native mobile dashboard app** for motorcycles, called **MotoAI Dashboard**. It displays real-time telemetry data from the bike — GPS speed, RPM, temperatures, tire pressures, alternator voltage — on a dark-themed scrollable dashboard. A live Google Map shows the rider's current position. A connectivity panel lists paired devices (OBD-II, TPMS, camera, HUD).

---

## Tech Stack

- **React Native 0.81+** with **TypeScript**
- **React 19+**
- **react-native-maps** — Google Maps integration (requires Google APIs emulator or device)
- **react-native-geolocation-service** — GPS position + speed tracking
- **react-native-svg** — required peer dependency for lucide-react-native
- **lucide-react-native** — icon library

---

## App Structure

```
src/
  hooks/
    useGpsData.ts
    useMockData.ts
    useElevationData.ts
    usePlaces.ts
    useRoute.ts
  components/
    Header.tsx
    AlertBar.tsx
    DataCard.tsx
    RpmGauge.tsx
    MapPanel.tsx
    ConnectivityPanel.tsx
    POIPanel.tsx
App.tsx  (thin orchestration layer)
```

---

## Hooks

### `useGpsData()`
- Requests `ACCESS_FINE_LOCATION` permission on Android at startup
- Watches GPS position via `Geolocation.watchPosition` (interval: 1000ms, fastestInterval: 500ms, high accuracy)
- Converts speed from m/s → km/h
- Returns `{ speed, latitude, longitude, hasLocationPermission, locationError }`
- Default fallback coordinates: `{ latitude: 47.26, longitude: 8.71 }` (Meilen, Switzerland)
- Logs with `[GPS]` prefix

### `useMockData()`
- Simulates OBD-II + TPMS sensor data, updating every 500ms
- Returns `{ rpm, engine_temp, air_temp, mileage, alternator_status, tpms_front_psi, tpms_rear_psi }`
- Initial values: rpm=0, engine_temp=20°C, air_temp=18°C, mileage=12345km, alternator=12.5V, front=36PSI, rear=42PSI
- RPM: random walk ±250 per tick
- Engine temp: rises slowly, capped at 110°C
- Air temp: sinusoidal variation around 18°C
- Alternator: random noise around 13.8V
- Tire pressures: very small random noise

### `useElevationData()`
- Calls Maps Elevation API with current GPS coordinates, throttled to once every 5 seconds
- Computes gradient % using Haversine formula from delta between last two elevation readings vs distance travelled
- Returns `{ altitude, gradient }`
- Logs with `[Elevation]` prefix

### `usePlaces()`
- Accepts `{ latitude, longitude, type: 'gas_station' | 'restaurant' }`
- Calls Places API nearby search, then Distance Matrix API for road distances
- Returns `{ places, loading, error, search() }`
- Each place: `{ name, address, straight_line_distance, road_distance_km, road_duration_mins, latitude, longitude }`
- Logs with `[Places]` prefix

### `useRoute()`
- POSTs to Routes API, decodes encoded polyline inline
- Returns `{ polyline, distanceKm, durationMins, compute(), clear() }`
- Logs with `[Route]` prefix

---

## UI Components

### `Header`
Fixed top bar. Shows "MotoAI Dashboard" title. Right side shows: Rss icon, Wifi icon, battery percentage ("95%") + Battery icon.

### `AlertBar`
Full-width colored bar below the header.
- Green (`#16A34A`) with CheckCircle icon + "All Systems Clear" when `alertType === 'none'`
- Amber (`#F59E0B`) with AlertTriangle icon + uppercased alert name when alerting
- Alert logic: fires `hazard_ahead` randomly when speed > 80 km/h (5% chance per 500ms tick)

### `DataCard`
Reusable card showing an icon, label, large numeric value, and unit. Takes `{ icon, label, value, unit, color }` props. Color defaults to white; used to show warning colors (e.g. red engine temp, amber alternator).

### `RpmGauge`
Horizontal progress bar gauge for RPM.
- Max: 10,000 RPM
- Redline at 80% — bar turns red (`#EF4444`) above that, cyan (`#22D3EE`) below
- Shows numeric RPM below the bar

### `MapPanel`
- MapView + destination search bar + route info bar + Clear button
- Height: 300px, rounded corners, `overflow: hidden`
- `initialRegion` set from GPS coordinates, `latitudeDelta: 0.0922`
- Animates to new coordinates on GPS update with `animateToRegion(..., 1000ms)`
- Cyan marker (`#22D3EE`) at current position, title "You are here"
- Loading overlay (ActivityIndicator + "Loading Map..." text) shown until `onMapReady` fires
- Error fallback component (`MapErrorFallback`) shown if `onError` fires
- Search bar: dark `#1F2937` background, cyan border on focus, geocodes via Geocoding API
- Route rendered as cyan polyline width 4, amber destination marker
- Route info bar shows distance (km) and ETA (mins)
- Clear button removes polyline and destination marker
- Accepts `poiMarker` prop — animates map to POI when set from POIPanel
- Logs with `[Map]` prefix

### `POIPanel`
- Two buttons: ⛽ Gas Stations and 🍽 Restaurants — cyan border when active
- Triggers `usePlaces()` search on tap using current GPS coordinates
- Shows up to 5 results with name, road distance, road travel time, and "Show on Map" button
- "Show on Map" passes coordinates up to App.tsx → MapPanel via `onShowOnMap` callback
- Loading: ActivityIndicator + "Searching..." text
- Error: amber "Search failed, check connection"
- All UI custom built — do not use Places UI Kit

### `ConnectivityPanel`
Lists 4 mock devices: OBD-II Scanner, Motorcycle TPMS, GoPro Hero 12, Rider HUD. Each row shows device name, type label, and a toggle button (green CheckCircle when connected, red XCircle when not). Tapping toggles the local connected state.

---

## Layout (scroll order, top to bottom)

1. `Header` (fixed, outside scroll)
2. `AlertBar`
3. Speed card (full-width, large 80px font, cyan label)
4. Engine Temp + Air Temp cards (side by side)
5. `RpmGauge` (full width)
6. Mileage + Alternator + Front Tire + Rear Tire cards (flex-wrap row)
7. Altitude + Gradient cards (side by side)
8. `MapPanel` (navigate search bar + 300px map)
9. `POIPanel`
10. `ConnectivityPanel`

All wrapped in `ScrollView` with 16px padding and 16px gap between sections.

---

## Theme / Colors

Dark theme throughout:
| Role | Color |
|---|---|
| Page background | `#111827` (gray-900) |
| Header / device rows | `#1F2937` (gray-800) |
| Cards / panels | `#374151` (gray-700) |
| Accent (speed, map marker, RPM bar) | `#22D3EE` (cyan-400) |
| Warning / alert | `#F59E0B` (amber-400) |
| Danger / redline | `#EF4444` (red-500) |
| Connected device | `#22C55E` (green-500) |
| Success / clear alert | `#16A34A` (green-700) |
| Low alternator warning | `#FBBF24` (yellow-400) |
| Muted text / units | `#9CA3AF` (gray-400) |

StatusBar: `barStyle="light-content"`, `backgroundColor="#111827"`

---

## Android Setup Notes

- Location permission: `ACCESS_FINE_LOCATION` via `PermissionsAndroid.request`
- Google Maps requires emulator with **Google APIs** system image and Google Play Services installed
- Tested on: Pixel 7, API 34, Google APIs Intel x86_64 system image
- API key goes in `android/app/src/main/AndroidManifest.xml` under `com.google.android.geo.API_KEY`
- `react-native-svg` must be installed as a peer dependency for `lucide-react-native` icons to render
- Play Services version conflict fix required in `android/build.gradle`:

```gradle
allprojects {
    configurations.all {
        resolutionStrategy {
            force "com.google.android.gms:play-services-location:21.0.1"
            force "com.google.android.gms:play-services-base:18.3.0"
            force "com.google.android.gms:play-services-basement:18.3.0"
        }
    }
}
```

---

## Google Maps API Key Setup

A single API key used for both Android and iOS. Key has access to the full Google Maps Platform suite (32 APIs). APIs actively used by the app:

| API | Used by |
|---|---|
| **Maps SDK for Android** | react-native-maps map rendering |
| **Maps SDK for iOS** | react-native-maps map rendering (iOS) |
| **Navigation SDK** | Future turn-by-turn guidance |
| **Routes API** | `useRoute()` — A-to-B route calculation |
| **Distance Matrix API** | `usePlaces()` — road distance/time to POIs |
| **Places API** | `usePlaces()` — nearby gas stations, restaurants |
| **Maps Elevation API** | `useElevationData()` — altitude + gradient |

**AndroidManifest.xml:**
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY_HERE" />
```

**Never commit the API key to version control.** Store in `local.properties` or `.env`.

---

## Data Formatting (`useMemo`)

All values formatted before display:
- Speed: `Math.round(gpsData.speed)`
- RPM: `Math.round(mockData.rpm)`
- Temps: `.toFixed(1)`
- Alternator: `.toFixed(1)`
- Tire pressures: `.toFixed(1)`
- Altitude: `Math.round(altitude)` + "m"
- Gradient: `${gradient >= 0 ? '+' : ''}${gradient.toFixed(1)}%`

---

## Key Behavioral Details

- Engine temp turns red above 100°C
- Alternator voltage turns amber below 13.0V
- Gradient card turns amber when |gradient| > 5%
- Map marker is custom cyan, not the default red pin
- Map loading overlay disappears once map is ready, not on a timer
- GPS errors are non-fatal — app keeps running with last known or default coordinates
- Elevation API throttled to once every 5 seconds to limit API calls
- POI results sorted by actual road travel time, not straight-line distance
- All sensor data is currently mocked; real OBD-II and TPMS integration is Phase 3
- Connectivity panel is UI-only; no actual Bluetooth yet

---

## Phase 3 — Planned Features (future work)

The API key has access to the full Google Maps Platform suite — no key changes needed for future phases.

### Real Sensor Integration
- Real OBD-II data via Bluetooth (replace `useMockData`)
- Real TPMS sensor data via Bluetooth
- Connectivity panel wired to actual Bluetooth device state

### Navigation
- Full turn-by-turn guidance via Navigation SDK
- Lane guidance and rerouting

### Ride Recording
- GPX track recording using GPS data
- Ride history and stats (distance, avg speed, max speed, elevation gain)
- Route elevation profile chart for planned rides
