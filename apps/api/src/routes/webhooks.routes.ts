/**
 * Provider Webhook Ingestion Routes
 * Lean declarative routing delegating presentation to WebhooksController.
 */
import { Router } from 'express';
import { WebhooksController } from '../controllers/webhooks.controller.js';

export const webhooksRouter = Router();
const controller = new WebhooksController();

// 1. Telephony Webhooks (Exotel)
webhooksRouter.post('/telephony/exotel', controller.handleExotelCall);

// 2. WhatsApp Business Platform Webhooks
webhooksRouter.get('/whatsapp', controller.handleWhatsAppChallenge);
webhooksRouter.post('/whatsapp', controller.handleWhatsAppInbound);

// 3. Billing Webhooks (Razorpay)
webhooksRouter.post('/billing/razorpay', controller.handleRazorpay);
