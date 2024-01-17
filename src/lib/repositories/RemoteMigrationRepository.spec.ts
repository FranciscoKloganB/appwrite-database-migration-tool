import { createMock } from '@golevelup/ts-jest';

import { DatabaseService } from '@lib/domain';
import { createId } from '@lib/utils';

import { RemoteMigrationEntity } from './entities';
import { RemoteMigrationRepository } from './RemoteMigrationRepository';

describe('RemoteMigrationRepository', () => {
  const collectionId = 'collection-id';
  const databaseId = 'database-id';
  const error = jest.fn();
  const log = jest.fn();

  const databaseService = createMock<DatabaseService>();
  const testSubject = RemoteMigrationRepository.create({
    databaseId,
    collectionId,
    databaseService,
    error,
    log,
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('deleteMigration', () => {
    it('should delete a migration document', async () => {
      const entity = RemoteMigrationEntity.create({
        id: createId(),
        applied: true,
        name: 'SomeMigrationName',
        timestamp: Date.now(),
      });

      databaseService.deleteDocument.mockResolvedValueOnce('');

      const result = await testSubject.deleteMigration(entity);

      expect(databaseService.deleteDocument).toHaveBeenCalledTimes(1);
      expect(databaseService.deleteDocument).toHaveBeenCalledWith(
        databaseId,
        collectionId,
        entity.$id,
      );

      expect(result).toBe(true);
    });

    it('should throw an error if migration entity does not have an $id property', async () => {
      const entity = RemoteMigrationEntity.create({
        id: '',
        applied: true,
        name: 'SomeMigrationName',
        timestamp: Date.now(),
      });

      await expect(async () => await testSubject.deleteMigration(entity)).rejects.toThrow(
        'Can not delete migration. Expected entity to have property `id` of type string.',
      );
    });
  });

  describe('insertMigration', () => {
    it('should insert a migration document', async () => {
      const id = createId();
      const applied = true;
      const name = 'SomeMigrationName';
      const timestamp = Date.now();

      const entity = RemoteMigrationEntity.create({
        id,
        applied,
        name,
        timestamp,
      });

      databaseService.createDocument.mockResolvedValueOnce(entity as any);

      const result = await testSubject.insertMigration(entity);

      expect(databaseService.createDocument).toHaveBeenCalledTimes(1);
      expect(databaseService.createDocument).toHaveBeenCalledWith(
        databaseId,
        collectionId,
        entity.$id,
        { applied, name, timestamp },
      );

      expect(result).toBeInstanceOf(RemoteMigrationEntity);
      expect(result.$id).toEqual(entity.$id);
    });

    it('should throw an error if migration entity is malformed', async () => {
      const entity = RemoteMigrationEntity.create({
        id: createId(),
        applied: true,
        name: 'SomeMigrationName',
        timestamp: Date.now(),
      });

      databaseService.createDocument.mockResolvedValueOnce({} as any);

      await expect(async () => await testSubject.insertMigration(entity)).rejects.toThrow(
        'Migration inserted resulted in malformed Migration document. This should not possible.',
      );
    });
  });

  describe('listMigrations', () => {
    it('should list migration documents', async () => {
      const response: any = {
        documents: [
          {
            $id: createId(),
            applied: true,
            name: 'migration_1',
            timestamp: Date.now(),
          },
          {
            $id: createId(),
            applied: false,
            name: 'migration_2',
            timestamp: Date.now(),
          },
        ],
      };

      databaseService.listDocuments.mockResolvedValueOnce(response);

      const result = await testSubject.listMigrations();

      expect(databaseService.listDocuments).toHaveBeenCalledTimes(1);
      expect(databaseService.listDocuments).toHaveBeenCalledWith(databaseId, collectionId);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RemoteMigrationEntity);
      expect(result[0].$id).toBe(response.documents[0].$id);
      expect(result[1]).toBeInstanceOf(RemoteMigrationEntity);
      expect(result[1].$id).toBe(response.documents[1].$id);
    });

    it('should throw an error if unexpected document shape is found', async () => {
      const response: any = {
        documents: [{ $id: 'document_id_1', applied: true, name: 'migration_1' }],
      };

      databaseService.listDocuments.mockResolvedValueOnce(response);

      await expect(async () => await testSubject.listMigrations()).rejects.toThrow(
        'Unexpected document shape found in migration document document_id_1',
      );
    });
  });

  describe('updateMigration', () => {
    it('should update a migration document', async () => {
      const id = createId();
      const applied = false;
      const name = 'SomeMigrationName';
      const timestamp = Date.now();

      const entity = RemoteMigrationEntity.create({
        id,
        applied,
        name,
        timestamp,
      });

      databaseService.updateDocument.mockResolvedValueOnce(entity.value as any);

      const result = await testSubject.updateMigration({
        $id: id,
        applied,
      });

      expect(databaseService.updateDocument).toHaveBeenCalledTimes(1);
      expect(databaseService.updateDocument).toHaveBeenCalledWith(
        databaseId,
        collectionId,
        entity.$id,
        {
          applied: entity.applied,
        },
      );

      expect(result).toBeInstanceOf(RemoteMigrationEntity);
      expect(result.$id).toEqual(entity.$id);
      expect(result.applied).toEqual(applied);
    });

    it('should throw an error if migration entity is malformed after update', async () => {
      const entity = RemoteMigrationEntity.create({
        id: createId(),
        applied: true,
        name: 'SomeMigrationName',
        timestamp: Date.now(),
      });

      databaseService.updateDocument.mockResolvedValueOnce({} as any);

      await expect(
        async () =>
          await testSubject.updateMigration({
            $id: entity.$id,
            applied: false,
          }),
      ).rejects.toThrow(
        'Migration update resulted in malformed Migration document. This should not be possible.',
      );
    });

    it('should throw a TypeError if migration entity has no $id during update', async () => {
      const applied = false;

      await expect(
        async () =>
          await testSubject.updateMigration({
            $id: undefined as any,
            applied,
          }),
      ).rejects.toThrow(
        'Can not update migration. Expected entity to have property `id` of type string.',
      );
    });
  });
});
