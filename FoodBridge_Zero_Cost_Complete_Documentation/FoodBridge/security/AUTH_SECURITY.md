# Authentication Security

Use Firebase Authentication email/password; optional Google sign-in. Do not use phone OTP, SMS gateway or homemade OTP. Never store passwords, bearer tokens or session secrets in Firestore or logs. Use Firebase SDK session handling and password reset email within Spark limits.

Security rules must bind user documents to `request.auth.uid`. Role and organisation membership are separate. Users cannot self-assign admin, verification status or organisation approval. Admin identities are provisioned manually in Firebase Console and protected with strong unique passwords and MFA on the Google account where available. Suspend compromised accounts and review memberships. Avoid detailed login errors that enable account enumeration.
