/**
 * Media Gateway WebSocket Server
 * Implements T-012: secure WebSocket ingress, session lifecycle, graceful call draining.
 */
import http from 'http';
import { URL } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { ExotelTelephonyAdapter } from './adapters/telephony.adapter.js';
import { CallSession } from './session.js';
import { logMedia } from './logger.js';

export * from './mock-client.js';
export * from './session.js';
export * from './adapters/telephony.adapter.js';
export * from './adapters/voice-ai.adapter.js';

export function createMediaServer(port: number) {
  const activeSessions = new Map<string, CallSession>();

  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'healthy',
          service: 'callivaan-media-gateway',
          activeSessionsCount: activeSessions.size,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = new URL(request.url || '', `http://${request.headers.host}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/v1/media/exotel' || pathname === '/v1/media/mock') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (ws: WebSocket, request: http.IncomingMessage) => {
    const parsedUrl = new URL(request.url || '', `http://${request.headers.host}`);
    const callSid = parsedUrl.searchParams.get('callSid') || 'sid_' + Math.random().toString(36).substring(2, 9);
    const callId = parsedUrl.searchParams.get('callId') || 'call_' + Math.random().toString(36).substring(2, 9);
    const tenantId = parsedUrl.searchParams.get('tenantId') || 'ten_callivaan_demo';

    logMedia('info', 'New media connection received', {
      callSid,
      tenantId,
      details: { callId, path: parsedUrl.pathname },
    });

    const adapter = new ExotelTelephonyAdapter(ws);
    const session = new CallSession(callId, tenantId, callSid, adapter);

    activeSessions.set(callSid, session);

    ws.on('close', () => {
      activeSessions.delete(callSid);
    });

    await session.init();
  });

  async function drainActiveCalls(timeoutMs = 15000): Promise<void> {
    logMedia('info', `commencing call drain for ${activeSessions.size} active sessions`);
    const promises: Promise<void>[] = [];
    for (const session of activeSessions.values()) {
      promises.push(session.endCall('completed', 'gateway_graceful_shutdown'));
    }
    await Promise.race([
      Promise.all(promises),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
    activeSessions.clear();
  }

  return {
    server,
    wss,
    activeSessions,
    drainActiveCalls,
  };
}
