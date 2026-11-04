> **ZERO-COST BUILD RULE (mandatory):** FoodBridge must remain on Firebase **Spark** with no billing account linked. Do not enable Blaze, add a payment method, use paid APIs, or add any service that can generate a bill. If a feature cannot be delivered within a genuinely no-payment-required plan, defer it or provide a manual workflow. Free-tier quotas are hard limits, not permission to upgrade. Never ask the owner to upgrade to solve a quota issue. See `architecture/ZERO_COST_ARCHITECTURE.md` and `architecture/FREE_SERVICE_REGISTER.md`.

# Color, Typography and Spacing

Suggested palette: brand-900 `#174B3A`; brand-700 `#246B50`; brand-100 `#E7F1EB`; accent-600 `#B66A35`; text `#18231E`; muted `#66736C`; surface `#FFFFFF`; canvas `#F5F7F5`; border `#DCE4DE`; success `#237A4B`; warning `#94621A`; danger `#B33A32`. Validate every foreground/background pair against WCAG AA before release.

Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; weights 400/500/600.

| Style | Size / line-height |
|---|---|
| Page title | 28/36 desktop; 24/32 mobile |
| Section | 20/28 |
| Card/table heading | 16/24 |
| Body | 14–16/22–24 |
| Label | 13/18 |
| Caption | 12/16 |

4 px base spacing; common gaps 8, 12, 16, 24, 32, 48. Controls 44 px minimum where practical. Radius 6–10 px. Shadows reserved for overlays.
