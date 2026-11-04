# Assumptions and Constraints

## Confirmed constraints

- Total software/service budget for MVP: ₹0.
- Firebase project remains on Spark; no billing account/payment method.
- Firebase Auth email/password; optional Google sign-in. No phone OTP.
- Cloud Firestore as database.
- Firebase Hosting Spark on default subdomain.
- React + Vite + JavaScript; no TypeScript.
- Leaflet + OpenStreetMap interactive tiles; Haversine distance only.
- No cloud file uploads, paid APIs, AI API, SMS, WhatsApp, external email, background server or paid CI.
- Direct collection only; no FoodBridge-operated delivery.
- Animal and compost routes remain gated by independent SOPs.

## Operational assumptions

- Pilot is small enough to fit Firestore and Hosting free quotas.
- Users can access the web app and internet; service is unavailable when quotas are exhausted or providers are down.
- Admin can inspect recipient documents offline/in person.
- Users accept email/password sign-in rather than phone OTP.
- OSM public tile availability is best effort and not an SLA.

## Limits

No unlimited use or uptime guarantee. Free plans and policies may change. If free quota is exceeded, affected service may stop until reset. Do not upgrade to recover service. A custom domain, SMS, private cloud file storage, automated scheduled tasks, AI inference and routing APIs are out of MVP scope.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
