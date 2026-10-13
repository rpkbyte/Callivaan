# Product Requirements Document: Callivaan

**Status:** Draft for MVP planning  
**Date:** 13 October 2026  
**Product working name:** Callivaan (pending trademark clearance)  
**Initial market:** India  
**Distribution:** Direct website sales and Android APK download; no Play Store launch in this phase

## 1. Product summary

Callivaan is a subscription service for small businesses and independent professionals. It answers inbound customer calls with a configurable AI voice agent, captures the caller's request, and sends the business owner a concise call summary over WhatsApp. The owner can manage settings from the Android app, website, and a linked official WhatsApp Business conversation.

The initial product is designed for businesses that lose leads when they cannot answer the phone: for example, repair services, salons, property agents, and other appointment or enquiry-based businesses.

The Android app and website are the user-facing control surfaces. A cloud telephony provider routes calls and streams call audio to the Node.js backend. The backend connects the audio to a real-time voice AI service, stores call results, and sends opted-in notifications through the WhatsApp Business Platform.

## 2. Problem and opportunity

Small businesses often miss calls while serving customers, outside business hours, or when staff are unavailable. A missed call can mean a lost booking or sales lead. Existing voicemail is passive and often leaves the owner with little structured information about what the caller needs.

The product should answer common calls, collect useful details, and give the owner a clear next action without requiring the owner to stay on the phone.

## 3. Goals

- Answer inbound calls routed through a supported cloud telephony setup.
- Let each customer configure the AI agent's role, tone, language, business details, FAQs, and escalation rules.
- Let the customer update agent instructions through the app, website, and linked WhatsApp account.
- Send an opted-in WhatsApp summary after each eligible call.
- Capture structured lead details such as caller intent, requested appointment time, urgency, and follow-up action.
- Sell and manage subscriptions directly through the product website.
- Keep call usage and variable service costs visible so plans can include minute allowances and paid overages.

## 4. Non-goals for the MVP

- Launching through Google Play or building an iOS app.
- Reliably answering a user's ordinary SIM calls without a supported call-forwarding or carrier integration.
- Automated outbound sales calls or bulk calling campaigns.
- Replacing a full contact centre, CRM, or human receptionist team.
- Storing call recordings by default.
- Supporting every telephony provider, language, country, or business vertical at launch.

## 5. Target users

### Primary user: owner/operator

An individual or small business owner who receives customer calls, is often busy, and wants to avoid losing enquiries. They may not have technical staff and should be able to configure the agent using plain language.

### Secondary user: staff member

A staff member who reviews call summaries, follows up with leads, or helps maintain business hours and FAQs. Team access can be limited to higher plans or a later release.

### Caller

A customer calling the business. The caller should receive a natural greeting, know when they are speaking to an AI assistant where required, and have a clear option to request a human follow-up.

## 6. Product experience and primary flows

### 6.1 Customer onboarding

1. Customer visits the product website and creates an account.
2. Customer selects a plan or starts a clearly limited trial.
3. Customer verifies their email and mobile number.
4. Product explains the supported telephony setup and checks whether the customer's number can be routed to the selected provider.
5. Customer connects a provider number or configures supported call forwarding.
6. Customer links WhatsApp by sending a one-time pairing code to the product's official WhatsApp Business number.
7. Customer opts in to receiving call summaries and account notifications on WhatsApp.
8. Customer configures the agent, business hours, greeting, languages, FAQs, and escalation behavior.
9. Customer places a test call and sees the resulting summary.

### 6.2 Incoming call

1. A caller dials the configured cloud number or a number routed to the provider.
2. The telephony provider runs the customer's configured call flow and opens a secure WebSocket to the backend.
3. The AI greets the caller, handles the conversation, and gathers relevant details.
4. The agent follows the customer's rules, avoids making commitments outside its approved knowledge, and offers a human follow-up when it cannot help.
5. When the call ends, the backend creates a summary and structured call record.
6. The backend sends the customer an opted-in WhatsApp summary, subject to WhatsApp messaging rules and delivery eligibility.

