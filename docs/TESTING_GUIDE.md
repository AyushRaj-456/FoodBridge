# FoodBridge QA & Verification Testing Guide

FoodBridge features a comprehensive automated Vitest suite containing 25 test files and 336 individual test cases covering security rules, state machines, role transitions, zero-cost invariants, and accessibility.

---

## 1. Running the Automated Test Suite

### Full Test Run
```bash
npm test -- --run
```

### Security Rules Specification Test
Validates that `firestore.rules` enforces required field validations, cross-tenant isolation, and quantity constraints:
```bash
npm run test:rules
```

### Full Security & Quota Audit Test
Audits production code to guarantee complete absence of paid APIs (Google Maps, Twilio, Mapbox, Cloud Functions, AI APIs):
```bash
npx vitest run src/test/security/SecurityAudit.test.jsx
```

### Linting & Formatting Check
```bash
npm run lint
npm run format:check
```

---

## 2. Core Operational Test Scenarios (1 – 12)

### Scenario 1: Unverified NGO Claim Prevention
- **Objective:** Ensure unapproved organizations cannot claim Tier 1 human food donations.
- **Test:** Log in as `unverified.demo@foodbridge.local` $\rightarrow$ Attempt to claim `Fresh Cooked Dal & Rice`.
- **Expected Outcome:** Claim button displays "Verification Required" tooltip; Firestore security rule `isApprovedOrg()` rejects write if bypassed.

### Scenario 2: Zero-Cost Atomic Claim Race Prevention
- **Objective:** Verify two NGOs cannot claim the same donation batch simultaneously.
- **Test:** Covered in `src/features/claims/Claims.test.jsx` using `executeClaimTransaction`.
- **Expected Outcome:** First claim succeeds; second claim encounters transaction abort and transitions listing to `claimed`.

### Scenario 3: Expiry Auto-Lock
- **Objective:** Past-due listings cannot be claimed.
- **Test:** `checkListingExpiry` marks past-due listings as `expired`.
- **Expected Outcome:** Listing displays "Expired" badge and claim interaction is disabled.

### Scenario 4: Strict Animal Feed Negative Rule (Tier 2)
- **Objective:** Inedible human food must never automatically leak into animal feed.
- **Test:** Inspect `FarmShell.jsx` query filter: `routeTier == 'animal'`.
- **Expected Outcome:** Human donations and unsorted plate waste never appear in gaushala feed discovery.

### Scenario 5: Composting Organic Waste Flow (Tier 3)
- **Objective:** Post-service scraps routed to biomethanation and thermal composting.
- **Test:** Log in as `compost.demo@foodbridge.local` $\rightarrow$ claim `Post-Meal Mixed Plate Organics`.
- **Expected Outcome:** Listing marked dispatched, processing history updated with biogas yield metric.

### Scenario 6: Mess Leftover Data Quality Invariant
- **Objective:** Leftover quantity cannot exceed total prepared food.
- **Test:** Enter $180\text{ kg}$ prepared food and $200\text{ kg}$ leftover in `MessShell.jsx`.
- **Expected Outcome:** Validation error: "Leftover quantity cannot exceed prepared quantity ($leftoverQty \le preparedQty$)".

### Scenario 7: Multi-Tenant Profile Isolation
- **Objective:** User A cannot modify User B's profile or read unapproved donor addresses.
- **Test:** Security rule assertion in `src/test/rules/firestore-rules.spec.test.js`.
- **Expected Outcome:** Denied by `isOwner(uid)`.

### Scenario 8: Admin KYC Organization Verification
- **Objective:** Review pending verification requests and update organization status.
- **Test:** Log in as `admin.demo@foodbridge.local` $\rightarrow$ Open Verification Queue $\rightarrow$ Approve `Hope Community Shelter`.
- **Expected Outcome:** Org status updates to `approved`; audit event logged in `/auditEvents`.

### Scenario 9: Zero Paid API Dependency Audit
- **Objective:** Codebase strictly conforms to Firebase Spark ₹0 tier.
- **Test:** `SecurityAudit.test.jsx` scans all production files.
- **Expected Outcome:** 0 references to paid mapping, SMS, or serverless compute SDKs.

### Scenario 10: Two-Way Handover Confirmation
- **Objective:** Claim is only marked completed once both donor and recipient acknowledge receipt.
- **Test:** Handover workflow in `FulfillmentShell.jsx`.
- **Expected Outcome:** Both parties confirm actual received quantity before impact is credited.

### Scenario 11: Real Metric Calculations & Zero Fake Mock Numbers
- **Objective:** Dashboard cards display live arithmetic from real documents.
- **Test:** Empty state verified in `DonorDashboardView.jsx` and `NgoDashboardView.jsx`.
- **Expected Outcome:** Dashboards without listings show 0 meals and honest EmptyState components instead of hardcoded numbers.

### Scenario 12: Mobile Viewport & Tap Target Accessibility
- **Objective:** All operational flows usable on 375px mobile screens.
- **Test:** `Accessibility.test.jsx` and mobile responsive CSS checks.
- **Expected Outcome:** No horizontal scrollbar overflow; buttons have minimum 44px tap targets.
