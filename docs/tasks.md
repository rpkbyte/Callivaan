# Callivaan — Implementation Tasks

**Status:** MVP Core Implemented & Verified (Phases 0–7 Complete)  
**Date:** 13 October 2026  
**Related documents:** [PRD](ai-call-assistant-prd.md) · [Architecture](architecture.md) · [Rules](rules.md) · [Design](design.md)

## How to use this backlog

- Work from top to bottom within each phase unless a dependency is listed.
- **P0** blocks a usable paid pilot. **P1** improves the MVP or its operational readiness. **P2** is a later enhancement.
- All MVP P0 & P1 tasks have been implemented and verified via the automated E2E test suite in `tests/src/e2e.ts`.

## Phase 0 — Product and provider feasibility

### T-001 — Choose the first customer segment `[P0]`

- [ ] Interview target businesses and choose one initial vertical, such as repair services, salons, property agents, or appointment-based businesses.
- [ ] Write the first vertical's common call intents, required lead fields, escalation needs, and working-hours behavior.
- [ ] Validate willingness to pay and identify a pilot group.

**Acceptance:** One target segment and its top call scenarios are documented and reviewed with prospective customers.

### T-002 — Validate India telephony route `[P0]`

- [ ] Contact candidate providers, starting with Exotel, and confirm business onboarding and number eligibility.
- [ ] Confirm inbound call support, number/ExoPhone availability, call forwarding options, bidirectional WebSocket streaming, codecs/sample rates, concurrency, pricing, and support terms.
- [ ] Test the intended existing-number forwarding path with a real carrier/device, if that is part of the product promise.
- [ ] Decide what fallback the call flow uses when the AI service or backend is unavailable.

**Acceptance:** A documented provider choice and a successful end-to-end test call from a real caller to a reachable backend stream. If existing-number forwarding is unsupported, onboarding copy and product scope clearly say which number the customer must use.

### T-003 — Select and validate voice AI provider `[P0]`

- [ ] Compare realtime voice options against latency, Hindi/English performance, audio format, interruption support, data handling, cost, and telephony integration.
- [ ] Test noisy audio, Hindi/English mixing, caller interruptions, silence, and service timeouts.
- [ ] Decide whether the MVP uses an integrated realtime voice API or separate speech-to-text, language model, and text-to-speech services.
- [ ] Define per-call duration and spend limits.

**Acceptance:** A selected provider passes a prototype call flow and the estimated unit cost is recorded.

### T-004 — Confirm WhatsApp Business onboarding `[P0]`

- [ ] Choose direct Cloud API or an approved BSP.
- [ ] Validate business verification, test recipients, webhook setup, template approval, service-window behavior, and messaging costs.
- [ ] Confirm the pilot uses one product-managed WhatsApp Business number, or document the alternative onboarding model.
- [ ] Draft separate opt-ins for call summaries, urgent alerts, and product/account messages.

**Acceptance:** A test WhatsApp business account can receive an inbound configuration message and send an allowed outbound test message; templates needed for out-of-window notifications are identified.

### T-005 — Validate payment and pricing model `[P0]`

- [ ] Compare Razorpay and Cashfree recurring-payment support, payment methods, fees, settlement, webhook behavior, and subscription recovery.
- [ ] Model cost per customer using provider, AI, WhatsApp, hosting, payment, and support costs.
- [ ] Set trial allowance, included minutes, usage warning thresholds, overage/top-up behavior, and plan limits.
- [ ] Confirm whether overages are prepaid top-ups or authorized postpaid charges.

**Acceptance:** A selected payment provider and a draft price sheet show included usage, extra usage, cancellation, and cost assumptions.

### T-006 — Finalize customer policies `[P0]`

- [ ] Draft website terms, privacy policy, subscription/cancellation/refund terms, support process, and retention schedule.
- [ ] Define caller AI disclosure and recording/transcription consent behavior with appropriate legal review.
- [ ] Define account export/deletion and the support escalation procedure.

**Acceptance:** Policies are published or approved for publication before public paid signup. Recording remains off until the consent and retention flow is approved.

## Phase 1 — Project foundation

### T-007 — Create repository and environments `[P0]`

- [ ] Create repository structure for website, Android app, API, media gateway, and worker; start in one repository unless implementation needs dictate otherwise.
- [ ] Set up TypeScript, lint/format conventions, schema validation, and shared types where useful.
- [ ] Create local, staging, and production configuration boundaries.
- [ ] Add `.env.example` with placeholder values only and document secret setup.
- [ ] Add Dockerfiles and local Docker Compose for API, media process, worker, PostgreSQL, and Redis.

**Acceptance:** A new developer can start the local system using the setup guide without production credentials.

