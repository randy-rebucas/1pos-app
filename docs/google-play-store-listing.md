# Google Play Store listing — 1POS Mobile

Copy, assets, and compliance notes for publishing **1POS Mobile** on Google Play.

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| App name (store) | 1POS Mobile                                     |
| Package name     | `com.app.onepos`                                |
| Default category | **Business**                                    |
| Production API   | `https://www.1pos.solutions`                    |
| Target audience  | Staff at retail / general businesses using 1POS |

---

## 1. Store listing text

### App name (30 characters max)

```
1POS Mobile
```

### Short description (80 characters max)

```
Staff companion for 1POS — scan barcodes, update products, and sync your store.
```

### Full description (4,000 characters max)

```
1POS Mobile is the official staff companion app for stores on the 1POS platform. Use it on the shop floor to scan barcodes and QR codes, update product details, and keep your catalog accurate — without returning to a desktop.

WHO IT'S FOR
• Store owners, managers, and staff with a 1POS account
• Retail and general businesses already set up on 1POS

WHAT YOU CAN DO
• Select your store and sign in securely with email and password
• Run bulk scan sessions to work through products that need barcodes or images
• Scan EAN, UPC, Code128, Code39, and QR codes with your phone camera
• Auto-capture barcodes when aligned in the camera frame
• Edit product title, SKU, price, stock, category, and notes
• Take or upload product photos synced to your 1POS catalog
• Track session progress — updated, skipped, and error counts

HOW IT WORKS
1. Choose your store (or enter your store slug)
2. Sign in with your staff credentials
3. Start a scan session and scan products one by one
4. Changes sync to your 1POS backend in real time

REQUIREMENTS
• An active 1POS store account (this app does not work without one)
• Internet connection
• Camera access for barcode/QR scanning and product photos

1POS Mobile is a business tool for authorized staff only. It is not a consumer shopping app.

Support: support@1pos.solutions
Website: https://www.1pos.solutions
```

> **Before publish:** Replace `support@1pos.solutions` and the website URL if your production contact details differ.

---

## 2. Graphic assets

| Asset                 | Spec                                                                    | Source in repo                                  |
| --------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| **App icon**          | 512 × 512 PNG, 32-bit, no alpha                                         | Export from `assets/images/icon.png` at 512×512 |
| **Feature graphic**   | 1,024 × 500 PNG or JPEG                                                 | Create marketing banner (see template below)    |
| **Phone screenshots** | 2–8 images; min 320 px short side; max 3,840 px long side; 16:9 or 9:16 | Capture from device or emulator                 |

### Feature graphic — suggested layout

- Background: brand blue `#0B6E99` or light `#F5F7FA`
- Headline: **1POS Mobile**
- Subline: _Scan. Update. Sync._
- Optional: phone mockup showing scanner + product form
- No excessive text (Play may reject cluttered feature graphics)

### Recommended screenshots (in order)

1. **Store select** — store search / slug entry
2. **Sign in** — staff login
3. **Scan setup** — barcode vs QR mode, product filter
4. **Active scanning** — camera + product form with barcode filled
5. **Session complete** — stats (updated / skipped / errors)

Use a real device frame or Play’s device art templates. Portrait 9:16 matches the app (`orientation: portrait`).

---

## 3. Play Console settings

### App category

| Setting           | Recommendation                                    |
| ----------------- | ------------------------------------------------- |
| Category          | **Business**                                      |
| Tags (if offered) | Point of sale, Inventory, Retail, Barcode scanner |

### Contact details

| Field   | Example                    |
| ------- | -------------------------- |
| Email   | support@1pos.solutions     |
| Phone   | Optional                   |
| Website | https://www.1pos.solutions |

### Privacy policy (required)

Host a public HTTPS page that covers:

- What data is collected (account email, store/tenant context, product data, uploaded images)
- How data is used (authentication, catalog updates, audit logging)
- Third parties (e.g. cloud image hosting if applicable on your backend)
- Data retention and user rights
- Contact for privacy requests

**Privacy policy URL field in Play Console:**  
`https://www.1pos.solutions/privacy` _(update to your live URL)_

---

## 4. App access

Play requires instructions if login is needed to review the app.

**Select:** _All or some functionality is restricted_

**Instructions for reviewers:**

