import * as fs from 'fs';
import { createMock } from '@golevelup/ts-jest';

import { MigrationEntity } from './entities/MigrationEntity';
import { MigrationLocalRepository } from './MigrationLocalRepository';

describe('MigrationLocalRepository', () => {
  const env = { ...process.env };

  const errorLogger = jest.fn();
  const infoLogger = jest.fn();

  const migrationFolder = '/test-utils/mocks';

  const entity = createMock<MigrationEntity>();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();

    process.env = env;
    process.env['MIGRATIONS_HOME'] = migrationFolder;
  });

  afterEach(() => {
    process.env = env;
  });

  describe('deleteMigration', () => {
    it('should throw an error indicating that the method is not implemented', async () => {
      const repository = MigrationLocalRepository.create({
        error: errorLogger,
        log: infoLogger,
      });

      expect(async () => await repository.deleteMigration(entity)).rejects.toThrow(
        'Method not implemented.',
      );
    });
  });

  describe('insertMigration', () => {
    it('should throw an error indicating that the method is not implemented', async () => {
      const repository = MigrationLocalRepository.create({
        error: errorLogger,
        log: infoLogger,
      });

      expect(async () => await repository.insertMigration(entity)).rejects.toThrow(
        'Method not implemented.',
      );
    });
  });

  describe('listMigrations', () => {
    it('should return an array of MigrationEntity instances when at least one MigrationFile exists', async () => {
      const repository = MigrationLocalRepository.create({
        error: errorLogger,
        log: infoLogger,
      });

      const result = await repository.listMigrations();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MigrationEntity);
    });

    it('should return an empty array when no MigrationFiles are found', async () => {
      jest.spyOn(fs.promises, 'readdir').mockResolvedValue([]);

      const repository = MigrationLocalRepository.create({
        error: errorLogger,
        log: infoLogger,
      });

      const result = await repository.listMigrations();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });
  });
});
