# VacantUp — Healthcare Appointment-Booking Platform

> **Tagline:** Skip the Queue. Find Available Doctors Instantly.  
> **Hero Heading:** Healthcare Appointments, Without the Wait.

VacantUp is a complete healthcare appointment-booking platform providing three integrated deliverables from one unified monorepo:
1. **Responsive Web Application** (React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Lucide React)
2. **Native Android Application** (React Native, Expo, Expo Router, TypeScript, Expo SecureStore, AAB build for Google Play Store)
3. **Native iOS Application** (React Native, Expo, Expo Router, TypeScript, Expo SecureStore, IPA archive for Apple App Store)
4. **Shared Backend & PostgreSQL Database** (Node.js, Express.js, TypeScript, Prisma ORM, JWT, bcrypt, atomic transactions, RBAC)
5. **Shared Packages** (`@vacantup/shared` types, validations, constants)

---

## 🏥 Architecture Overview

```
VacantUp/
├── apps/
│   ├── web/                     # Responsive Web Frontend (React + Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── components/      # Navbar, Footer, DoctorCard, HospitalCard, SlotPicker, Modals
│   │   │   ├── pages/           # Home, Doctors, DoctorDetail, Hospitals, Dashboards, Auth
│   │   │   ├── context/         # AuthContext, NotificationContext
│   │   │   ├── services/        # Typed API Client
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── mobile/                  # Native Android & iOS Apps (React Native + Expo)
│       ├── app/
│       │   ├── (tabs)/          # Bottom Tab Bar: Home, Doctors, Appointments, Alerts, Profile
│       │   ├── doctor/[id].tsx  # Doctor Profile & Interactive Slot Booking
│       │   ├── onboarding.tsx   # Mobile 4-step onboarding carousel
│       │   ├── auth/            # Mobile Login & Registration
│       │   └── _layout.tsx      # Native stack & safe areas
│       ├── services/            # Expo SecureStore & Mobile API Client
│       ├── context/             # Mobile Auth & Notifications Context
│       ├── app.json             # App Store & Play Store Bundle Config
│       ├── eas.json             # EAS Build Profiles (AAB & IPA)
│       └── package.json
│
├── server/                      # Shared Backend REST API
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL Schema with Enums, Relations & Constraints
│   │   └── seed.ts              # Database Seeder (Indian Cities, Hospitals, Doctors)
│   ├── src/
│   │   ├── config/              # Environment config
│   │   ├── controllers/         # Auth, Doctor, Hospital, Appointment, Schedule, Admin
│   │   ├── middleware/          # JWT Auth, Role RBAC, Rate Limiting, Zod Validation, Errors
│   │   ├── routes/              # Express API Routes
│   │   ├── services/            # Availability Calculation, Booking Engine, In-App Notifications
│   │   ├── tests/               # Vitest + Supertest integration test suite (21 passing tests)
│   │   ├── app.ts               # Express configuration
│   │   └── server.ts            # Server entry point
│   └── package.json
│
├── packages/
│   └── shared/                  # Shared TypeScript types, Zod schemas, constants
│       ├── src/
│       │   ├── types/
│       │   ├── constants/       # Cities (Karnal, Delhi...), Specialties, Color Palette
│       │   └── validation/      # Zod validation schemas
│       └── package.json
│
├── package.json                 # Monorepo NPM Workspaces
└── README.md
```

## Deploying to Vercel

The root `vercel.json` configures a Vercel project with two services:

- `web` serves the Vite app from `apps/web`.
- `server` serves the Express API from `server`.
- Requests under `/api/` are routed to `server`; all other paths are routed to `web`.

The web app uses the same-origin `/api` path by default, which is routed to the API in Vercel and proxied to the local Express server by Vite during development. `VITE_API_URL` can still override this path when needed.

The browser calls the API through this public route, so no service binding is needed. Configure the API's production environment variables in Vercel, including `DATABASE_URL` for a persistent database and a strong `JWT_SECRET`. The native app in `apps/mobile` is not included as a Vercel service.

---

## 🔐 Demonstration Accounts

All three platforms (Web, Android, iOS) share the same accounts and database. Quick one-click login buttons are provided on login screens:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **PATIENT** | `patient@vacantup.com` | `Patient@123` | Patient Rahul Verma (Karnal, Haryana). Can browse, book, reschedule, and cancel. |
| **DOCTOR** | `doctor@vacantup.com` | `Doctor@123` | Dr. Rajesh Sharma (Dermatologist, Karnal). OPD queue, schedule, and leave management. |
| **HOSPITAL_ADMIN** | `hospital@vacantup.com` | `Hospital@123` | Suresh Singhal (Amritdhara myHospital). Hospital doctor roster and departments. |
| **PLATFORM_ADMIN**| `admin@vacantup.com` | `Admin@123` | Super Admin. Platform metrics, doctor/hospital verification, audit logs. |

