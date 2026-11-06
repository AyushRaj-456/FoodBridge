import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  checkAdvisoryEligibility,
  computeStandardDeviation,
  generateAdvisoryForecasts,
  generate14DayHistoricalSeed,
} from './advisoryService.js';
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
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_, colName) => ({ id: colName })),
  doc: vi.fn((_, colName, id) => ({ id: id || 'doc-id' })),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-rec' })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn((...args) => ({ args })),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
}));

describe('Advisory Prediction & Moving Averages — Prompt 15 (₹0 Baseline)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Advisory Gating & Eligibility (14-Day Minimum Contract)', () => {
    it('gates predictions when fewer than 14 distinct days exist', () => {
      const records = [
        { mealDate: '2026-11-01', mealType: 'lunch', preparedQty: 100, leftoverQty: 10 },
        { mealDate: '2026-11-02', mealType: 'lunch', preparedQty: 100, leftoverQty: 10 },
        { mealDate: '2026-11-03', mealType: 'dinner', preparedQty: 80, leftoverQty: 8 },
      ];

      const eligibility = checkAdvisoryEligibility(records);
      expect(eligibility.isEligible).toBe(false);
      expect(eligibility.distinctDaysCount).toBe(3);
      expect(eligibility.minDaysRequired).toBe(14);
      expect(eligibility.dateStart).toBe('2026-11-01');
      expect(eligibility.dateEnd).toBe('2026-11-03');
    });

    it('un-gates advisory predictions when 14 or more distinct service days are logged', () => {
      const seed14 = generate14DayHistoricalSeed('org-test');
      const eligibility = checkAdvisoryEligibility(seed14);

      expect(eligibility.isEligible).toBe(true);
      expect(eligibility.distinctDaysCount).toBe(14);
      expect(eligibility.totalRecords).toBe(28); // 14 days x 2 meals
      expect(eligibility.dateStart).toBe('2026-10-21');
      expect(eligibility.dateEnd).toBe('2026-11-03');
    });
  });

  describe('Mathematical Helper: Standard Deviation & Uncertainty', () => {
    it('computes sample standard deviation accurately', () => {
      // values: [10, 12, 14, 16, 18], mean = 14
      // diffs: [-4, -2, 0, 2, 4], squared: [16, 4, 0, 4, 16] -> sum = 40
      // variance: 40 / 4 = 10 -> sqrt(10) ~ 3.16
      const stdDev = computeStandardDeviation([10, 12, 14, 16, 18]);
      expect(stdDev).toBe(3.16);
    });

    it('handles single value or empty inputs safely with 0 uncertainty', () => {
      expect(computeStandardDeviation([20])).toBe(0);
      expect(computeStandardDeviation([])).toBe(0);
    });
  });

  describe('Moving Averages & Weekday Patterns Engine', () => {
    it('returns isGated=true when historical days are insufficient', () => {
      const fewRecords = [
        { mealDate: '2026-11-01', mealType: 'lunch', preparedQty: 100, leftoverQty: 10 },
      ];
      const result = generateAdvisoryForecasts(fewRecords);
      expect(result.isGated).toBe(true);
      expect(result.weekdayPatterns).toEqual({});
    });

    it('generates weekday patterns, sample sizes, and uncertainty spreads for 14-day history', () => {
      const seed14 = generate14DayHistoricalSeed('org-test');
      const forecasts = generateAdvisoryForecasts(seed14);

      expect(forecasts.isGated).toBe(false);
      expect(forecasts.eligibility.distinctDaysCount).toBe(14);

      // Verify overall SMA
      expect(forecasts.overallSMA).toBeDefined();
      expect(forecasts.overallSMA.sampleSize).toBe(28);
      expect(forecasts.overallSMA.estimateLabel).toBe('ESTIMATE');
      expect(forecasts.overallSMA.avgPrepared).toBeGreaterThan(0);

      // Verify weekday patterns exist
      const weekdayNames = Object.keys(forecasts.weekdayPatterns);
      expect(weekdayNames.length).toBeGreaterThan(0);

      const firstWeekday = Object.values(forecasts.weekdayPatterns)[0];
      expect(firstWeekday.sampleSize).toBeGreaterThan(0);
      expect(firstWeekday.avgPrepared).toBeGreaterThan(0);
      expect(firstWeekday.estimateLabel).toBe('ESTIMATE');
      expect(typeof firstWeekday.leftoverUncertainty).toBe('number');

      // Verify dish-level batch prep recommendations
      expect(forecasts.dishRecommendations.length).toBeGreaterThan(0);
      const firstDish = forecasts.dishRecommendations[0];
      expect(firstDish.dishName).toBeDefined();
      expect(firstDish.suggestedPrep).toBeGreaterThan(0);
      expect(firstDish.estimateLabel).toBe('ESTIMATE');
      expect(firstDish.guidanceText).toContain('Consider scaling down');
    });
  });

  describe('Safety & Cost Invariant Enforcement', () => {
    it('strictly guarantees that forecasts NEVER create or publish confirmed listings', async () => {
      const seed14 = generate14DayHistoricalSeed('org-test');
      const forecasts = generateAdvisoryForecasts(seed14);

      // The service must return advisory data only
      expect(forecasts.disclaimer).toContain('Forecasts NEVER create confirmed surplus listings');
      expect(forecasts.overallSMA.estimateLabel).toBe('ESTIMATE');

      // Assert that no listing documents were created in the database during forecasting
      const { addDoc } = await import('firebase/firestore');
      expect(addDoc).not.toHaveBeenCalled();
    });

    it('proves zero dependencies on hosted ML or external generative APIs', async () => {
      const pkg = await import('../../../package.json');
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const prohibitedMLPackages = [
        '@google/generative-ai',
        '@google-cloud/aiplatform',
        'openai',
        'anthropic',
        'langchain',
        '@tensorflow/tfjs',
        'onnxruntime-node',
        'replicate',
        'cohere-ai',
      ];

      prohibitedMLPackages.forEach((pkgName) => {
        expect(allDeps[pkgName]).toBeUndefined();
      });
    });
  });

  describe('MessShell UI Workflow (Advisory Forecast Tab)', () => {
    it('displays 14-day data completeness gating prerequisite initially', () => {
      render(<MessShell activeTab="advisory-forecast" />);

      expect(screen.getByText(/Production Advisory & Forecasting/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Advisory Gated: Awaiting 14-Day Minimum Historical Data/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/FoodBridge does not fabricate predictive forecasts/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Load 14-Day Pilot History/i })
      ).toBeInTheDocument();
    });

    it('un-gates live moving averages and displays weekday patterns when 14-day history is loaded', () => {
      render(<MessShell activeTab="advisory-forecast" />);

      // Click "Load 14-Day Pilot History" button
      const loadBtn = screen.getByRole('button', { name: /Load 14-Day Pilot History/i });
      fireEvent.click(loadBtn);

      // Should now display active rolling model
      expect(screen.getByText(/Active 14-Day Rolling Model/i)).toBeInTheDocument();
      expect(screen.getByText(/Rolling 14-Day Average/i)).toBeInTheDocument();
      expect(screen.getByText(/Window:/i)).toBeInTheDocument();

      // Should render Safety Contract disclaimer
      expect(
        screen.getByText(/Forecasts never create confirmed surplus listings/i)
      ).toBeInTheDocument();

      // Should render Day-of-Week Moving Averages
      expect(
        screen.getByText(/Day-of-Week Moving Averages & Surplus Patterns/i)
      ).toBeInTheDocument();

      // Should render Dish-Specific Batch Scaling Guidance
      expect(screen.getByText(/Dish-Specific Batch Scaling Guidance/i)).toBeInTheDocument();

      // Multiple ESTIMATE labels displayed
      const estimateBadges = screen.getAllByText(/ESTIMATE/i);
      expect(estimateBadges.length).toBeGreaterThan(0);
    });

    it('allows resetting back to the baseline 5-record demo state', () => {
      render(<MessShell activeTab="advisory-forecast" />);

      // Load 14-day history
      fireEvent.click(screen.getByRole('button', { name: /Load 14-Day Pilot History/i }));
      expect(screen.getByText(/Active 14-Day Rolling Model/i)).toBeInTheDocument();

      // Reset
      fireEvent.click(screen.getByRole('button', { name: /Reset to Baseline Demo/i }));

      // Should be gated again
      expect(
        screen.getByText(/Advisory Gated: Awaiting 14-Day Minimum Historical Data/i)
      ).toBeInTheDocument();
    });
  });
});
