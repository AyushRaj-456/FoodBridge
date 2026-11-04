# Monitoring and Logging

Use Firebase Console's included usage dashboards for Firestore and Hosting, plus application-level error states and minimal structured client logs. Do not add paid observability, third-party analytics, BigQuery streaming or a paid crash-reporting service. Do not log passwords, tokens, exact private addresses, verification notes or beneficiary identities. Establish manual daily quota checks during pilot. If usage approaches the Spark cap, reduce query/listener volume or pause the feature; do not upgrade.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
