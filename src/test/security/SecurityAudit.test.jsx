import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Security & Zero-Cost Architecture Audit — Prompt 18', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const srcDir = path.join(rootDir, 'src');

  /**
   * Helper to recursively collect all source files
   */
  function getAllSourceFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist'].includes(file)) {
          getAllSourceFiles(fullPath, fileList);
        }
      } else if (/\.(js|jsx|html|css|json)$/.test(file)) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const allSourceFiles = getAllSourceFiles(srcDir);

  describe('ST-12 & Prohibited Paid SDK / Dependency Scan', () => {
    it('verifies package.json contains ZERO paid or billable SDK dependencies', () => {
      const pkgPath = path.join(rootDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      const prohibitedDeps = [
        '@googlemaps',
        'google-maps',
        'mapbox-gl',
        '@mapbox',
        'aws-sdk',
        '@aws-sdk',
        'stripe',
        'razorpay',
        'twilio',
        'sendgrid',
        '@sendgrid',
        'openai',
        '@google/generative-ai',
        '@anthropic-ai',
        'cloudinary',
        'multer',
        'mixpanel',
        'datadog',
      ];

      for (const prohibited of prohibitedDeps) {
        const found = Object.keys(allDeps).some((d) => d.includes(prohibited));
        expect(found, `Prohibited paid SDK detected: "${prohibited}"`).toBe(false);
      }
    });

    it('verifies Firebase configuration targets Spark plan with ZERO billing services', () => {
      const firebaseJsonPath = path.join(rootDir, 'firebase.json');
      const fbConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));

      // Invariant: Storage, Functions, Cloud Run, App Hosting, Scheduler must be absent
      expect(fbConfig.storage).toBeUndefined();
      expect(fbConfig.functions).toBeUndefined();
      expect(fbConfig.scheduler).toBeUndefined();
      expect(fbConfig.apphosting).toBeUndefined();
      expect(fbConfig.cloudrun).toBeUndefined();

      // Only static Hosting and Firestore rules/indexes permitted
      expect(fbConfig.hosting).toBeDefined();
      expect(fbConfig.firestore).toBeDefined();
    });
  });

  describe('Secret & Credential Leak Scan', () => {
    it('scans all tracked source code for hardcoded secrets, private keys, and tokens', () => {
      const highRiskPatterns = [
        /-----BEGIN\s+(RSA|EC|DSA|OPENSSH)?\s*PRIVATE\s+KEY-----/,
        /sk-[a-zA-Z0-9]{20,}/, // OpenAI-style secret keys
        /ghp_[a-zA-Z0-9]{36}/, // GitHub personal access token
        /AWS_SECRET_ACCESS_KEY\s*=\s*['"][^'"]+['"]/,
        /"private_key":\s*"-----BEGIN/, // Service account JSON private key
        /AIzaSy[a-zA-Z0-9_-]{33}/, // Real Google Cloud API key pattern
      ];

      for (const filePath of allSourceFiles) {
        // Skip test files that intentionally test mock keys or patterns
        if (filePath.includes('.test.')) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        for (const pattern of highRiskPatterns) {
          const match = content.match(pattern);
          expect(
            match,
            `Potential hardcoded credential detected in ${path.relative(rootDir, filePath)}: ${match?.[0]}`
          ).toBeNull();
        }
      }
    });
  });

  describe('Forbidden Network-Call Absence Scan', () => {
    it('guarantees source code makes NO calls to prohibited external APIs, maps, or AI endpoints', () => {
      const forbiddenDomains = [
        'maps.googleapis.com',
        'api.mapbox.com',
        'api.openai.com',
        'generativelanguage.googleapis.com',
        'api.stripe.com',
        'api.twilio.com',
        'api.sendgrid.com',
        'api.cloudinary.com',
        'nominatim.openstreetmap.org', // Forbidden geocoding API under prompt 09
      ];

      for (const filePath of allSourceFiles) {
        if (filePath.includes('.test.')) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        for (const domain of forbiddenDomains) {
          expect(
            content.includes(domain),
            `Forbidden network domain "${domain}" referenced in ${path.relative(rootDir, filePath)}`
          ).toBe(false);
        }
      }
    });

    it('verifies map requests only use OpenStreetMap raster tiles (tile.openstreetmap.org) with visible attribution', () => {
      const mapViewPath = path.join(srcDir, 'features/location/MapView.jsx');
      expect(fs.existsSync(mapViewPath)).toBe(true);
      const mapViewCode = fs.readFileSync(mapViewPath, 'utf-8');

      expect(mapViewCode).toContain('tile.openstreetmap.org/{z}/{x}/{y}.png');
      expect(mapViewCode).toContain('https://www.openstreetmap.org/copyright');
      // No geocoding API or routing engine
      expect(mapViewCode).not.toContain('nominatim');
      expect(mapViewCode).not.toContain('directions');
    });
  });

  describe('Exact-Address Privacy Partitioning', () => {
    it('enforces exact pickup address is partitioned into fulfillment subcollection only', () => {
      const rulesPath = path.join(rootDir, 'firestore.rules');
      const rules = fs.readFileSync(rulesPath, 'utf-8');

      // Rules must protect fulfillment subcollection
      expect(rules).toContain('match /fulfillment/{docId}');
      expect(rules).toContain(
        'isOrgMember(get(/databases/$(database)/documents/listings/$(listingId)).data.donorOrgId)'
      );
      expect(rules).toContain(
        'isOrgMember(get(/databases/$(database)/documents/claims/$(get(/databases/$(database)/documents/listings/$(listingId)).data.activeClaimId)).data.recipientOrgId)'
      );
    });

    it('verifies listings schema allowlist omits exact street address from top-level listing document', () => {
      const schemaPath = path.join(srcDir, 'rules/schema.js');
      const schemaCode = fs.readFileSync(schemaPath, 'utf-8');

      // In listings allowlist: location & geohash are approximate; exactAddress must NOT be in top-level
      expect(schemaCode).toContain('listings: [');
      const listingSection = schemaCode.slice(
        schemaCode.indexOf('listings: ['),
        schemaCode.indexOf('listingsDonorUpdate:')
      );
      expect(listingSection).not.toContain("'exactAddress'");
      expect(listingSection).not.toContain("'contactPhone'");

      // Only listingFulfillment subcollection holds exactAddress
      expect(schemaCode).toContain('listingFulfillment: [');
      const fulfillmentSection = schemaCode.slice(
        schemaCode.indexOf('listingFulfillment: ['),
        schemaCode.indexOf('claims: [')
      );
      expect(fulfillmentSection).toContain("'exactAddress'");
      expect(fulfillmentSection).toContain("'contactPhone'");
    });
  });

  describe('Quota-Safe Pagination & Query Bound Headroom', () => {
    it('verifies listingService queries enforce explicit limit constraints', () => {
      const listingServicePath = path.join(srcDir, 'features/listings/listingService.js');
      const code = fs.readFileSync(listingServicePath, 'utf-8');

      // Queries must be capped
      expect(code).toContain('limit(');
      expect(code).not.toContain('limit(1000)'); // No oversized limits
    });

    it('verifies messService queries enforce explicit limit constraints', () => {
      const messServicePath = path.join(srcDir, 'features/mess-analytics/messService.js');
      const code = fs.readFileSync(messServicePath, 'utf-8');

      expect(code).toContain('limit(boundedLimit');
      expect(code).toContain('startAfter');
    });

    it('verifies adminService queries enforce limit bounds on audit events and reports', () => {
      const adminServicePath = path.join(srcDir, 'features/admin/adminService.js');
      const code = fs.readFileSync(adminServicePath, 'utf-8');

      expect(code).toContain('limit(limitCount)');
    });
  });

  describe('Zero Cloud Storage / Photo Upload Elimination', () => {
    it('verifies zero imports of firebase/storage across all non-test source files', () => {
      for (const filePath of allSourceFiles) {
        if (filePath.includes('.test.')) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        expect(
          content.includes('firebase/storage'),
          `Prohibited firebase/storage import found in ${path.relative(rootDir, filePath)}`
        ).toBe(false);
      }
    });

    it('verifies listing creation form contains no file upload input element', () => {
      const listingShellPath = path.join(srcDir, 'features/listings/ListingShell.jsx');
      const code = fs.readFileSync(listingShellPath, 'utf-8');

      expect(code).not.toContain('type="file"');
      expect(code).not.toContain('accept="image/*"');
    });
  });
});
