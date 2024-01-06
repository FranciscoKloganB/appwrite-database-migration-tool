import { AppwriteException } from 'node-appwrite';

import { DatabaseService } from '@lib/domain';

export async function migrationCollectionExists(
  databaseService: DatabaseService,
  databaseId: string,
  collectionId: string,
) {
  try {
    await databaseService.getCollection(databaseId, collectionId);

    return true;
  } catch (e) {
    if (e instanceof AppwriteException) {
      e.message.includes('Collection with the requested ID could not be found');

      return false;
    }

    throw e;
  }
}
