import { Client } from 'node-appwrite'
import invariant from 'tiny-invariant'

import { MIGRATIONS_DATABASE_ID } from './constants'
import { DatabaseService } from './domain'
import type { Logger } from './types'

function configuration() {
  const apiKey = process.env['APPWRITE_API_KEY']
  invariant(apiKey, 'APPWRITE_API_KEY')

  const databaseId = process.env['MIGRATIONS_DATABASE_ID'] ?? MIGRATIONS_DATABASE_ID
  invariant(databaseId, 'MIGRATIONS_DATABASE_ID')

  const endpoint = process.env['APPWRITE_ENDPOINT']
  invariant(endpoint, 'APPWRITE_ENDPOINT')

  const projectId = process.env['APPWRITE_FUNCTION_PROJECT_ID']
  invariant(projectId, 'APPWRITE_FUNCTION_PROJECT_ID')

  return {
    apiKey,
    databaseId,
    endpoint,
    projectId,
  }
}

export async function migrationsResetDatabase({
  log,
  error,
}: { log: Logger; error: Logger }) {
  log('Started migrationsResetDatabase.')

  const { endpoint, apiKey, databaseId, projectId } = configuration()

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databaseService = DatabaseService.create({ client, databaseId })

  const databaseExists = await databaseService.databaseExists()

  if (!databaseExists) {
    error(
      `Can't prooced. Database ${databaseId} does not exist on project ${projectId}.`,
    )

    return
  }

  const { collections } = await databaseService.getCollections()

  for await (const collection of collections) {
    try {
      log(`Will delete collection ${collection.name} (id: ${collection.$id}).`)

      await databaseService.dropCollection(collection.$id)

      log(`Deleted collection ${collection.name} (id: ${collection.$id}).`)
    } catch (e) {
      error(
        `Failed to delete collection named ${collection.name} (id: ${collection.$id}).`,
      )

      throw e
    }
  }

  log('Completed migrationsResetDatabase. All collections have been dropped.')
}