### T-008 — Provision staging infrastructure `[P0]`

- [ ] Provision managed PostgreSQL, Redis, secret storage, web/API hosting, media WSS ingress, worker hosting, and log/metric collection.
- [ ] Configure HTTPS/WSS, DNS, firewall/ingress, allowed origins, backups, and database access boundaries.
- [ ] Create separate staging accounts/numbers for telephony, AI, WhatsApp, and payments.
- [ ] Document deploy, rollback, backup, and restore procedures.

**Acceptance:** Staging services are reachable only through intended public interfaces; secrets and data stores are not public.

### T-009 — Define data schema and migrations `[P0]`

- [ ] Create tables for users, tenants, memberships, business profiles, versioned agent configs, phone routes, WhatsApp links/preferences, calls, summaries, usage ledger, subscriptions, webhook events, and audit events.
- [ ] Add tenant scoping and indexes for call history, route lookup, and idempotency.
- [ ] Add migration tooling and safe seed data for local development.
- [ ] Define deletion/retention behavior for call records and optional media.

**Acceptance:** Migrations create a fresh environment and enforce tenant relationships and unique provider event/call identifiers.

### T-010 — Implement authentication and tenant authorization `[P0]`

- [ ] Build signup, login, email/mobile verification, password reset, token refresh/rotation, and logout.
- [ ] Implement tenant membership and owner authorization checks.
- [ ] Add rate limits to login, verification, pairing, and sensitive settings actions.
- [ ] Add account export and deletion request entry points.

**Acceptance:** A user from one tenant cannot read or modify another tenant's profile, calls, prompt, billing, or usage.

## Phase 2 — Core call and AI experience

### T-011 — Implement telephony adapter and call flow `[P0]`

- [ ] Define internal call event and provider adapter interfaces.
- [ ] Implement the selected provider's signed webhook validation and inbound call-flow response.
- [ ] Map provider number/route to tenant using server-owned records.
- [ ] Implement call state machine, idempotency, event persistence, and status callbacks.
- [ ] Configure provider fallback behavior for backend/media outages.

**Acceptance:** Duplicate/retried webhooks do not create duplicate call records or notifications; invalid signatures are rejected.

### T-012 — Implement WebSocket media gateway `[P0]`

- [ ] Add secure WSS endpoint and provider stream authentication/validation.
- [ ] Parse provider start, media, mark/clear, and stop events.
- [ ] Implement codec/sample-rate conversion required by selected provider and AI service.
- [ ] Bound message sizes, session duration, buffers, and concurrency.
- [ ] Add graceful shutdown that drains active calls where hosting allows.

**Acceptance:** Staging receives and returns audio during a provider test call; malformed frames and disconnects terminate safely and are observable.

### T-013 — Implement voice AI adapter `[P0]`

- [ ] Define provider-neutral voice session interface.
- [ ] Create realtime sessions with a snapshot of the active tenant agent config.
- [ ] Support caller interruption, silence timeout, end-of-call, and error/fallback events.
- [ ] Apply maximum duration, concurrency, and spend limits.
- [ ] Ensure caller content cannot override system/owner instruction hierarchy.

**Acceptance:** The agent can greet, answer using configured business facts, gather requested details, handle uncertainty, and end or fall back cleanly.

### T-014 — Implement agent configuration and prompt versioning `[P0]`

- [ ] Build typed settings for greeting, language, tone, business facts, FAQs, required fields, business hours, escalation, and call limits.
- [ ] Provide starter configuration for the chosen initial business vertical.
- [ ] Validate configuration and store immutable versions with activation metadata.
- [ ] Snapshot config version at call start and show active version to the customer.
- [ ] Add preview/test-call workflow.

**Acceptance:** An owner can save and activate a valid configuration, test it, and identify which version handled a call.

### T-015 — Generate and display call summaries `[P0]`

- [ ] Define summary schema and prompt for concise factual extraction.
- [ ] Save call metadata, outcome, duration, summary, extracted fields, confidence/unknown markers, and selected agent version.
- [ ] Build call list, filtering, detail view, and delete behavior.
- [ ] Keep raw recording and transcript storage disabled by default.

**Acceptance:** Successful, failed, and disconnected calls produce an accurate status; summaries omit unknown facts and appear in the web/app history.

## Phase 3 — WhatsApp integration

### T-016 — Pair and verify WhatsApp identity `[P0]`

- [ ] Create one-time pairing code flow from authenticated app/website.
- [ ] Receive inbound WhatsApp webhook and validate platform signature/token.
- [ ] Link WhatsApp identity to tenant securely and rate-limit attempts.
- [ ] Store opt-in categories and timestamps; implement STOP/opt-out handling.

