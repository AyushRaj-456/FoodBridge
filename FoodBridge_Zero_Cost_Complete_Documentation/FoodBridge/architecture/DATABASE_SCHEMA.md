# Firestore Data Model

Use Cloud Firestore on the Spark plan. Collections below are logical entities; use document IDs and subcollections consistently. Keep documents small and avoid storing binary files.

## Collections

| Collection | Document ID | Important fields | Access |
|---|---|---|---|
| `users` | Firebase Auth UID | displayName, email, status, createdAt, updatedAt | user reads own; admin reads all; restricted self-update |
| `organisations` | generated ID | type, legalName, displayName, addressText, geohash, lat, lng, status, createdBy, createdAt | members read own; approved public summary limited; admin manages status |
| `memberships` | `{orgId}_{uid}` | orgId, uid, role, status, createdAt | user reads own; admin controls role/status |
| `verificationReviews` | generated ID | orgId, reviewerUid, checklist, decision, reason, reviewedAt | admin only; no uploaded identity scans |
| `listings` | generated ID | donorOrgId, createdBy, title, category, quantity, unit, preparedAt, consumeBy, pickupStart, pickupEnd, storageDeclaration, dietType, allergens, location, geohash, routeTier, status, activeClaimId, createdAt, updatedAt | eligible users read limited fields; donor manages own; rules enforce lifecycle |
| `claims` | generated ID | listingId, recipientOrgId, claimedBy, status, claimedAt, idempotencyKey, donorConfirmedAt, recipientConfirmedAt, actualQuantity, unit | claim parties and admin |
| `messRecords` | generated ID | orgId, mealDate, mealType, dishName, preparedQty, servedQty, leftoverQty, unit, peopleServed, enteredBy, createdAt | org members; admin |
| `notifications` | generated ID | userId, type, title, body, relatedId, createdAt, readAt | owner only; in-app only |
| `reports` | generated ID | reporterUid, targetType, targetId, category, description, status, createdAt | reporter and admin |
| `auditEvents` | generated ID | actorUid, action, resourceType, resourceId, summary, createdAt | admin only; append-only from client rules where feasible |
| `impactFactors` | generated ID | metric, factor, unit, source, version, validFrom | read-only for users; admin writes |

## Important omissions

No `verificationDocuments`, `listingMedia`, object keys, signed URLs, uploaded proof photos or binary data. Firebase Storage requires Blaze for bucket access under current Firebase guidance; do not enable it. Verification uses offline inspection and a checklist.

## Query and index plan

- Listings by status + consumeBy.
- Listings by status + category + geohash range (geohash range queries may require multiple queries).
- Listings by donorOrgId + createdAt descending.
- Claims by recipientOrgId + claimedAt descending.
- Mess records by orgId + mealDate + mealType.
- Notifications by userId + createdAt descending.

Commit `firestore.indexes.json` for required composite indexes. Paginate every unbounded list. Avoid broad real-time listeners.

## Atomic claim protocol

Within a Firestore transaction:
1. Read listing, recipient organisation, membership and any relevant eligibility documents.
2. Verify listing is `published`, unexpired, within pickup window and has no active claim.
3. Verify recipient organisation is approved, active and compatible with the route tier.
4. Create claim and update listing `status=claimed`, `activeClaimId=claimId`.
5. If any precondition fails, abort with a stable error code.

Firestore transaction retries on contention. Rules must independently validate allowed updates and user membership. Add tests for simultaneous claims. A single winner is mandatory.

## Data rules

- Quantities are positive numbers with explicit units; never mix kg and meals.
- Store timestamps as Firestore Timestamp in UTC; render local time.
- Keep exact pickup location hidden from unclaimed recipients.
- Never store passwords, OTPs, identity-document scans or unnecessary personal data.
- Keep audit history append-only; do not silently rewrite completed donation records.
- Use soft deactivation where records are referenced.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
