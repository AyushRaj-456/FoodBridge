/**
 * FoodBridge — Home Page Centralized Sample Data Source
 *
 * NOTE FOR FUTURE BACKEND INTEGRATION:
 * All statistics, live feed events, map transit nodes, and partner placeholders
 * are consolidated in this single file. When connecting live Firestore listeners,
 * simply replace these static exports or wrap them in dynamic hooks without
 * modifying the presentation components.
 */

// ============================================================================
// 1. PUBLIC LIVE ACTIVITY METRICS
// ============================================================================
// === REPLACE WITH DYNAMIC FIRESTORE QUERY WHEN READY ===
// e.g., aggregate sums from 'listings' (status == 'completed') and 'organisations'
export const HOME_STATS = {
  mealsShared: {
    value: '14,820+',
    label: 'Meals Shared',
    changeNote: '+340 this week',
  },
  ngosConnected: {
    value: '48',
    label: 'Reviewed NGOs',
    changeNote: 'Active in 6 city zones',
  },
  activePickups: {
    value: '6',
    label: 'Pickups in Progress',
    changeNote: 'Live right now',
  },
  kgFoodSaved: {
    value: '4,940 kg',
    label: 'Food Rescued',
    changeNote: 'Prevented from waste',
  },
};

// ============================================================================
// 2. RECENT ANONYMIZED LIVE ACTIVITY FEED
// ============================================================================
// === REPLACE WITH DYNAMIC FIRESTORE QUERY WHEN READY ===
// e.g., collection('audit_events').where('action', 'in', ['claim', 'handover']).limit(5)
export const HOME_RECENT_ACTIVITY = [
  {
    id: 'act-01',
    foodSummary: '18 kg of cooked meals',
    donorArea: 'North Campus Area',
    recipientType: 'Local Shelter',
    timeAgo: '12 minutes ago',
    status: 'Picked up',
    statusColor: 'success',
  },
  {
    id: 'act-02',
    foodSummary: '25 kg of fresh bread & produce',
    donorArea: 'Central Bakery District',
    recipientType: 'Community Kitchen',
    timeAgo: '34 minutes ago',
    status: 'Claimed • En route',
    statusColor: 'pending',
  },
  {
    id: 'act-03',
    foodSummary: '40 portions of steamed rice & dal',
    donorArea: 'Engineering Mess B',
    recipientType: 'Youth Home',
    timeAgo: '1 hour ago',
    status: 'Completed',
    statusColor: 'success',
  },
  {
    id: 'act-04',
    foodSummary: '12 kg safe organic greens',
    donorArea: 'Hostel Dining Hall 3',
    recipientType: 'Animal Sanctuary',
    timeAgo: '2 hours ago',
    status: 'Delivered',
    statusColor: 'success',
  },
];

// ============================================================================
// 3. STYLIZED SVG MAP NODES & ACTIVE TRANSIT ROUTES
// ============================================================================
// Coordinates are calibrated on a 700 x 360 SVG coordinate grid.
// ALL LOCATIONS ARE APPROXIMATE DISTRICTS ONLY. No private addresses.
// === REPLACE WITH DYNAMIC FIRESTORE QUERY WHEN READY ===
export const HOME_MAP_DATA = {
  // Donor hubs (green pulsing circles)
  donors: [
    {
      id: 'd-1',
      name: 'North Campus Mess Hub',
      district: 'North Campus Sector B',
      x: 160,
      y: 110,
      activeOffer: '18 kg rice & curry',
    },
    {
      id: 'd-2',
      name: 'Central Dining Hall',
      district: 'Central University Ward',
      x: 350,
      y: 180,
      activeOffer: '22 kg dinner surplus',
    },
    {
      id: 'd-3',
      name: 'East Wing Cafeteria',
      district: 'East Tech Park Area',
      x: 520,
      y: 100,
      activeOffer: '15 kg baked items',
    },
  ],

  // Recipient shelters & community kitchens (amber/teal circles)
  recipients: [
    {
      id: 'r-1',
      name: 'City Youth Shelter',
      district: 'Civic Center Ward',
      x: 230,
      y: 260,
      capacity: '60 meals/day',
    },
    {
      id: 'r-2',
      name: 'Seva Relief Kitchen',
      district: 'Old Town Community Block',
      x: 440,
      y: 280,
      capacity: '120 meals/day',
    },
    {
      id: 'r-3',
      name: 'Green Valley Cattle Farm',
      district: 'Valley Green Belt',
      x: 600,
      y: 220,
      capacity: 'Organic feed depot',
    },
  ],

  // Active transit routes connecting donor -> recipient
  routes: [
    {
      id: 'rt-1',
      from: 'd-1',
      to: 'r-1',
      pathD: 'M 160 110 Q 180 200 230 260',
      label: '18 kg in transit',
      duration: '4s',
    },
    {
      id: 'rt-2',
      from: 'd-2',
      to: 'r-2',
      pathD: 'M 350 180 Q 400 220 440 280',
      label: '22 kg in transit',
      duration: '5s',
    },
    {
      id: 'rt-3',
      from: 'd-3',
      to: 'r-3',
      pathD: 'M 520 100 Q 570 150 600 220',
      label: 'Safe greens in transit',
      duration: '4.5s',
    },
  ],
};

// ============================================================================
// 4. TRUSTED PLACEHOLDER PARTNERS (UNDER HERO)
// ============================================================================
export const HOME_TRUSTED_PARTNERS = [
  'Central Hostel Mess (Sample)',
  'City Youth Shelter (Sample)',
  'Green Valley Farm (Sample)',
  'Seva Relief Kitchen (Sample)',
  'St. Jude Care Center (Sample)',
];

