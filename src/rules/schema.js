/**
 * FoodBridge Schema Definitions & Domain Rules
 * Conforms to architecture/DATABASE_SCHEMA.md
 */

export const USER_STATUSES = ['pending', 'active', 'suspended'];

export const ORG_TYPES = ['donor', 'recipient', 'farm', 'facility'];
export const ORG_STATUSES = ['pending', 'approved', 'suspended'];

export const MEMBERSHIP_ROLES = ['member', 'admin', 'donor', 'recipient', 'mess_operator'];
export const MEMBERSHIP_STATUSES = ['pending', 'active', 'suspended'];

export const LISTING_STATUSES = [
  'draft',
  'published',
  'claimed',
  'handover_pending',
  'completed',
  'withdrawn',
  'expired',
  'cancelled',
  'disputed',
];

export const ROUTE_TIERS = ['human', 'animal', 'organic'];

export const CLAIM_STATUSES = [
  'claimed',
  'donor_confirmed',
  'recipient_confirmed',
  'completed',
  'cancelled',
  'disputed',
];

export const MEAL_TYPES = ['breakfast', 'lunch', 'snacks', 'dinner'];

/**
 * Immutable and Allowlisted Fields per Collection
 */
export const ALLOWED_FIELDS = {
  users: ['displayName', 'email', 'status', 'createdAt', 'updatedAt'],
  usersClientUpdate: ['displayName', 'photoURL', 'updatedAt'],

  organisations: [
    'type',
    'legalName',
    'displayName',
    'addressText',
    'contactPerson',
    'contactPhone',
    'contactEmail',
    'regNumber',
    'capacity',
    'operatingHours',
    'notes',
    'geohash',
    'lat',
    'lng',
    'status',
    'createdBy',
    'createdAt',
    'updatedAt',
  ],
  organisationsMemberUpdate: ['displayName', 'addressText', 'updatedAt'],

  memberships: ['orgId', 'uid', 'role', 'status', 'createdAt'],
  membershipsOrgAdminUpdate: ['role', 'status'],

  listings: [
    'donorOrgId',
    'createdBy',
    'title',
    'category',
    'quantity',
    'unit',
    'preparedAt',
    'consumeBy',
    'pickupStart',
    'pickupEnd',
    'storageDeclaration',
    'dietType',
    'allergens',
    'location',
    'geohash',
    'routeTier',
    'status',
    'activeClaimId',
    'createdAt',
    'updatedAt',
  ],

  listingsDonorUpdate: [
    'title',
    'category',
    'quantity',
    'unit',
    'preparedAt',
    'consumeBy',
    'pickupStart',
    'pickupEnd',
    'storageDeclaration',
    'dietType',
    'allergens',
    'location',
    'geohash',
    'routeTier',
    'status',
    'updatedAt',
  ],

  listingFulfillment: ['exactAddress', 'contactName', 'contactPhone', 'instructions'],

  claims: [
    'listingId',
    'recipientOrgId',
    'claimedBy',
    'status',
    'claimedAt',
    'idempotencyKey',
    'donorConfirmedAt',
    'recipientConfirmedAt',
    'actualQuantity',
    'unit',
  ],

  messRecords: [
    'orgId',
    'mealDate',
    'mealType',
    'dishName',
    'preparedQty',
    'preparedMethod',
    'servedQty',
    'servedMethod',
    'leftoverQty',
    'leftoverMethod',
    'unit',
    'peopleServed',
    'peopleMethod',
    'notes',
    'enteredBy',
    'createdAt',
    'updatedAt',
  ],

  notifications: ['userId', 'type', 'title', 'body', 'relatedId', 'createdAt', 'readAt'],

  reports: [
    'reporterUid',
    'targetType',
    'targetId',
    'category',
    'description',
    'status',
    'createdAt',
  ],

  verificationReviews: ['orgId', 'reviewerUid', 'checklist', 'decision', 'reason', 'reviewedAt'],

  auditEvents: ['actorUid', 'action', 'resourceType', 'resourceId', 'summary', 'createdAt'],

  impactFactors: ['metric', 'factor', 'unit', 'source', 'version', 'validFrom'],
};
