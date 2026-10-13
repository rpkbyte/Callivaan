/**
 * Media Gateway Service Entry Point
 */
import { createMediaServer } from './server.js';
import { config } from './config.js';
import { logMedia } from './logger.js';

export * from './server.js';
export * from './mock-client.js';
export * from './session.js';
export * from './adapters/telephony.adapter.js';
export * from './adapters/voice-ai.adapter.js';

const { server, drainActiveCalls } = createMediaServer(config.port);

server.listen(config.port, () => {
  logMedia('info', `Callivaan Media Gateway listening on port ${config.port}`, {
    details: { port: config.port, env: config.env },
  });
});

async function gracefulShutdown(signal: string) {
  logMedia('info', `Received ${signal}, commencing media gateway graceful shutdown...`);
  await drainActiveCalls(10000);
  server.close(() => {
    logMedia('info', 'Media Gateway closed cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