### 6.3 WhatsApp prompt and settings control

The customer can send plain-language configuration requests to the linked business WhatsApp channel. Examples:

- “Hindi mein baat karo aur pehle caller ka naam pucho.”
- “Appointment request aaye to preferred date aur time note karo.”
- “Urgent repair request par mujhe turant alert bhejo.”
- “Price confirm mat karna; bolo ki team wapas call karegi.”

The system should turn messages into a proposed settings change, show a concise confirmation, and apply the change only after the customer's confirmation. It should preserve a versioned audit history and allow the customer to undo the latest change. WhatsApp commands must not bypass account permissions or safety limits.

### 6.4 Call summary

The default summary should contain:

- Call date, time, duration, and status.
- Caller number, subject to provider availability and privacy settings.
- Short summary of the caller's request.
- Extracted details such as name, requested service, preferred time, and urgency when provided.
- Suggested next action.
- Link to the app or website call detail page.

Full transcript and recording access are optional settings, off by default for the MVP. The summary must indicate uncertainty rather than invent missing information.

## 7. Functional requirements

### FR-1: Account and business profile

- Sign up, sign in, password reset, email/mobile verification.
- Store business name, category, timezone, operating hours, supported languages, service area, FAQs, and escalation contact.
- Support account deletion and export of account data.

### FR-2: AI agent configuration

- Configure greeting, tone, language, business facts, FAQs, information to collect, and prohibited commitments.
- Provide starter templates for the first supported business categories.
- Preview and test the current configuration before activating it.
- Keep configuration changes versioned and show when each version became active.
- Validate prompt size and reject unsafe or unsupported settings.

### FR-3: Telephony integration

- Configure provider account and inbound call flow per tenant, using provider-supported patterns.
- Accept provider call events and bidirectional audio streams over secure WebSockets.
- Validate provider webhook signatures or equivalent authentication.
- Handle call start, media, interruption, disconnect, timeout, and provider error events.
- Show setup instructions and a test-call status in the app and website.
- Treat India provider-number availability, call-forwarding behavior, and account eligibility as launch validation items.

### FR-4: Voice AI conversation

- Connect live call audio to a real-time voice AI service or a speech-to-text, language-model, and text-to-speech pipeline.
- Support interruption/barge-in, silence timeout, maximum call duration, and graceful fallback.
- Prevent the agent from claiming a booking or action succeeded unless a connected system confirms it.
- Offer a human follow-up path, initially by capturing a callback request and alerting the owner.

### FR-5: Call history and summaries

- Store call metadata and generated summaries in a tenant-isolated call history.
- Search/filter by date, call status, caller number, and extracted intent.
- Show processing/delivery status and allow the owner to correct or delete a summary.
- Do not retain raw audio or full transcripts unless the owner explicitly enables it and the required disclosure/consent flow is in place.

### FR-6: WhatsApp integration

- Use the official WhatsApp Business Platform/Cloud API or an approved provider integration.
- Pair a WhatsApp identity to one product account using a short-lived one-time code.
- Record opt-in categories separately where practical: call summaries, urgent alerts, and product/account updates.
- Receive owner messages through a signed webhook, interpret supported configuration requests, and request confirmation before applying changes.
- Send summaries and urgent alerts only when the user opted in and message delivery is allowed by current WhatsApp rules.
- Support STOP/opt-out and update notification preferences immediately.
- Use approved templates where required outside the customer-service messaging window.

### FR-7: Website sales, plans, and billing

- Public pages: product overview, use cases, pricing, FAQ, privacy policy, terms, support, and setup guide.
- Checkout for monthly/annual plans and any permitted usage top-ups.
- Subscription status, invoices/receipts, renewal date, cancellation, and payment-failure handling.
- Billing provider webhooks must be authenticated and idempotent.
- Show included minutes, current usage, overage rate, and estimated charges before the customer incurs extra usage.
- Candidate payment providers include Razorpay or Cashfree; select after verifying recurring-payment support, fees, settlement, and compliance for the target business.

