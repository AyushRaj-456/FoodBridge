# Notification System — Zero-Cost MVP

## Supported

- In-app notification documents in Firestore.
- Live updates for users who currently have the application open, using bounded Firestore listeners.
- Notification inbox with read/unread state.
- Refresh-on-open fallback if real-time listener is disconnected.

## Not supported in MVP

No SMS, WhatsApp, outbound email provider, scheduled email, Cloud Functions, Cloud Scheduler, FCM server-side sender or guaranteed notifications while the app is closed. Firebase Cloud Messaging itself is listed as no-cost, but a secure automated event sender would require trusted server execution, which is not available on Spark. Do not put service-account credentials in the browser.

## Event triggers

Create notification records in the same Firestore transaction as the business event where feasible (listing published, claim won/lost, handover confirmed, verification decision). Keep payload minimal and avoid exact pickup addresses, private documents or beneficiary details.

## Reliability

Show timestamp and delivery semantics as “in-app”. If the user is offline, unread notification remains stored and appears on next successful sync. Do not claim push delivery or guaranteed background execution.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
