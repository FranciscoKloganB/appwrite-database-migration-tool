import { createMock } from '@golevelup/ts-jest';

import {
  IMigrationFileEntity,
  LocalMigrationEntity,
  LocalMigrationRepository,
  RemoteMigrationEntity,
  RemoteMigrationRepository,
} from '@lib/repositories';
import { createId } from '@lib/utils';

import { Migration } from '.';
import { MigrationService } from './MigrationService';

describe('MigrationService', () => {
  const error = jest.fn();
  const log = jest.fn();

  const localMigrationRepository = createMock<LocalMigrationRepository>();
  const remoteMigrationRepository = createMock<RemoteMigrationRepository>();

  const ats = 1705148650;
  const amn = `Migration_${ats}_AppliedRemote`;
  const pts = 1705148849;
  const pmn = `Migration_${pts}_PendingRemote`;

  function createDependencies() {
    const firstLocalEntity = LocalMigrationEntity.create({
      instance: createMock<IMigrationFileEntity>(),
      name: amn,
      timestamp: ats,
    });

    const firstRemoteEntity = RemoteMigrationEntity.create({
      id: createId(),
      applied: true,
      name: amn,
      timestamp: ats,
    });

    const secondLocalEntity = LocalMigrationEntity.create({
      instance: createMock<IMigrationFileEntity>(),
      name: pmn,
      timestamp: pts,
    });

    const secondRemoteEntity = RemoteMigrationEntity.create({
      id: createId(),
      applied: false,
      name: pmn,
      timestamp: pts,
    });

    return {
      firstRemoteEntity,
      firstLocalEntity,
      secondLocalEntity,
      secondRemoteEntity,
    };
  }

  function createSubject() {
    return new MigrationService({
      localMigrationRepository,
      remoteMigrationRepository,
      error,
      log,
    });
  }

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

  describe('local migration value objects', () => {
    it('should start as an empty array', () => {
      const migrationService = createSubject();

      expect(migrationService.localMigrations).toBeInstanceOf(Array);
      expect(migrationService.localMigrations).toHaveLength(0);
    });

    it('should be possible to load local migrations', async () => {
      const migrationService = createSubject();
      const { firstLocalEntity, secondLocalEntity } = createDependencies();

      localMigrationRepository.listMigrations.mockResolvedValue([
        firstLocalEntity,
        secondLocalEntity,
      ]);

      await migrationService.withLocalEntities();

      expect(migrationService.localMigrations).toHaveLength(2);
    });

    it('should sort the local migrations by timestamp ASC when they are loaded', async () => {
      const migrationService = createSubject();
      const { firstLocalEntity, secondLocalEntity } = createDependencies();

      localMigrationRepository.listMigrations.mockResolvedValue([
        secondLocalEntity,
        firstLocalEntity,
      ]);

      await migrationService.withLocalEntities();

      const [olderVO, newerVO] = migrationService.localMigrations;

      expect(olderVO.name).toEqual(firstLocalEntity.name);
      expect(olderVO.timestamp).toEqual(firstLocalEntity.timestamp);

      expect(newerVO.name).toEqual(secondLocalEntity.name);
      expect(newerVO.timestamp).toEqual(secondLocalEntity.timestamp);

      expect(newerVO.timestamp).toBeGreaterThan(olderVO.timestamp);
    });

    it('should return the migration service instance allowing method chaining', async () => {
      const migrationService = createSubject();

      localMigrationRepository.listMigrations.mockResolvedValue([]);

      const result = await migrationService.withLocalEntities();

      expect(result).toBe(migrationService);
    });
  });

  describe('remote migration value objects', () => {
    it('should start as an empty an array', () => {
      const migrationService = createSubject();

      expect(migrationService.remoteMigrations).toBeInstanceOf(Array);
      expect(migrationService.remoteMigrations).toHaveLength(0);
    });

    it('should be possible to load remote migrations', async () => {
      const migrationService = createSubject();

      const { firstRemoteEntity, secondRemoteEntity } = createDependencies();

      remoteMigrationRepository.listMigrations.mockResolvedValue([
        firstRemoteEntity,
        secondRemoteEntity,
      ]);

      await migrationService.withRemoteEntities();

      expect(migrationService.remoteMigrations).toHaveLength(2);
    });

    it('should sort the remote migrations by timestamp ASC when they are loaded', async () => {
      const migrationService = createSubject();

      const { firstRemoteEntity, secondRemoteEntity } = createDependencies();

      remoteMigrationRepository.listMigrations.mockResolvedValue([
        secondRemoteEntity,
        firstRemoteEntity,
      ]);

      await migrationService.withRemoteEntities();

      const [olderVO, newerVO] = migrationService.remoteMigrations;

      expect(olderVO.name).toEqual(firstRemoteEntity.name);
      expect(olderVO.timestamp).toEqual(firstRemoteEntity.timestamp);

      expect(newerVO.name).toEqual(secondRemoteEntity.name);
      expect(newerVO.timestamp).toEqual(secondRemoteEntity.timestamp);

      expect(newerVO.timestamp).toBeGreaterThanOrEqual(olderVO.timestamp);
    });

    it('should return the migration service instance allowing method chaining', async () => {
      const migrationService = createSubject();

      remoteMigrationRepository.listMigrations.mockResolvedValue([]);

      const result = await migrationService.withRemoteEntities();

      expect(result).toBe(migrationService);
    });
  });

  describe('migrations', () => {
    async function setup() {
      const migrationService = createSubject();

      const entities = createDependencies();

      remoteMigrationRepository.listMigrations.mockResolvedValue([
        entities.firstRemoteEntity,
        entities.secondRemoteEntity,
      ]);

      localMigrationRepository.listMigrations.mockResolvedValue([
        entities.secondLocalEntity,
        entities.firstLocalEntity,
      ]);

      await migrationService.withLocalEntities();
      await migrationService.withRemoteEntities();
      await migrationService.withMigrations();

      return { ...entities, migrationService };
    }

    it('should return the migration service instance allowing method chaining', async () => {
      const migrationService = createSubject();

      await migrationService.withLocalEntities();
      await migrationService.withRemoteEntities();

      const result = await migrationService.withMigrations();

      expect(result).toBe(migrationService);
    });

    it('should be possible to load migrations', async () => {
      const migrationService = createSubject();

      const { firstLocalEntity, firstRemoteEntity, secondLocalEntity, secondRemoteEntity } =
        createDependencies();

      remoteMigrationRepository.listMigrations.mockResolvedValue([
        firstRemoteEntity,
        secondRemoteEntity,
      ]);

      localMigrationRepository.listMigrations.mockResolvedValue([
        firstLocalEntity,
        secondLocalEntity,
      ]);

      await migrationService.withLocalEntities();
      await migrationService.withRemoteEntities();
      await migrationService.withMigrations();

      const result = migrationService.migrations;

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result.every((m) => m instanceof Migration)).toBe(true);
    });

    it('should sort the migrations by timestamp ASC when they are loaded', async () => {
      const { migrationService, firstLocalEntity, secondLocalEntity } = await setup();

      const [older, newer] = migrationService.migrations;

      expect(older.name).toEqual(firstLocalEntity.name);
      expect(older.timestamp).toEqual(firstLocalEntity.timestamp);

      expect(newer.name).toEqual(secondLocalEntity.name);
      expect(newer.timestamp).toEqual(secondLocalEntity.timestamp);

      expect(newer.timestamp).toBeGreaterThan(older.timestamp);
    });

    it('should be possible to retrieve the latest migration', async () => {
      const { migrationService, secondRemoteEntity } = await setup();

      expect(migrationService.latestMigration).toBeDefined();
      expect(migrationService.latestMigration?.$id).toEqual(secondRemoteEntity.$id);
    });

    it('shouldd undefined when retrieving the latest migration and migrations are not loaded', async () => {
      const migrationService = createSubject();

      expect(migrationService.latestMigration).toBeUndefined();
    });

    it.todo('executedMigrations');
    it.todo('executePendingMigrations');
    it.todo('pendingMigrations');
    it.todo('undoLastMigration');
  });
});
