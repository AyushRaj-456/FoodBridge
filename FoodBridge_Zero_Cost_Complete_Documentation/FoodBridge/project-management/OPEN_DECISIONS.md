# Open Decisions

| ID | Decision | Current recommendation | Status |
|---|---|---|---|
| OD-01 | Pilot mess and operating owner | Confirm with institution | Open |
| OD-02 | Human-food safety SOP | Obtain written approval from competent institutional/food-safety authority | Blocking launch |
| OD-03 | Recipient cohort | Manually verify NGO and responsible contacts | Open |
| OD-04 | Firebase region | Choose closest supported region after latency/data review; Firestore location is difficult to change | Open |
| OD-05 | Admin UID(s) | Owner manually provisions at least two trusted admins in Firebase Console | Open |
| OD-06 | Spark quota capacity | Estimate reads/writes/storage/hosting usage for pilot and set manual thresholds | Open |
| OD-07 | OSM tile usage | Confirm modest expected traffic and display attribution; prepare no-map fallback | Open |
| OD-08 | Shared media uploads | Deferred; no Spark-compatible private file store approved | Deferred |
| OD-09 | Phone OTP | Excluded; SMS requires Blaze/paid provider | Closed for MVP |
| OD-10 | Push/SMS/WhatsApp | Excluded; in-app only | Closed for MVP |
| OD-11 | Animal-feed route | Keep disabled pending qualified assessment and written SOP | Blocking |
| OD-12 | Compost/biogas route | Keep disabled pending facility-specific acceptance SOP | Blocking |
| OD-13 | Prediction threshold | Define minimum historical sample before showing forecast | Open |
| OD-14 | Data retention/privacy | Confirm with institution and legal reviewer | Open |

Any new technology choice must pass the zero-cost register and may not require a billing account.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
