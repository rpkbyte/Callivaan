# Callivaan — Product and Engineering Rules

**Status:** Draft project rules  
**Date:** 13 October 2026  
**Related documents:** [PRD](ai-call-assistant-prd.md) · [Architecture](architecture.md)

These rules apply to product behavior and implementation. `MUST` means required for launch; `SHOULD` means the default unless a documented product decision explains otherwise.

## 1. Product scope and source of truth

1. The first release is an Android app and website distributed/sold directly by the product. Do not make Play Store distribution or Play Billing a release dependency.
2. The Android app and website configure and monitor the service. Cloud telephony and the backend handle live PSTN audio; the client app MUST NOT be treated as the call media server.
3. The service answers only calls that reach an enabled, supported cloud telephony route. Do not claim that it can automatically answer every ordinary SIM call unless the customer's carrier/provider setup has been verified.
4. Provider-specific functionality MUST be isolated behind adapters. The application MUST NOT assume Exotel, a voice AI vendor, WhatsApp, or a payment provider is permanently fixed until the provider decision is approved.
5. The PRD defines user-visible requirements. The architecture defines service boundaries. If implementation discovers a conflict, document the decision and update both documents.

## 2. Tenant and account security

1. Every customer-owned record MUST be scoped to a tenant.
2. The backend MUST derive tenant access from the authenticated user and server-side membership. Never trust a tenant ID supplied by a client as authorization.
3. Every read, write, export, and delete operation MUST enforce tenant authorization, including background jobs and administrative tools.
4. Provider call metadata MUST be verified and mapped to a configured route before loading a tenant's agent configuration.
5. Provider, AI, WhatsApp, payment, database, and signing secrets MUST remain server-side in a secret manager or protected environment configuration. They MUST NOT be placed in the APK, website JavaScript bundle, source control, logs, or support messages.
6. Webhooks MUST validate the provider's signature/token and, where available, timestamp/replay protection. Event processing MUST be idempotent.
7. Production administrative access MUST be least-privilege, protected with MFA where supported, and logged.

## 3. Voice agent behavior

1. The agent MUST follow this instruction priority: platform safety and product constraints → verified business configuration → caller request.
2. Caller audio is untrusted input. A caller MUST NOT be able to override the business owner's settings, expose system prompts/secrets, or authorize unrelated actions.
3. The agent MUST identify itself as an AI assistant when configured or required by the applicable disclosure flow. It MUST NOT pretend to be a human employee.
4. The agent MUST answer using only active business facts and approved integrations. If it is unsure, it MUST say so and offer a callback or human follow-up.
5. The agent MUST NOT invent prices, availability, bookings, refunds, policy exceptions, or completed actions. It may confirm an action only after the connected system reports success.
6. The agent SHOULD collect only the details needed for the caller's request, such as name, callback number, service requested, preferred time, and urgency.
7. The agent MUST NOT request full card numbers, passwords, one-time passwords, or other authentication secrets over a call.
8. Each call MUST use a snapshot of the agent configuration active at call start. Changes made during an active call apply to subsequent calls unless an explicit safe mechanism is designed.
9. Each call MUST end in a defined outcome: completed, callback requested, human route/fallback, caller disconnected, limit reached, or technical failure.
10. If the AI or media connection fails, the call flow MUST use a configured fallback message/route or end cleanly. It MUST NOT leave a caller connected to silence indefinitely.
11. The backend MUST enforce maximum duration, concurrency, and spend/usage controls appropriate to the tenant's plan.

## 4. Call audio, summaries, and data retention

