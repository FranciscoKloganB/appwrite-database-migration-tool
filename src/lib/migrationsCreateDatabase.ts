import { Client } from 'node-appwrite';
import invariant from 'tiny-invariant';

import { MIGRATIONS_DATABASE_ID } from './constants';
import { DatabaseService } from './domain';
import type { Logger } from './types';

function configuration() {
  const apiKey = process.env['APPWRITE_API_KEY'];
  invariant(apiKey, 'APPWRITE_API_KEY');

  const databaseId = process.env['MIGRATIONS_DATABASE_ID'] ?? MIGRATIONS_DATABASE_ID;
  invariant(databaseId, 'MIGRATIONS_DATABASE_ID');

  const endpoint = process.env['APPWRITE_ENDPOINT'];
  invariant(endpoint, 'APPWRITE_ENDPOINT');

  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID'];
  invariant(projectId, 'APPWRITE_FUNCTION_PROJECT_ID');

  return {
    apiKey,
    databaseId,
    endpoint,
    projectId,
  };
}

export async function migrationsCreateDatabase({ log, error }: { log: Logger; error: Logger }) {
  log('Started migrationsCreateDatabase.');

  const { endpoint, apiKey, databaseId, projectId } = configuration();

  log(`Will create the migration database ${databaseId} on project ${projectId}.`);

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databaseService = DatabaseService.create({ client, databaseId });

  const databaseExists = await databaseService.databaseExists();

  if (!databaseExists) {
    error(`Can't prooced. Database ${databaseId} already exists on project ${projectId}.`);

    return;
  }

  await databaseService
    .create(databaseId, databaseId)
    .then(() => log(`Created database ${databaseId} (id: ${databaseId}).`))
    .catch((e) => {
      error(`Could not create database ${databaseId} (id: ${databaseId}).`);

      if (e instanceof Error) {
        error(e.message);
      }

      throw e;
    });

  log('Completed migrationsCreateDatabase.');
}
