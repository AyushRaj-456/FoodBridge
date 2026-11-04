> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Pilot Data Collection

Daily fields: date, meal, dish, prepared/served/leftover quantity + unit, people served, measurement method, recorder, timestamp and notes.

Donation fields: listing ID, donor, category, declared/accepted/collected quantities, prepared/published/claimed/handover times, recipient type and completion state.

Use consistent scales/containers. No portions-to-kg conversion without documented factor. Missing values remain null. Corrections include reason. Avoid identifiable beneficiary data. Metrics: waste per meal/person, claim/completion rate, publish-to-claim/handover time, offered vs collected, completeness and incidents. Explain methodology and limitations.
