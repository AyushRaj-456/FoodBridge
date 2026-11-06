# FoodBridge Production Deployment Guide

This guide provides step-by-step instructions for deploying FoodBridge to production on Firebase and Vercel under the ₹0 Firebase Spark tier.

---

## 1. Vercel Frontend Deployment

### Critical Vercel Naming Rule (Lowercase Invariant)
When creating or naming your project on Vercel:
> [!IMPORTANT]
> Vercel project names must be **all lowercase** (letters, digits, '.', '_', '-').
> **Incorrect:** `FoodBridge`
> **Correct:** `foodbridge` or `foodbridge-community`

### Node.js Engine Configuration
In Vercel project settings, set the Node.js version to **20.x** or **22.x LTS** (FoodBridge `package.json` specifies `"node": ">=18.0.0 <=22.x"` to ensure zero `EBADENGINE` warnings).

### Production Environment Variables in Vercel
In the Vercel Dashboard under **Project Settings $\rightarrow$ Environment Variables**, configure the following client variables:

| Variable | Description | Example Live Value |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key | `AIzaSyCti7Wmvmheo...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `foodbridge-a859d.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Live Firebase Project ID | `foodbridge-a859d` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:1029811149484:web:...` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `1029811149484` |
| `VITE_USE_FIREBASE_EMULATOR` | Disable local emulators | `false` |

> [!CAUTION]
> Do NOT set `FIREBASE_ADMIN_KEY`, `FIREBASE_ADMIN_CREDENTIALS`, or any paid API keys in Vercel. FoodBridge is architected for zero server secret leakage.

---

## 2. Deploying Firebase Security Rules

Deploy security rules directly using the Firebase CLI:
```bash
# 1. Login to Firebase CLI
firebase login

# 2. Select your production project
firebase use foodbridge-a859d

# 3. Deploy Firestore and Storage security rules
firebase deploy --only firestore:rules,storage
```

---

## 3. Superadmin Bootstrapping

Because FoodBridge does not provide public self-service admin signup, the initial platform administrator must be bootstrapped via the Firebase Console:

1. Open the **Firebase Console** $\rightarrow$ **Authentication**.
2. Create an admin user account (e.g. `admin@yourdomain.org`) with a secure password.
3. Copy the generated `UID` from the Authentication table.
4. Navigate to **Firestore Database** $\rightarrow$ **Data**.
5. If the `admins` collection does not exist, click **Start collection** and name it `admins`.
6. Create a document with:
   - **Document ID:** The copied admin `UID`
   - **Fields:**
     - `uid` (string): The admin `UID`
     - `email` (string): `admin@yourdomain.org`
     - `role` (string): `superadmin`
     - `grantedAt` (string): ISO timestamp (e.g. `2026-11-06T12:00:00.000Z`)
7. The user can now log into FoodBridge and access the complete Administrator Console.
