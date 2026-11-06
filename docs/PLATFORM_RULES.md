# FoodBridge Operational Platform Rules & Policies

This document specifies the operational policies and invariants governing FoodBridge. All frontend workflows, client validation routines, and Firestore security rules enforce these platform rules.

---

## 1. General Platform Policies (G01 – G20)

- **G01 (Zero-Cost Spark Constraint):** The platform operates strictly within the ₹0/month Firebase Spark tier. No paid Google Maps, Mapbox, Twilio SMS, WhatsApp Business, SendGrid, Cloud Functions, or paid third-party AI APIs are permitted.
- **G02 (Non-Commercial redistributed Food Guarantee):** All food redistribution through FoodBridge is free of charge. Resale, monetization, or commercial exploitation of claimed donations is strictly forbidden.
- **G03 (Hierarchy of Food Recovery):** Platform prioritization follows EPA / FSSAI hierarchy:
  1. *Tier 1 (Human Consumption):* Surplus cooked meals, bakery, packaged goods distributed to verified NGOs.
  2. *Tier 2 (Animal Feed):* Clean, segregated grain and vegetable feedstock distributed to verified gaushalas and dairy farms under Animal Feed SOP.
  3. *Tier 3 (Soil & Energy Recovery):* Inedible plate organics and kitchen scraps diverted to biomethanation and thermal composting facilities.
- **G04 (Verified Organization Prerequisite):** Only organizations with `approved` verification status may claim donations or access recipient pickup addresses.
- **G05 (Privacy by Default):** Donor exact physical address, contact telephone number, and gate pickup instructions are masked to unauthenticated users and unapproved organizations.
- **G06 (Immutable Audit Trail):** Security-sensitive operations (claim approvals, status overrides, verification reviews, and account suspensions) must record an immutable audit event in `/auditEvents`.
- **G07 (Transparent Physical Quantities):** All platform statistics report authoritative physical measurements (kilograms, liters, meals) directly derived from verified records.
- **G08 (Open Environmental Formulas):** Carbon dioxide ($CO_2$) and water conservation translations must display accredited conversion factors ($2.5\text{ kg } CO_2\text{/kg food}$, $420\text{ L water/kg food}$) with clear estimation disclosures.
- **G09 (Zero Secret Client Keys):** No administrative private keys, service account JSON files, or elevated backend secrets may be packaged in client code.
- **G10 (Strict Cross-Tenant Isolation):** Members of Organization A cannot modify, claim on behalf of, or tamper with listings, claims, or verification records owned by Organization B.
- **G11 (Default Deny Access):** All Firestore collections follow a default deny-by-default security posture (`match /{document=**} { allow read, write: if false; }`).
- **G12 (Time-to-Live Expiry Enforcement):** Past-due food listings transition automatically to `expired` status and cannot be newly claimed.
- **G13 (Client Offline Capability):** Core descriptive and calculation logic functions offline without relying on external network microservices.
- **G14 (Zero Tolerance for Abuse):** Organizations flagged for food diversion, selling surplus, or hygiene violations are immediately suspended pending administrative review.
- **G15 (Safe Fallback Navigation):** Distance calculations use zero-cost Haversine formula on client device coordinates or human-readable street addresses without external geocoding calls.
- **G16 (Strict Input Sanitization):** Text inputs are bound to maximum lengths, and numbers must be non-negative finite values.
- **G17 (No Silent Failures):** Security rule rejections and validation errors provide human-understandable guidance without leaking database architecture.
- **G18 (Role Separation):** Role capabilities are bound to memberships and system claims; switching user roles requires authenticated membership verification.
- **G19 (Accessible Civic Design):** The UI must meet WCAG 2.1 AA standards (minimum 4.5:1 text contrast, accessible form labels, mobile-first responsive tap targets).
- **G20 (Community Ownership):** FoodBridge is maintained as open public infrastructure for community welfare.

---

## 2. Food Donor Policies (D01 – D45)

- **D01 (Donor Eligibility):** Eligible donors include university mess halls, hostel kitchens, caterers, restaurants, bakeries, corporate cafeterias, and verified event organizers.
- **D02 (Mandatory Food Safety Declaration):** Every listing must record preparation time, recommended consumption window, packaging integrity, and temperature status.
- **D03 (4-Hour Cooked Food Rule):** High-moisture cooked food kept at ambient temperature must be consumed or refrigerated within 4 hours of preparation.
- **D04 (Temperature Hold Standards):** Hot cooked items must be logged as hot-held ($>60^\circ\text{C}$) or chilled ($<5^\circ\text{C}$).
- **D05 (Quantity Invariant):** Donated quantity must be greater than zero and capped at $5,000\text{ kg}$ per single batch (commercial lots $>5\text{T}$ require batch splitting).
- **D06 (Accepted Units):** Listings must use standardized metric units: `kg`, `liters`, `servings`, `packets`, `crates`, or `boxes`.
- **D07 (Allergen Disclosures):** Donors must flag common allergens (dairy, nuts, gluten, soy) where applicable.
- **D08 (Clean Food-Grade Packaging):** Surplus food must be packaged in food-grade stainless containers, sealed HDPE drums, or clean recyclable crates.
- **D09 (Designated Pickup Window):** Donors must provide a realistic pickup window of at least 60 minutes with clear dock/bay instructions.
- **D10 (Listing Cancellation Protocol):** Donors may cancel a listing only before an NGO claims it; once claimed, mutual coordination is required.
- **D11 (Food Lot Identification):** Each donation batch is assigned a unique alphanumeric identifier for traceability.
- **D12 (Shelf-Life Verifiability):** Use-by timestamps cannot be set in the past at publication time.
- **D13 (Visual Inspection Requirement):** Kitchen staff must visually inspect surplus food for color, texture, and aroma before publishing.
- **D14 (Leftover Segregation):** Fresh untouched kitchen surplus must be kept separate from customer plate waste.
- **D15 (Single Listing Modification Guard):** Donors cannot change the route tier or food category once an organization has placed a claim.

