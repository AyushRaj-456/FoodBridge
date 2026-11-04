# Build Plan — Zero-Cost MVP

## Phase 0 — Cost and safety guardrails

- Create Firebase project on Spark only; do not link billing.
- Add cost/service register and a repository scan for prohibited integrations.
- Define pilot food-safety SOP and institutional permission before live redistribution.
- Set up Firebase Emulator Suite and rules tests.

## Phase 1 — Foundation

- React + Vite + JavaScript PWA.
- Firebase Auth email/password; optional Google provider.
- Firestore schema, rules and indexes.
- Firebase Hosting Spark deployment.
- Design tokens and accessible app shell.

## Phase 2 — Organisation and admin

- Donor and recipient onboarding.
- Manual verification checklist; no document uploads.
- Admin provisioning through Firebase Console.
- Role/ownership tests.

## Phase 3 — Listings and matching

- Listing lifecycle, explicit units and deadlines.
- Leaflet map with OSM attribution; manual pin fallback.
- Geohash candidate search and Haversine ranking.
- Atomic Firestore claim transaction.
- Exact location disclosure after claim.

## Phase 4 — Handover and records

- Dual confirmation and dispute path.
- Mess records for prepared/served/leftover quantities.
- In-app notification inbox.
- Expiry checks at reads and claims; no background worker.

## Phase 5 — Analytics and pilot

- Descriptive dashboards and data completeness.
- Moving-average forecast only after sufficient data.
- Measured impact with explicit source/formula.
- Controlled 1–2 week pilot, review and retrospective.

## Definition of done

Code, tests, Firestore rules, quota-aware queries, accessibility, docs, security review and cost audit all pass. No paid dependency or billing account is present. A rendered screen alone is not complete functionality.

## Deferred

Shared photo/document uploads, SMS/WhatsApp, background push, Cloud Functions, AI APIs, automatic OCR, routing APIs, delivery dispatch and animal/compost routes without approved SOP.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
