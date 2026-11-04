# Security Test Cases

| ID | Attack | Expected control |
|---|---|---|
| ST-01 | Unauthenticated Firestore read/write | Denied for private collections |
| ST-02 | Self-assign admin | Denied by rules |
| ST-03 | Self-approve organisation | Denied by rules |
| ST-04 | Cross-organisation listing mutation | Denied |
| ST-05 | Read exact pickup address before claim | Denied/field omitted |
| ST-06 | Concurrent claim race | One winner only |
| ST-07 | Claim after consume-by | Denied in transaction/rules |
| ST-08 | Modify completed handover quantity | Denied or admin-audited correction only |
| ST-09 | Write notification for another UID | Denied |
| ST-10 | Insert arbitrary admin audit event | Denied or constrained |
| ST-11 | Query entire database | Denied/limited by rules and pagination |
| ST-12 | Add forbidden paid SDK/API endpoint | Cost audit fails build review |