---

## 3. Recipient NGO Policies (N01 – N40)

- **N01 (Verification Requirement):** NGOs must complete identity verification and submit government registration (e.g. NGO Darpan / FSSAI) before claiming human food.
- **N02 (Cold-Chain & Transport Compliance):** Claiming organizations must possess covered, hygienic transport (insulated bags or thermal containers).
- **N03 (Timely Collection):** NGOs must arrive within the designated donor pickup window.
- **N04 (Immediate Consumption Distribution):** Claimed cooked food must be distributed directly to beneficiaries without delayed overnight storage unless rapid chilling is available.
- **N05 (Beneficiary Dignity):** Food distribution must respect beneficiary privacy; photography of vulnerable individuals is discouraged.
- **N06 (Two-Way Handover Confirmation):** Handover completion requires verification from both donor and recipient via platform status update.
- **N07 (Capacity Matching):** NGOs may not claim batches larger than their declared vehicle and volunteer distribution capacity.
- **N08 (Dispute & Rejection Protocol):** If food arrives spoiled or temperature-compromised, the NGO must reject the lot and submit an incident report.
- **N09 (No Sub-Contracting):** Only authorized staff and registered volunteers from the verified NGO may perform collections.
- **N10 (Fair Distribution):** Food must be distributed based on nutritional need without discrimination on caste, creed, religion, or gender.

---

## 4. Mess Operator Policies (M01 – M22)

- **M01 (Daily Meal Logging):** Mess operators log planned headcount, actual headcount, prepared quantity, and leftover quantity for each meal service (breakfast, lunch, snacks, dinner).
- **M02 (Data Quality Guard):** Actual diners cannot exceed planned diners by more than 50% without manager override note.
- **M03 (Leftover Limit):** Leftover food cannot exceed total prepared food ($leftoverQty \le preparedQty$).
- **M04 (Prevention-First Mandate):** Operations prioritize portion planning adjustments to eliminate surplus at the cooking stage.
- **M05 (Waste Stream Segregation):** Prep waste (peels), unserved cooked surplus, and post-consumer plate waste must be weighed separately.
- **M06 (Root Cause Categorization):** Leftover spikes must be categorized (weather absenteeism, exam schedules, menu mismatch, over-preparation).
- **M07 (Audit Transparency):** Mess records cannot be deleted after 24 hours to prevent retrospective metric tampering.

---

## 5. Cattle Farm & Livestock Feed Policies (C01 – C18)

- **C01 (Strict Negative Rule):** Food rejected as unsafe for humans is **NEVER** assumed safe for animal consumption.
- **C02 (Animal Feed SOP):** Only lots explicitly assessed under livestock feed guidelines may be published to Tier 2.
- **C03 (Prohibited Livestock Items):** Under no circumstances may onions, garlic, chocolate, caffeine, moldy bread, or spiced curries be directed to cattle.
- **C04 (Permitted Feedstock):** Clean vegetable trimmings (carrots, pumpkin, cabbage), fresh bran, spent brewer's grain, and unseasoned steamed rice.
- **C05 (Farm Registration):** Claiming gaushalas and dairy farms must be verified agricultural holdings with humane livestock care standards.
- **C06 (Contamination Free Carts):** Feed crates must not have touched non-vegetarian waste or industrial chemicals.

---

## 6. Composting & Biogas Facility Policies (R01 – R13)

- **R01 (Organic Waste Classification):** Tier 3 receives post-service mixed plate waste, coffee grounds, and spoiled organics unsuitable for consumption or livestock.
- **R02 (Foreign Matter Screening):** Plastics, metals, foil wrappers, and glass must be 100% segregated prior to digester input.
- **R03 (Sealed Transport Protocol):** Waste carts must be leak-proof and covered during transit across campus to prevent odors.
- **R04 (Yield Tracking):** Facilities record mass input against bio-fertilizer curing output and cubic meters ($m^3$) of methane biogas generated.
- **R05 (Zero Landfill Objective):** Complete circular conversion into soil conditioners or clean campus heating energy.

---

## 7. Administrator Policies (A01 – A20)

- **A01 (Two-Person Verification Standard):** Verification reviews follow structured criteria: valid registration document, verified telephone check, and physical address confirmation.
- **A02 (Console Admin Bootstrapping):** Superadmin accounts are granted exclusively via Firebase Console or pre-seeded admin document in `/admins/{uid}`. No public self-service admin registration exists.
- **A03 (Suspension Authority):** Admins may suspend non-compliant organizations with documented reason codes.
- **A04 (Dispute Adjudication):** Incidents filed under `/reports` are triaged with recorded resolution notes.
- **A05 (Zero Direct Database Edits):** All administrative interventions must preserve audit event history in `/auditEvents`.
