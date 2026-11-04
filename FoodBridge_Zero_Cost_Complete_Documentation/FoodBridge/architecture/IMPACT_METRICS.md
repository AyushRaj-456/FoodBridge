> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Impact Metrics

Keep distinct: offered quantity, accepted quantity, collected quantity, distributed quantity and organic-diverted quantity. A completed donation requires handover confirmation. Store units and measurement method.

Count portions only when directly counted or derived using documented portion-size factor. Environmental estimates require factor value/units, source/version/URL, geography/year, formula, lifecycle boundaries and uncertainty. Formula: `estimated_CO2e_avoided = verified_quantity_kg × approved_factor_kgCO2e_per_kg`; this does not authorise inventing a factor.

Prevent inflation: deduplicate by handover; count completed donations; preserve corrections; separate measured and estimated; disclose reporting period, sample coverage and assumptions. No public environmental metric until a credible applicable factor is reviewed.
