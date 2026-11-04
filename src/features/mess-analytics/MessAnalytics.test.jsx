import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  MEASUREMENT_METHODS,
  createMessRecord,
  fetchMessRecordsPaginated,
  computeMessAnalytics,
} from './messService.js';
import MessShell from './MessShell.jsx';

// Mock Firebase client
vi.mock('../../lib/firebase.js', () => ({
  db: { _mock: true },
}));

// Mock useAuth
vi.mock('../auth/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'op-1', displayName: 'Chef Raman', email: 'chef@campus.edu' },
    profile: { orgId: 'org-campus-mess', role: 'mess_operator' },
  })),
}));

// Mock Firebase Firestore methods
vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn((_, colName) => ({ id: colName })),
    doc: vi.fn((_, colName, id) => ({ id: id || 'doc-id', path: `${colName}/${id || 'doc-id'}` })),
    addDoc: vi.fn(() => Promise.resolve({ id: 'rec-test-101' })),
    getDocs: vi.fn(() =>
      Promise.resolve({
        docs: [
          {
            id: 'mock-rec-1',
            data: () => ({
              orgId: 'org-test-mess',
              mealDate: '2026-11-04',
              mealType: 'lunch',
              dishName: 'Rice & Dal',
              preparedQty: 100,
              preparedMethod: 'measured',
              servedQty: 90,
              servedMethod: 'measured',
              leftoverQty: 10,
              leftoverMethod: 'measured',
              unit: 'kg',
              peopleServed: 250,
              peopleMethod: 'measured',
              enteredBy: 'Operator',
            }),
          },
          {
            id: 'mock-rec-2',
            data: () => ({
              orgId: 'org-test-mess',
              mealDate: '2026-11-03',
              mealType: 'dinner',
              dishName: 'Khichdi',
              preparedQty: 50,
              preparedMethod: 'measured',
              servedQty: null, // Missing data
              servedMethod: null,
              leftoverQty: 8,
              leftoverMethod: 'derived',
              unit: 'kg',
              peopleServed: null, // Missing headcount
              peopleMethod: null,
              enteredBy: 'Operator',
            }),
          },
        ],
      })
    ),
    query: vi.fn((...args) => ({ args })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    limit: vi.fn((lim) => ({ lim })),
    startAfter: vi.fn((cursor) => ({ cursor })),
    serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
  };
});

