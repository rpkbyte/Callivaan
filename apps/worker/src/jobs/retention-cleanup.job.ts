/**
 * Scheduled Data Retention Cleanup Job
 * Implements T-024: scheduled deletion of old call records based on retention policy.
 */
import { getDatabase } from '@callivaan/database';
import { config } from '../config.js';
import { logWorker } from '../logger.js';

export async function processDataRetentionCleanup(): Promise<number> {
  const db = getDatabase();
  const retentionCutoff = new Date(Date.now() - config.retentionDays * 24 * 3600 * 1000).toISOString();
  let deletedCount = 0;

  try {
    const demoTenantId = 'ten_callivaan_demo';
    const calls = await db.listCalls(demoTenantId, 100);

    for (const call of calls.calls) {
      if (new Date(call.startedAt).getTime() < new Date(retentionCutoff).getTime()) {
        await db.deleteCall(demoTenantId, call.id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      await db.recordAuditEvent({
        tenantId: demoTenantId,
        actorId: 'system_retention_worker',
        actorType: 'system',
        action: 'retention.cleanup_executed',
        targetEntity: 'calls',
        targetEntityId: 'bulk',
        details: { deletedRecordsCount: deletedCount, retentionDays: config.retentionDays },
      });

      logWorker('info', 'Retention cleanup removed expired records', {
        jobName: 'retention-cleanup',
        details: { deletedCount, retentionDays: config.retentionDays },
      });
    }
  } catch (err) {
    logWorker('error', 'Error running retention cleanup job', {
      jobName: 'retention-cleanup',
      err,
    });
  }

  return deletedCount;
}
