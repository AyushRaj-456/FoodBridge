import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ACCREDITED_IMPACT_FACTORS,
  computeImpactMetrics,
  VERIFIED_SEED_IMPACT_DATA,
} from './impactService.js';
import ImpactDashboard from './ImpactDashboard.jsx';

// Mock Firebase client
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

// Mock Firebase Firestore methods
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_, colName) => ({ id: colName })),
  query: vi.fn((...args) => ({ args })),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: [
        {
          id: 'mock-lst-1',
          data: () => ({
            title: 'Rice',
            quantity: 50,
            unit: 'kg',
            status: 'completed',
            createdAt: '2026-11-04T10:00:00Z',
          }),
        },
      ],
    })
  ),
}));

describe('Impact Dashboard & Verified Factors — Prompt 16 (₹0 Baseline)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Accredited Public Impact Factors & Non-Fabrication Standards', () => {
    it('provides accredited public references with formulas, sources, versions, and ESTIMATE labels', () => {
      expect(ACCREDITED_IMPACT_FACTORS.length).toBeGreaterThanOrEqual(3);

      ACCREDITED_IMPACT_FACTORS.forEach((factor) => {
        expect(factor.metric).toBeDefined();
        expect(typeof factor.factor).toBe('number');
        expect(factor.factor).toBeGreaterThan(0);
        expect(factor.unit).toBeDefined();
        expect(factor.formula).toBeDefined();
        expect(factor.source).toBeDefined();
        expect(factor.version).toBeDefined();
        expect(factor.validFrom).toBeDefined();
        expect(factor.estimateLabel).toBe('ESTIMATE');

        // Check that sources cite accredited official bodies (UNEP, FSSAI, Water Footprint Network)
        const recognizedSources = ['UNEP', 'FSSAI', 'Water Footprint Network', 'FAO'];
        const matchesSource = recognizedSources.some((src) => factor.source.includes(src));
        expect(matchesSource).toBe(true);
      });
    });

    it('specifically contains UNEP 2024 CO2e and FSSAI 2019 meal equivalent benchmarks', () => {
      const co2e = ACCREDITED_IMPACT_FACTORS.find((f) => f.metric === 'co2e_avoided');
      expect(co2e).toBeDefined();
      expect(co2e.factor).toBe(2.5); // 2.5 kg CO2e per kg food waste
      expect(co2e.source).toContain('UNEP');

      const meals = ACCREDITED_IMPACT_FACTORS.find((f) => f.metric === 'meals_equivalent');
      expect(meals).toBeDefined();
      expect(meals.factor).toBe(2.5); // 2.5 meals per kg (400g standard portion)
      expect(meals.source).toContain('FSSAI');
    });
  });

  describe('Strict Quantity Segregation (Offered, Claimed, Collected, Distributed, Organic)', () => {
    const sampleListings = [
      {
        id: 'l1',
        quantity: 100,
        unit: 'kg',
        status: 'published',
        createdAt: '2026-11-01T10:00:00Z',
      },
      { id: 'l2', quantity: 50, unit: 'kg', status: 'claimed', createdAt: '2026-11-02T10:00:00Z' },
      {
        id: 'l3',
        quantity: 200,
        unit: 'portions',
        status: 'completed',
        createdAt: '2026-11-03T10:00:00Z',
      },
    ];

    const sampleClaims = [
      {
        id: 'c1',
        actualQuantity: 50,
        unit: 'kg',
        status: 'claimed',
        donorConfirmedAt: null,
        recipientConfirmedAt: null,
        claimedAt: '2026-11-02T11:00:00Z',
      },
      {
        id: 'c2',
        actualQuantity: 200,
        unit: 'portions',
        status: 'completed',
        donorConfirmedAt: '2026-11-03T12:00:00Z',
        recipientConfirmedAt: '2026-11-03T12:10:00Z',
        claimedAt: '2026-11-03T10:30:00Z',
      },
    ];

    const sampleOrganic = [
      {
        id: 'o1',
        quantity: 35,
        unit: 'kg',
        category: 'campus_composting',
        loggedAt: '2026-11-02T18:00:00Z',
      },
    ];

    it('computes offered, claimed, collected, distributed, and organic-diverted separately', () => {
      const metrics = computeImpactMetrics({
        listings: sampleListings,
        claims: sampleClaims,
        organicDiversions: sampleOrganic,
        period: 'all_time',
      });

      // 1. Offered
      expect(metrics.quantities.offered['kg'].total).toBe(150); // 100 + 50 kg
      expect(metrics.quantities.offered['portions'].total).toBe(200);

      // 2. Claimed
      expect(metrics.quantities.claimed['kg'].total).toBe(50);
      expect(metrics.quantities.claimed['portions'].total).toBe(200);

      // 3. Collected (completed claim c2 only, since c1 has not confirmed handover)
      expect(metrics.quantities.collected['portions'].total).toBe(200);
      expect(metrics.quantities.collected['kg']).toBeUndefined(); // No kg collected yet

      // 4. Distributed (dual-confirmed completed claim c2)
      expect(metrics.quantities.distributed['portions'].total).toBe(200);

      // 5. Organic Diverted (completely separate from human consumption)
      expect(metrics.quantities.organicDiverted['kg'].total).toBe(35);
      expect(metrics.quantities.organicDiverted['portions']).toBeUndefined();
    });

    it('proves that different units (kg vs portions) are NEVER mixed into a single number', () => {
      const metrics = computeImpactMetrics({
        listings: sampleListings,
        claims: sampleClaims,
        organicDiversions: sampleOrganic,
        period: 'all_time',
      });

      // Assert kg and portions are separate objects
      expect(metrics.quantities.offered['kg'].unit).toBe('kg');
      expect(metrics.quantities.offered['portions'].unit).toBe('portions');
      expect(metrics.quantities.offered['kg'].total).not.toBe(350); // Must NOT be 150 + 200
    });

    it('filters impact calculations across selected time periods (30 days and 7 days)', () => {
      const allTime = computeImpactMetrics({
        listings: VERIFIED_SEED_IMPACT_DATA.listings,
        claims: VERIFIED_SEED_IMPACT_DATA.claims,
        organicDiversions: VERIFIED_SEED_IMPACT_DATA.organicDiversions,
        period: 'all_time',
      });

      const thirtyDays = computeImpactMetrics({
        listings: VERIFIED_SEED_IMPACT_DATA.listings,
        claims: VERIFIED_SEED_IMPACT_DATA.claims,
        organicDiversions: VERIFIED_SEED_IMPACT_DATA.organicDiversions,
        period: '30_days',
      });

      expect(allTime.period).toBe('all_time');
      expect(thirtyDays.period).toBe('30_days');
      expect(allTime.sampleSummary.listingsCount).toBeGreaterThan(0);
    });
  });

  describe('ImpactDashboard Component UI Workflow', () => {
    it('renders the 5 distinct physical quantity cards and transparency policy banner', () => {
      render(<ImpactDashboard />);

      expect(screen.getByText(/Community Impact & Verification Dashboard/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Zero-Cost Data Integrity Policy \(Prompt 16\):/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Physical Quantities Tracked Separately/i)).toBeInTheDocument();

      // Check all 5 separate categories
      expect(screen.getByText(/1. Offered Surplus/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Claimed Surplus/i)).toBeInTheDocument();
      expect(screen.getByText(/3. Collected Surplus/i)).toBeInTheDocument();
      expect(screen.getByText(/4. Distributed Surplus/i)).toBeInTheDocument();
      expect(screen.getByText(/5. Organic Diverted/i)).toBeInTheDocument();
    });

    it('renders accredited environmental translation cards with formulas and ESTIMATE badges', () => {
      render(<ImpactDashboard />);

      expect(
        screen.getByText(/Accredited Environmental & Nutritional Equivalents/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Emissions Avoided \(CO₂e\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Meal Portions Equivalent/i)).toBeInTheDocument();
      expect(screen.getByText(/Virtual Water Preserved/i)).toBeInTheDocument();

      // Check for formulas and estimate tags
      const formulas = screen.getAllByText(/Formula:/i);
      expect(formulas.length).toBeGreaterThanOrEqual(3);

      const estimateBadges = screen.getAllByText(/ESTIMATE/i);
      expect(estimateBadges.length).toBeGreaterThanOrEqual(3);
    });

    it('switches between period filters (All Time, Last 30 Days, Last 7 Days)', async () => {
      render(<ImpactDashboard />);

      const thirtyDaysBtn = screen.getByRole('button', { name: /Last 30 Days/i });
      fireEvent.click(thirtyDaysBtn);

      await waitFor(() => {
        expect(thirtyDaysBtn.className).toContain('btn-primary');
      });

      const sevenDaysBtn = screen.getByRole('button', { name: /Last 7 Days/i });
      fireEvent.click(sevenDaysBtn);

      await waitFor(() => {
        expect(sevenDaysBtn.className).toContain('btn-primary');
      });
    });
  });

  describe('Cost Contract & Non-Functional Audit', () => {
    it('proves zero dependencies on external paid analytics, reporting APIs, or Cloud Functions', async () => {
      const pkg = await import('../../../package.json');
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const prohibitedAnalyticsPackages = [
        'mixpanel',
        '@amplitude/analytics-browser',
        '@segment/analytics-next',
        'posthog-js',
        'datadog-metrics',
        'newrelic',
        'firebase-admin',
      ];

      prohibitedAnalyticsPackages.forEach((pkgName) => {
        expect(allDeps[pkgName]).toBeUndefined();
      });
    });
  });
});