1. Raw call audio recording and full transcript storage MUST be off by default.
2. Recording or transcript storage may be enabled only after the customer configures it and the caller disclosure/consent flow has been reviewed for the applicable use case.
3. Call summaries MUST distinguish known facts from inferred or missing information. Uncertain fields MUST be omitted or marked unknown; never fabricate them.
4. Summaries MUST be limited to information needed for follow-up. Avoid exposing unnecessary sensitive details in notifications.
5. The owner MUST be able to view and delete call details subject to documented billing, security, and legal retention requirements.
6. Data retention periods MUST be documented and enforced by scheduled deletion jobs. Backups and any object storage MUST have a documented expiration/deletion approach.
7. Logs MUST NOT contain raw audio, access tokens, full prompts with personal information, or unnecessary full phone numbers. Use redaction or masking.

## 5. WhatsApp identity, commands, and notifications

1. Use the official WhatsApp Business Platform or an approved integration. Do not automate a personal WhatsApp account or use unofficial WhatsApp Web control as the production messaging path.
2. A WhatsApp identity MUST be linked to a signed-in product account using a short-lived, single-use pairing code. Pairing attempts MUST be rate-limited.
3. A WhatsApp message may change only settings the linked user is authorized to control.
4. Plain-language commands MUST be converted to a typed allowlisted settings patch. Do not execute arbitrary code, SQL, shell commands, or unrestricted tool actions from message content.
5. The system MUST show the proposed change and receive an explicit confirmation before applying changes to the live agent configuration.
6. Low-confidence or ambiguous requests MUST trigger a clarification question instead of a guessed setting change.
7. Changes to account ownership, payment method, phone routing, call recording, data retention, or security settings MUST require authenticated app/website access or an additional verification step.
8. The product MUST record the old/new configuration version, request source, confirmer, and timestamp for each applied WhatsApp change.
9. Call summaries and alerts may be sent only to users who opted in to the relevant message category. Opt-out requests MUST be honored promptly and stored.
10. Business-initiated messages MUST follow current WhatsApp template, service-window, quality, and pricing requirements. The sender MUST use an approved template whenever required.
11. WhatsApp provider acceptance does not prove delivery to the recipient's handset. Show delivery status accurately.
12. Pairing and notification flows MUST make it clear which business is sending messages and how the user can stop them.

## 6. Billing, usage, and monetization

1. Plans MUST state subscription price, renewal frequency, included minutes, overage/top-up price, and cancellation behavior clearly before purchase.
2. Do not offer unlimited usage until measured costs and abuse controls demonstrate that the plan can remain sustainable.
3. Track telephony duration, AI usage, messaging usage, and paid entitlement per tenant and billing period.
4. Usage aggregation MUST be idempotent and reconcile against provider records where available.
5. Warn customers before included usage is exhausted. Enforce the plan's configured behavior at the limit; do not silently accrue unlimited charges.
6. Overages MUST be disclosed and authorized before they are incurred, or the service MUST stop/limit usage according to the selected plan.
7. Payment webhooks MUST be authenticated, idempotent, and safe against duplicate or out-of-order events.
8. A payment failure MUST update account entitlements according to a documented grace-period policy. Do not delete call records merely because a subscription payment failed.
9. Keep billing and usage records separate from customer call content, with access limited to the necessary roles.

## 7. API, WebSocket, and data handling

1. Use HTTPS for APIs/webhooks and WSS for production media streams.
2. REST APIs MUST validate input, enforce authorization, rate-limit sensitive actions, and return non-sensitive errors.
3. WebSocket sessions MUST authenticate the provider and validate call/stream metadata before accepting media.
4. WebSocket handlers MUST bound message sizes, session duration, queues, and memory use; malformed or unsupported media events MUST fail safely.
5. Media adapters MUST document expected codec, sample rate, channel count, event protocol, and conversion behavior.
6. Call state transitions MUST be explicit and safe to repeat. Duplicate start/stop/status events MUST NOT create duplicate calls, summaries, notifications, or charges.
7. PostgreSQL is the durable source of truth for accounts, configuration, call metadata, summaries, subscriptions, and usage ledger. Redis may be used for transient state/queues but MUST NOT be the only copy of durable records.
8. All database queries and background jobs handling customer records MUST include tenant scope.
9. Use database migrations for schema changes. Production migrations MUST be backward-compatible with the currently deployed application during rollout where practical.

