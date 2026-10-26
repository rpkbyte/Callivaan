/**
 * External Webhook Presentation Controller
 */
import { Request, Response } from 'express';
import crypto from 'crypto';
import { WebhookService } from '../services/webhook.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ExotelIncomingCallWebhookSchema, WhatsAppInboundWebhookSchema } from '@callivaan/shared';
import { config } from '../config.js';
import { log } from '../logger.js';

export class WebhooksController {
  constructor(private webhookService: WebhookService = new WebhookService()) {}

  handleExotelCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const parseResult = ExotelIncomingCallWebhookSchema.safeParse(req.body);
      if (!parseResult.success) {
        log('warn', 'Invalid Exotel webhook payload received', {
          correlationId: authReq.correlationId,
          details: { errors: parseResult.error.flatten() },
        });
        res.status(400).send('<Response><Hangup/></Response>');
        return;
      }

      const result = await this.webhookService.processExotelInboundCall({
        ...parseResult.data,
        correlationId: authReq.correlationId,
      });

      res.type('text/xml').send(result.xml);
    } catch (err) {
      log('error', 'Error processing Exotel inbound call webhook', {
        correlationId: (req as any).correlationId,
        err,
      });
      res.type('text/xml').send('<Response><Say>Technical failure. Please try again later.</Say><Hangup/></Response>');
    }
  };

  handleWhatsAppChallenge = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
      log('info', 'WhatsApp webhook verification challenge accepted', {
        correlationId: (req as any).correlationId,
      });
      res.status(200).send(challenge);
    } else {
      log('warn', 'WhatsApp webhook verification challenge rejected', {
        correlationId: (req as any).correlationId,
        details: { token },
      });
      res.status(403).send('Forbidden');
    }
  };

  handleWhatsAppInbound = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const rawBody = authReq.rawBody || Buffer.from(JSON.stringify(req.body));
      const signature = req.headers['x-hub-signature-256'] as string | undefined;

      if (config.whatsappAppSecret && signature) {
        const expectedSignature = 'sha256=' + crypto.createHmac('sha256', config.whatsappAppSecret).update(rawBody).digest('hex');
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
        if (!isValid && config.env === 'production') {
          log('warn', 'Invalid WhatsApp webhook HMAC signature', { correlationId: authReq.correlationId });
          res.status(401).json({ error: 'Unauthorized', message: 'Invalid webhook signature' });
          return;
        }
      }

      const parseResult = WhatsAppInboundWebhookSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(200).json({ status: 'ok' });
        return;
      }

      const entry = parseResult.data.entry[0]?.changes[0]?.value;
      const messages = entry?.messages;
      if (!messages || messages.length === 0) {
        res.status(200).json({ status: 'ok' });
        return;
      }

      const result = await this.webhookService.processWhatsAppInbound(messages[0], authReq.correlationId);
      if (result.isDuplicate) {
        res.status(200).json({ status: 'duplicate_ignored' });
        return;
      }

      res.status(200).json({ status: 'processed', responseMessage: result.reply });
    } catch (err) {
      log('error', 'Error handling WhatsApp webhook', { correlationId: (req as any).correlationId, err });
      res.status(200).json({ status: 'error_handled' });
    }
  };

  handleRazorpay = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const rawBody = authReq.rawBody || Buffer.from(JSON.stringify(req.body));
      const signature = req.headers['x-razorpay-signature'] as string | undefined;

      if (config.razorpayWebhookSecret && signature) {
        const expected = crypto.createHmac('sha256', config.razorpayWebhookSecret).update(rawBody).digest('hex');
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
        if (!isValid && config.env === 'production') {
          log('warn', 'Invalid Razorpay webhook signature', { correlationId: authReq.correlationId });
          res.status(401).json({ error: 'Unauthorized', message: 'Invalid Razorpay signature' });
          return;
        }
      }

      const event = req.body.event as string;
      const eventId = (req.body.id as string) || 'rzp_evt_' + Date.now();

      const result = await this.webhookService.processRazorpayEvent(event, eventId, req.body);
      if (result.isDuplicate) {
        res.status(200).json({ status: 'duplicate_ignored' });
        return;
      }

      log('info', 'Razorpay webhook received', {
        correlationId: authReq.correlationId,
        details: { event, eventId },
      });

      res.status(200).json({ status: 'processed' });
    } catch (err) {
      log('error', 'Error processing Razorpay webhook', { correlationId: (req as any).correlationId, err });
      res.status(500).json({ error: 'InternalServerError' });
    }
  };
}
