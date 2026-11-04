# User Roles and Permissions

| Role | Permissions | Restrictions |
|---|---|---|
| Donor member | Manage listings for approved donor organisation; confirm handover | Cannot approve own organisation or claim own listing |
| Recipient member | Browse eligible listings; claim for approved recipient organisation; confirm handover | Cannot claim while pending/suspended or outside route eligibility |
| Mess operator | Enter/correct meal records for assigned mess | Cannot edit other organisations' records |
| Admin | Verify organisations, moderate listings, suspend accounts, resolve reports | Admin is manually provisioned; privileged actions audited |

A user may hold multiple organisation memberships. Membership and organisation status are checked on every sensitive write. Client UI role hiding is not a security control. No worker/service-account role exists in the Spark MVP.
