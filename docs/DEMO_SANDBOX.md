# FoodBridge Local Demo Testing Sandbox

The FoodBridge local demo sandbox runs completely isolated on your workstation using the Firebase Emulator Suite. It requires **zero network connectivity**, **zero credentials**, and **₹0 quota consumption**.

---

## 1. Prerequisites

- Node.js 18.x to 22.x LTS
- Java Runtime Environment (JRE 11+) for Firebase Local Emulators
- Firebase CLI (`npm install -g firebase-tools` or via project devDependencies)

---

## 2. Quickstart

### Step 1: Start the Local Emulators
In your terminal, start the Firebase emulator suite:
```bash
npm run emulators
```
This launches:
- **Authentication Emulator:** `127.0.0.1:9099`
- **Firestore Emulator:** `127.0.0.1:8080`
- **Hosting Emulator:** `127.0.0.1:5000`
- **Emulator UI:** `http://localhost:4000`

### Step 2: Seed Demo Data
In a second terminal window, populate the emulator with test personas and sample multi-tier listings:
```bash
npm run demo:seed
```

### Step 3: Run the Application
In your project directory, configure `.env.local` to point to the emulator:
```ini
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=demo-foodbridge-local
```
Then start the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Standard Demo Personas & Credentials

All test accounts use the common test password: `Password123!`

| Role / Persona | Email | Purpose & Pre-Configured State |
|---|---|---|
| **Donor** | `donor.demo@foodbridge.local` | Central University Dining Services; published active food batches |
| **Recipient NGO** | `ngo.demo@foodbridge.local` | City Care Welfare Foundation; approved status, ready to claim food |
| **Mess Operator** | `mess.demo@foodbridge.local` | Campus Dining Mess 2; linked to historical meal leftover records |
| **Cattle Farm** | `farm.demo@foodbridge.local` | Green Meadow Dairy Gaushala; claims Tier 2 animal feed |
| **Compost Facility** | `compost.demo@foodbridge.local` | EcoBio Biomethanation Facility; claims Tier 3 organic waste |
| **Platform Admin** | `admin.demo@foodbridge.local` | Superadmin privileges; can access KYC verification queue |
| **Pending NGO** | `unverified.demo@foodbridge.local` | Hope Community Shelter; unverified status to test claim blocking |
| **Suspended Org** | `suspended.demo@foodbridge.local` | Flagged Commercial Reseller; suspended state to test lockout |

---

## 4. Resetting the Sandbox

To wipe all data from the local emulator without touching production:
```bash
npm run demo:reset
```
This issues atomic purge commands to the local emulator REST endpoints. To re-seed after a reset, re-run `npm run demo:seed`.

---

## 5. Critical Safety Guarantees

Both `scripts/seed-demo.js` and `scripts/reset-demo.js` enforce strict safeguard checks:
- Execution is **aborted immediately** if `VITE_FIREBASE_PROJECT_ID` does not start with `demo-`.
- Live production credentials in `.env.local` are shielded from accidental deletion.
