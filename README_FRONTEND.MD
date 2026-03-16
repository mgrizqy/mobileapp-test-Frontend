
# Frontend – React Native + Expo

## Stack
- React Native (Expo managed workflow)
- Expo Router (file-based navigation)
- Zustand (state management)
- Axios (HTTP client)
- NativeWind (Tailwind CSS for React Native)
- expo-secure-store (hardware-backed token storage)
- expo-device (automatic device name detection)

## Setup
1. `npm install`
2. `npx expo start`

## Project Structure
```
app/                  ← Screens (Expo Router)
  (auth)/             ← Login, Register
  (app)/              ← Protected screens (Home, Profile, Sessions)
  account-switcher.tsx
src/
  api/                ← Axios client + endpoint functions
  stores/             ← Zustand stores
  services/           ← Business logic
  storage/            ← SecureStore wrapper
  types/              ← Shared TypeScript types
  components/         ← Reusable UI components
```
