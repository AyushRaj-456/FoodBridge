> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Risk Register & Post-Pilot Audit

| Risk | Mitigation | Pilot Evidence / Residual Status | Owner |
|---|---|---|---|
| **Unsafe food redistributed** | Written SOP `FB-SOP-PILOT-HUMAN-2026`, holding temperature $\ge 65^\circ\text{C}$, 45-min window | Zero food illness or hygiene breaches during 14-day pilot | Operations |
| **Unverified / Fake recipient** | Offline 5-point inspection checklist, Trust registry check | Seva Community Kitchen verified offline prior to claim authorization | Admin |
| **Double claim race condition** | Firestore atomic transaction re-checks status and locks single winner | Proved in concurrency test & 0 double claims during pilot | Backend |
| **Low recipient response** | Small verified cohort, realistic 45-minute pickup windows | Median claim time 18.4 mins; 100% pickup completion | Community |
| **Poor data quality** | Explicit units (`kg`, `portions`), missing data stored as `null` (not 0) | 95.2% completeness rate; missing fields isolated cleanly | Mess lead |
| **Location / privacy leak** | Partitioned `/fulfillment` subcollection; approximate radius pre-claim | Exact address withheld until claim; zero privacy leaks | Security |
| **Legal non-compliance** | FSSAI safe food recovery compliance, DPDP Act minimisation | FSSAI guidelines cited; zero personal beneficiary data collected | Institution |
| **Misleading forecast** | 14-day data completeness gate, sample size ($n$), $\pm \sigma$ spread | Gated forecast prevents false predictions; advisory badge enforced | Analytics |
| **Quota exhaustion / Bill risk** | Spark plan only, unlinked billing, automated 80% safety pause | Peak reads at 4.8% of daily limit; ₹0 incurred | Tech |
| **Inflated impact claims** | Disclosed formulas, accredited factors (UNEP/FSSAI), `[ESTIMATE]` label | Separate physical accounting for offered, claimed, collected | Product |
