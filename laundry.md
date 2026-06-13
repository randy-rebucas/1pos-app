You are a senior product architect, UX designer, and full-stack engineer.

Your task is to design and generate a COMPLETE Laundry Mobile App system that integrates with a POS backend (multi-tenant architecture similar to enterprise POS systems).

Context:
This app is part of a larger POS ecosystem that includes:

- Multi-tenant architecture (each laundry business is isolated)
- POS transactions, inventory, reporting, and automation workflows
- Service-based business logic (laundry, pickup/delivery, weight-based pricing)

The system follows a universal POS structure including:

- Business Profile
- Branches
- Services (instead of products)
- Orders / Tickets
- Payments
- Users & Roles
- Reports

Reference:
The POS supports laundry as a business type with service duration, weight pricing, pickup/delivery, and tracking. :contentReference[oaicite:0]{index=0}

---

## 🎯 OBJECTIVE

Design a MOBILE-FIRST Laundry App with:

1. Customer App (Client)
2. Staff App (Rider / Washer / Admin mobile)
3. Backend Integration (API-ready)

---

## 📱 CUSTOMER APP FEATURES

Design UX flows, screens, and API structure for:

### 1. Onboarding

- Login (OTP / Email / Social)
- Address selection (GPS + manual)
- Save multiple addresses

### 2. Book Laundry Service

- Select service type:
  - Wash & Fold
  - Wash & Iron
  - Dry Clean
  - Per Item pricing
- Pricing models:
  - Per KG
  - Per Item
- Add-ons:
  - Express service
  - Fabric softener
  - Special handling

### 3. Pickup & Delivery

- Schedule pickup date/time
- Select delivery date/time
- Real-time rider tracking

### 4. Order Tracking

Statuses:

- Pending
- Picked Up
- Washing
- Drying
- Ironing
- Out for Delivery
- Completed

### 5. Payments

- Cash
- GCash / Maya
- Card
- Wallet balance

### 6. Notifications

- Order updates
- Reminders
- Promotions

### 7. Customer Dashboard

- Order history
- Repeat order
- Favorites
- Reviews & ratings

---

## 🧑‍🔧 STAFF APP FEATURES

### Rider App

- Pickup list
- Route optimization
- Scan order QR
- Update status
- Proof of delivery (photo + signature)

### Laundry Staff App

- View assigned orders
- Update processing stages
- Tag issues (damaged, missing items)

### Admin Mobile

- Dashboard (orders, revenue)
- Manage bookings
- Assign riders

---

## 🧠 CORE BUSINESS LOGIC

Define:

1. Order lifecycle state machine
2. Pricing engine:
   - Weight-based
   - Item-based
   - Dynamic pricing (rush, bulk)

3. Inventory logic:
   - Detergents
   - Supplies consumption tracking

4. Automation:
   - Auto reminders
   - Status updates
   - Auto pricing calculation

---

## 🔗 API DESIGN (IMPORTANT)

Generate REST/GraphQL endpoints:

- POST /orders
- GET /orders
- PATCH /orders/status
- POST /payments
- GET /services
- GET /pricing
- POST /pickup-schedule

Ensure:

- Multi-tenant support (tenantId required)
- Role-based access (customer, rider, admin)

---

## 🎨 UI/UX REQUIREMENTS

- Clean, modern (similar to Grab / Uber style)
- Mobile-first (React Native or Flutter)
- Minimal taps to complete booking
- Clear status visualization (timeline)

Provide:

- Wireframes
- Component structure
- Navigation flow

---

## ⚙️ TECH STACK

Recommend:

- Frontend: React Native (Expo)
- Backend: Next.js API or Node.js
- Database: MongoDB
- Realtime: WebSockets or SSE
- Payments: Stripe / Local gateways (GCash, Maya)

---

## 📊 ANALYTICS & REPORTING

Include:

- Daily orders
- Revenue
- Customer retention
- Peak booking times

---

## 🚀 MONETIZATION OPTIONS

Suggest:

- Commission per order
- SaaS monthly subscription
- Franchise model
- Add-on services (express, premium care)

---

## 📦 OUTPUT FORMAT

Provide structured output:

1. System Architecture
2. Feature Breakdown
3. Database Schema
4. API Endpoints
5. UI Wireframes (textual)
6. User Flow Diagrams
7. Monetization Strategy
8. Future Scalability Plan

---

## ⚠️ IMPORTANT

- Make it production-ready, not MVP only
- Ensure scalability (multi-branch, multi-city)
- Design for real-world laundry operations
- Integrate tightly with POS system logic

Think like you're building the "Grab for Laundry" powered by POS.
