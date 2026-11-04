# Testing Strategy

Use Vitest for pure domain functions (expiry, Haversine, eligibility, forecast calculations), React Testing Library for components, Firebase Emulator Suite for Auth/Firestore rules and transactions, and Playwright locally for critical browser flows. Keep test data synthetic. Test quota-aware pagination, map fallback, in-app-only notifications, manual verification and Spark-only deployment configuration. No paid testing service is required.
