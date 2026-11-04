# Threat Model

## Assets

User accounts, organisation membership, verification decisions, listing data, exact pickup locations, claims, handover records, mess data, audit records and recipient contact details.

## Threats

- Account takeover or password reuse.
- Fake organisations and unauthorised role escalation.
- Firestore rule bypass attempts and cross-tenant IDOR.
- Listing spam and malicious content.
- Duplicate claims and concurrent transaction races.
- Location scraping or premature exact-address disclosure.
- Admin account compromise or insider misuse.
- Notification leakage.
- Quota exhaustion and denial of service.
- Misrepresentation of donor declarations as food-safety approval.

## MVP mitigations

Firebase Auth, strong password guidance, verified email where practical, least-privilege Firestore rules, manual admin provisioning, transaction-based claims, approximate pre-claim location, paginated queries, per-account limits expressible in rules, moderation and audit records. No identity-document upload or media storage is collected. Phone OTP is not used.

## Residual risks

No server-side rate limiter or scheduled worker exists on Spark. OSM tiles are best-effort. Admin processes include manual steps. Quota exhaustion can interrupt service. Food safety requires operational SOPs and qualified human oversight; software cannot certify it.
