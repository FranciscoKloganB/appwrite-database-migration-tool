import type { Databases } from 'node-appwrite';

import type { MigrationEntity } from '@repositories/entities';

export interface IMigrationEntity {
  $id: string | null;
  applied: boolean | null;
  instance: IMigrationFile | null;
  name: string;
  timestamp: number;
}

export interface IMigrationFile {
  /** Applies the migrations. */
  up(databaseService: Databases): Promise<boolean>;
  /** Reverse the migrations. */
  down(databaseService: Databases): Promise<boolean>;
}

export interface IMigrationRepository {
  deleteMigration(migration: MigrationEntity): Promise<boolean>;
  insertMigration(migration: MigrationEntity): Promise<MigrationEntity>;
  listMigrations(): Promise<MigrationEntity[]>;
}
