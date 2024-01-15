import { Client } from 'node-appwrite';
import invariant from 'tiny-invariant';

import { MIGRATIONS_COLLECTION_ID, MIGRATIONS_COLLECTION_NAME } from './constants';
import { DatabaseService, MigrationService } from './domain';
import { LocalMigrationRepository, RemoteMigrationRepository } from './repositories';
import type { Logger } from './types';

function configuration() {
  const apiKey = process.env['APPWRITE_API_KEY'];
  invariant(apiKey, 'APPWRITE_API_KEY');

  const collectionId = process.env['MIGRATIONS_COLLECTION_ID'] ?? MIGRATIONS_COLLECTION_ID;
  invariant(collectionId, 'MIGRATIONS_COLLECTION_ID');

  const collectionName = process.env['MIGRATIONS_COLLECTION_NAME'] ?? MIGRATIONS_COLLECTION_NAME;
  invariant(collectionName, 'MIGRATIONS_COLLECTION_NAME');

  const databaseId = process.env['MIGRATIONS_DATABASE_ID'];
  invariant(databaseId, 'MIGRATIONS_DATABASE_ID');

  const endpoint = process.env['APPWRITE_ENDPOINT'];
  invariant(endpoint, 'APPWRITE_ENDPOINT');

  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID'];
  invariant(projectId, 'APPWRITE_FUNCTION_PROJECT_ID');

  return {
    apiKey,
    collectionId,
    databaseId,
    endpoint,
    projectId,
  };
}

export async function migrationsRunSequence({ log, error }: { log: Logger; error: Logger }) {
  log('Run migration sequence started.');

  const { apiKey, collectionId, databaseId, endpoint, projectId } = configuration();

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databaseService = DatabaseService.create({ client, databaseId });

  const databaseExists = await databaseService.databaseExists();

  if (!databaseExists) {
    error(`Can't prooced. Database ${databaseId} does not exist.`);

    return;
  }

  const collectionExists = databaseService.collectionExists(collectionId);

  if (!collectionExists) {
    error(`Can't prooced. Collection ${collectionId} does not exist on database ${databaseId}.`);

    return;
  }

  const localMigrationRepository = LocalMigrationRepository.create({
    error,
    log,
  });

  const remoteMigrationRepository = RemoteMigrationRepository.create({
    collectionId,
    databaseId,
    databaseService,
    error,
    log,
  });

  log('Setting up migration service...');

  const migrationService = MigrationService.create({
    error,
    log,
    localMigrationRepository,
    remoteMigrationRepository,
  });

  await Promise.all([migrationService.withLocalEntities(), migrationService.withRemoteEntities()]);

  await migrationService.withMigrations().executePendingMigrations(databaseService);

  log('Run migration sequence completed successfully.');
}
