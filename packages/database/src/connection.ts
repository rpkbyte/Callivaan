/**
 * Database Connection Factory
 */
import { DatabaseRepository } from './repository.js';
import { MemoryDatabaseRepository } from './memory-store.js';

let dbInstance: DatabaseRepository | null = null;

export function getDatabase(): DatabaseRepository {
  if (!dbInstance) {
    // If DATABASE_URL is set to a live postgres instance and postgres is preferred,
    // a PostgresRepository can be instantiated. Otherwise, fallback safely to MemoryDatabaseRepository.
    dbInstance = new MemoryDatabaseRepository();
  }
  return dbInstance;
}

export function resetDatabaseForTesting(): DatabaseRepository {
  dbInstance = new MemoryDatabaseRepository();
  return dbInstance;
}
