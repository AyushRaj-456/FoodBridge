# Application Data Operations (No Custom API Server)

FoodBridge MVP has no Express/REST backend. The React client uses Firebase Auth and Firestore SDK directly. The authoritative API surface is the set of permitted Firestore document reads/writes governed by `firestore.rules` and the data model in `DATABASE_SCHEMA.md`.

| Operation | Firestore action | Required checks |
|---|---|---|
| Register profile | Create `users/{uid}` | Auth UID matches document ID; safe allowlisted fields |
| Apply organisation | Create `organisations/{id}` and membership request | Authenticated applicant; status forced to pending |
| Admin review | Update organisation and create review record | Admin-only; admin role provisioned out-of-band |
| Publish listing | Create/update `listings/{id}` | Active donor membership; approved donor org; valid fields and dates |
| Browse feed | Query published listings | Only safe public fields; approximate location |
| Claim | Firestore transaction writes claim and listing | Approved recipient; unexpired listing; route compatibility; one active claim |
| Confirm handover | Update claim state | Claim party; allowed transition; valid quantity/unit |
| Record mess data | Create `messRecords/{id}` | Active mess operator membership; non-negative values |
| Read notifications | Query by userId | Auth UID must match userId |

Use stable application error codes for validation failures, permission denial, expired listing, already claimed, inactive organisation, quota exceeded and network unavailable. Do not build a fake REST server or put Admin SDK credentials in the client. If future business logic cannot be secured with Firestore transactions and rules, defer it rather than adding a paid backend silently.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
