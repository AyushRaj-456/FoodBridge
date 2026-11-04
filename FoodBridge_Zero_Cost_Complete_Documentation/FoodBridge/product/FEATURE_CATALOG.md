# Feature Catalog and Phasing

| Module | Feature | Priority | Phase | Zero-cost implementation |
|---|---|---:|---|---|
| Identity | Email/password sign-in | P0 | MVP | Firebase Auth Spark |
| Identity | Google sign-in | P1 | MVP | Optional Firebase Auth provider |
| Identity | Phone OTP | — | Excluded | SMS requires paid plan/provider |
| Organisations | Donor/NGO/facility onboarding | P0 | MVP | Firestore forms |
| Verification | Admin checklist and manual review | P0 | MVP | Offline/in-person document review |
| Listings | Create/edit/publish/withdraw | P0 | MVP | Firestore |
| Media | Shared food photo upload | — | Deferred | Firebase Storage requires Blaze |
| Matching | Nearby eligible recipients | P0 | MVP | Geohash + Haversine |
| Maps | Interactive map | P1 | MVP | Leaflet + OSM tiles, policy compliant |
| Claims | Atomic first eligible claim | P0 | MVP | Firestore transaction |
| Handover | Dual confirmation | P0 | MVP | Firestore state transitions |
| Expiry | Check at read/claim | P0 | MVP | Client interaction + rules |
| Scheduled expiry | Background worker | — | Deferred | Cloud Functions/Scheduler excluded |
| Notifications | In-app inbox | P0 | MVP | Firestore records/listeners |
| Push/SMS/WhatsApp | Background delivery | — | Deferred | No paid gateway/server |
| Mess analytics | Prepared/served/leftover | P0 | MVP | Firestore bounded queries |
| Prediction | Moving averages | P1 | Phase 2 | Local JavaScript calculations |
| Demand requests | NGO demand posts | P2 | Phase 2 | Firestore |
| Recurring donors | Draft generation | P2 | Phase 2 | User-confirmed, no scheduler |
| Animal route | Approved cattle farm route | P2 | Disabled until SOP | Human review only |
| Compost route | Facility acceptance | P2 | Disabled until SOP | Manual eligibility |
| Impact | Measured kg/meals/donations | P0 | MVP | Derived from verified records |
| AI prediction | Hosted LLM/ML | — | Excluded | No AI API cost |
| Delivery helpers | Dispatch network | P3 | Future | Not part of direct-collection MVP |


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