### FR-8: Android app

- React Native with TypeScript.
- Login, onboarding, agent settings, test call, call history, usage, billing status, WhatsApp linking, and notification preferences.
- Provide APK download from the product website and a signed release/update process.
- The app does not process the live PSTN call audio in the MVP; telephony and AI audio run in the cloud backend.

### FR-9: Admin and support

- Internal admin view for account status, provider connection health, call failures, usage, and WhatsApp delivery failures.
- Restrict staff access by role and log sensitive administrative actions.
- Provide a support path for number setup and billing issues.

## 8. Monetization and unit economics

### Recommended initial model

Use a recurring subscription with an included monthly call-minute allowance, then charge for additional usage through top-ups or a clearly disclosed overage rate. Avoid an unlimited plan until measured usage and provider costs support it.

Potential plan structure:

- **Trial:** limited number of test/live minutes and basic summaries.
- **Personal:** one business profile and number, basic agent, monthly minute allowance, WhatsApp summaries.
- **Business:** larger minute allowance, business hours, FAQs, lead capture, urgent alerts, and more configuration options.
- **Team:** multiple staff or locations, shared call history, additional numbers, and integrations.
- **Custom:** negotiated limits, onboarding, and support for larger customers.

Illustrative price tests for India (not final market research): Personal ₹299–₹499/month; Business ₹999–₹2,499/month; Team/custom priced after discovery. Test willingness to pay with pilot customers before publishing final prices.

Track variable cost per tenant: telephony minutes + voice AI usage + WhatsApp messaging + hosting/storage + payment processing + support. The key operating measure is contribution margin per customer after variable service costs. Set alerts and usage caps to avoid surprise bills and losses.

## 9. Technical direction

- **Android:** React Native + TypeScript.
- **Website:** responsive web app and marketing/checkout site; React/Next.js with TypeScript is a suitable candidate, pending implementation decision.
- **Backend:** Node.js + TypeScript, with Fastify or Express; REST APIs for product actions and WebSockets for media streams.
- **Database:** PostgreSQL for accounts, settings, subscriptions, call metadata, and summaries.
- **Session/cache:** Redis is optional for active call/session state and rate limiting.
- **Deployment:** Dockerized services on a managed cloud host; HTTPS/WSS, secret manager, backups, and production monitoring.
- **Integrations:** India cloud telephony provider (Exotel is a candidate to validate), one voice AI provider, WhatsApp Business Platform, and a website payment provider.

### Credentials and secrets

Expected credentials include telephony account/API credentials and number IDs; AI provider API key; WhatsApp Business Account, phone-number ID, access token, and webhook verification configuration; payment-provider API keys and webhook secret; and cloud deployment credentials. Store secrets in a server-side secret manager or protected environment configuration. Never embed provider or AI secrets in the Android APK or website bundle.

## 10. Privacy, safety, and security requirements

- Provide clear disclosure that an AI assistant may answer the call.
- Obtain any required caller notice/consent before recording or retaining call audio/transcripts; recording is off by default.
- Give the product customer controls for summary delivery, transcript retention, recording, deletion, and retention period.
- Encrypt data in transit and at rest; isolate each tenant's data; apply least-privilege access.
- Verify signatures on telephony, WhatsApp, and billing webhooks; use idempotency for event handling.
- Keep audit logs for prompt changes, account access, billing state, and administrative actions.
- Add rate limits, spend limits, abuse monitoring, and emergency kill switches for calls and AI usage.
- Publish privacy, terms, cancellation/refund, and data-retention policies on the website.
- Validate applicable telecom, privacy, consumer, and messaging rules with qualified counsel before public launch.

## 11. Success metrics

### Activation

- Signup-to-first-test-call conversion.
- Signup-to-first-successful-routed-call conversion.
- Median time from signup to a working test call.