## 8. Reliability and operations

1. API, media gateway, worker, and provider webhook handling MUST emit structured logs with correlation IDs.
2. Metrics MUST cover call outcomes, first-audio latency, media/AI errors, summary timing, WhatsApp delivery, usage, and billing reconciliation.
3. Retries MUST be bounded, use backoff for transient errors, and avoid repeating non-idempotent side effects.
4. Notification failure MUST NOT erase or invalidate a successful call record.
5. The system MUST have configurable kill switches for inbound AI answering, WhatsApp notifications, and high-cost AI usage.
6. Production and staging MUST use separate numbers, WhatsApp configuration, payment accounts, databases, and secrets.
7. Local development MUST use mock/test adapters or sandbox accounts. Never replay production caller data in development.
8. Deployments MUST drain active WebSocket calls before terminating media gateway instances when the hosting platform allows it.
9. Backups MUST be monitored, and restoration steps MUST be documented before paid launch.

## 9. Website and APK distribution

1. Website checkout MUST use a supported payment flow and must not store raw card data.
2. Terms, privacy policy, pricing, cancellation/refund information, support contact, and data-retention information MUST be reachable from the website before paid signup.
3. APKs MUST be signed with a protected release key. Never commit the signing key or passwords to source control.
4. Every APK release MUST have a version number, release notes, checksum or equivalent integrity information, and a clear update path.
5. The website MUST explain Android's install-from-outside-store flow clearly and provide an authenticated download or account-specific access where appropriate.
6. Do not describe the app as an automatic SIM call-answering app unless the configured carrier/provider path actually supports that customer's use case.

## 10. Engineering workflow rules

1. Keep implementation decisions consistent with the PRD and architecture, or update the documents when a decision changes.
2. Prefer TypeScript types and schema validation at API, webhook, configuration, and provider-adapter boundaries.
3. Keep provider integration code out of business-domain logic. Map vendor payloads into internal typed events.
4. Avoid logging or returning secrets and unnecessary personal data. Review sample payloads before adding them to documentation or fixtures.
5. Changes to prompts, billing, tenant authorization, call routing, or retention behavior require explicit review because they affect customer trust or cost.
6. Before a production release, verify the release checklist in the PRD, provider sandbox/number configuration, secret configuration, rollback plan, and monitoring alerts.

## 11. Required configuration boundaries

Configuration values are environment-specific and must not be hard-coded:

- Database URL, Redis URL, and encryption/signing keys.
- Telephony provider credentials, number IDs, webhook secrets, and stream endpoint.
- AI provider API key, model identifier, timeout, and spend limits.
- WhatsApp access token, business/phone-number IDs, webhook verification secret, and approved template IDs.
- Payment-provider credentials, webhook secret, and plan/product IDs.
- Public website/API URLs, allowed origins, and environment name.
- Retention windows, plan limits, alert thresholds, and feature flags.

Keep a checked-in `.env.example` containing names and safe placeholders only. Never put real credentials in it.

## 12. Launch-blocking decisions

The following must be resolved before opening paid signup to the public:

- India telephony provider and proof that the target number routing/forwarding use case works end to end.
- Caller AI disclosure and any recording/transcription consent wording.
- WhatsApp account pairing, notification opt-in, templates, and opt-out behavior.
- Final data retention and account deletion behavior.
- Plan limits, overage behavior, spend caps, and payment failure grace period.
- APK signing/update process and user support for direct installation.
- Customer support escalation and emergency disable procedure.

## 13. Policy references

- [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy/preview?lang=en_US)
- [Exotel Programmable Voice documentation](https://developer.exotel.com/docs/voice)
- [Exotel AgentStream WebSocket protocol](https://developer.exotel.com/docs/agentstream/websocket-protocol)

Recheck vendor policies and technical limits during implementation and before launch; they may change.
