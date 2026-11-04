# Free Service Register and Cost Audit

**Last reviewed:** 4 November 2026. Verify provider terms again immediately before deployment; free plans and quotas can change.

| Service / capability | MVP selection | Free condition / known limit | Decision |
|---|---|---|---|
| Firebase project | Spark | No payment method needed; no-cost quota only; Spark services can stop at quota | Required |
| Firebase Auth | Email/password; optional Google sign-in | Most non-phone auth methods are no-cost; email limits apply | Approved |
| Firebase phone auth | None | Verification SMS requires Blaze/pay-as-you-go | Prohibited |
| Cloud Firestore | Spark | 1 GiB stored; 50,000 reads/day; 20,000 writes/day; 20,000 deletes/day; 10 GiB/month outbound transfer for standard free tier | Approved within quota |
| Firebase Hosting | Spark | 10 GB stored content and 10 GB/month data transfer at no cost; service can be disabled at cap | Approved within quota |
| Firebase Storage | None | Spark projects cannot access Cloud Storage buckets; Blaze required | Prohibited |
| Cloud Functions / Scheduler | None | Cloud Functions not available on Spark | Prohibited |
| Firebase Cloud Messaging | Not used in MVP | Product itself no-cost, but secure server-side event sending would require a backend; no backend on Spark | Deferred |
| Maps | Leaflet + OSM tile server | OSM data free; public tile service best-effort, no SLA, strict usage rules | Approved for modest interactive use only |
| Geocoding | Manual pin and typed address | Avoid external geocoding API | Approved |
| Routing | Haversine straight-line distance | No turn-by-turn route or ETA | Approved |
| AI | None | No AI API or inference spend | Prohibited in MVP |
| Email | Firebase Auth system emails only | Subject to Firebase Auth quotas and provider limits | Limited use only |
| SMS / WhatsApp | None | Provider fees / Firebase phone auth billing | Prohibited |
| File uploads | None | No Spark-compatible shared private file storage selected | Deferred |
| Hosting domain | Firebase subdomain | No custom domain purchase | Approved |
| CI/CD | Manual local deployment | Avoid dependence on paid build minutes | Approved |
| Libraries | npm open-source packages | Review licenses and hosted-service requirements | Approved after audit |

## Firestore free-tier figures

The standard Firestore free tier lists 1 GiB stored data, 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day and 10 GiB outbound transfer/month. The free tier applies to one Firestore database per project. Quotas reset according to Firebase's published schedule and may change.

## Hosting free-tier figures

Firebase Hosting currently lists 10 GB storage and 10 GB/month data transfer at no cost. On Spark, reaching the quota prevents further deploys or causes the site to be disabled until the next period; do not upgrade.

## Critical exclusions

- Firebase Storage is not available to Spark projects under current Firebase guidance; it requires Blaze.
- Phone number verification SMS requires Blaze/pay-as-you-go.
- Linking a Google Cloud Billing account or using certain Google Cloud products/Google Maps APIs can automatically move the project to Blaze.
- OSM public tiles are free to access under a policy, but are a best-effort community service, not a production SLA.

## Required cost audit before every merge

Search package files, environment variables, SDK initialisation, deployment files and network requests for:
`maps.googleapis.com`, `mapbox`, `twilio`, `msg91`, `whatsapp`, `cloudinary`, `storageBucket`, `functions`, `run.app`, `scheduler`, `gemini`, `generativelanguage`, `openai`, `stripe`, `sendgrid`, `mailgun`, `aws`, `s3`, and unknown external endpoints.

Any match requires explicit review. Reject new paid integrations. Keep Firebase plan set to Spark and do not link billing.

## Official sources

- Firebase plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Firebase pricing: https://firebase.google.com/pricing
- Firestore quotas: https://docs.cloud.google.com/firestore/quotas
- Firebase Hosting quotas: https://firebase.google.com/docs/hosting/usage-quotas-pricing
- Firebase Storage changes: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
- Firebase Auth limits: https://firebase.google.com/docs/auth/limits
- OSM tile policy: https://operations.osmfoundation.org/policies/tiles/
- OSM Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
