# Test Cases

| ID | Scenario | Expected result |
|---|---|---|
| TC-01 | Email/password registration | Auth account and pending profile created |
| TC-02 | User writes admin role | Firestore rules deny |
| TC-03 | Unapproved NGO claims listing | Denied |
| TC-04 | Donor publishes valid listing | Published state recorded |
| TC-05 | Listing deadline passed | Claim denied even if status still says published |
| TC-06 | Two recipients claim concurrently | Exactly one transaction succeeds |
| TC-07 | User reads another user's private profile | Denied |
| TC-08 | Unclaimed recipient requests exact address | Exact address withheld |
| TC-09 | Mess operator enters negative quantity | Validation/rules reject |
| TC-10 | In-app notification arrives while app open | Inbox updates |
| TC-11 | User opens app after offline period | Stored unread notifications sync |
| TC-12 | Map tiles unavailable | Text-list fallback works |
| TC-13 | OSM map attribution | Visible attribution displayed |
| TC-14 | Firestore quota error | Clear pause state; no paid upgrade |
| TC-15 | Animal route requested without SOP | Route remains disabled |
| TC-16 | Compost route requested without facility approval | Route remains disabled |
| TC-17 | User attempts file upload | Feature unavailable; no upload endpoint exists |
| TC-18 | Search dependency tree for paid SDKs | No prohibited dependency/network integration |
