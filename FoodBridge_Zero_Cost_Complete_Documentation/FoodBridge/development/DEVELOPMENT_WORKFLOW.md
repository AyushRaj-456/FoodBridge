> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Development Workflow

Use short-lived branches `feature/<ticket>-name`, `fix/...`, `docs/...`; protect main and require PR/CI. Commits are small and imperative, e.g. `feat(listings): add publish validation`.

PR includes purpose, screenshots, test evidence, migration/security/privacy impact, docs and rollback. JavaScript baseline; small modules; validate at API boundary; domain rules not duplicated in React and route handlers; parameterised SQL; structured errors/request IDs. Never commit secrets or real personal data.

AI-generated code is untrusted: human review, tests, dependency review and security checks required. Agents report what was actually run and limitations.
