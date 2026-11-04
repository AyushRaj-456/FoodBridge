import { describe, it, expect } from 'vitest';
import { validateEnvironment } from './env.js';

describe('Environment Validation & Zero-Cost Guardrails', () => {
  it('successfully validates default emulator configuration', () => {
    const config = validateEnvironment({
      VITE_USE_FIREBASE_EMULATOR: 'true',
    });

    expect(config.useEmulator).toBe(true);
    expect(config.projectId).toBe('foodbridge-spark');
    expect(config.authEmulatorHost).toBe('127.0.0.1:9099');
    expect(config.firestoreEmulatorHost).toBe('127.0.0.1:8080');
  });

  it('rejects prohibited environment variables that imply paid services', () => {
    expect(() =>
      validateEnvironment({
        VITE_USE_FIREBASE_EMULATOR: 'true',
        VITE_GOOGLE_MAPS_API_KEY: 'AIzaSyFakeKey123',
      })
    ).toThrow(/ZeroCostSecurityViolation.*GOOGLE_MAPS/i);

    expect(() =>
      validateEnvironment({
        VITE_USE_FIREBASE_EMULATOR: 'true',
        VITE_FIREBASE_STORAGE_BUCKET: 'foodbridge.appspot.com',
      })
    ).toThrow(/ZeroCostSecurityViolation.*FIREBASE_STORAGE/i);

    expect(() =>
      validateEnvironment({
        VITE_USE_FIREBASE_EMULATOR: 'true',
        TWILIO_ACCOUNT_SID: 'AC1234567890',
      })
    ).toThrow(/ZeroCostSecurityViolation.*TWILIO/i);

    expect(() =>
      validateEnvironment({
        VITE_USE_FIREBASE_EMULATOR: 'true',
        OPENAI_API_KEY: 'sk-proj-12345',
      })
    ).toThrow(/ZeroCostSecurityViolation.*OPENAI/i);
  });

  it('throws error when required production variables are missing in non-emulator mode', () => {
    expect(() =>
      validateEnvironment({
        VITE_USE_FIREBASE_EMULATOR: 'false',
        MODE: 'production',
      })
    ).toThrow(/EnvironmentValidationError.*Missing required Firebase client configuration/i);
  });

  it('accepts valid production configuration without paid service credentials', () => {
    const config = validateEnvironment({
      VITE_USE_FIREBASE_EMULATOR: 'false',
      VITE_FIREBASE_API_KEY: 'valid-client-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'foodbridge-spark.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'foodbridge-spark',
      VITE_FIREBASE_APP_ID: '1:123456:web:abcdef',
    });

    expect(config.useEmulator).toBe(false);
    expect(config.projectId).toBe('foodbridge-spark');
    expect(config.apiKey).toBe('valid-client-key');
  });
});
