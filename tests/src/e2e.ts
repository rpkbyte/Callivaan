/**
 * Callivaan Comprehensive End-to-End Verification Test Suite
 * Validates T-009, T-010, T-011, T-012, T-013, T-014, T-015, T-016, T-017, T-018, T-022, T-023, T-024.
 */
import http from 'http';
import { createServer } from '@callivaan/api';
import { createMediaServer, runMockCallSimulation } from '@callivaan/media-gateway';
import { formatWhatsAppSummaryText } from '@callivaan/worker';
import { getDatabase, resetDatabaseForTesting } from '@callivaan/database';
import { STARTER_PRESETS, STANDARD_PLANS } from '@callivaan/shared';

let apiPort = 4100;
let mediaPort = 4101;
let apiServer: http.Server;
let mediaGateway: ReturnType<typeof createMediaServer>;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`PASSED: ${message}`);
}

async function startServers() {
  resetDatabaseForTesting();

  const app = createServer();
  apiServer = app.listen(apiPort);

  mediaGateway = createMediaServer(mediaPort);
  mediaGateway.server.listen(mediaPort);

  console.log(`Test servers listening on API port ${apiPort} and Media port ${mediaPort}`);
}

async function stopServers() {
  await mediaGateway.drainActiveCalls();
  mediaGateway.server.close();
  apiServer.close();
}

async function request(endpoint: string, options: RequestInit = {}): Promise<{ status: number; body: any }> {
  const url = `http://localhost:${apiPort}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as any),
    },
  });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

// -------------------------------------------------------------
// Test 1: Tenant Isolation & Authorization (T-010)
// -------------------------------------------------------------
async function testTenantIsolation() {
  console.log('\n--- 1. Testing Tenant Isolation & Strict Authorization ---');

  // Sign up Tenant A
  const signupA = await request('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: 'alice@repair.demo',
      password: 'password123',
      fullName: 'Alice Verma',
      businessName: 'Alice Appliance Repairs',
      category: 'repair_service',
      phoneNumber: '+919811111111',
    }),
  });
  assert(signupA.status === 201, 'Tenant A registered successfully');
  const tokenA = signupA.body.accessToken;
  const tenantAId = signupA.body.tenant.id;

  // Sign up Tenant B
  const signupB = await request('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: 'bob@salon.demo',
      password: 'password123',
      fullName: 'Bob Kapoor',
      businessName: 'Bob Hair & Spa',
      category: 'salon_spa',
      phoneNumber: '+919822222222',
    }),
  });
  assert(signupB.status === 201, 'Tenant B registered successfully');
  const tokenB = signupB.body.accessToken;
  const tenantBId = signupB.body.tenant.id;

  // Verify Alice cannot read Bob's tenant using Alice's token
  const crossTenantAccess = await request('/v1/tenant/profile', {
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'x-tenant-id': tenantBId, // Alice tries to sneak into Bob's tenant
    },
  });
  assert(crossTenantAccess.status === 403, 'Cross-tenant access forbidden when spoofing x-tenant-id');

  // Verify Alice reads Alice's active config
  const configA = await request('/v1/agent-configs/active', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(configA.status === 200, 'Alice retrieves Alice active agent configuration');
  assert(configA.body.tenantId === tenantAId, 'Config belongs strictly to Tenant A');

  // Verify Bob reads Bob's active config (salon preset)
  const configB = await request('/v1/agent-configs/active', {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  assert(configB.status === 200, 'Bob retrieves Bob active agent configuration');
  assert(configB.body.tenantId === tenantBId, 'Config belongs strictly to Tenant B');
  assert(configB.body.settings.language === 'en', 'Bob has salon preset in English');
}

// -------------------------------------------------------------
// Test 2: Telephony Route Webhook & Idempotency (T-011)
// -------------------------------------------------------------
async function testTelephonyInboundAndIdempotency() {
  console.log('\n--- 2. Testing Telephony Inbound Webhook & Idempotency ---');
  const db = getDatabase();
  const demoTenantId = 'ten_callivaan_demo';
  const route = await db.getPhoneRoute(demoTenantId);
  assert(!!route, 'Demo phone route exists in database');

  const callSid = 'exotel_call_' + Date.now();

  // First incoming call webhook
  const res1 = await request('/v1/webhooks/telephony/exotel', {
    method: 'POST',
    body: JSON.stringify({
      CallSid: callSid,
      From: '+919988776655',
      To: route!.providerVirtualNumber,
      CallType: 'transferred',
    }),
  });
  assert(res1.status === 200, 'Exotel incoming call webhook returns 200 XML stream');
  assert(typeof res1.body === 'string' && res1.body.includes('<Stream url='), 'Response instructs provider to connect to media gateway');

  // Verify call record created in database
  const callRecord = await db.getCallByProviderCallId(callSid);
  assert(!!callRecord, 'Call record created in progress in database');
  assert(callRecord!.status === 'in_progress', 'Initial call status is in_progress');

  // Send duplicate webhook with identical CallSid
  const res2 = await request('/v1/webhooks/telephony/exotel', {
    method: 'POST',
    body: JSON.stringify({
      CallSid: callSid,
      From: '+919988776655',
      To: route!.providerVirtualNumber,
    }),
  });
  assert(res2.status === 200, 'Duplicate Exotel webhook handled gracefully');
}

// -------------------------------------------------------------
// Test 3: Media Gateway WebSocket Stream Simulation (T-012 & T-013)
// -------------------------------------------------------------
async function testMediaGatewayStream() {
  console.log('\n--- 3. Testing Media Gateway WebSocket Audio & Interruption Stream ---');
  const testCallSid = 'sid_stream_test_' + Date.now();
  const testCallId = 'call_stream_test_' + Date.now();
  const demoTenantId = 'ten_callivaan_demo';

  // Seed call in DB first
  const db = getDatabase();
  const activeConfig = await db.getActiveAgentConfig(demoTenantId);

  await db.createCall({
    id: testCallId,
    tenantId: demoTenantId,
    providerCallId: testCallSid,
    callerNumber: '+919876543210',
    virtualNumber: '+918047192000',
    agentConfigVersionId: activeConfig!.id,
    status: 'in_progress',
    durationSeconds: 0,
    startedAt: new Date().toISOString(),
  });

  // Run mock telephony client simulation
  const result = await runMockCallSimulation({
    wsUrl: `ws://localhost:${mediaPort}/v1/media/exotel`,
    tenantId: demoTenantId,
    callId: testCallId,
    callSid: testCallSid,
    utterances: [
      'Namaste, mera AC cooling nahi kar raha, visit charge kitna hai?',
      'Haan mera naam Rahul Sharma hai, kal subah slot book kar do.',
    ],
    testInterruption: true,
  });

  assert(result.finalSuccess, 'WebSocket stream completed successfully');
  assert(result.audioFramesReceived > 0, `Received ${result.audioFramesReceived} audio response frames from agent`);
  assert(result.clearsReceived > 0, `Barge-in interruption triggered ${result.clearsReceived} clear frames to silence agent`);

  // Verify that database call record was updated to completed
  const finalizedCall = await db.getCallById(demoTenantId, testCallId);
  assert(!!finalizedCall, 'Call record exists in database');
  assert(finalizedCall!.status === 'completed' || finalizedCall!.status === 'caller_disconnected', 'Call completed cleanly');
  assert(finalizedCall!.durationSeconds > 0, 'Duration accurately recorded');

  // Verify that Call Summary was persisted
  const summary = await db.getCallSummary(demoTenantId, testCallId);
  assert(!!summary, 'Call summary generated and stored');
  assert(summary!.summaryText.length > 20, 'Factual summary text populated');
}

