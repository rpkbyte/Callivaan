/**
 * Worker Entry Point
 */
import { CallivaanWorker } from './worker.js';
import { logWorker } from './logger.js';

export * from './worker.js';
export * from './jobs/summary-delivery.job.js';
export * from './jobs/retention-cleanup.job.js';

const worker = new CallivaanWorker();
worker.start();

function shutdown(signal: string) {
  logWorker('info', `Received ${signal}, shutting down worker...`);
  worker.stop();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