// ============================================================================
// 5. HOW IT WORKS STEPS
// ============================================================================
export const HOME_HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Post extra food in 60s',
    description:
      'Kitchen staff post extra prepared meals or fresh ingredients with portion estimates, diet tags, and safe pickup hours.',
    badge: 'For Kitchens & Messes',
  },
  {
    step: '2',
    title: 'Reviewed local NGO claims it',
    description:
      'Nearby verified shelters receive instant alerts and claim matching quantities based on their real daily capacity.',
    badge: 'Smart Matching',
  },
  {
    step: '3',
    title: 'Clean pickup & safe handover',
    description:
      'Volunteer arrives within the scheduled time window, checks packaging, and confirms collection with a single tap.',
    badge: 'Verified Handover',
  },
];

// ============================================================================
// 6. ROLE BENEFITS (TABS: DONORS VS NGOS)
// ============================================================================
export const HOME_BENEFITS = {
  donors: {
    heading: 'Designed for fast-paced campus & commercial kitchens',
    subheading:
      'Post surplus with minimal effort. Keep exact kitchen doors private until verified pickup.',
    points: [
      {
        title: 'Zero kitchen distraction',
        description:
          'Post extra food in under a minute directly from a phone or tablet. No photo uploads required.',
      },
      {
        title: 'Guaranteed privacy & control',
        description:
          'Exact kitchen bays and phone numbers are hidden from public view until an approved shelter claims.',
      },
      {
        title: 'Actionable mess analytics',
        description:
          'Track monthly kg saved, identify preparation patterns, and optimize future batch sizes over time.',
      },
    ],
    ctaLabel: 'Share extra food',
    targetRole: 'donor',
  },
  ngos: {
    heading: 'Reliable, dignified food supply for local shelters',
    subheading:
      'Know what food is coming before your volunteers head out. No surprises, no wasted trips.',
    points: [
      {
        title: 'Instant local surplus alerts',
        description:
          'Get notified the moment nearby kitchens have surplus that matches your dining shelter capacity.',
      },
      {
        title: 'Clear food details & diet tags',
        description:
          'See exact portion counts, vegetarian or allergen details, and preparation times before claiming.',
      },
      {
        title: 'Scheduled handover windows',
        description:
          'Collect food smoothly within agreed timeframes without volunteers waiting in long lines.',
      },
    ],
    ctaLabel: 'Join as an NGO',
    targetRole: 'recipient',
  },
};

// ============================================================================
// 7. SAFETY & TRUST ACCORDIONS
// ============================================================================
export const HOME_SAFETY_POINTS = [
  {
    id: 'safety-1',
    title: 'Strict safe consumption time windows',
    summary: 'Every donation has a clear, non-negotiable safe-to-serve deadline.',
    detail:
      'Donors set safe pickup windows (typically 1 to 3 hours from preparation). If a listing is not claimed before the pickup deadline ends, it closes automatically to guarantee that all distributed meals are safe, fresh, and wholesome.',
  },
  {
    id: 'safety-2',
    title: 'Community review & partner screening',
    summary: 'Only reviewed welfare organizations and shelters can claim meals.',
    detail:
      'Our team reviews every participating NGO, shelter home, and farm prior to authorizing claims. We confirm physical premises, safe food handling capacity, and active community feeding programs to maintain high accountability.',
  },
  {
    id: 'safety-3',
    title: 'Privacy by design: coarse location only',
    summary: 'Exact kitchen bays and contact numbers are never shown publicly.',
    detail:
      'Public visitors only see approximate district or neighborhood tags. Exact kitchen loading bay numbers, dispatch floor doors, and staff phone numbers are unlocked solely for the specific verified volunteer collecting the food.',
  },
  {
    id: 'safety-4',
    title: 'Three-tier waste hierarchy routing',
    summary: 'Human nourishment first, followed by animal feed and clean composting.',
    detail:
      'If surplus is not suitable for human consumption (such as vegetable peels, preparation trimmings, or day-old grain), our system routes it directly to verified cattle shelters (gaushalas) or clean composting facilities, ensuring zero food reaches landfills.',
  },
];

// ============================================================================
// 8. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDIONS)
// ============================================================================
export const HOME_FAQS = [
  {
    id: 'faq-1',
    question: 'Who can donate food on FoodBridge?',
    answer:
      'Any college mess, hostel dining hall, restaurant, caterer, corporate cafeteria, or event organizer with clean, untouched surplus meals or fresh ingredients can register as a donor.',
  },
  {
    id: 'faq-2',
    question: 'How quickly is food claimed and picked up?',
    answer:
      'Most food donations are claimed by nearby shelters within 15 to 30 minutes of posting. Volunteers arrive within the scheduled pickup window set by the donor kitchen.',
  },
  {
    id: 'faq-3',
    question: 'Can individuals claim food, or only registered organizations?',
    answer:
      'To guarantee food safety and equitable community distribution, only reviewed welfare organizations, registered shelter homes, and community kitchens can claim and distribute meals.',
  },
  {
    id: 'faq-4',
    question: 'What happens to food that cannot be served to people?',
    answer:
      'Untouched food preparation scraps, extra greens, and safe grains are routed to verified animal welfare shelters (cattle farms/gaushalas) or local composting facilities so nothing is wasted.',
  },
  {
    id: 'faq-5',
    question: 'Is there any fee or subscription cost to use FoodBridge?',
    answer:
      'No. FoodBridge is completely free for food donors and verified welfare organizations. We are a community-driven initiative focused on preventing waste and nourishing communities.',
  },
  {
    id: 'faq-6',
    question: 'Are donor addresses and phone numbers visible to everyone?',
    answer:
      'No. Public listings only show approximate neighborhood areas. Full pickup instructions and coordinator contact numbers are unlocked exclusively to the verified organization that claims that specific meal.',
  },
];
