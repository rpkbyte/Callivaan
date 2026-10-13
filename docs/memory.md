# Callivaan — Project Memory

**Last updated:** 13 October 2026  
**Purpose:** Short handoff context for future product, design, and engineering work.  
**Status:** MVP Implemented and Verified (Full monorepo, API, Media Gateway, Worker, Web Portal, Android app, and E2E test suite).

## Brand name check

- **Current working brand:** Callivaan.
- Exact-name public web searches did not surface an obvious matching product or company.
- Live registry RDAP lookups on 13 October 2026 returned no registration record for [`callivaan.com`](https://rdap.verisign.com/com/v1/domain/callivaan.com) and the .IN registry explicitly reported [`callivaan.in`](https://rdap.nixiregistry.in/rdap/domain/callivaan.in) available for registration at lookup time. Availability can change until registered.
- This is a preliminary name/domain check, not trademark clearance. The official IP India public search is interactive and its current flow requires OTP/CAPTCHA; exact and similar marks in relevant classes still need a proper registry search before filing or relying on the name commercially.
- Do not say the name is legally cleared or permanently available. Recheck at the registrar before purchasing domains.

## Product in one paragraph

Build a service for small businesses and independent professionals that answers inbound customer calls with an AI voice agent, captures the caller's request, and sends the business owner a useful call summary over WhatsApp. The owner can configure how the agent speaks and what it should collect using the Android app, website, and a linked WhatsApp conversation. Sell the service directly from the product website.

## Confirmed decisions from the user

- Product is an **AI voice agent that answers calls and speaks with callers**.
- Frontend direction: **React Native** for Android.
- Backend direction: **Node.js**.
- **Docker** is acceptable for backend packaging/deployment.
- The user wants WhatsApp controls so they can give the agent instructions, and wants call summaries delivered on WhatsApp to the person using the product.
- The user plans to create a product website and **sell directly from that website**.
- The user is **not launching on Google Play at this stage**. Do not make Play Store distribution or Play Billing a current product dependency.
- The UI is **light mode only**.
- The two brand colors are **white and one suitable accent color**. The design draft selects cobalt blue `#3157D5`; neutral grays are support colors for readability and structure.
- The product should be minimalist and aesthetic.
- **Never use emojis** in app, website, notifications, summaries, onboarding, or product-generated copy.
- The user communicates in Roman Hindi/Hinglish. Responding in that style is a good default unless they ask otherwise.

## Current product and technical direction

- React Native + TypeScript Android app for settings, test calls, call history, usage, billing status, and WhatsApp linking.
- A responsive customer website for marketing, signup, onboarding, customer portal, checkout, support, and signed APK downloads. Next.js + TypeScript is a candidate, not a user-confirmed requirement.
- Node.js + TypeScript backend, with HTTP API, WebSocket media gateway, and background worker processes.
- PostgreSQL for durable account, configuration, call, summary, subscription, and usage records. Redis is optional for transient state and job queues.
- Docker for local development and service packaging.
- A cloud telephony provider routes calls to a secure backend WebSocket. The mobile app does not carry live PSTN call audio.
- Exotel is a candidate provider for an India pilot, but **not yet selected**. Number availability, inbound routing, existing-number forwarding, bidirectional audio support, rates, account eligibility, and service terms must be validated.
- Use the official WhatsApp Business Platform/Cloud API or an approved BSP. A product-managed shared WhatsApp sender was proposed for an initial pilot, but this is still an architecture assumption to verify.
- Voice AI provider, payment provider (Razorpay/Cashfree candidates), cloud host, final prices, and business segment remain undecided.
- Monetization direction: recurring subscription with included call minutes plus controlled top-ups or explicitly authorized overage. Avoid claiming unlimited service until per-account variable cost is known.

## Important customer flows

1. Business owner creates a website account, configures the business and AI agent, connects a supported call route, pairs WhatsApp, opts into summaries, and places a test call.
2. Caller dials a configured provider number or supported forwarded route; provider streams audio to the Node.js media gateway; the backend connects the AI; the call ends with a call record and summary.
3. Owner sends a WhatsApp instruction; backend parses it into an allowlisted settings change; owner confirms; backend saves a new config version for future calls.
4. After an eligible call, backend sends an opted-in concise WhatsApp summary and exposes the call detail in the app/website.
5. Customer buys a monthly/annual plan from the website, sees included minutes and usage, and receives warnings/plan behavior at limits.

## Product guardrails to preserve

- Do not promise that the app can answer every ordinary SIM call. The call must reach a supported cloud telephony route; validate provider/carrier setup per customer.
- Keep provider credentials and AI keys only on the server. Never ship secrets in the APK or website bundle.
- Isolate all customer data by tenant and authorize every data access server-side.
- Caller audio is untrusted. It cannot override platform safety or the owner's configured rules.
- Agent must not invent prices, availability, appointments, or completed actions. Mark unknown details as unknown and offer a follow-up when unsure.
- Raw recording and full transcript storage are off by default. Recording/transcription requires clear customer configuration and caller disclosure/consent review.
- WhatsApp settings changes require confirmation; sensitive account, routing, billing, security, and retention changes require stronger authenticated steps.
- Store WhatsApp opt-in categories, honor opt-out, and use approved templates where required by current WhatsApp rules.
- Usage limits and overage behavior must be visible before billing; do not silently accrue unlimited charges.
- Direct APK distribution needs signing-key protection, versioning, integrity information, and a clear update guide.

## Design tokens to keep consistent

- White: `#FFFFFF`.
- Cobalt: `#3157D5`.
- Primary text: `#172033`; secondary text: `#667085`; border: `#E4E8F0`; subtle surface: `#F6F8FC`.
- Inter for English where practical; Noto Sans Devanagari/platform fallback for Hindi.
- Minimal borders, generous whitespace, restrained corner radii, one consistent outline icon set.
- No dark theme, emoji glyphs, decorative Unicode icons, busy gradients, or unnecessary animation.

## Project documents

- [PRD](ai-call-assistant-prd.md) — requirements, user flows, scope, monetization, launch phases, and acceptance criteria.
- [Architecture](architecture.md) — service boundaries, call/audio and WhatsApp flows, data model, API, deployment, and security.
- [Rules](rules.md) — enforceable product behavior, privacy, security, billing, and engineering constraints.
- [Design](design.md) — light-mode visual system, colors, typography, components, accessibility, and no-emoji rule.
- [Tasks](tasks.md) — phased implementation backlog with priorities and acceptance criteria.

## Open decisions / next critical steps

1. Pick the first target customer type and validate call scenarios with prospective users.
2. Prove India inbound telephony routing and existing-number forwarding with a provider and a real carrier/device.
3. Select voice AI vendor and measure Hindi/English quality, latency, and cost during a real call.
4. Confirm WhatsApp business account model, onboarding, templates, opt-in, and message costs.
5. Select payment provider and calculate viable included-minute limits and overage pricing.
6. Finalize caller disclosure, recording/transcript consent, data retention, and account deletion rules.
7. Decide final website framework, cloud host, plan prices, and trial limits.

## Working assumptions

These are recommendations in the generated planning docs, not confirmed user choices:

- Initial market and provider feasibility focus on India.
- Exotel is the first telephony provider to investigate.
- Initial pilot may use one product-managed WhatsApp Business number and securely link multiple customer identities.
- A single repository with separately deployable API, media gateway, and worker processes is preferred initially.
- The first commercial customer segment should be selected before building broad industry-specific features.
