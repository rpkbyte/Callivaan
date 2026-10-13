/**
 * Callivaan API Service Entry Point
 */
import { createServer } from './server.js';
import { config } from './config.js';
import { log } from './logger.js';

export { createServer };

const app = createServer();

const server = app.listen(config.port, () => {
  log('info', `Callivaan API service listening on port ${config.port}`, {
    details: { env: config.env, port: config.port },
  });
});

function gracefulShutdown(signal: string) {
  log('info', `Received ${signal}, commencing graceful shutdown...`);
  server.close(() => {
    log('info', 'Callivaan API HTTP server closed cleanly.');
    process.exit(0);
  });
  // Force exit after 10 seconds if connections refuse to close
  setTimeout(() => {
    log('error', 'Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
