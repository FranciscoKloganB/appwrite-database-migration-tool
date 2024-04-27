import type { IMigrationEntity } from '@lib/repositories/interfaces'
import type { Logger, TransactionMode } from '@lib/types'
import { createId } from '@lib/utils'

import type { DatabaseService } from '.'
import type {
  LocalMigrationEntity,
  LocalMigrationRepository,
  RemoteMigrationEntity,
  RemoteMigrationRepository,
} from '../../index-lib'
import { Migration } from './entities'
import { DuplicateMigrationError } from './errors/DuplicateMigrationError'
import type { LocalMigrationVO, RemoteMigrationVO } from './interfaces'

type MigrationServiceProps = {
  localMigrationRepository: LocalMigrationRepository
  remoteMigrationRepository: RemoteMigrationRepository
  error: Logger
  log: Logger
}

export class MigrationService {
  /** Indicates the transaction mode in which a sequence of pending transactions is executed */
  static readonly TRANSACTION_MODE: TransactionMode = 'each'

  /** Service that can be used to interact with Filesystem migration collection  */
  readonly #localMigrationRepository: LocalMigrationRepository
  /** Service that can be used to interact with Appwrite migration collection  */
  readonly #remoteMigrationRepository: RemoteMigrationRepository

  /** A function that can be used to log error messages */
  readonly #error: Logger
  /** A function that can be used to log information messages */
  readonly #log: Logger

  #localEntities: LocalMigrationEntity[] = []
  #remoteEntities: RemoteMigrationEntity[] = []

  #migrations: Migration[] = []

  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */

  public constructor(props: MigrationServiceProps) {
    this.#localMigrationRepository = props.localMigrationRepository
    this.#remoteMigrationRepository = props.remoteMigrationRepository
    this.#error = props.error
    this.#log = props.log
  }

  public static create(props: MigrationServiceProps) {
    return new MigrationService(props)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   builder                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Loads all migration document entities from Appwrite and sorts them by Timestamp ASC.
   */
  public async withRemoteEntities() {
    this.#log('Will retrieve migration data from Appwrite.')

    const entities = await this.#remoteMigrationRepository.listMigrations()

    this.#log(
      `Migration data retrieved from Appwrite. Found ${entities.length} entries.`,
    )

    this.assertNoDuplicateMigrations(entities)

    this.sortEntities(entities)
    this.#remoteEntities = entities

    return this
  }

  /**
   * Loads all migration document entities from Filesystem and sorts them by Timestamp ASC.
   */
  public async withLocalEntities() {
    this.#log('Will retrieve migration data from Filesystem.')

    const entities = await this.#localMigrationRepository.listMigrations()

    this.#log(
      `Migration data retrieved from Filesystem. Found ${entities.length} entries.`,
    )

    this.assertNoDuplicateMigrations(entities)

    this.sortEntities(entities)
    this.#localEntities = entities

