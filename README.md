# 1POS Mobile

Mobile POS companion for **retail stores and general businesses**. Built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/).

API reference: [`mobile-api-endpoints.md`](./mobile-api-endpoints.md)

## Flow

1. **Select store** — `GET /api/stores/retail` or enter store slug manually
2. **Sign in** — email + password via `POST /api/auth/mobile-login` (JWT in response body)
3. **Scan products** — bulk scan session + `PATCH /api/products/:id/scan-update`

| Screen | Purpose |
| --- | --- |
| Store select | Search and pick a retail store branch |
| Login | Email + password staff sign-in |
| Product scanner | Barcode/QR bulk edit with image upload |
| POS home | Quick access to scan and change store |

## Setup

1. Install dependencies: `npm install`

2. Create `.env`:

   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:3000
   # Optional — defaults to /api
   # EXPO_PUBLIC_API_PATH_PREFIX=/api
   ```

3. Start: `npm start`

## Navigation

| Route | Description |
| --- | --- |
| `/` | Store selection |
| `/(staff)/login` | Staff sign-in |
| `/(staff)/bulk-scan-select` | Scan session setup |
| `/(staff)/bulk-scan-session` | Active scanning |

## Project structure

```
app/(staff)/           # POS screens
components/ui/         # Shared UI
components/scan/       # Scanner UI
lib/api/               # staff-api, scan-api, upload-api, client
lib/context/           # Staff session + tenant providers
hooks/                 # use-staff-scan-headers
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Expo dev server |
| `npm run lint` | Run ESLint |

## Related docs

- [`mobile-api-endpoints.md`](./mobile-api-endpoints.md) — backend contract
- [Expo documentation](https://docs.expo.dev/)
