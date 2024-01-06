import { createMock } from '@golevelup/ts-jest';
import { AppwriteException } from 'node-appwrite';

import { DatabaseService } from '@lib/domain';

import { migrationCollectionExists } from './migrationCollectionExists';

describe('collectionExists', () => {
  const databaseId = 'foo';
  const collectionId = 'bar';
  const databaseService = createMock<DatabaseService>();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should retrieve collection information from Appwrite', async () => {
    databaseService.getCollection.mockResolvedValueOnce({} as any);

    await migrationCollectionExists(databaseService, databaseId, collectionId);

    expect(databaseService.getCollection).toHaveBeenCalledTimes(1);
    expect(databaseService.getCollection).toHaveBeenCalledWith(databaseId, collectionId);
  });

  it('should return true if collection exists on Appwrite', async () => {
    databaseService.getCollection.mockResolvedValueOnce({} as any);

    const result = await migrationCollectionExists(databaseService, databaseId, collectionId);

    expect(result).toBe(true);
  });

  it('should return false if collection does not exist on Appwrite', async () => {
    const error = new AppwriteException('Collection with the requested ID could not be found.');
    databaseService.getCollection.mockRejectedValueOnce(error);

    const result = await migrationCollectionExists(databaseService, databaseId, collectionId);

    expect(result).toBe(false);
  });

  it('should return false if Appwrite yields other errors', async () => {
    const error = new AppwriteException('Something different happened.');
    databaseService.getCollection.mockRejectedValueOnce(error);

    const result = await migrationCollectionExists(databaseService, databaseId, collectionId);

    expect(result).toBe(false);
  });

  it('should throw an error for other unexpected errors not related to Appwrite', async () => {
    const error = new Error('Unexpected error');
    databaseService.getCollection.mockRejectedValueOnce(error);

    await expect(
      migrationCollectionExists(databaseService, databaseId, collectionId),
    ).rejects.toThrow(error);
  });
});
