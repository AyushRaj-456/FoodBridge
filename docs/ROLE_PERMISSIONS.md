# FoodBridge Role Definitions & Authorization Matrix

This document details user personas, role hierarchy, permission boundaries, and collection-level authorizations across the FoodBridge application.

---

## 1. User Personas

| Role Identifier | User Persona | Primary Objectives | Verification Requirement |
|---|---|---|---|
| `donor` | Hostel Messes, Kitchens, Bakeries, Caterers | Post surplus food lots, declare food safety, manage pickup windows, hand over food | Email verified + Organization profile |
| `recipient_org` | Non-Profit Food Banks, Shelters, Community Kitchens | Discover human-tier food, place claims, coordinate pickup, confirm handover, feed beneficiaries | Government / NGO Registration (`approved` status) |
| `mess_operator` | Dining Hall Kitchen Supervisors | Log daily meal headcounts, track leftover quantities, review waste trends | Linked Mess Donor Org |
| `farm` | Gaushalas, Cattle Sanctuaries, Dairy Farms | Claim segregated livestock-safe vegetable and grain feedstock | Agricultural verification |
| `compost` | Municipal/Campus Composting & Biogas Plants | Claim post-meal plate organics, monitor digestion mass, generate bio-energy & fertilizer | Facility operational permit |
| `admin` | Platform Security & Verification Stewards | Review verification requests, investigate incident reports, manage users, audit trails | Explicit document in `/admins/{uid}` |

---

## 2. Granular Permissions Matrix

| Capability / Action | Donor | Recipient NGO | Mess Operator | Cattle Farm | Compost Plant | Platform Admin | Public / Unauth |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View Public Landing Page | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Public / Anon Stats | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register Account | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| Register Organisation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Create Human Food Listing | ✓ | — | ✓ | — | — | ✓ | — |
| Create Animal Feed Listing | ✓ | — | ✓ | — | — | ✓ | — |
| Create Compost Listing | ✓ | — | ✓ | — | — | ✓ | — |
| Claim Human Food (Tier 1) | — | ✓ (Approved) | — | — | — | ✓ | — |
| Claim Animal Feed (Tier 2) | — | — | — | ✓ | — | ✓ | — |
| Claim Organic Waste (Tier 3) | — | — | — | — | ✓ | ✓ | — |
| Confirm Handover (Recipient) | — | ✓ | — | ✓ | ✓ | ✓ | — |
| Confirm Handover (Donor) | ✓ | — | ✓ | — | — | ✓ | — |
| Log Daily Mess Records | — | — | ✓ | — | — | ✓ | — |
| View Mess Waste Analytics | — | — | ✓ | — | — | ✓ | — |
| File Incident / Safety Report | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Review Org Verifications | — | — | — | — | — | ✓ | — |
| Suspend / Unsuspend Org | — | — | — | — | — | ✓ | — |
| Read Immutable Audit Events | — | — | — | — | — | ✓ | — |

---

## 3. Firestore Collection Access Control

- **`/users/{uid}`**: Users can read and write only their own user document (`request.auth.uid == uid`). Admins can read all users.
- **`/admins/{uid}`**: Read and write restricted exclusively to users who are verified platform administrators.
- **`/organisations/{orgId}`**: Any authenticated user can read approved organisations. Org members can update their own organization. Admins have full access.
- **`/memberships/{membershipId}`**: Members can read their memberships. Org managers/admins can add members.
- **`/listings/{listingId}`**:
  - *Read:* Public listings readable by authenticated users; full contact details restricted to approved claiming orgs.
  - *Create:* Authenticated users belonging to an active approved donor organisation.
  - *Update:* Listing owner or claiming organization (during claim status update).
- **`/claims/{claimId}`**:
  - *Create:* Approved recipient organisations.
  - *Read:* Participating donor, claiming recipient, and admins.
  - *Update:* State transitions governed by mutual agreement rules.
- **`/fulfillment/{fulfillmentId}`**: Handover confirmation records created upon successful collection.
- **`/messRecords/{recordId}`**: Created and managed by mess operators belonging to that mess organization.
- **`/verificationReviews/{reviewId}`**: Admin only.
- **`/auditEvents/{eventId}`**: Append-only by authorized system actors; read-only by platform administrators.
