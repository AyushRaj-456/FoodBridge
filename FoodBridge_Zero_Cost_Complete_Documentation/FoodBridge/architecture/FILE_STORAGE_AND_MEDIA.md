# File Storage and Media — MVP Restriction

## Binding decision

No cloud file upload in the zero-cost MVP. Firebase Cloud Storage buckets are not accessible to Spark projects under current Firebase guidance; bucket access requires Blaze. Do not link billing to unlock it.

## MVP handling

- Do not collect identity-document scans, PAN images, NGO certificates or beneficiary photographs in the app.
- Administrators inspect documents in person/offline and record a checklist result, reviewer, date and minimal reference note.
- Do not store binary data or base64 images in Firestore.
- A local camera preview may be used during interface testing, but it is not uploaded, shared or persisted as platform evidence.
- Proof-of-distribution photos are deferred; use a non-image confirmation record and consent-aware beneficiary counts only.

## Future change gate

Any future shared-media feature requires a written zero-cost provider audit covering private access controls, quotas, data residency, retention, deletion, malware scanning and terms. If no genuinely no-cost private option is available without payment details, keep the feature out of scope. Never use public GitHub repositories, public image hosts or publicly readable buckets for sensitive documents.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
