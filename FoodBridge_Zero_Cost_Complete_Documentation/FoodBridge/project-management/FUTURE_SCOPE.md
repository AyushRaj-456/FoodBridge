# Future Scope & Post-Pilot Roadmap

> **ZERO-COST SELECTION MANDATE:** Every proposed feature must operate at ₹0 cost without requiring a credit card, billing account, paid API, or pay-as-you-go threshold. Free trials or temporary promotional credits are explicitly rejected as evidence of zero cost.

---

## 1. Approved Zero-Cost Roadmap (Post-Pilot)

The following enhancements have been approved for future development because they operate entirely in client-side JavaScript or standard browser APIs at ₹0 infrastructure cost:

1. **Offline PWA & Service Worker Caching:**
   - Full offline app shell caching and IndexedDB queueing for kitchen staff working in basement dining halls with intermittent Wi-Fi.
   - Cost: **₹0** (standard browser Service Worker API).
2. **Client-Side QR Code Handover Handshake:**
   - Rendering donor claim validation QR codes via client HTML5 canvas and scanning with the device camera.
   - Cost: **₹0** (open-source pure JS QR engine; zero backend compute).
3. **Local CSV / Audit Export:**
   - Generating downloadable spreadsheet audits directly in the browser using `Blob` objects.
   - Cost: **₹0** (zero cloud server functions required).
4. **Multilingual Interface Bundles:**
   - Static client-side translations (Hindi, Marathi, Tamil, Telugu, Kannada) bundled with the front-end assets.
   - Cost: **₹0** (static JSON strings, zero third-party translation API fees).
5. **Calendar Pickup Integration (.ics):**
   - Generating standard calendar invitation files for recipient transport drivers.
   - Cost: **₹0** (pure client-side JavaScript).

---

## 2. Permanently Deferred / Excluded Features

The following capabilities are excluded from the FoodBridge roadmap because they violate the zero-cost build invariant:

| Proposed Feature | Incompatible Requirement | Status |
| :--- | :--- | :--- |
| **Photo / Image Uploads** | Requires Cloud Storage or Cloudinary (Blaze billing required) | **Permanently Deferred** |
| **SMS / WhatsApp Alerts** | Per-message telecom fees (Twilio, MSG91, Firebase Phone Auth) | **Excluded** |
| **Cloud Functions / Background Cron** | Serverless compute and automated schedulers require Blaze | **Excluded** |
| **Google Maps / Mapbox Routing** | Turn-by-turn routing and geocoding require paid API billing | **Excluded** |
| **Hosted AI / LLM APIs** | OpenAI, Gemini, or Claude API token fees | **Excluded** |
| **Animal Feed & Biogas Routes** | Gated until qualified veterinary and PCB facility SOPs exist | **Gated** |

