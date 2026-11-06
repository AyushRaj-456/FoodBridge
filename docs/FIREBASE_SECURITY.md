# FoodBridge Firebase Security Architecture

This document explains the security design, rules structure, and cryptographic/authorization invariants enforced across FoodBridge.

---

## 1. Architectural Principles

1. **Default Deny-by-Default:**
   Every collection in Firestore is locked down by default. Rules explicitly declare access rights per role and condition.
   ```cel
   match /{document=**} {
     allow read, write: if false;
   }
   ```
2. **Spark ₹0 Cost Constraint Enforcement:**
   Because FoodBridge runs on the free Firebase Spark plan without Cloud Functions:
   - Security rules do not rely on server-side callable functions or background triggers.
   - Transactional state machines (`executeClaimTransaction`) run client-side using atomic Firestore transactions validated strictly by security rules.
   - Storage limits enforce max 5MB file sizes and specific MIME types (PDF, JPEG, PNG, WEBP) to prevent quota exhaustion.
3. **Role Determination via Firestore Lookups:**
   - Platform admins are verified via existence in `/databases/$(database)/documents/admins/$(request.auth.uid)`.
   - Organization approvals are verified via existence and field check on `/databases/$(database)/documents/organisations/$(orgId)`.
   - Multi-tenant data segregation checks `request.auth.uid` against membership records.

---

## 2. Security Rules Core Helper Functions

| Function Name | Definition / Purpose |
|---|---|
| `isAuthenticated()` | Verifies `request.auth != null`. |
| `isAdmin()` | Checks if `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`. |
| `isOwner(uid)` | Enforces single-user tenant isolation: `request.auth.uid == uid`. |
| `isOrgMember(orgId)` | Validates membership in the given organization. |
| `isApprovedOrg(orgId)` | Verifies that the organization document has `status == 'approved'`. |
| `isValidListingStatus(s)` | Validates allowed listing statuses: `draft`, `published`, `claimed`, `completed`, `cancelled`, `expired`. |
| `isValidClaimStatus(s)` | Validates allowed claim statuses: `pending`, `accepted`, `in_transit`, `completed`, `cancelled`, `rejected`. |
| `isValidRouteTier(tier)` | Ensures tier is one of: `human`, `animal`, `organic`. |

---

## 3. Data Integrity & Field Validation Invariants

### 3.1 Listing Creation (`/listings`)
- `request.resource.data.quantity > 0`
- `request.resource.data.quantity <= 5000` (prevents overflow/denial of service)
- `request.resource.data.unit in ['kg', 'liters', 'servings', 'packets', 'crates', 'boxes']`
- `isValidRouteTier(request.resource.data.routeTier)`
- `request.resource.data.status == 'published' || request.resource.data.status == 'draft'`

### 3.2 Claim Transactions (`/claims`)
- Only an approved organization can initiate a claim: `isApprovedOrg(request.resource.data.recipientOrgId)`.
- Re-claiming an already claimed listing is rejected atomically via transaction.
- Status transitions follow strict state machines:
  - `pending` $\rightarrow$ `accepted` $\rightarrow$ `in_transit` $\rightarrow$ `completed`
  - `pending` $\rightarrow$ `cancelled` or `rejected`

### 3.3 Mess Records (`/messRecords`)
- Leftover quantity cannot exceed prepared quantity:
  `request.resource.data.leftoverQty <= request.resource.data.preparedQty`
- Planned count and actual count must be non-negative:
  `request.resource.data.plannedCount >= 0 && request.resource.data.actualCount >= 0`

---

## 4. Cloud Storage Security (`storage.rules`)

Storage is restricted strictly to non-executable organization verification proof documents (government registrations, certificates):
```cel
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /organisations/{orgId}/verification/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('application/pdf|image/(jpeg|png|webp)');
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
All other upload paths are blocked.
