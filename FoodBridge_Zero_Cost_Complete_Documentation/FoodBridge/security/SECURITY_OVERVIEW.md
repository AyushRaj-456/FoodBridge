# Security Overview

FoodBridge uses Firebase Auth + Firestore Security Rules on Spark. The browser is untrusted; identity authentication does not grant organisation permissions.

Controls:
- HTTPS through Firebase Hosting and Firebase services.
- Deny-by-default Firestore rules; validate UID, active membership, role, ownership and allowed changed fields.
- Manual admin provisioning through Firebase Console; client cannot write admin roles or verification decisions.
- Firestore transactions for claims; re-check expiry and eligibility within transaction.
- Minimise exact location exposure; approximate location before claim.
- No cloud file uploads in MVP; no identity-document scans or beneficiary images collected.
- Validate and bound all user inputs; encode output; avoid rendering untrusted HTML.
- Keep Firebase project on Spark; no billing account, paid APIs, SMS, AI API or external storage.
- Dependency/license review, secret scanning and manual quota monitoring.

Do not claim a client-side check is an authorisation control. Firestore rules are the enforcement boundary. Test rules in Firebase Emulator Suite before deployment.
