import type { Models } from 'node-appwrite';

import { DatabaseService } from '@lib/domain';
import type { Logger } from '@lib/types';
import { isRecord } from '@lib/utils';

import { MigrationEntity } from './entities';
import type { IMigrationRepository } from './interfaces';

type MigrationRemoteRepositoryProps = {
  databaseId: string;
  collectionId: string;
  databaseService: DatabaseService;
  error: Logger;
  log: Logger;
};

type MigrationDocument = Models.Document & { [x: string]: unknown } & {
  $id: string;
  applied: boolean;
  name: string;
  timestamp: number;
};

export class MigrationRemoteRepository implements IMigrationRepository {
  /** The ID of the collection where executed migrations can be found */
  readonly #collectionId: string;
  /** The ID database against which migrations files will be ran */
  readonly #databaseId: string;
  /** An instance of Appwrite Databases to be as a database service */
  readonly #databaseService: DatabaseService;
  /** A function that can be used to log error messages */
  readonly #error: Logger;
  /** A function that can be used to log information messages */
  readonly #log: Logger;

  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */

  private constructor(props: MigrationRemoteRepositoryProps) {
    this.#collectionId = props.collectionId;
    this.#databaseId = props.databaseId;
    this.#databaseService = props.databaseService;
    this.#error = props.error;
    this.#log = props.log;
  }

  static create(props: MigrationRemoteRepositoryProps) {
    return new MigrationRemoteRepository(props);
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */

  public async deleteMigration(migration: MigrationEntity) {
    if (!migration.$id) {
      throw new TypeError(
        'Can not delete migration. Expected entity to have property `id` of type string',
      );
    }

    await this.#databaseService.deleteDocument(this.#databaseId, this.#collectionId, migration.$id);

    return true;
  }

  public async insertMigration(migration: MigrationEntity) {
    const document = await this.#databaseService.createDocument(
      this.#databaseId,
      this.#collectionId,
      migration.$id,
      migration.value,
    );

    if (this.isMigrationEntity(document)) {
      return MigrationEntity.createFromRemoteDocument({ ...document, id: document.$id });
    }

    throw new Error(
      'Migration inserted resulted in malformed Migration document. This should not possible.',
    );
  }

  public async listMigrations() {
    const response = await this.#databaseService.listDocuments(
      this.#databaseId,
      this.#collectionId,
    );

    return response.documents.map((document) => {
      if (this.isMigrationEntity(document)) {
        return MigrationEntity.createFromRemoteDocument({
          id: document.$id,
          applied: document.applied,
          name: document.name,
          timestamp: document.timestamp,
        });
      }

      throw new TypeError(`Unexpected document shape found in migration document ${document.$id}`);
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 type-guards                                */
  /* -------------------------------------------------------------------------- */
  private isMigrationEntity(
    document: Models.Document & { [x: string]: unknown },
  ): document is MigrationDocument {
    const expectedFields = ['$id', 'applied', 'name', 'timestamp'];

    return (
      isRecord(document) &&
      expectedFields.every((field) => field in document) &&
      typeof document['$id'] === 'string' &&
      typeof document['applied'] === 'boolean' &&
      typeof document['name'] === 'string' &&
      typeof document['timestamp'] === 'number'
    );
  }
}
