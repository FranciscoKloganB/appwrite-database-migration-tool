import { createMock } from '@golevelup/ts-jest';

import type { IMigrationFile } from '@lib/repositories/interfaces';

import { MigrationEntity } from './MigrationEntity';

describe('MigrationEntity', () => {
  const instanceMock = createMock<IMigrationFile>();

  const baseLocalDocumentProps: Parameters<typeof MigrationEntity.createFromLocalDocument>[0] = {
    instance: instanceMock,
    name: 'SampleMigration',
    timestamp: 1234567890,
  };

  const baseRemoteDocumentProps: Parameters<typeof MigrationEntity.createFromRemoteDocument>[0] = {
    applied: true,
    id: 'sample-id',
    name: 'SampleMigration',
    timestamp: 1234567890,
  };

  describe('local documents', () => {
    it('should create an instance from local document', () => {
      const entity = MigrationEntity.createFromLocalDocument(baseLocalDocumentProps);

      expect(entity).toBeInstanceOf(MigrationEntity);

      expect(typeof entity.$id).toEqual('string');
      expect(entity.$id).toHaveLength(20);
      expect(entity.applied).toBeNull();
      expect(entity.instance).toBe(baseLocalDocumentProps.instance);
      expect(entity.name).toBe(baseLocalDocumentProps.name);
      expect(entity.timestamp).toBe(baseLocalDocumentProps.timestamp);
    });

    it('should expose a value getter', () => {
      const entity = MigrationEntity.createFromLocalDocument(baseLocalDocumentProps);

      expect(entity.value).toMatchObject({
        applied: false,
        name: entity.name,
        timestamp: entity.timestamp,
      });
    });
  });

  describe('remote documents', () => {
    it('should create an instance from remote document', () => {
      const entity = MigrationEntity.createFromRemoteDocument(baseRemoteDocumentProps);

      expect(entity).toBeInstanceOf(MigrationEntity);

      expect(entity.$id).toBe(baseRemoteDocumentProps.id);
      expect(entity.applied).toBe(baseRemoteDocumentProps.applied);
      expect(entity.instance).toBeNull();
      expect(entity.name).toBe(baseRemoteDocumentProps.name);
      expect(entity.timestamp).toBe(baseRemoteDocumentProps.timestamp);
    });

    it('should expose a value getter', () => {
      const entity = MigrationEntity.createFromLocalDocument(baseLocalDocumentProps);

      expect(entity.value).toMatchObject({
        applied: false,
        name: entity.name,
        timestamp: entity.timestamp,
      });
    });
  });

  it('should be possible to apply the migration', () => {
    const entity = MigrationEntity.createFromLocalDocument(baseLocalDocumentProps);

    entity.apply();

    expect(entity.applied).toBe(true);
  });

  it('should be possible to unapply the migration', () => {
    const entity = MigrationEntity.createFromRemoteDocument(baseRemoteDocumentProps);

    entity.unapply();

    expect(entity.applied).toBe(false);
  });
});
