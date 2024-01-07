import { AppwriteException, Databases, type Client } from 'node-appwrite';

export class DatabaseService extends Databases {
  readonly #databaseId: string;

  constructor(client: Client, databaseId: string) {
    super(client);

    this.#databaseId = databaseId;
  }

  static create(props: { client: Client; databaseId: string }) {
    return new DatabaseService(props.client, props.databaseId);
  }

  get databaseId() {
    return this.#databaseId;
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */
  public async collectionExists(collectionId: string) {
    try {
      await this.getCollection(this.#databaseId, collectionId);

      return true;
    } catch (e) {
      if (e instanceof AppwriteException) {
        e.message.includes('Collection with the requested ID could not be found');

        return false;
      }

      throw e;
    }
  }

  public async databaseExists() {
    try {
      await this.get(this.#databaseId);

      return true;
    } catch (e) {
      if (e instanceof AppwriteException) {
        e.message.includes('Database with the requested ID could not be found');

        return false;
      }

      throw e;
    }
  }
}