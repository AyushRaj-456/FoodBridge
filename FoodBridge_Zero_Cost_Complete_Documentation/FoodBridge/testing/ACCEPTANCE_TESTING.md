> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Acceptance Testing

- [ ] Institution approves pilot and operating procedure.
- [ ] Qualified reviewer approves food-safety SOP and permitted categories.
- [ ] Recipient cohort verified.
- [ ] Donor/recipient flows work on mobile.
- [ ] Unverified recipient cannot claim.
- [ ] API blocks expired listing.
- [ ] Concurrent claim test passes.
- [ ] Exact location private before claim.
- [ ] Dual handover confirmation works.
- [ ] Admin actions audited.
- [ ] Mess data has units and correction history.
- [ ] Analytics distinguish measured/estimated.
- [ ] Privacy notice, retention and grievance approved.
- [ ] Backup restore and incident contact tested.
- [ ] Support owner and escalation known.

Sign-off by product owner, institution, food-safety reviewer, technical lead and privacy/legal reviewer. Technical pass does not replace operational/legal approval.
