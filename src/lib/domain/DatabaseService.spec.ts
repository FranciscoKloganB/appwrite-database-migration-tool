import { createMock } from '@golevelup/ts-jest';
import { Client, Databases } from 'node-appwrite';

import { DatabaseService } from './DatabaseService';

describe('DatabaseService', () => {
  const client = createMock<Client>();
  const databaseId = 'database-id';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance of DatabaseService with a valid databaseId', () => {
    const databaseService = DatabaseService.create({
      client,
      databaseId,
    });

    expect(databaseService).toBeInstanceOf(DatabaseService);
    expect(databaseService.databaseId).toEqual(databaseId);
  });

  it('should initialize Databases class with the provided client', () => {
    const databaseService = DatabaseService.create({
      client,
      databaseId,
    });

    expect(databaseService).toBeInstanceOf(Databases);
    expect(databaseService.client).toEqual(client);
  });
});