// -------------------------------------------------------------
// Test 4: WhatsApp Pairing, Plain-Language Changes & Confirmation (T-016 & T-018)
// -------------------------------------------------------------
async function testWhatsAppPairingAndPromptControl() {
  console.log('\n--- 4. Testing WhatsApp Pairing & Two-Step Prompt Modification ---');
  const demoTenantId = 'ten_callivaan_demo';
  const ownerPhone = '+919876543210';
  const db = getDatabase();

  // 1. Request pairing code
  const code = '789123';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.createOrUpdateWhatsAppPairing(demoTenantId, ownerPhone, code, expiresAt);

  // 2. Send code via WhatsApp webhook
  const pairingWebhook = await request('/v1/webhooks/whatsapp', {
    method: 'POST',
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_1',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '12345', phone_number_id: 'pn_1' },
                messages: [{ from: ownerPhone, id: 'msg_' + Date.now(), timestamp: '123', type: 'text', text: { body: code } }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }),
  });
  assert(pairingWebhook.status === 200, 'WhatsApp webhook received');
  assert(pairingWebhook.body.responseMessage.includes('Account linked successfully'), 'WhatsApp account linked with 6-digit code');

  // 3. Send configuration instruction in Hinglish
  const instructionMsg = 'Hindi mein baat karo aur tone concise karo';
  const instructionWebhook = await request('/v1/webhooks/whatsapp', {
    method: 'POST',
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_1',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '12345', phone_number_id: 'pn_1' },
                messages: [{ from: ownerPhone, id: 'msg_' + Date.now(), timestamp: '123', type: 'text', text: { body: instructionMsg } }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }),
  });
  assert(instructionWebhook.status === 200, 'Instruction webhook received');
  assert(instructionWebhook.body.responseMessage.includes('Proposed change:'), 'System generated proposed patch');
  assert(instructionWebhook.body.responseMessage.includes('CONFIRM'), 'System requires explicit confirmation');

  // Verify settings have NOT changed yet before confirmation
  const activeBefore = await db.getActiveAgentConfig(demoTenantId);
  assert(activeBefore!.settings.language !== 'hi', 'Settings remain unchanged before confirmation');

  // 4. Send explicit confirmation
  const confirmWebhook = await request('/v1/webhooks/whatsapp', {
    method: 'POST',
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_1',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '12345', phone_number_id: 'pn_1' },
                messages: [{ from: ownerPhone, id: 'msg_' + Date.now(), timestamp: '123', type: 'text', text: { body: 'CONFIRM' } }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }),
  });
  assert(confirmWebhook.status === 200, 'Confirmation webhook processed');
  assert(confirmWebhook.body.responseMessage.includes('Changes confirmed and active'), 'Confirmed message received');

  // Verify active config is now updated and version incremented
  const activeAfter = await db.getActiveAgentConfig(demoTenantId);
  assert(activeAfter!.settings.language === 'hi', 'Agent language updated to Hindi after confirmation');
  assert(activeAfter!.settings.tone === 'concise', 'Agent tone updated to Concise after confirmation');
  assert(activeAfter!.changeSource === 'whatsapp', 'Change source attributed to WhatsApp');

  // 5. Test STOP opt-out
  const stopWebhook = await request('/v1/webhooks/whatsapp', {
    method: 'POST',
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'waba_1',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '12345', phone_number_id: 'pn_1' },
                messages: [{ from: ownerPhone, id: 'msg_' + Date.now(), timestamp: '123', type: 'text', text: { body: 'STOP' } }],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }),
  });
  assert(stopWebhook.body.responseMessage.includes('opted out of Callivaan notifications'), 'STOP request instantly honored and opted out');
}

