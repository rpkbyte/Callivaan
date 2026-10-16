import { getDatabase, PostgresDatabaseRepository } from '@callivaan/database';
import { createServer } from './server.js';
import { config } from './config.js';
import { log } from './logger.js';

export { createServer };

const app = createServer();

async function bootstrap() {
  const db = getDatabase();
  if (db instanceof PostgresDatabaseRepository) {
    try {
      log('info', 'Connecting to self-hosted PostgreSQL and verifying schema...');
      await db.initSchema();
      await db.seedDemoDataIfEmpty();
      log('info', 'PostgreSQL database initialized and verified successfully.');
    } catch (err) {
      log('error', 'PostgreSQL database initialization warning:', { err });
    }
  }

  const server = app.listen(config.port, () => {
    log('info', `Callivaan API service listening on port ${config.port}`, {
      details: { env: config.env, port: config.port },
    });
  });

  function gracefulShutdown(signal: string) {
    log('info', `Received ${signal}, commencing graceful shutdown...`);
    server.close(() => {
      log('info', 'Callivaan API HTTP server closed cleanly.');
      if (db instanceof PostgresDatabaseRepository) {
        db.close().catch(() => {});
      }
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
}

bootstrap().catch((err) => {
  log('error', 'Fatal error during API bootstrap:', { err });
  process.exit(1);
});

export default app;
