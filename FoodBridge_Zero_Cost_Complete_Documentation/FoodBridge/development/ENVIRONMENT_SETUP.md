# Environment Setup

## Local prerequisites

- Node.js LTS and npm.
- Git.
- Firebase CLI installed locally or via npm.
- Modern browser.
- Firebase Emulator Suite for local Auth/Firestore/rules tests.

## Setup

1. Clone repository.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and fill Firebase web-app configuration only.
4. Start local app with `npm run dev`.
5. Run unit tests and Firebase emulator tests before deploying.

## Allowed environment variables

`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` (only if required by SDK configuration). These are client project configuration values, not Admin SDK secrets.

Never add service account JSON, private keys, SMS provider keys, email provider keys, Storage bucket credentials, Maps API keys, AI API keys or payment credentials. If a coding agent proposes one, reject it and re-check the zero-cost policy.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
