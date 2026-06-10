# MotoAI Dashboard

React Native 0.81 + TypeScript motorcycle telemetry dashboard for Android (iOS port planned).

## Stack
- React Native 0.81+ / TypeScript / React 19+
- react-native-maps (Google Maps)
- react-native-geolocation-service
- lucide-react-native

## Android emulator requirements
- Android Studio emulator with **Google APIs** system image
- Google Play Services installed on emulator
- Google Maps API key (Android-restricted) in `android/app/src/main/AndroidManifest.xml`

## Environment setup
1. Copy `android/local.properties.example` to `android/local.properties` and set your SDK path
2. Add your Maps API key to AndroidManifest.xml (see Android Setup section in docs)
3. `npm install` then `npx react-native run-android`
