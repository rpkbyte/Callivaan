/**
 * Mock Telephony Client Simulator
 * Connects to the Media Gateway WSS endpoint as an Exotel client.
 * Sends start event, audio frames, tests interruption, and closes session.
 */
import { WebSocket } from 'ws';

export interface MockCallSimulationOptions {
  wsUrl: string;
  tenantId: string;
  callId: string;
  callSid: string;
  utterances?: string[];
  testInterruption?: boolean;
}

export function runMockCallSimulation(options: MockCallSimulationOptions): Promise<{
  audioFramesReceived: number;
  clearsReceived: number;
  finalSuccess: boolean;
}> {
  return new Promise((resolve, reject) => {
    const fullUrl = `${options.wsUrl}?callSid=${options.callSid}&callId=${options.callId}&tenantId=${options.tenantId}`;
    const ws = new WebSocket(fullUrl);

    let audioFramesReceived = 0;
    let clearsReceived = 0;
    const streamSid = 'stream_' + options.callSid;

    const timeout = setTimeout(() => {
      ws.close();
      resolve({ audioFramesReceived, clearsReceived, finalSuccess: audioFramesReceived > 0 });
    }, 12000);

    ws.on('open', () => {
      // 1. Send start event
      ws.send(
        JSON.stringify({
          event: 'start',
          streamSid,
          callSid: options.callSid,
          start: {
            streamSid,
            callSid: options.callSid,
            customParameters: {
              tenantId: options.tenantId,
              callId: options.callId,
            },
          },
        })
      );

      // 2. Send initial speech after brief delay
      setTimeout(() => {
        const firstUtterance = options.utterances?.[0] || 'Mera AC cooling nahi kar raha hai, kal subah technician bhej sakte ho?';
        const payload = Buffer.from(`TEXT:${firstUtterance}`).toString('base64');
        ws.send(
          JSON.stringify({
            event: 'media',
            streamSid,
            media: { payload },
          })
        );
      }, 1500);

      // 3. Test interruption if requested
      if (options.testInterruption) {
        setTimeout(() => {
          const interruptUtterance = 'Wait, ek second, mera naam Rahul hai.';
          const payload = Buffer.from(`TEXT:${interruptUtterance}`).toString('base64');
          ws.send(
            JSON.stringify({
              event: 'media',
              streamSid,
              media: { payload },
            })
          );
        }, 2200);
      }

      // 4. Send second speech / confirm
      setTimeout(() => {
        const secondUtterance = options.utterances?.[1] || 'Haan, mera number yahi hai, please book kar lijiye.';
        const payload = Buffer.from(`TEXT:${secondUtterance}`).toString('base64');
        ws.send(
          JSON.stringify({
            event: 'media',
            streamSid,
            media: { payload },
          })
        );
      }, 4000);

      // 5. Caller hang up
      setTimeout(() => {
        ws.send(
          JSON.stringify({
            event: 'stop',
            streamSid,
            callSid: options.callSid,
          })
        );
        ws.close();
      }, 6500);
    });

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.event === 'media') {
          audioFramesReceived++;
        } else if (parsed.event === 'clear') {
          clearsReceived++;
        }
      } catch {
        // ignore parse errors
      }
    });

    ws.on('close', () => {
      clearTimeout(timeout);
      resolve({
        audioFramesReceived,
        clearsReceived,
        finalSuccess: audioFramesReceived > 0,
      });
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
