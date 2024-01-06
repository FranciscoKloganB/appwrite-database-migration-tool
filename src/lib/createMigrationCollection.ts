import { Client } from 'node-appwrite';
import invariant from 'tiny-invariant';

import { MIGRATIONS_COLLECTION_ID, MIGRATIONS_COLLECTION_NAME } from './constants';
import { DatabaseService } from './domain';
import type { Logger } from './types';
import { migrationCollectionExists } from './utils';

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
    collectionName,
    databaseId,
    endpoint,
    projectId,
  };
}

export async function createMigrationCollection({ log, error }: { log: Logger; error: Logger }) {
  log('Create migration collection started.');

  const { endpoint, apiKey, databaseId, collectionId, collectionName, projectId } = configuration();

  log(`Initiating client. Endpoint: ${endpoint}, ProjectID: ${projectId}`);

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);

  const databaseService = DatabaseService.create({ client, databaseId });

  const collectionExists = await migrationCollectionExists(
    databaseService,
    databaseId,
    collectionId,
  );

  if (collectionExists) {
    log('Create migration collection exited. Collection already exists.');

    return;
  }

  await databaseService
    .createCollection(databaseId, collectionId, collectionName)
    .then(() => log('Create migration collection completed successfully.'))
    .catch((e) => {
      error(`Could not create collection ${collectionName} (id: ${collectionId}).`);

      if (e instanceof Error) {
        error(e.message);
      }
    });

  await databaseService.createBooleanAttribute(
    databaseId,
    collectionId,
    'applied',
    false,
    false,
    false,
  );

  await databaseService.createStringAttribute(
    databaseId,
    collectionId,
    'name',
    256,
    true,
    undefined,
    false,
  );

  await databaseService.createIntegerAttribute(
    databaseId,
    collectionId,
    'timestamp',
    true,
    0,
    9007199254740991,
    undefined,
    false,
  );
}
