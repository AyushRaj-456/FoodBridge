# Business Rules

## Identity and roles

- Every account authenticates through Firebase Auth email/password or optional Google sign-in.
- Phone OTP is not part of MVP.
- Organisation membership and role are granted by admin; users cannot self-verify or self-promote.
- Only active members of approved organisations may perform organisation actions.

## Listing lifecycle

`draft → published → claimed → handover_pending → completed` with alternate `withdrawn`, `expired`, `cancelled`, `disputed` states. All transitions are audited. `consumeBy` must be after preparation time and before/consistent with pickup window. Expiry is enforced at read/claim; no scheduled background job is implied.

## Claiming

- Claim transaction re-reads listing and recipient organisation.
- Exactly one active claim may exist per listing.
- Re-check status, expiry, pickup window, role, organisation approval and route eligibility inside the transaction.
- A stale client must receive a conflict and refresh.

## Food routing

1. Human consumption: only food meeting the pilot's written SOP and handled by verified donor; only approved NGO recipient.
2. Animal consumption: disabled until a competent authority/qualified professional defines acceptable materials and controls. Food unsafe for humans is not automatically safe for animals.
3. Compost/biogas: disabled until each facility's accepted material list, contamination controls and handover SOP are recorded.
4. Unknown/uncertain condition: do not route to consumption.

## Location and privacy

- Ask before accessing browser location.
- Allow manual pin/address if denied.
- Approximate location visible before claim; exact pickup address only after successful claim.
- Never expose identity documents or beneficiary identities.

## Zero-cost rules

- Firebase Spark only; no billing account.
- No paid APIs, AI, SMS, WhatsApp, custom domain or storage provider.
- No Firebase Storage, Cloud Functions, Scheduler or paid Google Maps APIs.
- At quota limits, pause affected functionality and explain; never upgrade or switch to paid provider.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
