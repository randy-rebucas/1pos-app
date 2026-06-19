# Deployment

This app ships via [EAS Build](https://docs.expo.dev/build/introduction/) and [EAS Submit](https://docs.expo.dev/submit/introduction/). Build profiles and per-environment config live in [`eas.json`](../eas.json).

## Prerequisites

- `npm install -g eas-cli` (or `npx eas-cli`)
- `eas login` — must be a member of the `randyreb` Expo account/org
- Android keystore and iOS credentials are managed by EAS (`eas credentials` to inspect/rotate)

## Environments

| Profile | API URL | Use |
| --- | --- | --- |
| `development` | ngrok tunnel (`EXPO_PUBLIC_API_URL` in `eas.json`) | Dev client builds against a local backend tunnel |
| `preview` | `https://www.1pos.solutions` | Internal QA builds (Android APK) |
| `production` | `https://www.1pos.solutions` | Store releases (App Store / Play Store) |

The `development` profile's `EXPO_PUBLIC_API_URL` points at a temporary ngrok URL — update it in `eas.json` whenever the tunnel changes.

## Build

```bash
# Internal QA APK
eas build --platform android --profile preview

# Production builds
eas build --platform android --profile production
eas build --platform ios --profile production
```

`production` has `autoIncrement: true`, so EAS bumps the build number/version code automatically; `appVersionSource` is `remote`, so version state is tracked by EAS, not local `app.json`.

## Submit to stores

```bash
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

Play Store listing copy lives in [`google-play-store-listing.md`](./google-play-store-listing.md).

## Local/dev client

```bash
npm install
npm start            # Expo dev server, requires a dev client or Expo Go-compatible build
npm run android      # eas build profile=development equivalent, run locally
npm run ios
```

Local runs read `.env` (`EXPO_PUBLIC_API_URL`) instead of the `eas.json` build profile env.

## Web

```bash
npx expo export --platform web   # static output (app.json: web.output = "static")
```

## Rollback

EAS keeps every build artifact under the project dashboard (project ID `d5552809-3576-41a9-a44d-8a051d71cad2`). To roll back, re-submit a previous build via `eas submit` using its build ID — there is no separate rollback command.
