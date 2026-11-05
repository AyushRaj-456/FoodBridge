# Open Decisions & Post-Pilot Resolutions

| ID | Decision | Resolution / Post-Pilot Outcome | Status |
|---|---|---|---|
| OD-01 | Pilot mess and operating owner | Confirmed Campus Dining Hall 3 (`org-seed-02`) under supervisor R. K. Sharma | Resolved (Pilot Complete) |
| OD-02 | Human-food safety SOP | Approved written SOP `FB-SOP-PILOT-HUMAN-2026` (v1.0.0) with hot-holding ($\ge 65^\circ\text{C}$) & 45-min pickup window | Resolved (Pilot Complete) |
| OD-03 | Recipient cohort | Verified Seva Community Kitchen (`org-seed-01`) via offline Trust registry & kitchen inspection | Resolved (Pilot Complete) |
| OD-04 | Firebase region | Configured region in Firebase project settings; tested with latency < 100ms | Resolved |
| OD-05 | Admin UID(s) | Provisioned console-only administrators via `/admins/{uid}`; client self-promotion permanently denied | Resolved |
| OD-06 | Spark quota capacity | Peak reads at 4.8% of daily quota (2,410 / 50k); automated safety pause active at 80% (40k reads) | Resolved (Verified Healthy) |
| OD-07 | OSM tile usage | Implemented Leaflet + OpenStreetMap tiles with visible attribution and resilient text-list fallback | Resolved |
| OD-08 | Shared media uploads | Permanently deferred; Spark projects cannot access Cloud Storage; offline checklist eliminates photo need | Deferred (Zero-Cost Invariant) |
| OD-09 | Phone OTP | Excluded; SMS requires paid provider or Blaze pay-as-you-go | Closed (Zero-Cost Invariant) |
| OD-10 | Push/SMS/WhatsApp | Excluded; in-app Firestore snapshots (`onSnapshot`) provide real-time updates at ₹0 cost | Closed (In-App Only) |
| OD-11 | Animal-feed route | Remains permanently disabled until qualified veterinary eligibility & separate livestock SOPs exist | Closed / Gated |
| OD-12 | Compost/biogas route | Remains permanently disabled until PCB-authorized composting facility SOPs exist | Closed / Gated |
| OD-13 | Prediction threshold | Strict 14-day data completeness gate implemented in pure client JavaScript; no paid ML APIs | Resolved |
| OD-14 | Data retention/privacy | Field-level privacy partition (`/fulfillment`) protects exact location; unmeasured data kept as `null` | Resolved |

Any new technology choice must pass the zero-cost register and may not require a billing account.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
