# FINWALL — SCAMSTOP Testing-First Prototype

An educational, client-side financial scam detection prototype. Analysis is deterministic and rules-based; it is **not a trained AI model, a bank service, or a guarantee that a message is safe**.

## Requirements
- Node.js 18+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:8000.

## Firebase authentication
The deployed app uses Firebase Email/Password Authentication. Copy `.env.example` to `.env.local` for local development and fill in the web app configuration from Firebase Console. In Firebase Console, enable **Authentication > Sign-in method > Email/Password**.

For Vercel, add each `VITE_FIREBASE_*` value under **Project Settings > Environment Variables**, then redeploy. These web configuration values are intended for browser use; never add a Firebase service-account key or other private server credential to this app.

## Build and tests
```bash
npm test
npm run build
npm run test:coverage
```

## Modules
Dashboard, Scan Message, Scam Lab, Fraud Chain, Before I Pay, Reports, Settings.

## Test strategy
- Unit tests: Vitest for the actual TypeScript engine.
- Black-box cases: `docs/test-matrix.md`.
- JUnit example: `java-tests/` contains a Java implementation of the risk category contract and JUnit 5 tests. This tests the shared classification rule in Java, **not** the React/TypeScript code directly. Confirm with the instructor that a separate Java test component satisfies the course's JUnit requirement.
- Performance: use JMeter against the local website for basic page load checks; this is a static client-side app with no backend API. Do not describe this as backend/API load testing.

## Risk thresholds
Safe: 0–25; Caution: 26–50; High: 51–75; Critical: 76–100.

## Limitations
The prototype uses configurable keyword rules and simulated scenarios. OCR/QR uploads, real-time monitoring, and real financial-system integrations are not implemented in this starter unless added separately. Never enter real personal, banking, or payment information.
