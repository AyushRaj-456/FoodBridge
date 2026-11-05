import { describe, it, expect } from 'vitest';
import {
  evaluateQuotaHealth,
  calculatePilotMetrics,
  getPilotStakeholderFeedback,
  PILOT_CONFIG,
} from '../../features/pilot/pilotService.js';

describe('Controlled Pilot Monitoring & Quota Headroom (Prompt 20 / ₹0 Spark)', () => {
  const sampleMessRecords = [
    {
      id: 'rec-01',
      dishName: 'Rice & Sambar',
      preparedQty: 100,
      servedQty: 90,
      leftoverQty: 10,
      unit: 'kg',
      peopleServed: 250,
    },
    {
      id: 'rec-02',
      dishName: 'Chapatis Pack',
      preparedQty: 80,
      servedQty: 70,
      leftoverQty: 10,
      unit: 'kg',
      peopleServed: 220,
    },
    {
      id: 'rec-03',
      dishName: 'Vegetable Pulao',
      preparedQty: 60,
      servedQty: null, // Missing served quantity preserved as null
      leftoverQty: 5,
      unit: 'kg',
      peopleServed: null, // Missing people served preserved as null
    },
    {
      id: 'rec-04',
      dishName: 'Dal Makhani',
      preparedQty: 50,
      servedQty: 45,
      leftoverQty: 5,
      unit: 'kg',
      peopleServed: 180,
    },
  ];

  const sampleListings = [
    { id: 'lst-p1', title: 'Surplus Rice', quantity: 20, unit: 'kg', status: 'completed' },
    { id: 'lst-p2', title: 'Surplus Chapatis', quantity: 15, unit: 'kg', status: 'completed' },
    { id: 'lst-p3', title: 'Surplus Pulao', quantity: 10, unit: 'kg', status: 'claimed' },
  ];

  const sampleClaims = [
    { id: 'clm-p1', listingId: 'lst-p1', status: 'completed', actualQuantity: 20, unit: 'kg' },
    { id: 'clm-p2', listingId: 'lst-p2', status: 'completed', actualQuantity: 15, unit: 'kg' },
  ];

  const sampleReports = [
    {
      id: 'rep-p1',
      category: 'Late Collection',
      description: 'Vehicle dispatch delayed by 10 mins due to campus gate verification.',
      status: 'resolved',
    },
  ];

  describe('Quota Headroom & Safety Pause Mechanism', () => {
    it('confirms safe operating state when quota usage is within normal baseline limits', () => {
      const health = evaluateQuotaHealth({
        dailyReads: 2410,
        dailyWrites: 680,
        monthlyHostingBytes: 385 * 1024 * 1024,
        storageBytes: 0,
      });

      expect(health.isSafe).toBe(true);
      expect(health.pauseTriggered).toBe(false);
      expect(health.headroom.readsHeadroomPercent).toBeGreaterThan(90);
      expect(health.headroom.writesHeadroomPercent).toBeGreaterThan(90);
      expect(health.warnings).toHaveLength(0);
    });

    it('emits advisory warning when daily reads exceed 70% threshold (35,000 reads)', () => {
      const health = evaluateQuotaHealth({
        dailyReads: 36000,
        dailyWrites: 500,
        monthlyHostingBytes: 100 * 1024 * 1024,
        storageBytes: 0,
      });

      expect(health.isSafe).toBe(true);
      expect(health.pauseTriggered).toBe(false);
      expect(health.warnings[0]).toContain('exceeded 70% advisory threshold');
    });

    it('triggers operational pause when daily reads reach 80% threshold (40,000 reads)', () => {
      const health = evaluateQuotaHealth({
        dailyReads: 41000,
        dailyWrites: 500,
        monthlyHostingBytes: 100 * 1024 * 1024,
        storageBytes: 0,
      });

      expect(health.isSafe).toBe(false);
      expect(health.pauseTriggered).toBe(true);
      expect(health.pauseReason).toContain('OPERATIONAL PAUSE TRIGGERED');
      expect(health.pauseReason).toContain('40,000/50,000');
    });

    it('triggers operational pause when daily writes reach 80% threshold (16,000 writes)', () => {
      const health = evaluateQuotaHealth({
        dailyReads: 5000,
        dailyWrites: 16500,
        monthlyHostingBytes: 100 * 1024 * 1024,
        storageBytes: 0,
      });

      expect(health.isSafe).toBe(false);
      expect(health.pauseTriggered).toBe(true);
      expect(health.pauseReason).toContain('16,000/20,000');
    });

    it('triggers critical violation if any Cloud Storage bytes are detected', () => {
      const health = evaluateQuotaHealth({
        dailyReads: 1000,
        dailyWrites: 200,
        monthlyHostingBytes: 100 * 1024 * 1024,
        storageBytes: 1048576, // 1 MB
      });

      expect(health.isSafe).toBe(false);
      expect(health.pauseTriggered).toBe(true);
      expect(health.pauseReason).toContain('CRITICAL VIOLATION: Cloud Storage usage detected');
    });
  });

  describe('Measured Operational Metrics & Data Completeness', () => {
    it('calculates data completeness rate while preserving null fields (null !== 0)', () => {
      const metrics = calculatePilotMetrics({
        messRecords: sampleMessRecords,
        listings: sampleListings,
        claims: sampleClaims,
        reports: sampleReports,
      });

      // 3 complete out of 4 = 75.0%
      expect(metrics.dataCompleteness.totalMessRecords).toBe(4);
      expect(metrics.dataCompleteness.completeRecords).toBe(3);
      expect(metrics.dataCompleteness.recordsWithMissingServed).toBe(1);
      expect(metrics.dataCompleteness.recordsWithMissingPeople).toBe(1);
      expect(metrics.dataCompleteness.dataCompletenessRate).toBe(75.0);
    });

    it('calculates exact physical mass for prepared, served, and leftover quantities', () => {
      const metrics = calculatePilotMetrics({
        messRecords: sampleMessRecords,
        listings: sampleListings,
        claims: sampleClaims,
        reports: sampleReports,
      });

      // 100 + 80 + 60 + 50 = 290 kg prepared
      expect(metrics.messProduction.totalPreparedKg).toBe(290.0);
      // 90 + 70 + 45 = 205 kg served (record 3 was null, ignored from served sum)
      expect(metrics.messProduction.totalServedKg).toBe(205.0);
      // 10 + 10 + 5 + 5 = 30 kg leftover
      expect(metrics.messProduction.totalLeftoverKg).toBe(30.0);
    });

    it('calculates redistribution quantities and claim completion rates', () => {
      const metrics = calculatePilotMetrics({
        messRecords: sampleMessRecords,
        listings: sampleListings,
        claims: sampleClaims,
        reports: sampleReports,
      });

      // Offered: 20 + 15 + 10 = 45 kg
      expect(metrics.redistribution.totalOfferedKg).toBe(45.0);
      // Claimed: 20 + 15 + 10 = 45 kg
      expect(metrics.redistribution.totalClaimedKg).toBe(45.0);
      // Collected: 20 + 15 = 35 kg
      expect(metrics.redistribution.totalCollectedKg).toBe(35.0);
      // 2 completed claims out of 2 attempted = 100% completion rate
      expect(metrics.redistribution.claimCompletionRate).toBe(100.0);
      expect(metrics.redistribution.claimFailureRate).toBe(0.0);
    });

    it('tracks community incidents and safety concerns', () => {
      const metrics = calculatePilotMetrics({
        messRecords: sampleMessRecords,
        listings: sampleListings,
        claims: sampleClaims,
        reports: sampleReports,
      });

      expect(metrics.incidents.total).toBe(1);
      expect(metrics.incidents.open).toBe(0);
      expect(metrics.incidents.resolved).toBe(1);
      expect(metrics.incidents.hygieneConcerns).toBe(0);
    });
  });

  describe('Qualitative Feedback Collection & Pilot Governance', () => {
    it('retrieves documented feedback from kitchen supervisor, NGO, and safety observer', () => {
      const feedback = getPilotStakeholderFeedback();
      expect(feedback).toHaveLength(3);
      expect(feedback.some((f) => f.role.includes('Mess Supervisor'))).toBe(true);
      expect(feedback.some((f) => f.role.includes('Recipient Coordinator'))).toBe(true);
      expect(feedback.some((f) => f.role.includes('Food Safety Observer'))).toBe(true);
    });

    it('validates pilot configuration constants and SOP references', () => {
      expect(PILOT_CONFIG.PILOT_ID).toBe('PILOT-CAMPUS-MESS-2026');
      expect(PILOT_CONFIG.SOP_REF).toBe('FB-SOP-PILOT-HUMAN-2026');
      expect(PILOT_CONFIG.SPARK_LIMITS.READS_PER_DAY).toBe(50000);
      expect(PILOT_CONFIG.SPARK_LIMITS.WRITES_PER_DAY).toBe(20000);
      expect(PILOT_CONFIG.SPARK_LIMITS.STORAGE_BYTES).toBe(0);
    });
  });
});

