/**
 * Telephony Provider Adapter
 * Implements Exotel AgentStream bidirectional WebSocket protocol.
 * Conforms to docs/architecture.md and Exotel AgentStream specification.
 */
import { WebSocket } from 'ws';
import { logMedia } from '../logger.js';

export interface TelephonyStreamEvents {
  onStart: (data: { streamSid: string; callSid: string; customParameters: Record<string, string> }) => void;
  onMedia: (data: { streamSid: string; payload: string; timestamp?: string }) => void;
  onMark: (data: { streamSid: string; markName: string }) => void;
  onStop: (data: { streamSid: string; callSid?: string }) => void;
  onError: (err: Error) => void;
}

export class ExotelTelephonyAdapter {
  private ws: WebSocket;
  private streamSid?: string;
  private callSid?: string;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  public bindEvents(handlers: TelephonyStreamEvents) {
    this.ws.on('message', (raw: Buffer | string) => {
      try {
        const text = raw.toString();
        const msg = JSON.parse(text);

        switch (msg.event) {
          case 'connected':
            logMedia('info', 'Exotel WebSocket connected', { callSid: this.callSid });
            break;

          case 'start':
            this.streamSid = msg.streamSid || msg.start?.streamSid;
            this.callSid = msg.callSid || msg.start?.callSid;
            handlers.onStart({
              streamSid: this.streamSid || '',
              callSid: this.callSid || '',
              customParameters: msg.start?.customParameters || {},
            });
            break;

          case 'media':
            if (msg.media?.payload) {
              handlers.onMedia({
                streamSid: msg.streamSid || this.streamSid || '',
                payload: msg.media.payload,
                timestamp: msg.media.timestamp,
              });
            }
            break;

          case 'mark':
            handlers.onMark({
              streamSid: msg.streamSid || this.streamSid || '',
              markName: msg.mark?.name || '',
            });
            break;

          case 'stop':
            handlers.onStop({
              streamSid: msg.streamSid || this.streamSid || '',
              callSid: this.callSid,
            });
            break;

          default:
            logMedia('debug', `Unhandled provider event: ${msg.event}`);
            break;
        }
      } catch (err) {
        logMedia('warn', 'Failed to parse Exotel WebSocket frame', { err });
      }
    });

    this.ws.on('error', (err) => {
      handlers.onError(err);
    });

    this.ws.on('close', () => {
      if (this.streamSid) {
        handlers.onStop({ streamSid: this.streamSid, callSid: this.callSid });
      }
    });
  }

  public sendAudioChunk(payloadBase64: string, streamSid?: string) {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    const targetStream = streamSid || this.streamSid;
    const frame = JSON.stringify({
      event: 'media',
      streamSid: targetStream,
      media: {
        payload: payloadBase64,
      },
    });
    this.ws.send(frame);
  }

  public sendClear(streamSid?: string) {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    const targetStream = streamSid || this.streamSid;
    const frame = JSON.stringify({
      event: 'clear',
      streamSid: targetStream,
    });
    this.ws.send(frame);
  }

  public sendMark(markName: string, streamSid?: string) {
    if (this.ws.readyState !== WebSocket.OPEN) return;
    const targetStream = streamSid || this.streamSid;
    const frame = JSON.stringify({
      event: 'mark',
      streamSid: targetStream,
      mark: {
        name: markName,
      },
    });
    this.ws.send(frame);
  }

  public closeCall() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Call Ended Cleanly');
    }
  }
}
