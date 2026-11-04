# FoodBridge — Sequential Gemini/Claude Development Prompts (₹0 Only)

Give the agent this documentation repository and the code repository. Execute one prompt at a time. Review diffs, run tests, and commit after each phase.

## Absolute non-negotiable cost contract

You must build FoodBridge using only free/open-source software and services that work without a payment method. Firebase must remain on **Spark**. Never link a Google Cloud Billing account, never upgrade to Blaze, never request card details, never enable paid APIs, and never introduce a service with a paid overage. No paid trial or temporary credits count as free.

Approved: React, Vite, JavaScript, Firebase Auth email/password or Google sign-in, Firestore Spark, Firebase Hosting Spark, Leaflet, policy-compliant OpenStreetMap tile use, browser geolocation, Haversine, open-source npm packages, local tests, GitHub Free.

Forbidden: Firebase Storage, Cloud Functions, Cloud Scheduler, Cloud Run, Google Maps APIs, Mapbox, Twilio, MSG91, WhatsApp API, paid email, paid geocoding/routing, S3/Cloudinary, Gemini/OpenAI/Vertex APIs, paid analytics/monitoring, custom domain purchases, paid CI, and any API key that can incur a charge.

If a requested feature requires any forbidden service or a billing account, do not implement a workaround that weakens security. Mark it deferred, explain why, and implement the documented manual alternative. Do not silently change the architecture. Use JavaScript, not TypeScript.

## Rules for every phase

- Read `architecture/ZERO_COST_ARCHITECTURE.md`, `architecture/FREE_SERVICE_REGISTER.md` and relevant docs first.
- Keep Firebase on Spark and verify no billing account is linked.
- No paid API, no payment details, no free trial dependencies.
- Do not store images or documents in Firestore; no shared file upload in MVP.
- No phone OTP; use email/password or optional Google sign-in.
- No background jobs; enforce expiry at read and claim time.
- No server-side push/email/SMS; in-app notifications only.
- Do not invent credentials, legal approvals, food-safety thresholds or conversion factors.
- Never present mocks/placeholders as completed integrations.
- AI/photo analysis must never certify food safety; no AI API in MVP.
- Keep implementation, tests and documentation aligned.
- Report files changed, commands run, test results, unresolved issues and cost audit findings.

---

## Prompt 01 — Repository audit and cost audit

Inspect the full docs and code repository without modifying code. Identify current stack, paid services, billing requirements, secret keys, external network calls, Firestore rules gaps and contradictions. Search for maps.googleapis.com, mapbox, twilio, msg91, whatsapp, cloudinary, storageBucket, functions, run.app, scheduler, gemini, generativelanguage, openai, stripe, sendgrid, mailgun, aws and s3. Produce `IMPLEMENTATION_STATUS.md` with exact remediation tasks. Confirm no billing account is linked and Spark is the target.

## Prompt 02 — React foundation

Create React + Vite + JavaScript app shell, CSS tokens, ESLint, Prettier, Vitest and local scripts. Use only open-source dependencies. No TypeScript, paid component library, external backend or hosted service. Ensure clean install/build.

## Prompt 03 — Firebase client and emulator setup

Configure Firebase Auth and Firestore client SDK, emulator setup, environment validation, `firebase.json`, Firestore rules and indexes. Enable email/password; Google sign-in optional. Do not enable phone auth, Storage, Functions, Scheduler, App Hosting, Maps APIs or billing. Add tests for local emulators.

## Prompt 04 — Firestore schema and security rules

Implement collections from `architecture/DATABASE_SCHEMA.md`. Write deny-by-default rules for ownership, active memberships, role checks, immutable fields and state transitions. Admin role must be manually provisioned in console; users cannot self-promote. Test every rule using emulator tests, including cross-user and cross-organisation access.

## Prompt 05 — Authentication and profiles

Implement email/password registration, sign-in, sign-out, password reset, profile creation and account states. Optional Google sign-in only if it remains within Spark. Never implement SMS OTP or custom password handling. Ensure user cannot choose admin/verified role.

## Prompt 06 — Organisation onboarding and manual verification

Implement donor/NGO/farm/facility application forms and admin review checklist. Do not build document upload. Record reviewer, decision, timestamp and reason. Make unapproved recipients unable to claim. Admin role is provisioned manually in Firebase Console.

## Prompt 07 — Design system and screens