describe('Mess Records & Descriptive Analytics — Prompt 14 (₹0 Baseline)', () => {
  const mockUser = { uid: 'op-1', displayName: 'Chef Raman', email: 'chef@campus.edu' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mess Record Creation & Data Integrity', () => {
    it('creates mess production record with explicit units and measurement methods', async () => {
      const { addDoc } = await import('firebase/firestore');

      const result = await createMessRecord({
        orgId: 'org-campus-mess',
        user: mockUser,
        mealDate: '2026-11-04',
        mealType: 'lunch',
        dishName: 'Rajma Chawal',
        preparedQty: 80,
        preparedMethod: MEASUREMENT_METHODS.MEASURED,
        servedQty: 72.5,
        servedMethod: MEASUREMENT_METHODS.MEASURED,
        leftoverQty: 7.5,
        leftoverMethod: MEASUREMENT_METHODS.DERIVED,
        unit: 'kg',
        peopleServed: 210,
        peopleMethod: MEASUREMENT_METHODS.MEASURED,
        notes: 'Regular lunch service',
      });

      expect(result.id).toBe('rec-test-101');
      expect(addDoc).toHaveBeenCalledTimes(1);

      const payload = addDoc.mock.calls[0][1];
      expect(payload.orgId).toBe('org-campus-mess');
      expect(payload.mealType).toBe('lunch');
      expect(payload.dishName).toBe('Rajma Chawal');
      expect(payload.preparedQty).toBe(80);
      expect(payload.preparedMethod).toBe('measured');
      expect(payload.servedQty).toBe(72.5);
      expect(payload.leftoverQty).toBe(7.5);
      expect(payload.leftoverMethod).toBe('derived');
      expect(payload.unit).toBe('kg');
      expect(payload.peopleServed).toBe(210);
    });

    it('enforces that missing data is recorded as null and NEVER 0', async () => {
      const { addDoc } = await import('firebase/firestore');

      await createMessRecord({
        orgId: 'org-campus-mess',
        user: mockUser,
        mealDate: '2026-11-04',
        mealType: 'dinner',
        dishName: 'Aloo Gobi',
        preparedQty: 40,
        servedQty: null, // Missing served
        leftoverQty: 5,
        unit: 'kg',
        peopleServed: null, // Missing headcount
      });

      const payload = addDoc.mock.calls[0][1];
      expect(payload.servedQty).toBeNull();
      expect(payload.servedQty).not.toBe(0);
      expect(payload.peopleServed).toBeNull();
      expect(payload.peopleServed).not.toBe(0);
    });

    it('rejects negative quantities and invalid inputs', async () => {
      await expect(
        createMessRecord({
          orgId: 'org-1',
          user: mockUser,
          mealDate: '2026-11-04',
          mealType: 'lunch',
          dishName: 'Food',
          preparedQty: -10,
          leftoverQty: 5,
          unit: 'kg',
        })
      ).rejects.toThrow(/non-negative number/i);

      await expect(
        createMessRecord({
          orgId: 'org-1',
          user: mockUser,
          mealDate: '2026-11-04',
          mealType: 'lunch',
          dishName: 'Food',
          preparedQty: 10,
          leftoverQty: -2,
          unit: 'kg',
        })
      ).rejects.toThrow(/non-negative number/i);

      await expect(
        createMessRecord({
          orgId: 'org-1',
          user: mockUser,
          mealDate: '2026-11-04',
          mealType: 'invalid_meal',
          dishName: 'Food',
          preparedQty: 10,
          leftoverQty: 2,
          unit: 'kg',
        })
      ).rejects.toThrow(/Invalid meal type/i);

      await expect(
        createMessRecord({
          orgId: 'org-1',
          user: mockUser,
          mealDate: '2026-11-04',
          mealType: 'lunch',
          dishName: 'Food',
          preparedQty: 10,
          leftoverQty: 2,
          unit: 'buckets', // Prohibited unit
        })
      ).rejects.toThrow(/Invalid unit/i);
    });
  });

  describe('Paginated Records Retrieval', () => {
    it('queries mess records with bounded page limit and cursor pagination', async () => {
      const { getDocs, limit, orderBy, where } = await import('firebase/firestore');

      const result = await fetchMessRecordsPaginated({
        orgId: 'org-test-mess',
        pageSize: 15,
        mealType: 'lunch',
      });

      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(where).toHaveBeenCalledWith('orgId', '==', 'org-test-mess');
      expect(where).toHaveBeenCalledWith('mealType', '==', 'lunch');
      expect(orderBy).toHaveBeenCalledWith('mealDate', 'desc');
      // limit is pageSize + 1 = 16 to check hasMore
      expect(limit).toHaveBeenCalledWith(16);
      expect(result.records).toHaveLength(2);
      expect(result.records[0].dishName).toBe('Rice & Dal');
    });
  });

  describe('Descriptive Analytics Engine (Missing Data & Unit Invariants)', () => {
    const testRecords = [
      {
        dishName: 'Poha',
        mealType: 'breakfast',
        preparedQty: 50,
        preparedMethod: 'measured',
        servedQty: 48,
        servedMethod: 'measured',
        leftoverQty: 2,
        leftoverMethod: 'measured',
        unit: 'kg',
        peopleServed: 200,
      },
      {
        dishName: 'Thali Meals',
        mealType: 'lunch',
        preparedQty: 100,
        preparedMethod: 'measured',
        servedQty: 85,
        servedMethod: 'derived',
        leftoverQty: 15,
        leftoverMethod: 'measured',
        unit: 'kg',
        peopleServed: 300,
      },
      {
        dishName: 'Kadhi Chawal',
        mealType: 'lunch',
        preparedQty: 60,
        preparedMethod: 'estimated',
        servedQty: null, // MISSING SERVED
        servedMethod: null,
        leftoverQty: 10,
        leftoverMethod: 'estimated',
        unit: 'kg',
        peopleServed: null, // MISSING DINERS
      },
      {
        dishName: 'Snack Samosas',
        mealType: 'snacks',
        preparedQty: 150,
        preparedMethod: 'measured',
        servedQty: 140,
        servedMethod: 'measured',
        leftoverQty: 10,
        leftoverMethod: 'measured',
        unit: 'portions', // SEPARATE UNIT
        peopleServed: 140,
      },
    ];

    it('proves missing data is not counted as zero in denominators', () => {
      const analytics = computeMessAnalytics(testRecords);

      const kgMetrics = analytics.unitMetrics['kg'];
      expect(kgMetrics).toBeDefined();

      // Total prepared in kg = 50 + 100 + 60 = 210
      expect(kgMetrics.totalPrepared).toBe(210);
      // Total leftover in kg = 2 + 15 + 10 = 27
      expect(kgMetrics.totalLeftover).toBe(27);
      // Surplus rate = (27 / 210) * 100 = 12.857... -> 12.9%
      expect(kgMetrics.surplusRate).toBe(12.9);

      // Total served = 48 + 85 = 133 kg. The third record is null, NOT 0.
      expect(kgMetrics.totalServed).toBe(133);
      expect(kgMetrics.servedSampleCount).toBe(2); // Only 2 records had servedQty

      // Average served per measured service = 133 / 2 = 66.5 kg
      // If missing was treated as 0, it would be 133 / 3 = 44.3 kg (diluted).
      expect(kgMetrics.avgServedPerService).toBe(66.5);
    });

    it('proves different units (kg vs portions) are strictly kept separate', () => {
      const analytics = computeMessAnalytics(testRecords);

      expect(analytics.unitMetrics['kg']).toBeDefined();
      expect(analytics.unitMetrics['portions']).toBeDefined();

      // Portions are NOT added to kg
      expect(analytics.unitMetrics['portions'].totalPrepared).toBe(150);
      expect(analytics.unitMetrics['portions'].totalLeftover).toBe(10);
      expect(analytics.unitMetrics['portions'].unit).toBe('portions');
    });

    it('separates measured, derived, and estimated records in quality audit', () => {
      const analytics = computeMessAnalytics(testRecords);

      expect(analytics.qualityMetrics.totalRecords).toBe(4);
      expect(analytics.qualityMetrics.missingServedCount).toBe(1);
      expect(analytics.qualityMetrics.missingPeopleCount).toBe(1);
      expect(analytics.qualityMetrics.estimatedCount).toBe(1);
      expect(analytics.qualityMetrics.derivedCount).toBe(1);
      expect(analytics.qualityMetrics.measuredCount).toBe(2);
    });

    it('calculates per-capita consumption only over complete pairs', () => {
      const analytics = computeMessAnalytics(testRecords);

      const perCapitaKg = analytics.perCapitaByUnit['kg'];
      // Valid complete pairs for kg: Record 1 (48kg / 200 people = 0.24), Record 2 (85kg / 300 people = 0.2833)
      // Average = (0.24 + 0.2833) / 2 = 0.262 kg/person
      expect(perCapitaKg.validSampleCount).toBe(2);
      expect(perCapitaKg.averagePerPerson).toBe(0.262);
    });
  });

  describe('MessShell UI Workflow', () => {
    it('renders KPI summary cards and data quality rules banner', () => {
      render(<MessShell activeTab="meal-entry" />);

      expect(screen.getByText(/Mess Waste & Production Records/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Quality Rules:/i)).toBeInTheDocument();
      expect(screen.getByText(/Missing data is recorded as/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Prepared \(kg\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Per-Diner Consumption/i)).toBeInTheDocument();
    });

    it('submits meal service form with missing values recorded as null', async () => {
      render(<MessShell activeTab="meal-entry" />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Dish \/ Menu Item \*/i), {
        target: { value: 'Dal Makhani & Naan' },
      });
      fireEvent.change(screen.getByLabelText(/Prepared Quantity \(kg\) \*/i), {
        target: { value: '75' },
      });
      fireEvent.change(screen.getByLabelText(/Unserved Leftover \(kg\) \*/i), {
        target: { value: '9' },
      });

      // Leave served and headcount empty to test missing data
      const submitBtn = screen.getByRole('button', { name: /Save Production Record/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Missing fields stored as null \(not zero\)/i)).toBeInTheDocument();
      });
    });

    it('renders paginated leftover records table with method badges and null indicators', () => {
      render(<MessShell activeTab="leftover-records" />);

      expect(screen.getByText(/Leftover Production Log/i)).toBeInTheDocument();
      expect(screen.getByText('Yellow Dal & Jeera Rice')).toBeInTheDocument();
      expect(screen.getByText('Poha & Masala Chai')).toBeInTheDocument();

      // Check method badges
      const measuredBadges = screen.getAllByText('Measured');
      expect(measuredBadges.length).toBeGreaterThan(0);

      // Check N/A for record with missing served quantity
      expect(screen.getByText('N/A (Missing)')).toBeInTheDocument();
    });

    it('filters records by meal type in history view', () => {
      render(<MessShell activeTab="leftover-records" />);

      const filterSelect = screen.getByLabelText(/Filter by Meal Type/i);
      fireEvent.change(filterSelect, { target: { value: 'breakfast' } });

      expect(screen.getByText('Poha & Masala Chai')).toBeInTheDocument();
      expect(screen.queryByText('Yellow Dal & Jeera Rice')).not.toBeInTheDocument();
    });

    it('renders descriptive analytics tab with dish-level patterns and sample size', () => {
      render(<MessShell activeTab="consumption-trends" />);

      expect(screen.getByText(/Descriptive Analytics & Surplus Patterns/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Quality & Integrity Audit/i)).toBeInTheDocument();
      expect(screen.getByText(/Directly Measured on Scale:/i)).toBeInTheDocument();
      expect(screen.getByText(/Mathematically Derived:/i)).toBeInTheDocument();
      expect(screen.getByText(/Visual \/ Operator Estimated:/i)).toBeInTheDocument();
    });

    it('renders 14-day minimum gated advisory forecast notice', () => {
      render(<MessShell activeTab="advisory-forecast" />);

      expect(
        screen.getByText(/Advisory Gated: Awaiting 14-Day Minimum Historical Data/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/FoodBridge does not fabricate predictive forecasts/i)
      ).toBeInTheDocument();
    });
  });
});
