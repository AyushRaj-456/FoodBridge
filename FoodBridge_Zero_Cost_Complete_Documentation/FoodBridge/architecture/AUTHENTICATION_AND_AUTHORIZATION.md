# Authentication and Authorization

## Authentication providers

Default: Firebase Authentication email/password. Optional: Google sign-in. Both are used without a paid external identity provider. Phone OTP is excluded because Firebase phone verification SMS requires Blaze/pay-as-you-go. Do not use Twilio, MSG91 or WhatsApp authentication.

## Account lifecycle

`created → email_verified (where required) → profile_complete → organisation_pending → approved_member`.

Suspension states block listing publication, claiming and privileged actions. A user may belong to more than one organisation through separate membership documents.

## Roles

- `donor`: create and manage listings for an approved donor organisation.
- `recipient`: browse eligible listings and claim for an approved recipient organisation.
- `mess_operator`: enter meal preparation and leftover records.
- `admin`: verify organisations, suspend accounts and resolve reports.

A user cannot set their own organisation status, verification status, membership role or admin privilege. Initial admin provisioning is manual through Firebase Console. Firestore rules deny client writes to admin membership records and admin-only configuration.

## Security rules requirements

- Require `request.auth != null` for private collections.
- Verify UID ownership and active membership on every write.
- Restrict changed fields with `diff().affectedKeys().hasOnly(...)`.
- Deny writes to `admin` role and verification decision fields from normal clients.
- Require approved organisation status before listing/claim operations.
- Deny writes to audit records except narrowly defined append operations.
- Use least-privilege reads; public feed documents expose approximate coordinates only.

## Recovery

Use Firebase's built-in password reset email within published Spark limits. Maintain an offline admin recovery record and at least two trusted admin operators for pilot continuity. Do not build custom password reset or homemade OTP logic.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