### Product value

- Percentage of calls answered by the agent successfully.
- Percentage of calls with a useful summary delivered.
- Owner-rated summary usefulness and AI conversation quality.
- Number of follow-ups or leads captured per active customer.
- Call failure, transfer/follow-up, and WhatsApp delivery failure rates.

### Business health

- Trial-to-paid conversion.
- Paid customer retention and monthly churn.
- Average revenue per account.
- Usage cost and contribution margin per account.
- Support tickets per active account and number-setup completion rate.

## 12. MVP acceptance criteria

The MVP is ready for a limited paid pilot when:

1. A customer can create an account, configure the business profile, and complete a test call.
2. A supported inbound number can route a call to the AI agent through the selected provider.
3. The AI can greet a caller, answer within configured business knowledge, collect basic details, and end gracefully.
4. A call record and concise summary appear in the app/website after the call.
5. A linked, opted-in WhatsApp account receives the allowed summary message; opt-out is respected.
6. A customer can request a prompt/settings change on WhatsApp, confirm it, and see the new version reflected in the app.
7. Subscription activation, usage tracking, payment failure, cancellation, and usage-limit behavior work end to end.
8. The website provides signed APK downloads, setup instructions, privacy/terms pages, and support contact.
9. Provider and AI secrets are not present in client-side app/web bundles.
10. Tenant data is access-controlled, and a customer can request deletion of their account data.

## 13. Delivery phases

### Phase 0: feasibility and provider validation

- Confirm India provider number availability, inbound call routing, forwarding compatibility, bidirectional audio support, and commercial terms.
- Confirm WhatsApp Business Platform onboarding and template requirements.
- Run a minimal call-to-WebSocket-to-AI prototype and measure latency/cost.
- Interview target businesses and validate the first vertical and pricing assumptions.

### Phase 1: MVP

- Account onboarding, one business profile, one provider route, agent setup, test call, call history, WhatsApp pairing/summary, and website billing.
- Direct signed Android APK distribution.
- Basic internal monitoring and manual customer support.

### Phase 2: paid pilot improvements

- Multiple numbers or locations, richer prompt templates, team access, calendar/CRM integrations, enhanced usage controls, and improved analytics based on pilot data.

## 14. Key risks and open decisions

1. **Number routing:** Can the chosen provider supply a usable inbound number and support forwarding from the target customer's existing Indian number? Validate before building onboarding around it.
2. **Telephony policy and eligibility:** Provider availability, number requirements, and call routing rules can differ by use case and change over time.
3. **WhatsApp onboarding:** Decide whether MVP uses one product-managed WhatsApp Business number with linked customer accounts or each customer connects their own WhatsApp Business account. The shared-number approach is simpler to pilot; per-customer numbers may offer stronger branding but add onboarding and operational complexity.
4. **AI quality and latency:** Test noisy calls, Hindi/English mixing, interruptions, and low network quality with real callers.
5. **Variable costs:** Call minutes, AI tokens/audio, messaging, and support may make low-priced or unlimited plans unprofitable.
6. **Direct APK distribution:** Define signing-key protection, versioning, update prompts, and customer trust/support for installing outside an app store.
7. **Recording and consent:** Finalize caller disclosure, opt-in, storage, and deletion behavior before enabling transcripts or recordings.
8. **Payment provider:** Choose Razorpay or Cashfree after checking subscription mandates, failed-payment recovery, fees, and supported payment methods.

## 15. External references for implementation planning

- [Exotel Programmable Voice documentation](https://developer.exotel.com/docs/voice)
- [Exotel AgentStream WebSocket protocol](https://developer.exotel.com/docs/agentstream/websocket-protocol)
- [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy/preview?lang=en_US)
- [React Native TypeScript documentation](https://reactnative.dev/docs/typescript)

Provider features, pricing, eligibility, and platform policies must be rechecked during implementation and before launch.
