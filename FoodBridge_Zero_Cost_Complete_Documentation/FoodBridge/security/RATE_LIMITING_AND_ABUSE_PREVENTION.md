# Rate Limiting and Abuse Prevention

MVP controls must fit Firestore Security Rules and Firebase Auth Spark. Enforce field allowlists, account ownership, bounded listing creation, minimum/maximum quantity, bounded radius, pagination, claim eligibility, and one-active-claim transaction semantics. Use Firebase Auth provider protections and email verification where appropriate.

No phone OTP send/verify endpoints, file uploads, distributed API rate limiter, Cloud Functions or external CAPTCHA service are included. Monitor Firestore/Auth quotas manually during pilot. If abuse or quota exhaustion cannot be contained with rules and moderation, pause onboarding or the affected feature; do not add a paid server silently.
