# FoodBridge Security Boundaries & Architectural Limitations

This document outlines the architectural trade-offs, operational boundaries, and security design choices in FoodBridge resulting from the ₹0 Firebase Spark baseline.

---

## 1. Firebase Spark Tier Constraints

FoodBridge is engineered to run permanently on Google Cloud's free tier with zero recurring operational cost. This architecture introduces specific boundaries:

| Capability | Enterprise / Paid Cloud Tier | FoodBridge ₹0 Spark Architecture | Mitigation / Guardrail |
|---|---|---|---|
| **Background Cron Expiry** | Cloud Functions / Cloud Scheduler running every 5 min | Client-driven evaluation at read/claim time | `checkListingExpiry` verifies timestamps upon listing fetch and claim submission. Expired batches cannot be claimed. |
| **SMS / OTP Verification** | Twilio / MSG91 phone verification | Firebase Auth Email/Password + Verification Documents | Offline manual KYC review via Admin Verification Queue. |
| **Address Geocoding** | Google Maps Geocoding API | Zero-cost client-side Haversine formula + text addresses | Distance computed using browser GPS coordinates or designated landmark drop-offs. |
| **Image Compression** | Cloud Function image processing pipeline | Client-side Canvas downscaling & 5MB storage rule | Storage security rules enforce max 5MB and image MIME types. |
| **Automated Anti-Fraud** | Paid ML risk models | Community moderation & incident reports (`/reports`) | Volunteer and donor reporting workflow triaged by platform admins. |

---

## 2. Quota Management & Read/Write Budgeting

The Firebase Spark plan includes:
- **Firestore Reads:** 50,000 / day
- **Firestore Writes:** 20,000 / day
- **Firestore Deletes:** 20,000 / day
- **Storage:** 5 GB stored, 1 GB/day download

### Optimization Strategies Applied in FoodBridge
1. **Query Limits:** All discovery queries enforce explicit limits (e.g., `limit(25)` or `limit(50)`).
2. **Targeted Listeners:** Real-time snapshot listeners are unmounted when navigation views change to prevent idle read consumption.
3. **Optimistic UI with Local Fallbacks:** Static metadata (impact factors, SOP points) are cached in memory.

---

## 3. Human-in-the-Loop Verification Requirements

Under the ₹0 baseline, automated business entity verification (e.g., automated MCA/Darpan scraping APIs) is replaced with an auditable **Human-in-the-Loop KYC Workflow**:
1. Recipient organizations upload registration documents or certificates.
2. Admins inspect uploaded credentials through the Admin Verification Queue (`VerificationQueue.jsx`).
3. Approvals and rejections record structured checklist notes and write immutable audit records to `/auditEvents`.
