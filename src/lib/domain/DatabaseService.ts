import { Databases, type Client } from 'node-appwrite';

export class DatabaseService extends Databases {
  public readonly databaseId: string;

  constructor(client: Client, databaseId: string) {
    super(client);

    this.databaseId = databaseId;
  }

  static create(props: { client: Client; databaseId: string }) {
    return new DatabaseService(props.client, props.databaseId);
  }
}
