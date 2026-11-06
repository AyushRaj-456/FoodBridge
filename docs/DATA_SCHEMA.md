# FoodBridge Firestore Collection Schema Inventory

FoodBridge organizes application state into 13 top-level Firestore collections. All fields, data types, indexes, and relationship constraints are documented below.

---

## Collection Directory

1. [`/users`](#1-users)
2. [`/admins`](#2-admins)
3. [`/organisations`](#3-organisations)
4. [`/memberships`](#4-memberships)
5. [`/listings`](#5-listings)
6. [`/claims`](#6-claims)
7. [`/fulfillment`](#7-fulfillment)
8. [`/messRecords`](#8-messrecords)
9. [`/notifications`](#9-notifications)
10. [`/reports`](#10-reports)
11. [`/verificationReviews`](#11-verificationreviews)
12. [`/auditEvents`](#12-auditevents)
13. [`/impactFactors`](#13-impactfactors)

---

### 1. `/users/{uid}`
Stores base identity information for registered users.
- `uid` (string, required): Firebase Auth UID.
- `email` (string, required): User email address.
- `name` (string, required): Full name or display name.
- `role` (string, required): Primary role (`donor`, `recipient_org`, `farm`, `compost`, `admin`).
- `activeOrgId` (string | null): Currently active organization.
- `phone` (string, optional): Contact telephone.
- `createdAt` (ISO timestamp string, required).
- `updatedAt` (ISO timestamp string, required).

---

### 2. `/admins/{uid}`
Superadmin authorization registry.
- `uid` (string, required): Admin's Firebase Auth UID.
- `email` (string, required): Verified admin email.
- `grantedAt` (ISO timestamp string, required).
- `grantedBy` (string, optional): UID of authorizing admin.
- `role` (string, required): e.g. `'superadmin'`.

---

### 3. `/organisations/{orgId}`
Organizational entities (messes, NGOs, farms, composting units).
- `id` (string, required): Org ID.
- `name` (string, required): Legal or operating entity name.
- `type` (string, required): `'donor' | 'recipient_org' | 'farm' | 'compost'`.
- `subType` (string, optional): e.g. `'mess' | 'hostel' | 'restaurant' | 'shelter'`.
- `status` (string, required): `'pending' | 'approved' | 'rejected' | 'suspended'`.
- `address` (string, required): Operating physical address.
- `coordinates` (map, optional): `{ lat: number, lng: number }`.
- `contactPhone` (string, required).
- `contactEmail` (string, required).
- `fssaiRegistration` (string, optional): Government registration or FSSAI number.
- `verificationDocUrl` (string, optional): Reference to uploaded verification PDF/image.
- `verifiedAt` (ISO timestamp string, optional).
- `suspensionReason` (string, optional).
- `createdAt` (ISO timestamp string, required).
- `updatedAt` (ISO timestamp string, required).

---

### 4. `/memberships/{membershipId}`
Many-to-many link between users and organisations. (ID pattern: `{uid}_{orgId}`).
- `userId` (string, required): User UID.
- `orgId` (string, required): Organization ID.
- `role` (string, required): `'owner' | 'manager' | 'member'`.
- `createdAt` (ISO timestamp string, required).

---

### 5. `/listings/{listingId}`
Surplus food lots and organic resource declarations.
- `id` (string, required): Unique listing identifier.
- `title` (string, required): Descriptive title.
- `donorOrgId` (string, required): ID of donor organization.
- `donorOrgName` (string, required): Display name of donor org.
- `routeTier` (string, required): `'human' | 'animal' | 'organic'`.
- `foodCategory` (string, required): e.g. `'Cooked Meals' | 'Raw Veg Scraps' | 'Dry Rations'`.
- `quantity` (number, required): $0 < quantity \le 5000$.
- `unit` (string, required): `'kg' | 'liters' | 'servings' | 'packets' | 'crates' | 'boxes'`.
- `servings` (number, optional): Estimated meal servings.
- `packaging` (string, required): Description of food-safe container.
- `prepTime` (ISO timestamp string, optional).
- `useBy` (ISO timestamp string, required): Expiry limit.
- `pickupAddress` (string, required): Full pickup location.
- `pickupWindow` (string, required): Human-readable window (e.g. `'Today 18:00 – 20:00'`).
- `status` (string, required): `'draft' | 'published' | 'claimed' | 'completed' | 'cancelled' | 'expired'`.
- `claimedByOrgId` (string, optional): NGO ID if claimed.
- `createdAt` (ISO timestamp string, required).

---

### 6. `/claims/{claimId}`
Reservation of a listing by a recipient, farm, or composting partner.
- `id` (string, required): Unique claim ID.
- `listingId` (string, required): Referenced listing ID.
- `donorOrgId` (string, required).
- `recipientOrgId` (string, required): ID of approved claiming organization.
- `claimedByUid` (string, required): UID of volunteer/staff claiming the food.
- `status` (string, required): `'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled' | 'rejected'`.
- `estimatedPickupTime` (ISO timestamp string, optional).
- `createdAt` (ISO timestamp string, required).
- `updatedAt` (ISO timestamp string, required).

---

### 7. `/fulfillment/{fulfillmentId}`
Proof of physical collection and handover confirmation.
- `id` (string, required).
- `claimId` (string, required).
- `listingId` (string, required).
- `donorConfirmed` (boolean, required).
- `recipientConfirmed` (boolean, required).
- `actualQuantity` (number, required).
- `unit` (string, required).
- `completedAt` (ISO timestamp string, required).

---

### 8. `/messRecords/{recordId}`
Daily mess dining, attendance, and surplus food logs.
- `id` (string, required).
- `orgId` (string, required): Mess organization ID.
- `date` (string, required): YYYY-MM-DD.
- `mealType` (string, required): `'breakfast' | 'lunch' | 'snacks' | 'dinner'`.
- `plannedCount` (number, required): Diners planned.
- `actualCount` (number, required): Diners served.
- `preparedQty` (number, required): Total food cooked in kg.
- `leftoverQty` (number, required): Total uneaten food ($leftoverQty \le preparedQty$).
- `divertedToRescueQty` (number, required): kg diverted to human rescue.
- `divertedToCompostQty` (number, required): kg diverted to composting/biogas.
- `loggedBy` (string, required): Staff UID.
- `createdAt` (ISO timestamp string, required).

---

### 9. `/notifications/{notificationId}`
In-app operational notifications for users.
- `userId` (string, required).
- `title` (string, required).
- `message` (string, required).
- `type` (string, required): `'claim_created' | 'claim_accepted' | 'pickup_ready' | 'verification' | 'system'`.
- `read` (boolean, required): Default `false`.
- `createdAt` (ISO timestamp string, required).

---

### 10. `/reports/{reportId}`
Incident, safety, and hygiene reporting.
- `id` (string, required).
- `reporterUid` (string, required).
- `targetOrgId` (string, optional).
- `listingId` (string, optional).
- `category` (string, required): `'food_quality' | 'hygiene' | 'no_show' | 'commercial_resale' | 'other'`.
- `description` (string, required).
- `status` (string, required): `'open' | 'investigating' | 'resolved' | 'dismissed'`.
- `resolutionNotes` (string, optional).
- `createdAt` (ISO timestamp string, required).

---

### 11. `/verificationReviews/{reviewId}`
Administrative KYC review records.
- `id` (string, required).
- `orgId` (string, required).
- `adminUid` (string, required).
- `decision` (string, required): `'approved' | 'rejected'`.
- `notes` (string, optional).
- `reviewedAt` (ISO timestamp string, required).

---

### 12. `/auditEvents/{eventId}`
Immutable audit log of security and financial-risk operations.
- `id` (string, required).
- `action` (string, required): e.g. `'ORG_VERIFIED' | 'ORG_SUSPENDED' | 'CLAIM_OVERRIDE'`.
- `actorUid` (string, required).
- `targetId` (string, required).
- `timestamp` (ISO timestamp string, required).
- `details` (string, optional).

---

### 13. `/impactFactors/default`
System-wide accredited environmental conversion coefficients.
- `co2KgPerKgFood` (number, required): Default `2.5`.
- `waterLitersPerKgFood` (number, required): Default `420`.
- `mealsPerKgFood` (number, required): Default `2.5`.
- `lastReviewed` (ISO timestamp string, required).
