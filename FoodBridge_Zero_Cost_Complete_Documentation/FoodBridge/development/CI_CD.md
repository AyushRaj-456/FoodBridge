# CI/CD

MVP uses local checks and manual Firebase Hosting deployment to avoid reliance on paid CI minutes or cloud build services. Required local checks: `npm ci`, lint, unit tests, Firebase emulator/rules tests and production build. GitHub Free may be used for source control; automatic workflows are optional only if the repository's current free allowance is confirmed and no paid minutes are consumed. Never add a paid runner or cloud build dependency. Deploy Hosting and Firestore rules/indexes only; never Functions.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