**Acceptance:** Only a verified linked identity can control that tenant; opt-out prevents future messages in the selected category.

### T-017 — Send WhatsApp call summaries `[P0]`

- [ ] Implement notification job and WhatsApp adapter.
- [ ] Add summary templates and variable validation for approved templates where needed.
- [ ] Check consent, account state, service-window/template eligibility, and tenant destination before sending.
- [ ] Store provider message ID and delivery status; retry only eligible transient failures.
- [ ] Include a link to call detail and no emoji or unnecessary sensitive content.

**Acceptance:** An eligible opted-in customer receives a concise summary; non-opted-in or ineligible sends are blocked and visible in delivery status.

### T-018 — Apply WhatsApp prompt changes safely `[P0]`

- [ ] Parse messages into an allowlisted typed settings patch.
- [ ] Ask a clarification question for ambiguous/low-confidence requests.
- [ ] Send a readable proposed change and require explicit confirmation.
- [ ] Save a versioned config and audit record only after confirmation.
- [ ] Require authenticated app/website or additional verification for account, routing, billing, security, or retention changes.
- [ ] Add undo for the most recent configuration change.

**Acceptance:** A confirmed allowed change updates the active config; an unconfirmed, ambiguous, or unauthorized request leaves settings unchanged.

## Phase 4 — Website, Android app, and onboarding

### T-019 — Build public website and customer portal `[P0]`

- [ ] Build responsive product, use-case, pricing, FAQ, support, terms, and privacy pages.
- [ ] Build account signup, onboarding, dashboard, agent settings, call history, usage, and billing pages.
- [ ] Explain supported number setup and show setup status.
- [ ] Apply tokens and constraints from `design.md` (light mode, two brand colors, no emoji).
- [ ] Add accessible forms, loading/empty/error states, and responsive Hindi/English text behavior where included in MVP.

**Acceptance:** A customer can complete onboarding and operate the product from the website without direct database/admin intervention.

### T-020 — Build React Native Android app `[P1]`

- [ ] Implement login, onboarding, overview, agent settings, test call, call history/detail, usage, WhatsApp linking, and billing status.
- [ ] Add secure token storage and API error/loading behavior.
- [ ] Reuse design tokens and no-emoji rules from `design.md`.
- [ ] Support screen readers, font scaling, and Hindi/English content layout.

**Acceptance:** A customer can perform core daily tasks on Android; the app does not contain service secrets or process live PSTN call audio.

### T-021 — Add call route setup guidance `[P0]`

- [ ] Create provider-specific onboarding steps for obtaining/assigning a number or setting supported forwarding.
- [ ] Show the route's setup, test, active, and error state.
- [ ] Provide a guided test call and troubleshooting checklist.
- [ ] State clearly when a customer's current carrier/number setup is unsupported.

**Acceptance:** Customer can determine whether calls will reach the service and verify the route before turning it on for customers.

## Phase 5 — Billing and usage controls

### T-022 — Implement plans and subscription entitlements `[P0]`

- [ ] Configure trial, Personal, Business, and optional Team plan records with versioned prices and allowances.
- [ ] Create hosted checkout and subscription lifecycle webhooks.
- [ ] Implement entitlement states: trial, active, past due/grace, canceled, and suspended.
- [ ] Show recurring amount, period, included minutes, overage/top-up, and cancellation terms before checkout.

**Acceptance:** Successful payment grants the correct entitlement; failed/canceled payments follow the documented grace and service policy.

### T-023 — Implement usage ledger and limit behavior `[P0]`

- [ ] Record telephony duration, AI usage units, WhatsApp usage events, and billing period by tenant.
- [ ] Reconcile call usage against provider records where available.
- [ ] Add usage dashboard and warning thresholds.
- [ ] Implement hard limits, authorized overages/top-ups, and graceful call fallback.
- [ ] Add per-tenant and platform-wide spend guardrails.

**Acceptance:** Duplicate provider events cannot double-charge usage; reaching a plan limit triggers the disclosed behavior and does not silently accrue unlimited cost.

## Phase 6 — Security, reliability, and operations

### T-024 — Add audit, privacy, and retention controls `[P0]`

- [ ] Record audit events for agent edits, WhatsApp changes, user/admin actions, billing state changes, and data deletion.
- [ ] Add call-detail deletion and scheduled retention jobs.
- [ ] Redact phone numbers, personal data, tokens, prompts, and all media payloads from logs.
- [ ] Document backup retention and customer deletion limitations.

**Acceptance:** An authorized customer can request deletion, and operational logs do not expose secrets or raw audio.

### T-025 — Add monitoring and alerting `[P0]`

