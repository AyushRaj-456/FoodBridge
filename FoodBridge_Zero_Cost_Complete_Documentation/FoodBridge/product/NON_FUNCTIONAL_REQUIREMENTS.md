# Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | Firebase Auth, deny-by-default Firestore rules, least privilege, field allowlists, transaction integrity |
| Privacy | Minimise personal data; approximate location before claim; no document/photo upload in MVP |
| Performance | Paginated queries, bounded listeners, small bundle, lazy-loaded routes and map |
| Availability | Best-effort within Firebase Spark quotas; show graceful unavailable state when quota/provider limits are reached |
| Cost | ₹0 service-cost target; Spark only; no billing account or paid dependency |
| Maintainability | Modular React features, domain rules separated from UI, JavaScript, pinned dependencies |
| Accessibility | Keyboard support, semantic HTML, labels, visible focus, contrast and responsive layout |
| Reliability | Firestore transaction for claims; expiry checked at interaction time; no background-job guarantee |
| Scalability | Controlled pilot scale only; measure Firestore reads/writes/egress before expanding |
| Portability | Keep domain logic provider-light; export documented data; avoid proprietary paid APIs |

Do not promise horizontal API replicas, managed SQL, server-side workers or 24/7 uptime: those components are not part of the Spark-only architecture.
