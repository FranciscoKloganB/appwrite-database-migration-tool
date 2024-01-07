import { createMock } from '@golevelup/ts-jest';
import { AppwriteException, Client, Databases } from 'node-appwrite';

import { DatabaseService } from './DatabaseService';

describe('DatabaseService', () => {
  const client = createMock<Client>();
  const databaseId = 'database-id';
  const databaseService = DatabaseService.create({
    client,
    databaseId,
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should create an instance of DatabaseService with a valid `id` representing the database ID', () => {
      expect(databaseService).toBeInstanceOf(DatabaseService);
      expect(databaseService.id).toEqual(databaseId);
    });

    it('should initialize Databases class with the provided client', () => {
      expect(databaseService).toBeInstanceOf(Databases);
      expect(databaseService.client).toEqual(client);
    });
  });

  describe('collectionExists', () => {
    const collectionId = 'bar';

    const getCollectionSpy = jest.spyOn(Databases.prototype, 'getCollection');

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should retrieve collection information from Appwrite', async () => {
      getCollectionSpy.mockResolvedValueOnce({} as any);

      databaseService.collectionExists(collectionId);

      expect(databaseService.getCollection).toHaveBeenCalledTimes(1);
      expect(databaseService.getCollection).toHaveBeenCalledWith(databaseId, collectionId);
    });

    it('should return true if collection exists on Appwrite', async () => {
      getCollectionSpy.mockResolvedValueOnce({} as any);

      const result = await databaseService.collectionExists(collectionId);

      expect(result).toBe(true);
    });

    it('should return false if collection does not exist on Appwrite', async () => {
      const error = new AppwriteException('Collection with the requested ID could not be found.');
      getCollectionSpy.mockRejectedValueOnce(error);

      const result = await databaseService.collectionExists(collectionId);

      expect(result).toBe(false);
    });

    it('should return false if Appwrite yields other errors', async () => {
      const error = new AppwriteException('Something different happened.');
      getCollectionSpy.mockRejectedValueOnce(error);

      const result = await databaseService.collectionExists(collectionId);

      expect(result).toBe(false);
    });

    it('should throw an error for other unexpected errors not related to Appwrite', async () => {
      const error = new Error('Unexpected error');
      getCollectionSpy.mockRejectedValueOnce(error);

      await expect(
        async () => await databaseService.collectionExists(collectionId),
      ).rejects.toThrow(error);
    });
  });

  describe('databaseExists', () => {
    const getDatabaseSpy = jest.spyOn(Databases.prototype, 'get');

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should retrieve database information from Appwrite', async () => {
      getDatabaseSpy.mockResolvedValueOnce({} as any);

      databaseService.databaseExists();

      expect(databaseService.get).toHaveBeenCalledTimes(1);
      expect(databaseService.get).toHaveBeenCalledWith(databaseId);
    });

    it('should return true if database exists on Appwrite', async () => {
      getDatabaseSpy.mockResolvedValueOnce({} as any);

      const result = await databaseService.databaseExists();

      expect(result).toBe(true);
    });

    it('should return false if database does not exist on Appwrite', async () => {
      const error = new AppwriteException('Database not found.');
      getDatabaseSpy.mockRejectedValueOnce(error);

      const result = await databaseService.databaseExists();

      expect(result).toBe(false);
    });

    it('should return false if Appwrite yields other errors', async () => {
      const error = new AppwriteException('Something different happened.');
      getDatabaseSpy.mockRejectedValueOnce(error);

      const result = await databaseService.databaseExists();

      expect(result).toBe(false);
    });

    it('should throw an error for other unexpected errors not related to Appwrite', async () => {
      const error = new Error('Unexpected error');
      getDatabaseSpy.mockRejectedValueOnce(error);

      await expect(async () => await databaseService.databaseExists()).rejects.toThrow(error);
    });
  });
});