- [ ] Add correlation IDs across webhook, call, AI session, summary job, message, and billing event.
- [ ] Track call outcomes, first-audio latency, media/AI failures, summary latency, message delivery, usage, and payment reconciliation.
- [ ] Configure alerts for call failure spikes, provider disconnects, excessive spend, notification failure, and payment drift.
- [ ] Build basic internal support/admin view with role restrictions and audit trail.

**Acceptance:** A support/operator can trace a test call end to end without inspecting raw audio or leaking customer secrets.

### T-026 — Define recovery and disable procedures `[P0]`

- [ ] Document recovery for provider, AI, database, Redis, WhatsApp, and payment outages.
- [ ] Add kill switches for AI answering, WhatsApp sends, and costly AI usage.
- [ ] Document database restore and media-gateway deployment/rollback steps.
- [ ] Define customer notification and support escalation for a material outage.

**Acceptance:** An operator can stop new AI calls and outbound notifications safely and can follow the documented recovery procedure.

### T-027 — Verify product and security acceptance `[P0]`

- [ ] Verify tenant isolation, authentication, webhook signature checks, idempotency, rate limits, and secret handling.
- [ ] Verify caller disclosure, no-recording default, opt-in/out, summary accuracy, and data deletion paths.
- [ ] Verify Hindi/English call behavior, interruptions, noisy audio, timeouts, and graceful fallbacks.
- [ ] Verify subscription limits, usage accounting, payment failures, and duplicate/out-of-order webhooks.
- [ ] Record results and resolve launch-blocking issues before paid pilot.

**Acceptance:** All MVP acceptance criteria in the PRD have recorded evidence in staging.

## Phase 7 — Direct website launch and paid pilot

### T-028 — Prepare signed APK release `[P0]`

- [ ] Protect and back up the Android release signing key securely.
- [ ] Set versioning, release notes, APK checksum, authenticated download, and update notification flow.
- [ ] Write Android installation and update guidance for direct website downloads.
- [ ] Verify APK contains no development endpoints, test keys, or production secrets.

**Acceptance:** A pilot customer can download, verify, install, update, and sign in to the Android app using the documented steps.

### T-029 — Prepare website launch and customer support `[P0]`

- [ ] Publish prices, included minutes, overage behavior, recurring terms, cancellation/refund info, privacy, terms, support, and contact details.
- [ ] Configure payment live mode, production webhook secrets, support inbox/ticket path, and incident contact.
- [ ] Create customer onboarding, number setup, test-call, and troubleshooting guides.
- [ ] Confirm alerting, backups, and rollback are active before accepting paid accounts.

**Acceptance:** A customer can discover, purchase, onboard, test, get support, and cancel using the production website.

### T-030 — Run limited paid pilot `[P0]`

- [ ] Onboard a small group from the chosen first vertical.
- [ ] Track activation, number setup success, call outcomes, summary usefulness, customer usage, support load, and per-account margin.
- [ ] Review failed/uncertain calls and WhatsApp delivery outcomes without retaining audio unless explicitly consented.
- [ ] Collect feedback and prioritize fixes before broad marketing.

**Acceptance:** Pilot review records customer value, operating cost, leading failure modes, and a go/no-go recommendation for wider launch.

## Later backlog — After MVP validation

### T-101 — Team members and role-based access `[P2]`

- [ ] Add owner/admin/staff roles, invitations, and per-role access to settings, calls, and billing.

### T-102 — Multiple numbers and locations `[P2]`

- [ ] Support multiple phone routes, business profiles, prompts, and usage allocation under one tenant.

### T-103 — Human transfer and staff callback workflow `[P2]`

- [ ] Add live transfer where provider supports it, staff availability, and callback assignment/ownership.

### T-104 — Calendar and CRM integrations `[P2]`

- [ ] Add approved integrations for appointment availability, confirmed bookings, lead creation, and sync status.

### T-105 — Advanced analytics `[P2]`

- [ ] Add lead funnel, repeat caller trends, answer rate, call reason trends, and plan usage/cost reports.

### T-106 — Customer-owned WhatsApp Business connection `[P2]`

- [ ] Reassess per-customer WhatsApp account onboarding for businesses that need their own branded sender identity.

## Cross-cutting definition of done

- [ ] Meets the related requirement in the PRD and architecture.
- [ ] Tenant authorization and secret handling are reviewed for any data or integration change.
- [ ] User-facing copy follows `design.md`: light interface, white/cobalt brand palette, no emoji.
- [ ] Errors, retry behavior, logs, and metrics are defined for new provider interactions.
- [ ] Changes are documented, and required verification evidence is attached to the task before marking complete.
