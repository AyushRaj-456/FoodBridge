import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ROUTE_TIERS,
  ROUTE_STATES,
  APPROVED_PILOT_SOP,
  evaluateRoutingEligibility,
  approveHumanRoute,
  blockSurplusRoute,
  attemptAnimalFeedRoute,
  attemptCompostRoute,
} from './routingService.js';
import RouteAuditCard from './RouteAuditCard.jsx';

describe('Zero-Waste Routing Gates — Prompt 12 (₹0 Baseline)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    uid: 'safety-officer-1',
    displayName: 'Chef / Mess Safety Lead',
  };

  const validSopAssessment = {
    holdingTempCompliant: true,
    sensoryInspectionPassed: true,
    safetyNotes: 'Holding temperature verified at 65°C. Clean visual and aromatic aroma.',
    sopRef: APPROVED_PILOT_SOP.REF,
    sopVersion: APPROVED_PILOT_SOP.VERSION,
  };

  describe('Tier 1: Human Route Approval & Traceable Audit Fields', () => {
    it('approves human route and populates full traceable audit record', () => {
      const result = approveHumanRoute('lst-101', mockUser, validSopAssessment);

      expect(result.listingId).toBe('lst-101');
      expect(result.routeTier).toBe(ROUTE_TIERS.HUMAN);
      expect(result.routeStatus).toBe(ROUTE_STATES.HUMAN_ROUTE_APPROVED);
      expect(result.inferredFromHumanRejection).toBe(false);

      const sop = result.sopVerification;
      expect(sop.sopApproved).toBe(true);
      expect(sop.sopRef).toBe(APPROVED_PILOT_SOP.REF);
      expect(sop.sopVersion).toBe(APPROVED_PILOT_SOP.VERSION);
      expect(sop.assessedBy).toBe('safety-officer-1');
      expect(sop.assessedByName).toBe('Chef / Mess Safety Lead');
      expect(sop.holdingTempCompliant).toBe(true);
      expect(sop.sensoryInspectionPassed).toBe(true);
      expect(sop.safetyNotes).toContain('65°C');
      expect(sop.inferredFromHumanRejection).toBe(false);
      expect(sop.assessedAt).toBeDefined();
    });

    it('evaluates approved listing as eligible for verified recipient organisations', () => {
      const auditListing = approveHumanRoute('lst-101', mockUser, validSopAssessment);
      const listing = {
        ...auditListing,
        consumeBy: Date.now() + 1000 * 60 * 60 * 4,
      };

      const recipientOrg = {
        id: 'org-ngo-1',
        status: 'approved',
        category: 'ngo',
      };

      const evalResult = evaluateRoutingEligibility(listing, recipientOrg);
      expect(evalResult.isEligible).toBe(true);
      expect(evalResult.routeState).toBe(ROUTE_STATES.HUMAN_ROUTE_APPROVED);
      expect(evalResult.reason).toBeNull();
    });
  });

  describe('Negative Tests: Human Route Gates & Prerequisite Failures', () => {
    it('rejects human route when written pilot SOP is unapproved or missing', () => {
      const unassessedListing = {
        id: 'lst-unassessed',
        routeTier: ROUTE_TIERS.HUMAN,
        routeStatus: ROUTE_STATES.UNASSESSED,
        consumeBy: Date.now() + 1000 * 60 * 60,
      };

      const result = evaluateRoutingEligibility(unassessedListing);
      expect(result.isEligible).toBe(false);
      expect(result.routeState).toBe(ROUTE_STATES.UNASSESSED);
      expect(result.reason).toMatch(/approved written pilot food-safety SOP/i);
    });

    it('rejects human route approval when holding temperature fails', () => {
      expect(() =>
        approveHumanRoute('lst-cold', mockUser, {
          ...validSopAssessment,
          holdingTempCompliant: false,
        })
      ).toThrow(/holding temperature compliance/i);
    });

    it('rejects human route approval when sensory inspection fails', () => {
      expect(() =>
        approveHumanRoute('lst-smelly', mockUser, {
          ...validSopAssessment,
          sensoryInspectionPassed: false,
        })
      ).toThrow(/sensory inspection pass/i);
    });

    it('rejects human route approval when safety notes are under 10 characters', () => {
      expect(() =>
        approveHumanRoute('lst-notes', mockUser, {
          ...validSopAssessment,
          safetyNotes: 'Too short',
        })
      ).toThrow(/minimum 10 characters/i);
    });

    it('rejects human route when listing has passed its consume-by deadline', () => {
      const auditListing = approveHumanRoute('lst-expired', mockUser, validSopAssessment);
      const expiredListing = {
        ...auditListing,
        consumeBy: Date.now() - 1000 * 60 * 10, // 10 min past deadline
      };

      const result = evaluateRoutingEligibility(expiredListing);
      expect(result.isEligible).toBe(false);
      expect(result.routeState).toBe(ROUTE_STATES.EXPIRED);
    });

    it('rejects human route when claimed by farm or composting facility', () => {
      const auditListing = approveHumanRoute('lst-farm-attempt', mockUser, validSopAssessment);
      const listing = {
        ...auditListing,
        consumeBy: Date.now() + 1000 * 60 * 60,
      };

      const farmOrg = { id: 'org-farm', status: 'approved', category: 'farm' };
      const facilityOrg = { id: 'org-facility', status: 'approved', category: 'facility' };

      expect(evaluateRoutingEligibility(listing, farmOrg).isEligible).toBe(false);
      expect(evaluateRoutingEligibility(listing, facilityOrg).isEligible).toBe(false);
    });
  });

  describe('Negative Invariant: NEVER Infer Animal Suitability from Human Rejection', () => {
    it('blocking a human route explicitly flags inferredFromHumanRejection', () => {
      const blockedPayload = blockSurplusRoute('lst-spoiled', mockUser, {
        reason: 'Sour odor detected; curdled texture in dal tadka.',
        isHumanInspectionFailure: true,
      });

      expect(blockedPayload.routeStatus).toBe(ROUTE_STATES.BLOCKED);
      expect(blockedPayload.inferredFromHumanRejection).toBe(true);
      expect(blockedPayload.rejectionReason).toContain('Sour odor');
    });

    it('strictly throws CRITICAL SAFETY VIOLATION if attempting to cascade human rejection to animal feed', () => {
      expect(() =>
        attemptAnimalFeedRoute('lst-spoiled', mockUser, {
          inferredFromHumanRejection: true,
        })
      ).toThrow(/CRITICAL SAFETY VIOLATION: Animal feed suitability must never be inferred/i);
    });

    it('evaluates animal feed with inferredFromHumanRejection as BLOCKED with critical safety reason', () => {
      const listing = {
        id: 'lst-cascaded',
        routeTier: ROUTE_TIERS.ANIMAL_FEED,
        inferredFromHumanRejection: true,
        consumeBy: Date.now() + 100000,
      };

      const result = evaluateRoutingEligibility(listing);
      expect(result.isEligible).toBe(false);
      expect(result.routeState).toBe(ROUTE_STATES.BLOCKED);
      expect(result.reason).toMatch(/cannot be inferred from human food rejection/i);
    });
  });

  describe('Negative Tests: Tier 2 Animal Feed & Tier 3 Compost Disabled in MVP', () => {
    it('throws error when attempting to activate Tier 2 animal feed route', () => {
      expect(() => attemptAnimalFeedRoute('lst-feed-1', mockUser)).toThrow(
        /Tier 2 Animal Feed route is currently disabled in MVP/i
      );
    });

    it('throws error when attempting to activate Tier 3 compost route', () => {
      expect(() => attemptCompostRoute('lst-compost-1', mockUser)).toThrow(
        /Tier 3 Compost.*route is currently disabled in MVP/i
      );
    });

    it('evaluates Tier 2 animal feed listing as BLOCKED in MVP', () => {
      const listing = {
        id: 'lst-animal',
        routeTier: ROUTE_TIERS.ANIMAL_FEED,
        consumeBy: Date.now() + 100000,
      };

      const result = evaluateRoutingEligibility(listing);
      expect(result.isEligible).toBe(false);
      expect(result.routeState).toBe(ROUTE_STATES.BLOCKED);
      expect(result.reason).toMatch(/Tier 2 Animal Feed route is currently disabled/i);
    });

    it('evaluates Tier 3 compost listing as BLOCKED in MVP', () => {
      const listing = {
        id: 'lst-compost',
        routeTier: ROUTE_TIERS.COMPOST,
        consumeBy: Date.now() + 100000,
      };

      const result = evaluateRoutingEligibility(listing);
      expect(result.isEligible).toBe(false);
      expect(result.routeState).toBe(ROUTE_STATES.BLOCKED);
      expect(result.reason).toMatch(/Tier 3 Compost.*route is currently disabled/i);
    });
  });

  describe('RouteAuditCard Component', () => {
    const approvedListing = {
      id: 'lst-card-1',
      title: 'Vegetable Khichdi',
      routeTier: 'human',
      routeStatus: 'HUMAN_ROUTE_APPROVED',
      sopVerification: {
        sopApproved: true,
        sopRef: 'FB-SOP-PILOT-HUMAN-2026',
        sopVersion: '1.0.0',
        holdingTempCompliant: true,
        sensoryInspectionPassed: true,
        safetyNotes: 'Maintained at 68°C in insulated cambro. Aromatic scent confirmed.',
        assessedBy: 'officer-42',
      },
    };

    it('renders zero-waste routing hierarchy banner and human route approval badge', () => {
      render(<RouteAuditCard listing={approvedListing} />);

      expect(
        screen.getByText(/Routing Governance: Humans First → Animals Second → Soil Third/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Human Route Approved/i)).toBeInTheDocument();
      expect(screen.getByText(/FB-SOP-PILOT-HUMAN-2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Compliant \(>60°C \/ <4°C\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Passed \(Odor & Visual\)/i)).toBeInTheDocument();
    });

    it('renders disabled controls with lock icons for Tier 2 Animal Feed and Tier 3 Compost', () => {
      render(<RouteAuditCard listing={approvedListing} />);

      const disabledBadges = screen.getAllByText(/Disabled in MVP/i);
      expect(disabledBadges.length).toBe(2);

      expect(screen.getByText(/never inferred from human rejection/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Composting route disabled until qualified campus organic processing SOP/i)
      ).toBeInTheDocument();
    });

    it('renders strict no-AI certification safety policy disclaimer', () => {
      render(<RouteAuditCard listing={approvedListing} />);

      expect(
        screen.getByText(
          /AI models and computer vision are never permitted to certify food safety/i
        )
      ).toBeInTheDocument();
    });
  });
});
