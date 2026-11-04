> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# FoodBridge Design System

## Direction: calm civic utility
FoodBridge should feel like a dependable community operations product: warm but not playful, contemporary but not trend-chasing. Prioritise clarity, trust, status visibility and quick task completion.

Use a restrained neutral canvas, deep green primary and small warm accent. Prefer typography, alignment and whitespace over gradients, glass effects or decoration. Use gently rounded geometry; avoid every element becoming a pill or floating card. Use one consistent line-icon set; never use emoji navigation. Status always includes text; colour is supplementary.

## Layout
Desktop sidebar 240–256 px; flexible content up to 1440 px. Mobile compact top bar and bottom navigation for primary destinations. Gutters 24 px desktop / 16 px mobile. Spacing uses 4 px base scale. Use tables for dense admin work; cards only for discrete records.

## Role-specific screens
Donor: create listing, active listings, pickup status, history. NGO: eligible opportunities, claim/pickup, handover, distribution report. Mess: meal entry, completeness, trends, advisory recommendations. Admin: verification queue, reports, organisation/user status, audit.

## Interaction
Destructive actions require confirmation. Claim state is server-confirmed. Forms preserve values after recoverable errors. Design loading, empty, error, offline and permission-denied states. Avoid surprise modals. Safety-critical information must be explicit.

## Theme
Light theme first. Add dark theme only after contrast and state audit. A screen is incomplete until responsive layout, keyboard behavior, real data and visual QA are complete. Never ship placeholder charts or fabricated activity.
