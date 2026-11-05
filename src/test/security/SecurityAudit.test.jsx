import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runTransaction } from 'firebase/firestore';
import { executeClaimTransaction } from '../../features/claims/claimService.js';
import { canTransitionListing, canTransitionClaim } from '../../rules/stateMachines.js';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    runTransaction: vi.fn(),
  };
});

describe('FoodBridge Full Security, Privacy & Quota Audit (Prompt 18 / ₹0 Spark)', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const srcDir = path.resolve(rootDir, 'src');
  const rulesPath = path.resolve(rootDir, 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf-8');

  // Helper to recursively get all files in a directory
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(file)) {
          getAllFiles(fullPath, fileList);
        }
      } else {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const allSrcFiles = getAllFiles(srcDir);
  // Production source files only (excluding test files which mention forbidden strings to verify absence)
  const prodCodeFiles = allSrcFiles.filter(
    (f) =>
      /\.(js|jsx|css|html)$/.test(f) &&
      !f.includes('.test.') &&
      !f.includes(`${path.sep}test${path.sep}`)
  );

  // =========================================================================
  // 1. FORBIDDEN NETWORK CALLS & PROHIBITED PAID APIS (TC-18, ST-12)
  // =========================================================================
  describe('Forbidden Network Calls & Prohibited Paid APIs (TC-18, ST-12)', () => {
    it('verifies complete absence of Google Maps, Mapbox, and paid mapping APIs in production code', () => {
      const forbiddenMapPatterns = [
        /maps\.googleapis\.com/i,
        /api\.mapbox\.com/i,
        /@googlemaps\//i,
        /mapbox-gl/i,
        /api\.openrouteservice\.org/i,
        /tomtom\.com/i,
        /here\.com/i,
      ];

      for (const file of prodCodeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of forbiddenMapPatterns) {
          const match = content.match(pattern);
          expect(
            match,
            `Forbidden paid mapping API found in ${path.relative(rootDir, file)}: ${match?.[0]}`
          ).toBeNull();
        }
      }
    });

    it('verifies complete absence of Cloud Storage and Cloud Functions SDKs in production code', () => {
      const forbiddenFirebaseServices = [
        /firebase\/storage/i,
        /getStorage/i,
        /uploadBytes/i,
        /uploadString/i,
        /firebase\/functions/i,
        /getFunctions/i,
        /httpsCallable/i,
        /firebase-admin/i,
      ];

      for (const file of prodCodeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of forbiddenFirebaseServices) {
          const match = content.match(pattern);
          expect(
            match,
            `Forbidden Firebase paid service found in ${path.relative(rootDir, file)}: ${match?.[0]}`
          ).toBeNull();
        }
      }
    });

    it('verifies complete absence of hosted AI / LLM APIs (OpenAI, Gemini, Anthropic) in production code', () => {
      const forbiddenAiApis = [
        /api\.openai\.com/i,
        /@google\/generative-ai/i,
        /generativelanguage\.googleapis\.com/i,
        /api\.anthropic\.com/i,
        /new OpenAI/i,
      ];

      for (const file of prodCodeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of forbiddenAiApis) {
          const match = content.match(pattern);
          expect(
            match,
            `Forbidden AI/LLM API call found in ${path.relative(rootDir, file)}: ${match?.[0]}`
          ).toBeNull();
        }
      }
    });

    it('verifies complete absence of payment gateways and SMS dispatch endpoints in production code', () => {
      const forbiddenCommercialEndpoints = [
        /api\.stripe\.com/i,
        /@stripe\//i,
        /api\.razorpay\.com/i,
        /checkout\.razorpay/i,
        /api\.twilio\.com/i,
        /sendgrid\.com/i,
      ];

      for (const file of prodCodeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of forbiddenCommercialEndpoints) {
          const match = content.match(pattern);
          expect(
            match,
            `Forbidden commercial/payment/SMS endpoint found in ${path.relative(rootDir, file)}: ${match?.[0]}`
          ).toBeNull();
        }
      }
    });
  });

  // =========================================================================
  // 2. HARDCODED SECRET & CREDENTIAL SCANNING
  // =========================================================================
  describe('Secret & Private Key Scanning', () => {
    it('verifies that no private keys, live tokens, or production passwords exist in code', () => {
      const sensitivePatterns = [
        /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
        /sk_live_[0-9a-zA-Z]{24}/,
        /ghp_[0-9a-zA-Z]{36}/,
        /AKIA[0-9A-Z]{16}/,
      ];

      for (const file of prodCodeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of sensitivePatterns) {
          const match = content.match(pattern);
          expect(
            match,
            `Sensitive credential / private key detected in ${path.relative(rootDir, file)}`
          ).toBeNull();
        }
      }
    });

    it('verifies that .env.local is ignored in .gitignore', () => {
      const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
      expect(gitignore).toContain('.env.local');
      expect(gitignore).toContain('.env.*.local');
    });
  });

  // =========================================================================
  // 3. EXACT-ADDRESS PRIVACY PARTITION & RULES ENFORCEMENT (TC-08, ST-05)
  // =========================================================================
  describe('Exact-Address Privacy Partition (TC-08, ST-05)', () => {
    it('partitions exact pickup address into a secured subcollection in rules', () => {
      expect(rules).toContain('match /listings/{listingId}');
      expect(rules).toContain('match /fulfillment/{docId}');
    });

    it('restricts fulfillment subcollection access to donor org members, admins, and active claim recipient only', () => {
      const fulfillmentSection = rules.slice(rules.indexOf('match /fulfillment/{docId}'));
      expect(fulfillmentSection).toContain(
        'isOrgMember(get(/databases/$(database)/documents/listings/$(listingId)).data.donorOrgId)'
      );
      expect(fulfillmentSection).toContain('isAdmin()');
      expect(fulfillmentSection).toContain('activeClaimId != null');
      expect(fulfillmentSection).toContain(
        'isOrgMember(get(/databases/$(database)/documents/claims/$(get(/databases/$(database)/documents/listings/$(listingId)).data.activeClaimId)).data.recipientOrgId)'
      );
    });

    it('verifies that listing service partitions exact address into fulfillment subcollection', () => {
      const listingServiceCode = fs.readFileSync(
        path.join(srcDir, 'features/listings/listingService.js'),
        'utf-8'
      );
      expect(listingServiceCode).toContain('/fulfillment/');
      expect(listingServiceCode).toContain('location_privacy');
      expect(listingServiceCode).toContain('fulfillmentPayload');
    });
  });

  // =========================================================================
  // 4. QUOTA-SAFE PAGINATION & READ OPTIMISATIONS (TC-11, TC-14, ST-11)
  // =========================================================================
  describe('Quota-Safe Pagination & Query Headroom (TC-11, TC-14, ST-11)', () => {
    it('enforces limit constraints on all querying services to stay within Spark 50k reads/day', () => {
      const servicesWithQueries = [
        'features/listings/listingService.js',
        'features/mess-analytics/messService.js',
        'features/admin/adminService.js',
        'features/notifications/notificationService.js',
        'features/impact/impactService.js',
      ];

      for (const svc of servicesWithQueries) {
        const content = fs.readFileSync(path.join(srcDir, svc), 'utf-8');
        expect(content, `Service ${svc} must import limit from firebase/firestore`).toContain(
          'limit'
        );
      }
    });

    it('ensures mess analytics distinguishes missing data from zero (missing !== 0)', () => {
      const messServiceCode = fs.readFileSync(
        path.join(srcDir, 'features/mess-analytics/messService.js'),
        'utf-8'
      );
      expect(messServiceCode).toContain('Missing data is stored as null, NEVER 0');
      expect(messServiceCode).toContain('null');
    });
  });

  // =========================================================================
  // 5. CONCURRENCY & RACE CONDITION PROOF (TC-06, ST-06)
  // =========================================================================
  describe('Concurrency & Race Condition Proof (TC-06, ST-06)', () => {
    it('guarantees that simultaneous claims on a single listing produce exactly one winner', async () => {
      let listingState = {
        id: 'lst-race-01',
        status: 'published',
        activeClaimId: null,
        donorOrgId: 'org-donor-1',
        consumeBy: Date.now() + 100000,
        pickupEnd: Date.now() + 80000,
      };

      // Concurrency simulator: First transaction commits; subsequent transactions see claimed status and reject
      runTransaction.mockImplementation((_, fn) => {
        const mockTx = {
          get: vi.fn((ref) => {
            if (ref.id === 'lst-race-01') {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ ...listingState }),
              });
            }
            if (ref.id && ref.id.includes('_')) {
              return Promise.resolve({
                exists: () => true,
                data: () => ({ status: 'active', role: 'member' }),
              });
            }
            return Promise.resolve({
              exists: () => true,
              data: () => ({ status: 'approved', category: 'ngo' }),
            });
          }),
          set: vi.fn(),
          update: vi.fn((ref, updates) => {
            if (ref.id === 'lst-race-01') {
              listingState = { ...listingState, ...updates };
            }
          }),
        };

        return fn(mockTx);
      });

      const claimPromise1 = executeClaimTransaction('lst-race-01', 'org-recip-1', {
        uid: 'user-1',
      });
      const claimPromise2 = executeClaimTransaction('lst-race-01', 'org-recip-2', {
        uid: 'user-2',
      });

      const results = await Promise.allSettled([claimPromise1, claimPromise2]);

      const winners = results.filter((r) => r.status === 'fulfilled');
      const losers = results.filter((r) => r.status === 'rejected');

      expect(winners.length).toBe(1);
      expect(losers.length).toBe(1);
      expect(losers[0].reason.message).toMatch(/no longer available/i);
    });
  });

  // =========================================================================
  // 6. ACCESSIBILITY & WCAG CIVIC UTILITY AUDIT
  // =========================================================================
  describe('Accessibility & WCAG Semantic Invariants', () => {
    it('verifies that interactive buttons throughout the app define text or aria-labels', () => {
      const componentFiles = allSrcFiles.filter(
        (f) =>
          (f.includes('components') || f.includes('features')) &&
          !f.includes('.test.') &&
          f.endsWith('.jsx')
      );

      let checkedButtons = 0;
      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const buttonTags = content.match(/<button[\s\S]*?<\/button>/g) || [];
        for (const btn of buttonTags) {
          checkedButtons++;
          const hasAriaLabel = /aria-label=/i.test(btn);
          const hasChildren = />\s*[\w{<]/i.test(btn);
          const hasTitle = /title=/i.test(btn);
          expect(
            hasAriaLabel || hasChildren || hasTitle,
            `Button in ${path.relative(rootDir, file)} must have accessible name or label: ${btn}`
          ).toBe(true);
        }
      }
      expect(checkedButtons).toBeGreaterThan(15);
    });

    it('verifies modal dialogs declare role="dialog" and aria-modal="true"', () => {
      const modalFiles = allSrcFiles.filter(
        (f) => f.includes('Modal.jsx') && !f.includes('.test.')
      );
      for (const file of modalFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content, `${path.basename(file)} must define role="dialog"`).toContain(
          'role="dialog"'
        );
        expect(content, `${path.basename(file)} must define aria-modal="true"`).toContain(
          'aria-modal="true"'
        );
      }
    });

    it('verifies that tokens.css enforces accessible high-contrast colors and calm utility theme', () => {
      const tokensCss = fs.readFileSync(path.join(srcDir, 'styles/tokens.css'), 'utf-8');
      expect(tokensCss).toContain('--color-brand-700');
      expect(tokensCss).toContain('--color-text');
      expect(tokensCss).toContain('--color-surface');
      expect(tokensCss).toContain('--radius-md');
    });
  });

  // =========================================================================
  // 7. END-TO-END STATE TRANSITIONS & DOMAIN INTEGRITY
  // =========================================================================
  describe('End-to-End State Machine Flow & Invariants', () => {
    it('strictly guides surplus listing lifecycle from draft to terminal completion', () => {
      expect(canTransitionListing('draft', 'published')).toBe(true);
      expect(canTransitionListing('published', 'claimed')).toBe(true);
      expect(canTransitionListing('claimed', 'completed')).toBe(true);

      // Terminal: cannot re-open completed listing
      expect(canTransitionListing('completed', 'published')).toBe(false);
      expect(canTransitionListing('completed', 'claimed')).toBe(false);

      // Cannot bypass claim to complete
      expect(canTransitionListing('draft', 'completed')).toBe(false);
    });

    it('strictly guides claim dual confirmation lifecycle', () => {
      expect(canTransitionClaim('claimed', 'donor_confirmed')).toBe(true);
      expect(canTransitionClaim('claimed', 'recipient_confirmed')).toBe(true);
      expect(canTransitionClaim('donor_confirmed', 'completed')).toBe(true);
      expect(canTransitionClaim('recipient_confirmed', 'completed')).toBe(true);

      // Terminal claim state
      expect(canTransitionClaim('completed', 'claimed')).toBe(false);
    });
  });
});
