# Recommended Codebase Structure

```text
foodbridge-app/
├── public/
├── src/
│   ├── app/                 # routes, providers, app shell
│   ├── components/          # reusable UI components
│   ├── features/
│   │   ├── auth/
│   │   ├── organisations/
│   │   ├── listings/
│   │   ├── matching/
│   │   ├── claims/
│   │   ├── handovers/
│   │   ├── mess-analytics/
│   │   ├── notifications/
│   │   └── admin/
│   ├── lib/                 # firebase client, geohash, haversine
│   ├── rules/               # domain validators and state machines
│   ├── styles/
│   └── test/
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .firebaserc.example
├── .env.example
├── package.json
└── README.md
```

Use JavaScript only. Do not add server, functions, storage or paid integration directories. Keep Firebase client initialisation in one module. Separate domain rules from UI. Never put admin secrets in frontend code.


## Cost and implementation constraint

This document is subordinate to [`architecture/ZERO_COST_ARCHITECTURE.md`](../architecture/ZERO_COST_ARCHITECTURE.md) (adjust relative path if needed) and [`architecture/FREE_SERVICE_REGISTER.md`](../architecture/FREE_SERVICE_REGISTER.md). Firebase Spark only; no billing account, paid API, paid storage, SMS, AI API or paid hosting. Defer any feature that cannot be delivered within those constraints.
