import type { MigrationEntity } from '@lib/repositories/entities';
import type { IMigrationEntity, IMigrationRepository } from '@lib/repositories/interfaces';
import type { Logger, TransactionMode } from '@lib/types';
import { createId } from '@lib/utils';

import { DatabaseService } from '.';
import { Migration, type MigrationProps } from './entities';

type MigrationServiceProps = {
  migrationLocalRepository: IMigrationRepository;
  migrationRemoteRepository: IMigrationRepository;
  error: Logger;
  log: Logger;
};

export class MigrationService {
  /** Indicates the transaction mode in which a sequence of pending transactions is executed */
  static readonly TRANSACTION_MODE: TransactionMode = 'each';

  /** Service that can be used to interact with Filesystem migration collection  */
  readonly #migrationLocalRepository: IMigrationRepository;
  /** Service that can be used to interact with Appwrite migration collection  */
  readonly #migrationRemoteRepository: IMigrationRepository;

  /** A function that can be used to log error messages */
  readonly #error: Logger;
  /** A function that can be used to log information messages */
  readonly #log: Logger;

  #localEntities: IMigrationEntity[] = [];
  #remoteEntities: IMigrationEntity[] = [];

  #migrations: Migration[] = [];

  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */

  private constructor(props: MigrationServiceProps) {
    this.#migrationLocalRepository = props.migrationLocalRepository;
    this.#migrationRemoteRepository = props.migrationRemoteRepository;
    this.#error = props.error;
    this.#log = props.log;
  }

  static create(props: MigrationServiceProps) {
    return new MigrationService(props);
  }

  /* -------------------------------------------------------------------------- */
  /*                                   builder                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Loads all migration document entities from Appwrite and sorts them by Timestamp ASC.
   */
  public async withRemoteEntities() {
    this.#log('Will retrieve migration data from Appwrite.');

    const entities = await this.#migrationRemoteRepository.listMigrations();

    this.#log(`Migration data retrieved from Appwrite. Found ${entities.length} entries.`);

    this.assertNoDuplicateMigrations(entities);

    this.sortEntities(entities);
    this.#remoteEntities = entities;

    return this;
  }

  /**
   * Loads all migration document entities from Filesystem and sorts them by Timestamp ASC.
   */
  public async withLocalEntities() {
    this.#log('Will retrieve migration data from Filesystem.');

    const entities = await this.#migrationLocalRepository.listMigrations();

    this.#log(`Migration data retrieved from Filesystem. Found ${entities.length} entries.`);

    this.assertNoDuplicateMigrations(entities);

    this.sortEntities(entities);
    this.#localEntities = entities;

    return this;
  }

  /**
   * Builds migration domain entities by combining remote and local migration document entities together.
   *
   * It assumes `withRemoteEntities` and `withLocalEntities` builders were already invoked.
   */
  public withMigrations() {
    this.#migrations = this.#localEntities.map((local, idx) => {
      const fill = { id: createId(), applied: false };
      const remote = this.#remoteEntities.at(idx);

      if (remote && typeof remote.$id === 'string' && typeof remote.applied === 'boolean') {
        fill.id = remote.$id;
        fill.applied = remote.applied;
      }

      return Migration.create({ ...local, ...fill } as MigrationProps);
    });

    return this;
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */

  /** Gets an array containing all executed and pending migrations sorted by timestamp ASC. */
  get migrations() {
    return this.#migrations;
  }

  /** Gets an array containing all executed migrations, sorted by timestamp ASC. */
  get executedMigrations() {
    return this.#migrations.filter((m) => m.isExecuted());
  }

  /** Gets an array containing all pending migrations, sorted by timestamp ASC. */
  get pendingMigrations() {
    return this.#migrations.filter((m) => m.isPending());
  }

  /** Gets the latest migration regardless of it's applied state */
  get latestMigration() {
    return this.#migrations.at(-1);
  }

  /**
   * Executes all pending migrations.
   *
   * Pending migrationss are the ones in our local system but not stored as a document on Appwrite collection
   */
  async executePendingMigrations(databaseService: DatabaseService) {
    this.#log(`Will apply ${this.pendingMigrations.length} pending migrations.`);

    for await (const migration of this.pendingMigrations) {
      try {
        await migration.up(databaseService);
      } catch (e) {
        this.#error(`Failed to apply pending migration: ${migration.name}. Aborting...`);

        if (e instanceof Error) {
          this.#error(e.message);
        }

        break;
      }
    }

    this.#log(`Pending migrations were applied.`);
  }

  /** Reverts last migration that were executed */
  async undoLastMigration(databaseService: DatabaseService) {
    this.#log(`Undoing last applied migration...`);

    const migration = this.executedMigrations.at(-1);

    if (migration) {
      try {
        await migration.down(databaseService);
      } catch (e) {
        this.#error(`Failed to undo last applied migration: ${migration.name}.`);

        if (e instanceof Error) {
          this.#error(e.message);
        }
      }

      this.#log(`Migration 'down' method completed. The ${migration.name} is no longer applied.`);

      return;
    }

    this.#log(`No applied migrations found. Skipped.`);
  }

  /* -------------------------------------------------------------------------- */
  /*                              protected methods                             */
  /* -------------------------------------------------------------------------- */

  /** TODO Runs application routines after the execution of all migrations (before exitting) */
  protected async afterAll(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /** TODO Runs applicational routines after migration completes successfully */
  protected async afterOneCompleted(_: MigrationEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /** TODO Runs applicational routines and cleanup after migration fails to complete */
  protected async afterOneFailed(_: MigrationEntity): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /** TODO Runs applicational routines and sets up the executor before executing migrations */
  protected async beforeAll(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /* -------------------------------------------------------------------------- */
  /*                               private methods                              */
  /* -------------------------------------------------------------------------- */

  /** Validates there are no duplicates in the provided migration document entities by checking names */
  private assertNoDuplicateMigrations(migrations: IMigrationEntity[]) {
    const names = migrations.map((migration) => migration.name);
    const uniqueNames = Array.from(new Set([...names]));

    if (uniqueNames.length === names.length) {
      return true;
    }

    throw Error(
      'Found duplicate migration files. There are at least two files with the same class name. We suggest using our codegen tools when you need to write new migration files.',
    );
  }

  /** Performs an inplace sort of the provided migration document entities by timestamp ASC */
  private sortEntities(migrations: IMigrationEntity[]) {
    return migrations.sort((a, b) => a.timestamp - b.timestamp);
  }
}
