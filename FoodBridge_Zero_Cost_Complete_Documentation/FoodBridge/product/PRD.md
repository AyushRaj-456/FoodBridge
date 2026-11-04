# Product Requirements Document

## Summary

FoodBridge is a community platform to prevent avoidable food preparation, coordinate safe surplus-food redistribution, route eligible non-human food waste to approved facilities in later phases, and measure real outcomes. Initial pilot: one college hostel mess and a small, manually verified recipient cohort.

## Goals

- Publish accurate, time-bounded surplus listings.
- Allow only approved, eligible recipients to claim.
- Prevent duplicate claims.
- Record handover outcomes.
- Collect meal preparation/leftover data.
- Show transparent measured impact and clearly labelled estimates.
- Operate with a strict ₹0 software/service budget using Firebase Spark.

## Non-goals for MVP

No delivery fleet, payments, phone OTP, SMS, WhatsApp, shared photo/document uploads, AI food freshness detection, AI API, automatic OCR, turn-by-turn routing, automated animal-feed decisions, automatic compost classification, background scheduler, serverless functions or paid external service.

## Functional requirements

### Identity and verification
- FR-001: Email/password authentication; optional Google sign-in.
- FR-002: Phone OTP is excluded; no SMS fees.
- FR-003: User profile and organisation membership are separate.
- FR-004: Recipient organisation remains pending until admin manually reviews it.
- FR-005: Admin records checklist, reviewer, timestamp, decision and reason; documents are reviewed offline, not uploaded.

### Listings
- FR-010: Food description, quantity/unit, preparation time, consume-by deadline, storage declaration, diet type, allergens, pickup window and location.
- FR-011: No shared image upload in MVP; photo evidence is deferred because Spark has no Cloud Storage bucket access.
- FR-012: Donor confirms declaration; declaration is not independent safety certification.
- FR-013: Expiry is enforced at every read/claim interaction; no scheduled worker is promised.
- FR-014: Expired, withdrawn, suspended or claimed listings cannot be claimed.

### Matching and handover
- FR-020: Only active approved recipients with compatible capabilities are candidates.
- FR-021: Human route requires approved SOP and verified NGO.
- FR-022: Animal route disabled until independently assessed and approved; human-ineligible does not imply animal-eligible.
- FR-023: Compost route disabled until facility-specific acceptance SOP exists.
- FR-024: Claim allocation is atomic through Firestore transaction.
- FR-025: Approximate location before claim; exact pickup details after claim.
- FR-026: Radius expansion never changes safety eligibility.
- FR-027: Distance is straight-line Haversine, not road ETA.

### Analytics
- FR-040: Staff record prepared, served and leftover quantities by date, meal and dish.
- FR-041: Units are explicit; values non-negative.
- FR-042: Dashboard reports trends and data completeness.
- FR-043: Forecasts are estimates with sample size/window.
- FR-044: Recommendations are advisory; mess staff decide preparation.

### Notifications
- FR-050: In-app notification inbox and live updates while app is open.
- FR-051: No guarantee of background notifications; no SMS/WhatsApp/email provider.

### Administration
- FR-060: Admin approves/rejects/suspends with reason.
- FR-061: Admin reviews reports, listings and audit events.
- FR-062: Admin role is provisioned manually; client cannot self-assign privilege.

## MVP acceptance

Unverified recipients cannot claim; expired listings are blocked; concurrent claims produce one winner; exact address is private before claim; completed donations record quantities, parties and timestamps; measured and estimated analytics are distinct; no unsafe automatic route downgrade; app uses Spark only and no billing account; no paid dependencies are present.

## Launch gates

Institutional permission, written food-safety SOP, verified recipient cohort, privacy notice, admin training, tested Firestore rules, quota monitoring, offline document review process, incident contact and restore/export procedure. See `project-management/OPEN_DECISIONS.md` and `LEGAL_AND_REGULATORY_REVIEW.md`.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
