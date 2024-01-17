import { createMock } from '@golevelup/ts-jest';
import { describe } from 'node:test';

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
import { DuplicateMigrationError } from './errors/DuplicateMigrationError';
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

      it('should prevent duplicate local entities', async () => {
        const migrationService = createSubject();
        const { firstLocalEntity } = createDependencies();

        localMigrationRepository.listMigrations.mockResolvedValue([
          firstLocalEntity,
          firstLocalEntity,
        ]);

        await expect(async () => migrationService.withLocalEntities()).rejects.toThrow(
          DuplicateMigrationError,
        );
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

      it('should prevent duplicate remote entities', async () => {
        const migrationService = createSubject();
        const { firstRemoteEntity } = createDependencies();

        remoteMigrationRepository.listMigrations.mockResolvedValue([
          firstRemoteEntity,
          firstRemoteEntity,
        ]);

        await expect(async () => migrationService.withLocalEntities()).rejects.toThrow(
          DuplicateMigrationError,
        );
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
        expect(result[0].name).toEqual(firstRemoteEntity.name);
      });

      describe('pending migration execution', () => {
        it('should apply all pending migrations', async () => {
          const { migrationService } = await setup();

          const databaseService = createMock<DatabaseService>();
          const migrationApplySpy = jest.spyOn(Migration.prototype, 'apply');

          expect(migrationService.appliedMigrations).toHaveLength(1);
          expect(migrationService.pendingMigrations).toHaveLength(2);

          await migrationService.executePendingMigrations(databaseService);

          expect(migrationService.appliedMigrations).toHaveLength(3);
          expect(migrationService.pendingMigrations).toHaveLength(0);

          expect(migrationApplySpy).toHaveBeenCalledTimes(2);
        });

        it('should update the remote migration when it is applied when it it already exists remotely', async () => {
          const localEnt = LocalMigrationEntity.create({
            instance: createMock<IMigrationFileEntity>(),
            name: smn,
            timestamp: sts,
          });

          const remoteEnt = RemoteMigrationEntity.create({
            id: createId(),
            applied: false,
            name: smn,
            timestamp: sts,
          });

          const { migrationService } = await setup({
            localMigrationEntities: [localEnt],
            remoteMigrationEntities: [remoteEnt],
          });

          const databaseService = createMock<DatabaseService>();

          await migrationService.executePendingMigrations(databaseService);

          expect(remoteMigrationRepository.insertMigration).toHaveBeenCalledTimes(0);
          expect(remoteMigrationRepository.updateMigration).toHaveBeenCalledTimes(1);
        });

        it('should write a remote migration when it is applied when it it already exists remotely', async () => {
          const entity = LocalMigrationEntity.create({
            instance: createMock<IMigrationFileEntity>(),
            name: tmn,
            timestamp: tts,
          });

          const databaseService = createMock<DatabaseService>();

          const { migrationService } = await setup({
            localMigrationEntities: [entity],
            remoteMigrationEntities: [],
          });

          await migrationService.executePendingMigrations(databaseService);

          expect(remoteMigrationRepository.insertMigration).toHaveBeenCalledTimes(1);
          expect(remoteMigrationRepository.updateMigration).toHaveBeenCalledTimes(0);
        });

        it('should save applied migrations state to remote repository', async () => {
          const { migrationService } = await setup();

          const databaseService = createMock<DatabaseService>();

          await migrationService.executePendingMigrations(databaseService);

          // Migration 2 already exists on remote, so we updated it
          expect(remoteMigrationRepository.updateMigration).toHaveBeenCalledTimes(1);
          // Migration 3 is new (only exists locally), so we write it
          expect(remoteMigrationRepository.insertMigration).toHaveBeenCalledTimes(1);

          expect(migrationService.appliedMigrations.every((m) => m.persisted)).toBe(true);
        });

        it('should throw an when a migration fails to apply', async () => {
          const error = new Error('failed to apply');
          const { migrationService } = await setup();

          const migrationApplySpy = jest.spyOn(Migration.prototype, 'apply');
          migrationApplySpy.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          await expect(async () =>
            migrationService.executePendingMigrations(databaseService),
          ).rejects.toThrow(error);
        });

        it('should throw an error when a migration is applied but state could not be persisted', async () => {
          const error = new Error('failed to persist');
          const { migrationService } = await setup();

          remoteMigrationRepository.insertMigration.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          await expect(async () =>
            migrationService.executePendingMigrations(databaseService),
          ).rejects.toThrow(error);
        });

        it('should not apply subsequent migration files when the current migration fails to apply', async () => {
          const error = new Error('failed to apply');
          const { migrationService } = await setup();

          const migrationApplySpy = jest.spyOn(Migration.prototype, 'apply');
          migrationApplySpy.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          try {
            await migrationService.executePendingMigrations(databaseService);
          } catch (e) {
            // pass
          }

          expect(migrationApplySpy).toHaveBeenCalledTimes(1);
        });

        it('should not apply subsequent migration files when the current migration fails to persist', async () => {
          const error = new Error('failed to persist');
          const { migrationService } = await setup();

          const migrationApplySpy = jest.spyOn(Migration.prototype, 'apply');

          remoteMigrationRepository.insertMigration.mockRejectedValueOnce(error);
          remoteMigrationRepository.updateMigration.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          try {
            await migrationService.executePendingMigrations(databaseService);
          } catch (e) {
            // pass
          }

          expect(migrationApplySpy).toHaveBeenCalledTimes(1);
        });
      });

      describe('undoing last migration', () => {
        it('it should only undo one migration', async () => {
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
            applied: true,
            name: smn,
            timestamp: sts,
          });

          const { migrationService } = await setup({
            localMigrationEntities: [firstLocalEntity, secondLocalEntity],
            remoteMigrationEntities: [firstRemoteEntity, secondRemoteEntity],
          });

          const databaseService = createMock<DatabaseService>();
          const migrationUnapplySpy = jest.spyOn(Migration.prototype, 'unapply');

          expect(migrationService.appliedMigrations).toHaveLength(2);
          expect(migrationService.pendingMigrations).toHaveLength(0);

          await migrationService.undoLastMigration(databaseService);

          expect(migrationService.pendingMigrations).toHaveLength(1);
          expect(migrationService.appliedMigrations).toHaveLength(1);
          expect(migrationUnapplySpy).toHaveBeenCalledTimes(1);
        });

        it('should throw an when a migration fails to undo', async () => {
          const error = new Error('failed to unapply');
          const { migrationService } = await setup();

          const migrationUnapplySpy = jest.spyOn(Migration.prototype, 'unapply');
          migrationUnapplySpy.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          await expect(async () =>
            migrationService.undoLastMigration(databaseService),
          ).rejects.toThrow(error);
        });

        it('should throw an error when a migration is unapplied but state could not be updated', async () => {
          const error = new Error('failed to persist');
          const { migrationService } = await setup();

          remoteMigrationRepository.updateMigration.mockRejectedValueOnce(error);

          const databaseService = createMock<DatabaseService>();

          await expect(async () =>
            migrationService.undoLastMigration(databaseService),
          ).rejects.toThrow(error);
        });
      });
    });
  });
});
