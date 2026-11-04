# Integration Architecture

## MVP integrations

| Integration | Method | Cost boundary |
|---|---|---|
| Firebase Auth | Client SDK, email/password or Google sign-in | Spark; no phone OTP |
| Firestore | Client SDK + Security Rules | Spark quotas |
| Firebase Hosting | Static app hosting | Spark quotas; Firebase subdomain |
| OpenStreetMap | Leaflet tile display | Public tile policy; best effort, no SLA |
| Browser location | Native Geolocation API | User permission; no external provider |

## Explicitly excluded

Google Maps Platform, Mapbox, paid geocoding, paid routing, SMS gateways, WhatsApp Business API, paid email, Cloud Functions, Cloud Run, Cloud Scheduler, Cloud Storage, S3, AI APIs, delivery partner APIs and paid analytics.

## Future integrations

Future integrations are ideas only, not approved dependencies. Every proposal must pass the zero-cost review in `ZERO_COST_ARCHITECTURE.md` and be approved by the owner before code is added. A paid integration is rejected even if it has a free trial or temporary credits.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
