/**
 * Worker Service Runner
 */
import { config } from './config.js';
import { logWorker } from './logger.js';
import { processPendingSummaryDeliveries } from './jobs/summary-delivery.job.js';
import { processDataRetentionCleanup } from './jobs/retention-cleanup.job.js';

export class CallivaanWorker {
  private timer?: NodeJS.Timeout;
  private isRunning = false;
  private lastRetentionRun = 0;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    logWorker('info', 'Callivaan Worker process started', {
      details: { pollIntervalMs: config.pollIntervalMs },
    });

    this.scheduleNextTick();
  }

  private scheduleNextTick() {
    if (!this.isRunning) return;
    this.timer = setTimeout(async () => {
      await this.runJobs();
      this.scheduleNextTick();
    }, config.pollIntervalMs);
  }

  public async runJobs() {
    try {
      // 1. Process pending summary notifications
      await processPendingSummaryDeliveries();

      // 2. Process data retention once per hour
      const now = Date.now();
      if (now - this.lastRetentionRun > 3600 * 1000) {
        this.lastRetentionRun = now;
        await processDataRetentionCleanup();
      }
    } catch (err) {
      logWorker('error', 'Unhandled error in worker loop', { err });
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) clearTimeout(this.timer);
    logWorker('info', 'Callivaan Worker stopped cleanly.');
  }
}
