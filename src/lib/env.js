/**
 * FoodBridge Environment Configuration & Zero-Cost Guardrails
 * Validates Spark-compliant client configuration and forbids paid/server credentials.
 */

const FORBIDDEN_VITE_KEYWORDS = [
  'STORAGE',
  'MAPS',
  'MAPBOX',
  'TWILIO',
  'MSG91',
  'WHATSAPP',
  'CLOUDINARY',
  'GEMINI',
  'OPENAI',
  'STRIPE',
  'SENDGRID',
  'MAILGUN',
  'AWS',
];

const FORBIDDEN_EXACT_KEYS = [
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_ADMIN_KEY',
  'FIREBASE_ADMIN_CREDENTIALS',
  'GOOGLE_MAPS_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'OPENAI_API_KEY',
];

export function validateEnvironment(
  rawEnv = (typeof import.meta !== 'undefined' && import.meta.env) || {}
) {
  // 1. Scan for forbidden paid service keys or server secrets configured for the client
  for (const [key, value] of Object.entries(rawEnv)) {
    if (value && typeof key === 'string') {
      const upperKey = key.toUpperCase();

      if (FORBIDDEN_EXACT_KEYS.includes(key)) {
        throw new Error(
          `[ZeroCostSecurityViolation] Prohibited service configuration detected: '${key}'. ` +
            `FoodBridge is strictly constrained to the Firebase Spark ₹0 tier. Remove this variable immediately.`
        );
      }

      if (upperKey.startsWith('VITE_')) {
        for (const forbidden of FORBIDDEN_VITE_KEYWORDS) {
          if (upperKey.includes(forbidden)) {
            throw new Error(
              `[ZeroCostSecurityViolation] Prohibited service configuration detected: '${key}'. ` +
                `FoodBridge is strictly constrained to the Firebase Spark ₹0 tier. Remove this variable immediately.`
            );
          }
        }
      }
    }
  }

  // 2. Resolve emulator mode flag
  const useEmulator =
    rawEnv.VITE_USE_FIREBASE_EMULATOR === 'true' ||
    rawEnv.VITE_USE_FIREBASE_EMULATOR === true ||
    (rawEnv.MODE === 'test' && rawEnv.VITE_USE_FIREBASE_EMULATOR !== 'false');

  // 3. Resolve client configuration
  const config = {
    apiKey: rawEnv.VITE_FIREBASE_API_KEY || (useEmulator ? 'demo-api-key' : ''),
    authDomain:
      rawEnv.VITE_FIREBASE_AUTH_DOMAIN || (useEmulator ? 'foodbridge-spark.firebaseapp.com' : ''),
    projectId: rawEnv.VITE_FIREBASE_PROJECT_ID || (useEmulator ? 'foodbridge-spark' : ''),
    appId: rawEnv.VITE_FIREBASE_APP_ID || (useEmulator ? '1:1234567890:web:demoapp' : ''),
    messagingSenderId: rawEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
    useEmulator,
    authEmulatorHost: rawEnv.VITE_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099',
    firestoreEmulatorHost: rawEnv.VITE_FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
    firestoreEmulatorPort: parseInt(rawEnv.VITE_FIRESTORE_EMULATOR_PORT || '8080', 10),
  };

  // 4. Validate mandatory parameters in production/live mode
  if (!useEmulator) {
    const missing = [];
    if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
    if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
    if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');

    if (missing.length > 0) {
      throw new Error(
        `[EnvironmentValidationError] Missing required Firebase client configuration variables: ${missing.join(', ')}. ` +
          `Provide client identifiers in .env.local without attaching billing accounts.`
      );
    }
  }

  return Object.freeze(config);
}

export const env = validateEnvironment();
