import { createMock } from '@golevelup/ts-jest';

import {
  IMigrationFileEntity,
  LocalMigrationEntity,
  LocalMigrationRepository,
  RemoteMigrationEntity,
  RemoteMigrationRepository,
} from '@lib/repositories';
import { createId } from '@lib/utils';

import { DatabaseService } from './DatabaseService';
import { Migration } from './entities/Migration';
import { MigrationService } from './MigrationService';

describe('MigrationService', () => {
  const error = jest.fn();
  const log = jest.fn();

  const localMigrationRepository = createMock<LocalMigrationRepository>();
  const remoteMigrationRepository = createMock<RemoteMigrationRepository>();

  const fts = 1705148650;
  const fmn = `Migration_${fts}_AppliedRemote`;
  const sts = 1705148849;
  const smn = `Migration_${sts}_PendingRemote`;
  const tts = 1805148555;
  const tmn = `Migration_${tts}_PendingLocalOnly`;

  function createDependencies() {
    const firstLocalEntity = LocalMigrationEntity.create({
      instance: createMock<IMigrationFileEntity>(),
      name: fmn,
      timestamp: fts,
    });

    const firstRemoteEntity = RemoteMigrationEntity.create({
      id: createId(),
      applied: true,
      name: fmn,
      timestamp: fts,
    });

    const secondLocalEntity = LocalMigrationEntity.create({
      instance: createMock<IMigrationFileEntity>(),
      name: smn,
      timestamp: sts,
    });

    const secondRemoteEntity = RemoteMigrationEntity.create({
      id: createId(),
      applied: false,
      name: smn,
      timestamp: sts,
    });

    const thirdLocalEntity = LocalMigrationEntity.create({
      instance: createMock<IMigrationFileEntity>(),
      name: tmn,
      timestamp: tts,
    });

    return {
      firstRemoteEntity,
      firstLocalEntity,
      secondLocalEntity,
      secondRemoteEntity,
      thirdLocalEntity,
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

    describe('withLocalEntities', () => {
      it('should be possible to fill local migrations', async () => {
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

    describe('withRemoteEntities', () => {
      it('should be possible to fill remote migrations', async () => {
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
      async function setup({
        localMigrationEntities,
        remoteMigrationEntities,
      }: {
        localMigrationEntities?: LocalMigrationEntity[];
        remoteMigrationEntities?: RemoteMigrationEntity[];
      } = {}) {
        const migrationService = createSubject();

        const entities = createDependencies();

        remoteMigrationRepository.listMigrations.mockResolvedValue(
          remoteMigrationEntities ?? [entities.firstRemoteEntity, entities.secondRemoteEntity],
        );

        localMigrationRepository.listMigrations.mockResolvedValue(
          localMigrationEntities ?? [
            entities.secondLocalEntity,
            entities.firstLocalEntity,
            entities.thirdLocalEntity,
          ],
        );

        await migrationService.withLocalEntities();
        await migrationService.withRemoteEntities();
        await migrationService.withMigrations();

        return { ...entities, migrationService };
      }

      it('should mark migrations as being "persisted" according to whether they are found remotely during service setup', async () => {
        const { migrationService } = await setup();

        const [first, second, third] = migrationService.migrations;

        expect(first.persisted).toBe(true);
        expect(second.persisted).toBe(true);
        expect(third.persisted).toBe(false);
      });

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
        const { migrationService, thirdLocalEntity } = await setup();

        expect(migrationService.latestMigration).toBeDefined();
        expect(migrationService.latestMigration?.name).toEqual(thirdLocalEntity.name);
      });

      it('should undefined when retrieving the latest migration and migrations are not loaded', async () => {
        const migrationService = createSubject();

        expect(migrationService.latestMigration).toBeUndefined();
      });

      it('should be possible to retrieve pending migrations', async () => {
        const { migrationService, secondRemoteEntity, thirdLocalEntity } = await setup();

        const result = migrationService.pendingMigrations;

        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(2);
        expect(result[0].name).toEqual(secondRemoteEntity.name);
        expect(result[1].name).toEqual(thirdLocalEntity.name);
      });

      it('should be possible to retrieve applied migrations', async () => {
        const { migrationService, firstRemoteEntity } = await setup();

        const result = migrationService.appliedMigrations;

        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(1);
        expect(result[0].$id).toEqual(firstRemoteEntity.$id);
      });

      it('undoLastMigration', async () => {
        const { migrationService } = await setup();

        const databaseService = createMock<DatabaseService>();
        const migrationUnapplySpy = jest.spyOn(Migration.prototype, 'unapply');

        expect(migrationService.appliedMigrations).toHaveLength(1);
        expect(migrationService.pendingMigrations).toHaveLength(2);

        await migrationService.undoLastMigration(databaseService);

        expect(migrationService.pendingMigrations).toHaveLength(2);
        expect(migrationUnapplySpy).toHaveBeenCalledTimes(1);
      });

      it('executePendingMigrations', async () => {
        const { migrationService } = await setup();

        const databaseService = createMock<DatabaseService>();
        const migrationApplySpy = jest.spyOn(Migration.prototype, 'apply');

        expect(migrationService.appliedMigrations).toHaveLength(1);
        expect(migrationService.pendingMigrations).toHaveLength(1);

        await migrationService.executePendingMigrations(databaseService);

        expect(migrationService.appliedMigrations).toHaveLength(3);
        expect(migrationApplySpy).toHaveBeenCalledTimes(2);
      });
    });
  });
});
