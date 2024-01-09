import { createMock } from '@golevelup/ts-jest';

import { DatabaseService } from '@lib/domain';
import { IMigrationFileEntity } from '@lib/repositories';
import type { Logger } from '@lib/types';
import { createId } from '@lib/utils';

import { Migration, MigrationProps } from './Migration';

describe('Migration', () => {
  const mockDbService = createMock<DatabaseService>();
  const mockLog = createMock<Logger>();
  const mockError = createMock<Logger>();
  const mockInstance = createMock<IMigrationFileEntity>();

  const baseProps: MigrationProps = {
    applied: false,
    id: createId(),
    instance: mockInstance,
    name: 'MockMigration',
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create an instance using the static create method', () => {
      const migration = Migration.create(baseProps);

      expect(migration).toBeInstanceOf(Migration);
      expect(migration.$id).toEqual(baseProps.id);
      expect(migration.applied).toEqual(baseProps.applied);
      expect(migration.name).toEqual(baseProps.name);
      expect(migration.timestamp).toEqual(baseProps.timestamp);
      expect(migration.instance).toBe(baseProps.instance);
    });
  });

  describe('value', () => {
    it('should return the a value object when accessing the value property', () => {
      const migration = Migration.create({ ...baseProps });
      const value = migration.value;

      expect(value).toMatchObject({
        $id: baseProps.id,
        applied: baseProps.applied,
        name: baseProps.name,
        timestamp: baseProps.timestamp,
      });
    });
  });

  describe('isExecuted', () => {
    it('should return true for isExecuted when applied is true', () => {
      const migration = Migration.create({ ...baseProps, applied: true });
      expect(migration.isExecuted()).toBe(true);
    });

    it('should return true for isExecuted when applied is false', () => {
      const migration = Migration.create({ ...baseProps, applied: false });
      expect(migration.isExecuted()).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true for isPending when applied is false', () => {
      const migration = Migration.create({ ...baseProps, applied: false });
      expect(migration.isPending()).toBe(true);
    });

    it('should return false for isPending when applied is true', () => {
      const migration = Migration.create({ ...baseProps, applied: true });
      expect(migration.isPending()).toBe(false);
    });
  });

  describe('apply', () => {
    const params = {
      db: mockDbService,
      log: mockLog,
      error: mockError,
    };

    it('should call ask the migration instance to execute', async () => {
      const migration = Migration.create({ ...baseProps, applied: false });

      await migration.apply(params);

      expect(mockInstance.up).toHaveBeenCalledTimes(1);
      expect(mockInstance.up).toHaveBeenCalledWith(params);
    });

    it('should not apply when already applied', async () => {
      const migration = Migration.create({ ...baseProps, applied: true });

      await migration.apply(params);

      expect(mockInstance.up).not.toHaveBeenCalled();
    });

    it('should not be applied twice', async () => {
      const migration = Migration.create({ ...baseProps, applied: false });

      await migration.apply(params);
      await migration.apply(params);

      expect(mockInstance.up).toHaveBeenCalledTimes(1);
    });

    it('should apply the migration and set applied to true', async () => {
      const migration = Migration.create({ ...baseProps });

      await migration.apply(params);

      expect(migration.applied).toBe(true);
    });
  });

  describe('unapply', () => {
    const params = {
      db: mockDbService,
      log: mockLog,
      error: mockError,
    };

    it('should call ask the migration instance to undo', async () => {
      const migration = Migration.create({ ...baseProps, applied: true });

      await migration.unapply(params);

      expect(mockInstance.down).toHaveBeenCalledTimes(1);
      expect(mockInstance.down).toHaveBeenCalledWith(params);
    });

    it('should not unapply when already pending', async () => {
      const migration = Migration.create({ ...baseProps, applied: false });

      await migration.unapply(params);

      expect(mockInstance.down).not.toHaveBeenCalled();
    });

    it('should not be unapplied twice', async () => {
      const migration = Migration.create({ ...baseProps, applied: true });

      await migration.unapply(params);
      await migration.unapply(params);

      expect(mockInstance.down).toHaveBeenCalledTimes(1);
    });

    it('should unapply the migration and set applied to false', async () => {
      const migration = Migration.create({ ...baseProps, applied: true });

      await migration.unapply(params);

      expect(migration.applied).toBe(false);
    });
  });
});
