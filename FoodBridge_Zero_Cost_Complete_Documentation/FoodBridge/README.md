# FoodBridge — Zero-Cost Project Documentation

FoodBridge is a community-driven surplus-food prevention and redistribution platform. It begins with a controlled college-hostel mess pilot and is designed to expand to donors, verified NGOs, cattle farms and compost/biogas facilities.

**Product principle:** PREVENT → REDISTRIBUTE → RECYCLE → MEASURE IMPACT.

## Non-negotiable financial constraint

The implementation is deliberately restricted to free/open-source tools and Firebase's no-cost **Spark** plan. No billing account or payment method is to be linked. No paid API, AI service, map provider, SMS gateway, email provider, object-storage service, server, domain or SaaS dependency may be introduced. Where a requested capability cannot be implemented reliably at ₹0, it is deferred rather than quietly routed to a paid tier.

This is a zero-cost *design target*, not a promise that third-party free services will exist forever or that usage can be unlimited. Firebase Spark quotas are capped; when a cap is reached, the affected service may stop until its quota resets. The app must fail safely and must never auto-upgrade.

## Selected MVP stack

- Frontend: React + Vite + JavaScript (not TypeScript), responsive PWA.
- Data and identity: Firebase Authentication (email/password and optional Google sign-in only) + Cloud Firestore on Spark.
- Hosting: Firebase Hosting on Spark (`web.app` / `firebaseapp.com` subdomain; no custom domain purchase).
- Maps: Leaflet + OpenStreetMap standard tiles, with visible attribution and strict tile-policy compliance. No Google Maps/Mapbox API.
- Location: browser Geolocation API with user consent; manual map pin/address fallback.
- Distance: local Haversine calculation; no paid directions/routing API.
- Tests: Vitest, React Testing Library, Playwright locally, ESLint; open-source dependencies only.
- Source control: Git and GitHub Free. Manual local build/deploy; no paid CI requirement.

## Deliberately deferred in the ₹0 MVP

Cloud photo/document uploads, phone OTP/SMS, WhatsApp, outbound transactional email, server-side scheduled jobs, Cloud Functions, AI/Gemini APIs, Google Maps APIs, route optimisation, paid geocoding, delivery dispatch, custom domain, and any service requiring a billing account. Document verification is handled through an admin review checklist and in-person/offline review. Listing photos may be previewed during local draft entry but are not uploaded or represented as shared evidence.

## Start here

1. Read `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.
2. Read `product/PRD.md`, `product/BUSINESS_RULES.md` and `architecture/DATABASE_SCHEMA.md`.
3. Follow `development/BUILD_PLAN.md`.
4. Give Gemini/Claude `prompt.md` one prompt at a time. The prompts prohibit billing upgrades and paid integrations.
5. Before deployment, verify the Firebase console still shows Spark and no billing account is linked.

## Product safety

A photograph, donor declaration, app status or algorithm is not food-safety certification. Human consumption requires an approved operational SOP and qualified oversight. Animal-feed and compost routes remain disabled until their own documented eligibility and facility-acceptance procedures are approved. Food unsafe for humans is not automatically safe for animals.

## Documentation map

- `product/`: requirements, roles, journeys, features and rules.
- `architecture/`: Firebase design, schema, matching, routing, security boundaries, free-service register.
- `design/`: UI system and screen flows.
- `security/`: privacy, threat model, access control and abuse prevention.
- `testing/`: test plans and acceptance cases.
- `development/`: build, deployment, operations and backup constraints.
- `project-management/`: assumptions, decisions, risks and pilot plan.
- `prompt.md`: sequenced coding-agent instructions.
- `LEGAL_AND_REGULATORY_REVIEW.md`: launch review topics.

## Cost-control checklist

- [ ] Firebase project plan is Spark.
- [ ] No Google Cloud Billing account is linked.
- [ ] No Google Maps API is enabled.
- [ ] No Cloud Functions, Cloud Run, Scheduler, Storage bucket or other Blaze-only service is used.
- [ ] Authentication uses email/password or Google sign-in, never SMS OTP.
- [ ] Firebase Storage is not used; it requires Blaze for bucket access under current Firebase guidance.
- [ ] All dependencies are open-source and have no paid runtime requirement.
- [ ] Hosting uses the free Firebase subdomain.
- [ ] Quota monitoring and safe-stop behavior are tested.