---

## ⚡ Core Features & Business Logic

### 1. Doctor Availability Engine
- Generates consultation time slots based on doctor's weekly working days, start and end times, lunch breaks, and slot duration (default 20 mins).
- Automatically calculates live availability from existing bookings:
  - **Available** (Green): Slots open for booking.
  - **Few Slots Left** (Amber): $\le 25\%$ slots remaining.
  - **Fully Booked** (Red): All slots occupied.
  - **On Leave** (Gray): Doctor registered a leave/holiday exception.
  - **Schedule Not Available** (Slate): No active OPD hours configured.

### 2. Atomic Booking Engine
- **Conflict Prevention:** Checks and locks slots atomically; rejects duplicate bookings for the exact same slot with a 400 Conflict message.
- **Past Booking Rejection:** Rejects past dates and elapsed slots for today.
- **Unique Booking References:** Generates tamper-proof alphanumeric references (e.g. `VAC-2026-789123`).
- **In-App Notifications:** Real-time cross-device notifications created for patients and practitioners on booking, cancellation, and rescheduling.
- **Audit Logs:** Every key appointment action is logged with IP address and JSON context.

### 3. Real-World Indian Hospital Network
- Multi-city coverage starting with **Karnal (Haryana)**, New Delhi, Gurugram, Chandigarh, Bengaluru, Mumbai, Jaipur, and Hyderabad.
- Real hospitals included in initial dataset: *Amritdhara myHospital (Karnal)*, *Civil Hospital Karnal*, *Max Super Speciality Hospital (Saket)*, *Medanta - The Medicity (Gurugram)*, and *Manipal Hospital (Bengaluru)*.
- Clear distinction between demonstration records (`isDemo: true`) and verified institutions (`isVerified: true`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js $\ge$ 18.x (tested on v24.x)
- npm $\ge$ 9.x
- Git

### 1. Clone & Install Dependencies

From the project root:

```bash
# Install all workspace dependencies
npm install --workspace=packages/shared
npm run build --workspace=packages/shared

npm install --workspace=server
npm install --workspace=apps/web
npm install --workspace=apps/mobile
```

### 2. Environment Configuration

The backend comes pre-configured with `.env` in `server/`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=vacantup_super_secret_jwt_key_2026_healthcare_jwt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vacantup?schema=public
CLIENT_URL=http://localhost:5173
```

> **Note on Database:** Prisma Client is generated with the PostgreSQL schema. The server features an intelligent dual-mode: if PostgreSQL is connected, Prisma is used; if PostgreSQL is not currently running locally, the server seamlessly runs on an embedded high-performance stateful in-memory store pre-seeded with realistic Indian healthcare records so development and testing run out of the box!

To seed a live PostgreSQL instance:
```bash
npm run db:push --workspace=server
npm run db:seed --workspace=server
```

---

## 💻 Running the Applications

### 1. Start the Backend API
```bash
npm run dev:server
```
- API Base URL: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

### 2. Start the Web Application
```bash
npm run dev:web
```
- Web Application URL: `http://localhost:5173`

### 3. Start the Mobile Application (Android & iOS)
```bash
npm run dev:mobile
```
- Press `a` in the terminal to launch the **Android Emulator**.
- Press `i` to launch the **iOS Simulator**.
- Scan the QR code using the **Expo Go** app on your physical Android or iPhone device.

---

## 🧪 Testing

VacantUp includes automated test suites covering backend APIs, authentication, concurrency booking validation, and frontend component rendering:

```bash
# Run all backend integration tests (21 tests)
npm run test --workspace=server

# Run web application tests
npm run test --workspace=apps/web

# Typecheck mobile application
cd apps/mobile && npx tsc --noEmit
```

---

## 📱 Publishing Android & iOS Applications

VacantUp is fully configured for EAS Build and App Store / Google Play distribution:

### 1. Android App Bundle (AAB) for Google Play Store
`apps/mobile/eas.json` is configured with `buildType: "app-bundle"` and package identifier `com.vacantup.app`.

To build the production AAB:
```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```
Upload the generated `.aab` file directly to the Google Play Console under Internal Testing / Production track.

### 2. iOS Archive for Apple App Store
`apps/mobile/app.json` is configured with bundle identifier `com.vacantup.app` and `eas.json` production profile.

To build the iOS production binary:
```bash
cd apps/mobile
npx eas-cli build --platform ios --profile production
```
The build produces an `.ipa` archive ready for upload to Apple App Store Connect via Transporter or EAS Submit.

---

## 🛡️ License & Copyright
© 2026 VacantUp Healthcare Technologies. All rights reserved.
