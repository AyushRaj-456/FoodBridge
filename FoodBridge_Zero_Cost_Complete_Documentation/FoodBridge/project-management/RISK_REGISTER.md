> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Risk Register

| Risk | Mitigation | Owner |
|---|---|---|
| Unsafe food redistributed | Qualified SOP, route gates, manual review, stop procedure | Operations |
| Fake recipient | Document/callback review and revalidation | Admin |
| Double claim | Transaction, unique constraint, concurrency test | Backend |
| Low recipient response | Small cohort and realistic pickup windows | Community |
| Poor data quality | Simple forms, units, training, completeness view | Mess lead |
| Location/privacy leak | Least privilege, approximate pre-claim location, manual/offline document review | Security |
| Legal non-compliance | Qualified FSSAI/DPDP/local review | Institution |
| Misleading forecast | Baseline only, sample count, advisory label | Analytics |
| Provider outage/cost | Adapter, quotas, manual fallback | Tech |
| Team capacity | MVP scope and named owners | Project lead |
| Inflated impact | Provenance, measured/estimated split, audit | Product |