    return this
  }

  /**
   * Builds migration domain entities by combining remote and local entities.
   *
   * It is assumed `withRemoteEntities` and `withLocalEntities` builders were already invoked.
   */
  public withMigrations() {
    this.#migrations = this.#localEntities.map((local) => {
      const remote = this.#remoteEntities.find((rmt) => rmt.name === local.name)

      return Migration.create({
        applied: remote?.applied || local.applied,
        id: remote?.$id || createId(),
        instance: local.instance,
        name: local.name,
        persisted: !!remote,
        timestamp: local.timestamp,
      })
    })

    return this
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */
  /** Gets an array containing all executed migrations, sorted by timestamp ASC. */
  public get appliedMigrations(): Array<Migration> {
    return this.#migrations.filter((m) => m.isExecuted())
  }

  /** Gets an array containing local migration value objects sorted by timestamp ASC */
  public get localMigrations(): Array<LocalMigrationVO> {
    return this.#localEntities.map((m) => m.value)
  }

  /** Gets an array containing remote migration value objects sorted by timestamp ASC */
  public get remoteMigrations(): Array<RemoteMigrationVO> {
    return this.#remoteEntities.map((m) => m.value)
  }

  /** Gets an array containing all executed and pending migrations sorted by timestamp ASC. */
  public get migrations(): Array<Migration> {
    return this.#migrations
  }

  /** Gets an array containing all pending migrations, sorted by timestamp ASC. */
  public get pendingMigrations(): Array<Migration> {
    return this.#migrations.filter((m) => m.isPending())
  }

  /** Gets the latest migration regardless of it's applied state */
  public get latestMigration(): Migration | undefined {
    return this.#migrations.at(-1)
  }

  /**
   * Executes all pending migrations.
   *
   * Pending migrationss are the ones in our local system but not stored as a document on Appwrite collection
   */
  public async executePendingMigrations(databaseService: DatabaseService) {
    this.#log(`There are ${this.pendingMigrations.length} pending migrations.`)

    for await (const migration of this.pendingMigrations) {
      try {
        this.#log(`Pending migration ${migration.name} is being applied.`)

        await migration.apply({
          db: databaseService,
          log: this.#log,
          error: this.#error,
        })

        this.#log(`Pending migration ${migration.name} was applied.`)
      } catch (error) {
        this.#error(`Error applying pending migration ${migration.name}. Aborting...`)

        throw error
      }

      try {
        this.#log(`Migration ${migration.name} new state will be saved to Appwrite.`)

        migration.persisted
          ? await this.#remoteMigrationRepository.updateMigration({
              $id: migration.$id,
              applied: true,
            })
          : await this.#remoteMigrationRepository.insertMigration({
              $id: migration.$id,
              applied: migration.applied,
              timestamp: migration.timestamp,
              name: migration.name,
            })

        migration.setPersisted(true)

        this.#log(`Migration ${migration.name} new state was saved. Completed.`)
      } catch (insertError) {
        this.#error(
          `Migration ${migration.name} was applied but new state was not saved.`,
        )

        throw insertError
      }
    }

    this.#log('All Pending migrations were applied.')
  }

  /** Reverts last migration that were executed */
  public async undoLastMigration(databaseService: DatabaseService) {
    this.#log('Undoing last applied migration...')

    const migration = this.appliedMigrations.at(-1)

    if (migration) {
      try {
        await migration.unapply({
          db: databaseService,
          log: this.#log,
          error: this.#error,
        })
      } catch (e) {
        this.#error(`Failed to undo last applied migration: ${migration.name}.`)

        throw e
      }

      try {
        this.#log(`Migration ${migration.name} new state will be updated on Appwrite.`)

        await this.#remoteMigrationRepository.updateMigration({
          $id: migration.$id,
          applied: false,
        })

        this.#log(`Migration ${migration.name} new state was updated. Completed.`)
      } catch (insertError) {
        this.#error(
          `Migration ${migration.name} was unapplied but new state was not updated.`,
        )

        throw insertError
      }

      this.#log(
        `Migration 'down' method completed. The ${migration.name} is no longer applied.`,
      )

      return
    }

    this.#log('No applied migrations found. Skipped.')
  }

  /* -------------------------------------------------------------------------- */
  /*                              protected methods                             */
  /* -------------------------------------------------------------------------- */

  /** TODO Runs application routines after the execution of all migrations (before exitting) */
  protected async afterAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /** TODO Runs applicational routines after migration completes successfully */
  protected async afterOneCompleted(_: IMigrationEntity): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /** TODO Runs applicational routines and cleanup after migration fails to complete */
  protected async afterOneFailed(_: IMigrationEntity): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /** TODO Runs applicational routines and sets up the executor before executing migrations */
  protected async beforeAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  /* -------------------------------------------------------------------------- */
  /*                               private methods                              */
  /* -------------------------------------------------------------------------- */

  /** Validates there are no duplicates in the provided migration document entities by checking names */
  private assertNoDuplicateMigrations(migrations: IMigrationEntity[]) {
    const names = migrations.map((migration) => migration.name)
    const uniqueNames = Array.from(new Set([...names]))

    if (uniqueNames.length === names.length) {
      return true
    }

    throw new DuplicateMigrationError()
  }

  /** Performs an inplace sort of the provided migration document entities by timestamp ASC */
  private sortEntities(migrations: IMigrationEntity[]) {
    return migrations.sort((a, b) => a.timestamp - b.timestamp)
  }
}