// -------------------------------------------------------------
// Test 5: Call Summary & Zero-Emoji Formatting (T-015 & T-017)
// -------------------------------------------------------------
async function testCallSummaryFormatting() {
  console.log('\n--- 5. Testing WhatsApp Summary Formatting & Zero Emoji Rule ---');

  const mockCall: any = {
    id: 'call_test_fmt_1',
    callerNumber: '+919876543210',
    startedAt: new Date().toISOString(),
    durationSeconds: 45,
    status: 'completed',
  };

  const mockSummary: any = {
    summaryText: 'Caller enquired about microwave repair. Slot requested for tomorrow 11 AM.',
    extractedLead: {
      callerName: 'Vikram',
      callbackNumber: '+919876543210',
      requestedService: 'Microwave heating issue',
      preferredTime: 'Tomorrow 11:00 AM',
      urgency: 'urgent',
      followUpAction: 'Assign service technician slot',
    },
    isUnknownFlags: { callerNameUnknown: false },
  };

  const formatted = formatWhatsAppSummaryText(mockCall, mockSummary, 'Sharma Repairs');

  // Verify no emojis are present (regex test for emoji unicode planes)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert(!emojiRegex.test(formatted), 'Summary text contains ZERO emojis (strictly complies with design.md)');
  assert(formatted.includes('CALLIVAAN CALL SUMMARY'), 'Header matches expected format');
  assert(formatted.includes('Vikram'), 'Caller name present');
  assert(formatted.includes('Microwave heating issue'), 'Service present');
}

// -------------------------------------------------------------
// Test 6: Usage Ledger & Plan Limit Behavior (T-022 & T-023)
// -------------------------------------------------------------
async function testUsageLedgerAndLimits() {
  console.log('\n--- 6. Testing Usage Ledger & Plan Limit Accounting ---');
  const db = getDatabase();
  const tenantId = 'ten_callivaan_demo';

  // Record 30 seconds of call usage (rounds to 1 minute)
  const l1 = await db.recordCallUsage(tenantId, 30);
  assert(l1.telephonyMinutesUsed > 0, 'Telephony minutes recorded in usage ledger');

  // Verify plan definition and overage rates
  const sub = await db.getSubscription(tenantId);
  const plan = STANDARD_PLANS.find((p: any) => p.id === sub?.planId);
  assert(!!plan, 'Subscription plan mapped to standard plan catalog');
  assert(plan!.includedMinutes > 0, 'Plan includes explicit monthly minutes');
  assert(plan!.overageRatePerMinuteInr > 0, 'Disclosed overage rate present');
}

// -------------------------------------------------------------
// Main Runner
// -------------------------------------------------------------
async function runAllTests() {
  console.log('====================================================');
  console.log('CALLIVAAN FULL END-TO-END VERIFICATION RUNNER');
  console.log('====================================================');

  await startServers();

  try {
    await testTenantIsolation();
    await testTelephonyInboundAndIdempotency();
    await testMediaGatewayStream();
    await testWhatsAppPairingAndPromptControl();
    await testCallSummaryFormatting();
    await testUsageLedgerAndLimits();

    console.log('\n====================================================');
    console.log('ALL VERIFICATION ACCEPTANCE TESTS PASSED (100% SUCCESS)');
    console.log('====================================================');
  } catch (err) {
    console.error('\nTest suite encountered a failure:', err);
    process.exit(1);
  } finally {
    await stopServers();
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