Implement `design/design.md` and page inventory. Create accessible responsive screens, loading/empty/error states and clear role navigation. Avoid generic AI dashboard styling, excessive gradients, emoji navigation and unnecessary cards. Use JavaScript and CSS only with free dependencies.

## Prompt 08 — Listing lifecycle

Implement listing create/edit/preview/publish/withdraw/history/detail. Include quantity/unit, prepared time, consume-by deadline, storage declaration, diet, allergens, pickup window and location. Do not upload photos. Validate every state transition in Firestore rules. Expiry is checked at read and claim time, not by a scheduled worker.

## Prompt 09 — Maps and location

Use Leaflet + OpenStreetMap tiles with visible attribution and policy-compliant viewport requests only. Use browser Geolocation with permission and manual pin/address fallback. No Google Maps, Mapbox, geocoding API, route API, tile prefetch or offline tile packs. Implement Haversine straight-line distance. Provide text-list fallback when tiles fail.

## Prompt 10 — Matching and radius expansion

Implement geohash candidate queries, exact Haversine filtering, recipient eligibility, capacity and pickup-window checks. Approximate location before claim; exact location after claim. Radius expansion must never relax safety eligibility. Paginate and minimise Firestore reads.

## Prompt 11 — Atomic claims and handover

Implement Firestore transaction that re-reads listing and recipient approval, checks expiry and writes claim + listing state atomically. Add dual handover confirmation, cancellation and dispute states. Run concurrent-claim tests and prove exactly one winner. Do not rely on client button disabling.

## Prompt 12 — Zero-waste routing gates

Implement human-consumption route only after approved written pilot SOP. Keep animal-feed and compost routes disabled until qualified eligibility and facility SOPs exist. Never infer animal suitability from human rejection. Add audit fields and negative tests.

## Prompt 13 — In-app notifications

Create notification documents and inbox with live Firestore listeners while app is open. No SMS, WhatsApp, email provider, FCM server sender, Cloud Functions or background push. Show “in-app only” clearly. Test offline sync and unread state.

## Prompt 14 — Mess records and analytics

Implement prepared/served/leftover data with explicit units, dish, meal, date and people served. Build paginated descriptive analytics. Missing data is not zero. Separate measured, derived and estimated values. Stay within Firestore quota.

## Prompt 15 — Advisory prediction

After sufficient historical records exist, implement moving averages and weekday/meal patterns in JavaScript. Show sample size, date window and uncertainty. No hosted ML, Gemini, OpenAI or other API. Forecasts never create confirmed listings.

## Prompt 16 — Impact dashboard

Track offered, claimed, collected, distributed and organic-diverted quantities separately. Do not invent meals-per-kg, CO2e or other factors. Include formulas, units, source, period and estimate label. Use only verified data.

## Prompt 17 — Admin and moderation

Implement verification, account/org status, reports, listing moderation and audit. Admin role remains console-provisioned. Test privilege escalation, IDOR and cross-tenant access.

## Prompt 18 — Full test and security audit

Run unit, emulator/rules, integration, E2E, concurrency, accessibility, dependency and secret scans. Test quota-safe pagination, exact-address privacy and forbidden network-call absence. Produce evidence-based report; do not claim tests passed if not run.

## Prompt 19 — Zero-cost deployment

Deploy only static Hosting and Firestore rules/indexes using Firebase CLI. Confirm Spark and no linked billing account. Never deploy Functions, Storage, Scheduler or Cloud Run. Use Firebase subdomain. Record exact commands and verify public app behavior.

## Prompt 20 — Controlled pilot

Pilot with approved mess and manually verified recipients after institutional permission and food-safety SOP. Monitor data completeness, claim failures, failed pickups, incidents, Firestore usage and hosting usage. Do not exceed free quotas; pause safely if nearing limits. Collect feedback and report measured outcomes only.

## Prompt 21 — Post-pilot review

Review outcomes, reliability, quotas and costs. Propose future features only if they can remain genuinely free without billing details. Anything requiring paid storage, SMS, background functions, AI or maps must remain deferred. Update all docs and cost register.

---

## Final instruction

Build the smallest secure and useful FoodBridge that can operate on Firebase Spark at ₹0 service cost. Never trade security, privacy or food safety for a free workaround. If a feature cannot be delivered within the constraints, state that plainly and leave it deferred. Do not ask the owner to pay, upgrade or enter card details.
