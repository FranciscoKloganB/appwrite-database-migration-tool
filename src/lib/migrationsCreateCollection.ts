import { Client } from 'node-appwrite'
import invariant from 'tiny-invariant'

import {
  MIGRATIONS_COLLECTION_ID,
  MIGRATIONS_COLLECTION_NAME,
  MIGRATIONS_DATABASE_ID,
} from './constants'
import { DatabaseService } from './domain'
import type { Logger } from './types'

function configuration() {
  const apiKey = process.env['APPWRITE_API_KEY']
  invariant(apiKey, 'APPWRITE_API_KEY')

  const collectionId =
    process.env['MIGRATIONS_COLLECTION_ID'] ?? MIGRATIONS_COLLECTION_ID
  invariant(collectionId, 'MIGRATIONS_COLLECTION_ID')

  const collectionName =
    process.env['MIGRATIONS_COLLECTION_NAME'] ?? MIGRATIONS_COLLECTION_NAME
  invariant(collectionName, 'MIGRATIONS_COLLECTION_NAME')

  const databaseId = process.env['MIGRATIONS_DATABASE_ID'] ?? MIGRATIONS_DATABASE_ID
  invariant(databaseId, 'MIGRATIONS_DATABASE_ID')

  const endpoint = process.env['APPWRITE_ENDPOINT']
  invariant(endpoint, 'APPWRITE_ENDPOINT')

  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID']
  invariant(projectId, 'APPWRITE_FUNCTION_PROJECT_ID')

  return {
    apiKey,
    collectionId,
    collectionName,
    databaseId,
    endpoint,
    projectId,
  }
}

export async function migrationsCreateCollection({
  log,
  error,
}: { log: Logger; error: Logger }) {
  log('Started migrationsCreateCollection.')

  const { endpoint, apiKey, databaseId, collectionId, collectionName, projectId } =
    configuration()

  log(
    `Will create the migration collection ${collectionName} on database ${databaseId}.`,
  )

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databaseService = DatabaseService.create({ client, databaseId })

  const databaseExists = await databaseService.databaseExists()

  if (!databaseExists) {
    error(
      `Can't prooced. Database ${databaseId} does not exist on project ${projectId}.`,
    )

    return
  }

  const collectionExists = await databaseService.collectionExists(collectionId)

  if (collectionExists) {
    error(
      `Can't prooced. Collection ${collectionId} already exists on database ${databaseId}.`,
    )

    return
  }

  await databaseService
    .createCollection(databaseId, collectionId, collectionName)
    .then(() =>
      log(`Created Migration collection ${collectionName} (id: ${collectionId}).`),
    )
    .catch((e) => {
      error(`Could not create collection ${collectionName} (id: ${collectionId}).`)

      if (e instanceof Error) {
        error(e.message)
      }

      throw e
    })

  await databaseService.createBooleanAttribute(
    databaseId,
    collectionId,
    'applied',
    false,
    false,
    false,
  )

  await databaseService.createStringAttribute(
    databaseId,
    collectionId,
    'name',
    256,
    true,
    undefined,
    false,
  )

  await databaseService.createIntegerAttribute(
    databaseId,
    collectionId,
    'timestamp',
    true,
    0,
    9007199254740991,
    undefined,
    false,
  )

  log('Completed migrationsCreateCollection.')
}
