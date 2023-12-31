import { Client, Databases } from 'node-appwrite';
import invariant from 'tiny-invariant';

import { MIGRATIONS_COLLECTION_ID, MIGRATIONS_COLLECTION_NAME } from './constants';
import { MigrationService } from './domain';
import { MigrationLocalRepository, MigrationRemoteRepository } from './repositories';
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

export async function runMigrationSequence({ log, error }: { log: Logger; error: Logger }) {
  log('Run migration sequence started.');

  const { apiKey, collectionId, databaseId, endpoint, projectId } = configuration();
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databaseService = new Databases(client);

  const collection = await databaseService.getCollection(databaseId, collectionId);

  if (!collection) {
    error(
      'Run migration sequence exited. Collection does not exist. Please run Create Migration Collection first.',
    );

    return;
  }

  const migrationLocalRepository = MigrationLocalRepository.create({
    error,
    log,
  });

  const migrationRemoteRepository = MigrationRemoteRepository.create({
    collectionId,
    databaseId,
    databaseService,
    error,
    log,
  });

  const migrationService = MigrationService.create({
    error,
    log,
    migrationLocalRepository,
    migrationRemoteRepository,
  });

  await Promise.all([migrationService.withLocalEntities(), migrationService.withRemoteEntities()]);

  await migrationService.withMigrations().executePendingMigrations(databaseService);

  log('Run migration sequence completed successfully.');
}
