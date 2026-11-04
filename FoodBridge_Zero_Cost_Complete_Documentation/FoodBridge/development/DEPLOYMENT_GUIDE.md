# Deployment Guide — Firebase Spark Only

## Prerequisites

Node.js LTS, npm, Git, Firebase CLI, a Firebase project created on Spark, and a Google account. Do not add a billing account or payment method. Do not enable Cloud Functions, Cloud Storage, Cloud Run, Scheduler or Google Maps APIs.

## Configure

1. Create Firebase project and verify plan is Spark.
2. Register a Web App and copy Firebase web configuration into local `.env` values. These values identify the project; never place Admin SDK credentials in the browser.
3. Enable email/password Auth; optionally enable Google provider.
4. Create one Firestore database in a supported region; select region deliberately because it cannot be changed easily.
5. Deploy reviewed `firestore.rules` and `firestore.indexes.json`.
6. Configure Firebase Hosting with `dist` as public directory and SPA rewrite.
7. Build locally: `npm ci && npm run build`.
8. Deploy only Hosting and Firestore rules/indexes using Firebase CLI. Never deploy functions.

## Verify zero-cost plan

Before and after deployment, confirm Spark is displayed and no billing account is linked. Do not click upgrade. Use the default `web.app` / `firebaseapp.com` domain; custom domain registration is not included.

## Quota-aware operations

Keep the bundle small, paginate queries, limit real-time listeners, avoid loading entire histories, compress static assets and monitor Firestore reads/writes/egress and Hosting transfer/storage. When quota is reached, show a service-paused message until reset. Do not upgrade.

## Rollback

Use Firebase Hosting release history for rollback within available controls. Keep source and configuration in Git. Export critical Firestore data periodically using documented manual procedures and local tools; automated scheduled exports are not assumed free on Spark.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
