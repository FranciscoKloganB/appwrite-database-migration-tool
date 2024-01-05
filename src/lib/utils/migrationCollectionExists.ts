import { AppwriteException, Databases } from 'node-appwrite';

export async function migrationCollectionExists(
  db: Databases,
  databaseId: string,
  collectionId: string,
) {
  try {
    await db.getCollection(databaseId, collectionId);

    return true;
  } catch (e) {
    if (e instanceof AppwriteException) {
      e.message.includes('Collection with the requested ID could not be found');

      return false;
    }

    throw e;
  }
}
