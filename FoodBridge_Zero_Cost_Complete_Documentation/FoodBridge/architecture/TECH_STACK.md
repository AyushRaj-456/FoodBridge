# Technology Stack — ₹0 Spark-Only Baseline

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Vite + JavaScript | Open-source SPA/PWA; no TypeScript per project preference |
| Styling | CSS variables + CSS modules or plain CSS | Avoid paid design systems |
| Auth | Firebase Authentication email/password; optional Google | Avoid paid SMS/OTP |
| Database | Cloud Firestore | Familiar Firebase workflow; Spark quota is sufficient for a controlled pilot |
| Hosting | Firebase Hosting Spark | Free subdomain; fixed free quotas |
| Maps | Leaflet + OpenStreetMap | No Google Maps/Mapbox billing; OSM usage policy must be followed |
| Geospatial | geohash utility + Haversine JS | Candidate filtering and straight-line distance without paid APIs |
| Charts | Recharts or Chart.js | Open-source; no hosted chart service |
| Validation | Zod (client-side) + Firestore rules | Validate inputs; rules remain authoritative for permitted writes |
| Tests | Vitest, React Testing Library, Playwright | Open-source, local execution |
| Lint | ESLint + Prettier | Open-source |
| Tooling | Node.js LTS, npm, Git | Local development |

## Not in the stack

No PostgreSQL, PostGIS, Express server, Redis, S3, Firebase Storage, Cloud Functions, Cloud Run, AWS, Render, Vercel, paid CI, Twilio, MSG91, WhatsApp API, Google Maps API, Mapbox, paid geocoding, Gemini, OpenAI, paid analytics, paid monitoring, custom domain or paid UI component library.

## Version and license policy

Use stable releases and commit `package-lock.json`. Check each dependency's license and whether its documentation requires a hosted paid service. Prefer small dependency sets. The existence of a free npm package does not mean its optional cloud service is free.

## Cost invariant

The Firebase project remains Spark and must not have a linked billing account. If a feature cannot work within Spark, remove it from MVP or provide a manual alternative. No “temporary” upgrade is permitted.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
