import { createMock } from '@golevelup/ts-jest';

import {
  LocalMigrationEntity,
  LocalMigrationRepository,
  RemoteMigrationEntity,
  RemoteMigrationRepository,
} from '../../index-lib';
import { MigrationService } from './MigrationService';

describe('MigrationService', () => {
  const localMigrationRepository = createMock<LocalMigrationRepository>();
  const remoteMigrationRepository = createMock<RemoteMigrationRepository>();
  const error = jest.fn();
  const log = jest.fn();

  const createSubject = () =>
    new MigrationService({
      localMigrationRepository,
      remoteMigrationRepository,
      error,
      log,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an instance of MigrationService', () => {
      expect(
        MigrationService.create({
          localMigrationRepository,
          remoteMigrationRepository,
          error: error,
          log: log,
        }),
      ).toBeInstanceOf(MigrationService);
    });
  });

  describe('localMigrations', () => {
    it('should be an array', () => {
      const migrationService = createSubject();

      expect(migrationService.localMigrations).toBeInstanceOf(Array);
    });

    it('should be empty', () => {
      const migrationService = createSubject();

      expect(migrationService.localMigrations).toHaveLength(0);
    });
  });

  describe('withLocalEntities', () => {
    it('should be possible to fill local migrations', async () => {
      const migrationService = createSubject();

      const newer = createMock<LocalMigrationEntity>({ timestamp: 10 });
      const older = createMock<LocalMigrationEntity>({ timestamp: 5 });

      localMigrationRepository.listMigrations.mockResolvedValue([newer, older]);

      await migrationService.withLocalEntities();

      expect(migrationService.localMigrations).toHaveLength(2);
    });

    it('should sort the local migrations by timestamp ASC when they are filled', async () => {
      const migrationService = createSubject();

      const newerTimestamp = 10;
      const olderTimestamp = 5;

      const newer = createMock<LocalMigrationEntity>({
        timestamp: newerTimestamp,
        value: {
          timestamp: newerTimestamp,
        },
      });

      const older = createMock<LocalMigrationEntity>({
        timestamp: olderTimestamp,
        value: {
          timestamp: olderTimestamp,
        },
      });

      localMigrationRepository.listMigrations.mockResolvedValue([newer, older]);

      await migrationService.withLocalEntities();

      const [olderVO, newerVO] = migrationService.localMigrations;

      expect(olderVO.timestamp).toEqual(older.timestamp);
      expect(newerVO.timestamp).toEqual(newerVO.timestamp);
    });

    it('should return the migration servicie instance allowing method chaining', async () => {
      const migrationService = createSubject();

      localMigrationRepository.listMigrations.mockResolvedValue([]);

      const result = await migrationService.withLocalEntities();

      expect(result).toBe(migrationService);
    });
  });

  describe('remoteMigrations', () => {
    it('should be an array', () => {
      const migrationService = createSubject();

      expect(migrationService.remoteMigrations).toBeInstanceOf(Array);
    });

    it('should be empty', () => {
      const migrationService = createSubject();

      expect(migrationService.remoteMigrations).toHaveLength(0);
    });
  });

  describe('withRemoteEntities', () => {
    it('should be possible to fill remote migrations', async () => {
      const migrationService = createSubject();

      const newer = createMock<RemoteMigrationEntity>({ timestamp: 10 });
      const older = createMock<RemoteMigrationEntity>({ timestamp: 5 });

      remoteMigrationRepository.listMigrations.mockResolvedValue([newer, older]);

      await migrationService.withRemoteEntities();

      expect(migrationService.remoteMigrations).toHaveLength(2);
    });

    it('should sort the remote migrations by timestamp ASC when they are filled', async () => {
      const migrationService = createSubject();

      const newerTimestamp = 10;
      const olderTimestamp = 5;

      const newer = createMock<RemoteMigrationEntity>({
        timestamp: newerTimestamp,
        value: {
          timestamp: newerTimestamp,
        },
      });

      const older = createMock<RemoteMigrationEntity>({
        timestamp: olderTimestamp,
        value: {
          timestamp: olderTimestamp,
        },
      });

      remoteMigrationRepository.listMigrations.mockResolvedValue([newer, older]);

      await migrationService.withRemoteEntities();

      const [olderVO, newerVO] = migrationService.remoteMigrations;

      expect(olderVO.timestamp).toEqual(older.timestamp);
      expect(newerVO.timestamp).toEqual(newerVO.timestamp);
    });

    it('should return the migration servicie instance allowing method chaining', async () => {
      const migrationService = createSubject();

      remoteMigrationRepository.listMigrations.mockResolvedValue([]);

      const result = await migrationService.withRemoteEntities();

      expect(result).toBe(migrationService);
    });
  });
});
