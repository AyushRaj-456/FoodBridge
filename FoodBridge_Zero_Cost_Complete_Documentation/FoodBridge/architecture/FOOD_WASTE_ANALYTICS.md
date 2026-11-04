> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Food Waste Analytics

Record one row per organisation/date/meal/dish/unit: prepared, served/consumed, leftover, people served, method and author. If possible distinguish unserved surplus from plate waste.

Validate non-negative quantities and explicit units. `served + leftover` should not exceed prepared unless an explained adjustment exists. Corrections are append-only. Missing data is null, not zero.

MVP metrics: totals by day/meal/dish; leftover percentage = leftover/prepared × 100; per-person quantity only when units/denominator are compatible; data completeness; top dishes by leftover. Forecast baseline: moving average over comparable days, then weekday/meal patterns only with adequate sample size. Show date range, sample count and error/uncertainty. A 1–2 week pilot is too small for robust seasonal claims.

Preparation recommendation = expected attendance × historical consumption per attendee, adjusted by surplus pattern and manager-defined service buffer. Advisory only; staff decide. Forecast notifications must say “estimated, not confirmed” and never create claimable listings. Donor reconfirms before publishing.