```
1POS Mobile requires an active 1POS store account.

Demo credentials (provide before submission):
  Email: [demo-admin@yourstore.com]
  Password: [DemoPassword123]
  Store slug: [your-demo-store]

Steps:
1. Open the app
2. Select the demo store (or enter the store slug on the manual entry screen)
3. Sign in with the demo email and password
4. Tap "Scan products" → choose Barcode mode → "Start scanning"
5. Grant camera permission when prompted
6. Scan any retail barcode or enter a barcode manually in the form

The demo account is read/write enabled on a test catalog only.
```

Replace bracketed values with a dedicated **demo tenant** before submission. Never use production admin credentials.

---

## 5. Ads & content

| Question                        | Answer                                       |
| ------------------------------- | -------------------------------------------- |
| Contains ads?                   | **No**                                       |
| In-app purchases?               | **No** (unless you add billing later)        |
| Primarily directed at children? | **No** — target age **18+** / business users |

### Content rating questionnaire (IARC)

Typical answers for this app:

- Violence, sexuality, language, controlled substances: **No**
- User-generated content: **No** (staff edit catalog data; not public UGC)
- Shares user location: **No**
- Digital purchases: **No**

Expected rating: **Everyone** or **PEGI 3** / low maturity (business utility).

---

## 6. Data safety form

Use answers consistent with actual backend behavior. Adjust if your production stack differs.

### Data collected

| Data type                         | Collected | Shared | Purpose                                   |
| --------------------------------- | --------- | ------ | ----------------------------------------- |
| Email address                     | Yes       | No     | Account / authentication                  |
| Name (staff profile)              | Yes       | No     | Account management                        |
| Photos (product images)           | Yes       | No\*   | App functionality — catalog photos        |
| App activity (scan session stats) | Yes       | No     | Analytics / audit (if logged server-side) |
| Device or other IDs               | Optional  | No     | Only if you add crash analytics later     |

\*Photos are uploaded to your backend / cloud storage; mark **shared** only if a third-party processor (e.g. Cloudinary) stores them — then list that provider under data sharing.

### Security practices

- Data encrypted in transit: **Yes** (HTTPS)
- Users can request data deletion: **Yes** (via store admin / support — describe process)
- Committed to Play Families Policy: **N/A** (not a kids app)

### Permissions declared (Android)

From `app.json`:

| Permission     | Why users see it                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| `CAMERA`       | Barcode/QR scanning and product photos                                                                          |
| `RECORD_AUDIO` | May appear via camera stack — **review before release**; remove from manifest if unused to simplify Data safety |

---

## 7. Release checklist

### Build

```bash
eas build --platform android --profile production
```

Production profile uses `EXPO_PUBLIC_API_URL=https://www.1pos.solutions` (see `eas.json`).

### Submit

```bash
eas submit --platform android --profile production
```

Or upload the `.aab` manually in Play Console → **Release** → **Production**.

### Pre-launch verification

- [ ] Production API live and stable (not ngrok)
- [ ] Demo account works end-to-end (store select → login → scan → save)
- [ ] Privacy policy URL returns 200
- [ ] App icon 512×512 uploaded
- [ ] Feature graphic 1024×500 uploaded
- [ ] At least 2 phone screenshots uploaded
- [ ] Short + full description pasted
- [ ] Data safety form completed
- [ ] Content rating questionnaire completed
- [ ] App access instructions + demo credentials added for reviewers
- [ ] Target countries selected
- [ ] `versionCode` increments on each upload (`eas.json` → `production.autoIncrement: true`)

---

## 8. Version & package reference

| Item            | Current value                          |
| --------------- | -------------------------------------- |
| Version name    | `1.0.0` (`app.json` → `expo.version`)  |
| Android package | `com.app.onepos`                       |
| iOS bundle ID   | `com.app.onepos`                       |
| EAS project ID  | `d5552809-3576-41a9-a44d-8a051d71cad2` |

---

## 9. Optional: localized listings

If you ship in the Philippines first, you can add **Filipino (Tagalog)** later under **Store presence → Main store listing → Manage translations**, reusing the same structure with translated short/full descriptions.

---

## 10. Related internal docs

- [`../README.md`](../README.md) — dev setup
- [`../mobile-api-endpoints.md`](../mobile-api-endpoints.md) — API contract
- [`../eas.json`](../eas.json) — build profiles and production API URL
