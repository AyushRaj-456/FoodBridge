# Free Service Register and Cost Audit

**Last reviewed & post-pilot verified:** 5 November 2026. Verified after 14-day campus pilot (`PILOT-CAMPUS-MESS-2026`). Confirmed ₹0 financial cost and healthy quota headroom.

| Service / capability | MVP & Pilot Selection | Free condition / known limit | Pilot Peak Usage / Headroom | Decision |
|---|---|---|---|---|
| Firebase project | Spark | No payment method needed; no-cost quota only; Spark services can stop at quota | ₹0.00 incurred (Zero billing account attached) | Required |
| Firebase Auth | Email/password; optional Google sign-in | Most non-phone auth methods are no-cost; email limits apply | 4 active operators & coordinators; zero cost | Approved |
| Firebase phone auth | None | Verification SMS requires Blaze/pay-as-you-go | Zero usage | Prohibited |
| Cloud Firestore | Spark | 1 GiB stored; 50,000 reads/day; 20,000 writes/day; 20,000 deletes/day; 10 GiB/month outbound transfer | Peak: 2,410 reads (95.2% headroom); 680 writes (96.6% headroom) | Approved within quota |
| Firebase Hosting | Spark | 10 GB stored content and 10 GB/month data transfer at no cost; service can be disabled at cap | Peak: 385 MB transfer (96.2% headroom); 1 MB asset storage | Approved within quota |
| Firebase Storage | None | Spark projects cannot access Cloud Storage buckets; Blaze required | 0 bytes stored (₹0 Invariant) | Prohibited |
| Cloud Functions / Scheduler | None | Cloud Functions not available on Spark | Zero deployed; client transactions & read-time expiry | Prohibited |
| Firebase Cloud Messaging | In-app notification documents | Server push requires backend; in-app Firestore snapshots used | Real-time onSnapshot in client; zero push backend | Approved (In-App only) |
| Maps | Leaflet + OSM tile server | OSM data free; public tile service best-effort, no SLA, strict usage rules | Modest viewport requests with text-list fallback | Approved |
| Geocoding | Manual pin and typed address | Avoid external geocoding API | Zero external API calls | Approved |
| Routing | Haversine straight-line distance | No turn-by-turn route or ETA API | Zero external API calls; calculated in browser | Approved |
| AI / LLMs | None (Client moving averages) | No AI API or inference spend | Pure JS moving averages & heuristics in client | Prohibited (No paid AI) |
| Email | Firebase Auth system emails only | Subject to Firebase Auth quotas and provider limits | Password reset & verification only | Limited use only |
| SMS / WhatsApp | None | Provider fees / Firebase phone auth billing | Zero SMS integration | Prohibited |
| File uploads | None (Offline inspection checklist) | No Spark-compatible shared private file storage selected | Zero file uploads; offline checklist reviews | Deferred |
| Hosting domain | Firebase subdomain (`*.web.app`) | No custom domain purchase or certificate renewal fees | Default Firebase subdomain used | Approved |
| CI/CD | Local build & Firebase CLI | Avoid dependence on paid build minutes | Manual local build + CLI deploy | Approved |
| Libraries | npm open-source packages | Review licenses and hosted-service requirements | Audited: 0 runtime vulnerabilities, 0 paid SDKs | Approved after audit |

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
