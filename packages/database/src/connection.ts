/**
 * Database Connection Factory
 */
import { DatabaseRepository } from './repository.js';
import { MemoryDatabaseRepository } from './memory-store.js';
import { PostgresDatabaseRepository } from './postgres-store.js';

let dbInstance: DatabaseRepository | null = null;

export function getDatabase(): DatabaseRepository {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        dbInstance = new PostgresDatabaseRepository(databaseUrl);
      } catch (err) {
        console.warn('⚠️ [Callivaan DB] Failed to initialize PostgresDatabaseRepository, falling back to MemoryDatabaseRepository:', err);
        dbInstance = new MemoryDatabaseRepository();
      }
    } else {
      dbInstance = new MemoryDatabaseRepository();
    }
  }
  return dbInstance;
}

export function setDatabase(instance: DatabaseRepository): void {
  dbInstance = instance;
}

export function resetDatabaseForTesting(): DatabaseRepository {
  dbInstance = new MemoryDatabaseRepository();
  return dbInstance;
}

