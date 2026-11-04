# Backup and Recovery

A zero-cost Spark pilot cannot assume automated scheduled exports or paid backup products. Define a manual, documented Firestore export/backup procedure using available Firebase/GCP console capabilities only when accessible without enabling billing; verify this before pilot. If an export path requires billing, use a controlled manual data export of non-sensitive records through authorised admin tooling, with access restrictions and encryption on the operator's own device. Do not export identity documents because the MVP does not collect them. Test restoration in a separate local/emulator environment. Record RPO/RTO honestly; do not promise automated recovery. Keep application source and rules in Git.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
