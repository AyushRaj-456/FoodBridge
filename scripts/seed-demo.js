#!/usr/bin/env node
/**
 * FoodBridge Local Demo Testing Sandbox — Seed Script
 * Strictly constrained to local Firebase Emulator suite and projects prefixed with 'demo-'.
 * Populates Auth identities and Firestore collections for all operational roles.
 */

const FIRESTORE_EMULATOR_HOST = process.env.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_EMULATOR_HOST = process.env.VITE_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'demo-foodbridge-local';

// Production safety guard: Refuse execution if not an explicit demo project
if (!PROJECT_ID.startsWith('demo-')) {
  console.error(`\x1b[31m[CRITICAL SAFETY ERROR]\x1b[0m Refusing to run demo seed against non-demo project: "${PROJECT_ID}".`);
  console.error('Demo scripts may only target projects whose ID begins with "demo-".');
  process.exit(1);
}

const FIRESTORE_BASE = `http://${FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const AUTH_BASE = `http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`;

// Demo User Accounts (Standard Test Personas)
const DEMO_ACCOUNTS = [
  {
    uid: 'demo_user_donor_001',
    email: 'donor.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'Hostel Dining Services',
    role: 'donor',
    orgId: 'demo_org_donor_campus',
  },
  {
    uid: 'demo_user_ngo_001',
    email: 'ngo.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'City Care Welfare NGO',
    role: 'recipient_org',
    orgId: 'demo_org_ngo_citycare',
  },
  {
    uid: 'demo_user_mess_001',
    email: 'mess.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'Campus Dining Mess 2',
    role: 'donor',
    subRole: 'mess_operator',
    orgId: 'demo_org_mess_north',
  },
  {
    uid: 'demo_user_farm_001',
    email: 'farm.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'Green Meadow Dairy Gaushala',
    role: 'farm',
    orgId: 'demo_org_farm_greenmeadow',
  },
  {
    uid: 'demo_user_compost_001',
    email: 'compost.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'EcoBio Biogas & Soil Facility',
    role: 'compost',
    orgId: 'demo_org_compost_ecobio',
  },
  {
    uid: 'demo_user_admin_001',
    email: 'admin.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'FoodBridge Platform Admin',
    role: 'admin',
    isAdmin: true,
  },
  {
    uid: 'demo_user_unverified_001',
    email: 'unverified.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'Hope Community Shelter (Pending)',
    role: 'recipient_org',
    orgId: 'demo_org_unverified',
  },
  {
    uid: 'demo_user_suspended_001',
    email: 'suspended.demo@foodbridge.local',
    password: 'Password123!',
    displayName: 'Flagged Reseller Org (Suspended)',
    role: 'donor',
    orgId: 'demo_org_suspended',
  },
];

// Helper to convert plain JS objects into Firestore REST document format
function encodeFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = encodeFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function encodeDocument(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = encodeFirestoreValue(v);
  }
  return { fields };
}

async function writeDoc(collectionPath, docId, data) {
  const url = `${FIRESTORE_BASE}/${collectionPath}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encodeDocument(data)),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to write ${collectionPath}/${docId}: ${res.status} ${errText}`);
  }
}

async function createAuthUser(user) {
  const url = `${AUTH_BASE}/accounts:signUp?key=demo-key`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      localId: user.uid,
      returnSecureToken: false,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    // If account exists, update it
    if (errText.includes('EMAIL_EXISTS')) {
      return;
    }
    console.warn(`[seed] Note on Auth user ${user.email}: ${errText}`);
  }
}

async function seed() {
  console.log(`\x1b[36m=== FoodBridge Local Demo Sandbox Seeder ===\x1b[0m`);
  console.log(`Targeting Project: \x1b[32m${PROJECT_ID}\x1b[0m`);
  console.log(`Firestore Emulator: ${FIRESTORE_EMULATOR_HOST}`);
  console.log(`Auth Emulator: ${AUTH_EMULATOR_HOST}\n`);

  // 1. Verify emulators reachable
  try {
    const check = await fetch(`http://${FIRESTORE_EMULATOR_HOST}/`);
    if (!check.ok && check.status !== 404) {
      throw new Error(`Emulator responded with ${check.status}`);
    }
  } catch (err) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Firestore emulator not reachable at ${FIRESTORE_EMULATOR_HOST}:`, err.message);
    console.error('Please run "npm run emulators" first before seeding.');
    process.exit(1);
  }

  // 2. Seed Auth Accounts
  console.log('Seeding Demo Auth Accounts...');
  for (const acct of DEMO_ACCOUNTS) {
    await createAuthUser(acct);
    // Seed /users document
    await writeDoc('users', acct.uid, {
      uid: acct.uid,
      email: acct.email,
      name: acct.displayName,
      role: acct.role,
      activeOrgId: acct.orgId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // If admin, seed /admins document
    if (acct.isAdmin) {
      await writeDoc('admins', acct.uid, {
        uid: acct.uid,
        email: acct.email,
        grantedAt: new Date().toISOString(),
        role: 'superadmin',
      });
    }
  }
  console.log(`\x1b[32m✓\x1b[0m Created ${DEMO_ACCOUNTS.length} Auth personas.\n`);

  // 3. Seed Organisations
  console.log('Seeding Organisations...');
  const organisations = [
    {
      id: 'demo_org_donor_campus',
      name: 'Central University Dining Services',
      type: 'donor',
      status: 'approved',
      address: 'North Campus Main Dining Quad, Bay 1',
      contactPhone: '+91 98765 43210',
      contactEmail: 'dining@campus.edu',
      fssaiRegistration: 'FSSAI-1202300189',
      verifiedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_ngo_citycare',
      name: 'City Care Food Welfare Foundation',
      type: 'recipient_org',
      status: 'approved',
      address: 'Sector 4 Community Welfare Center',
      contactPhone: '+91 98111 22233',
      contactEmail: 'contact@citycarewelfare.org',
      fssaiRegistration: 'FSSAI-NGO-2022091',
      verifiedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_mess_north',
      name: 'North Campus Mess 3 Cleaning Station',
      type: 'donor',
      subType: 'mess',
      status: 'approved',
      address: 'Hostel Complex Block C',
      contactPhone: '+91 98222 33344',
      contactEmail: 'mess3@campus.edu',
      verifiedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_farm_greenmeadow',
      name: 'Green Meadow Dairy Gaushala',
      type: 'farm',
      status: 'approved',
      address: 'Outer Ring Rural Belt Plot 14',
      contactPhone: '+91 98333 44455',
      contactEmail: 'gaushala@greenmeadow.org',
      verifiedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_compost_ecobio',
      name: 'EcoBio Biomethanation & Soil Facility',
      type: 'compost',
      status: 'approved',
      address: 'Municipal Solid Waste Processing Zone, Dock 5',
      contactPhone: '+91 98444 55566',
      contactEmail: 'ops@ecobiofacility.org',
      verifiedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_unverified',
      name: 'Hope Community Shelter (Pending)',
      type: 'recipient_org',
      status: 'pending',
      address: 'Old Town Railway Colony',
      contactPhone: '+91 98555 66677',
      contactEmail: 'shelter@hopecommunity.org',
      submittedAt: new Date().toISOString(),
    },
    {
      id: 'demo_org_suspended',
      name: 'Flagged Commercial Reseller',
      type: 'donor',
      status: 'suspended',
      address: 'Industrial Warehouse 8',
      suspensionReason: 'Commercial resale violation under platform policy G14',
      suspendedAt: new Date().toISOString(),
    },
  ];

  for (const org of organisations) {
    const { id, ...data } = org;
    await writeDoc('organisations', id, { ...data, updatedAt: new Date().toISOString() });
  }
  console.log(`\x1b[32m✓\x1b[0m Created ${organisations.length} organisations.\n`);

  // 4. Seed Memberships
  console.log('Seeding Memberships...');
  for (const acct of DEMO_ACCOUNTS) {
    if (acct.orgId) {
      const membershipId = `${acct.uid}_${acct.orgId}`;
      await writeDoc('memberships', membershipId, {
        userId: acct.uid,
        orgId: acct.orgId,
        role: acct.role === 'admin' ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
      });
    }
  }
  console.log(`\x1b[32m✓\x1b[0m Linked memberships.\n`);

  // 5. Seed Multi-Tier Listings
  console.log('Seeding Multi-Tier Food Listings...');
  const listings = [
    // Tier 1: Human Redistribution
    {
      id: 'demo_listing_human_001',
      title: 'Freshly Cooked Toor Dal & Steamed Basmati Rice',
      donorOrgId: 'demo_org_donor_campus',
      donorOrgName: 'Central University Dining Services',
      foodCategory: 'Cooked Meals',
      routeTier: 'human',
      quantity: 45,
      unit: 'kg',
      servings: 110,
      packaging: 'Sealed food-grade thermal containers',
      prepTime: new Date(Date.now() - 3600000).toISOString(),
      useBy: new Date(Date.now() + 14400000).toISOString(), // 4h window
      pickupAddress: 'North Campus Main Dining Quad, Bay 1',
      pickupWindow: 'Today within 3 hours',
      temperatureLog: 'Kept above 65°C hot hold',
      status: 'published',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_listing_human_002',
      title: 'Warm Vegetable Pulao & Raita Pots',
      donorOrgId: 'demo_org_donor_campus',
      donorOrgName: 'Central University Dining Services',
      foodCategory: 'Cooked Meals',
      routeTier: 'human',
      quantity: 30,
      unit: 'kg',
      servings: 75,
      packaging: 'Insulated stainless carrier trays',
      prepTime: new Date(Date.now() - 7200000).toISOString(),
      useBy: new Date(Date.now() + 10800000).toISOString(),
      pickupAddress: 'North Campus Dining Quad, Bay 2',
      pickupWindow: 'Evening 18:30 – 20:30',
      temperatureLog: 'Maintained at 68°C',
      status: 'published',
      createdAt: new Date().toISOString(),
    },
    // Tier 2: Cattle / Animal Feed
    {
      id: 'demo_listing_animal_001',
      title: 'Segregated Fresh Vegetable Peels & Trimmings',
      donorOrgId: 'demo_org_mess_north',
      donorOrgName: 'North Campus Mess 3 Cleaning Station',
      foodCategory: 'Raw Veg Scraps',
      routeTier: 'animal',
      feedGrade: 'Cattle/Livestock Qualified',
      quantity: 80,
      unit: 'kg',
      packaging: 'Heavy duty HDPE crates',
      pickupAddress: 'Rear Loading Dock, Kitchen Bay 4',
      pickupWindow: 'Morning 07:00 – 10:00 Daily',
      safetyDeclaration: 'Zero onion/garlic/spices. Pure raw carrot, cabbage, potato trimmings.',
      status: 'published',
      createdAt: new Date().toISOString(),
    },
    // Tier 3: Compost / Biogas
    {
      id: 'demo_listing_organic_001',
      title: 'Post-Meal Mixed Plate Organics & Kitchen Scraps',
      donorOrgId: 'demo_org_mess_north',
      donorOrgName: 'North Campus Mess 3 Cleaning Station',
      foodCategory: 'Organic Waste',
      routeTier: 'organic',
      compatibility: 'Anaerobic Biogas Digestion & Thermal Composting',
      quantity: 120,
      unit: 'kg',
      pickupAddress: 'Hostel Complex Solid Waste Bay',
      pickupWindow: 'Nightly 21:30 – 23:00',
      status: 'published',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const listing of listings) {
    const { id, ...data } = listing;
    await writeDoc('listings', id, data);
  }
  console.log(`\x1b[32m✓\x1b[0m Seeded ${listings.length} listings across Human, Animal, and Organic route tiers.\n`);

  // 6. Seed Mess Waste Analytics Records
  console.log('Seeding Mess Production Records...');
  const messRecords = [
    {
      id: 'demo_mess_rec_001',
      orgId: 'demo_org_mess_north',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      mealType: 'lunch',
      plannedCount: 450,
      actualCount: 410,
      preparedQty: 180,
      leftoverQty: 22,
      divertedToRescueQty: 18,
      divertedToCompostQty: 4,
      loggedBy: 'demo_user_mess_001',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo_mess_rec_002',
      orgId: 'demo_org_mess_north',
      date: new Date().toISOString().split('T')[0],
      mealType: 'breakfast',
      plannedCount: 380,
      actualCount: 375,
      preparedQty: 120,
      leftoverQty: 6,
      divertedToRescueQty: 6,
      divertedToCompostQty: 0,
      loggedBy: 'demo_user_mess_001',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const rec of messRecords) {
    const { id, ...data } = rec;
    await writeDoc('messRecords', id, data);
  }
  console.log(`\x1b[32m✓\x1b[0m Seeded ${messRecords.length} mess records.\n`);

  // 7. Seed Impact Factors & Audit Events
  console.log('Seeding Impact Factors & Audit Trail...');
  await writeDoc('impactFactors', 'default', {
    co2KgPerKgFood: 2.5,
    waterLitersPerKgFood: 420,
    mealsPerKgFood: 2.5,
    lastReviewed: new Date().toISOString(),
  });

  await writeDoc('auditEvents', 'demo_audit_001', {
    action: 'DEMO_SANDBOX_INITIALIZED',
    actorUid: 'system',
    targetId: PROJECT_ID,
    timestamp: new Date().toISOString(),
    details: 'Demo test environment populated with standard personas and listings.',
  });

  console.log(`\x1b[32m✓\x1b[0m Impact factors and audit events configured.\n`);

  console.log(`\x1b[32m====================================================\x1b[0m`);
  console.log(`\x1b[32m Demo Sandbox Seeding Completed Successfully!        \x1b[0m`);
  console.log(`====================================================\n`);
  console.log('Standard Demo Credentials (all password: "Password123!"):');
  console.log('  Donor:         donor.demo@foodbridge.local');
  console.log('  Recipient NGO: ngo.demo@foodbridge.local');
  console.log('  Mess Operator: mess.demo@foodbridge.local');
  console.log('  Cattle Farm:   farm.demo@foodbridge.local');
  console.log('  Compost Plant: compost.demo@foodbridge.local');
  console.log('  Platform Admin:admin.demo@foodbridge.local');
  console.log('  Pending NGO:   unverified.demo@foodbridge.local');
  console.log('  Suspended Org: suspended.demo@foodbridge.local\n');
}

seed().catch((err) => {
  console.error('\x1b[31m[Demo Seed Failed]:\x1b[0m', err.message);
  process.exit(1);
});
