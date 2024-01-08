import { DatabaseService } from '@lib/domain';

export interface IMigrationEntity {
  $id: string | null;
  applied: boolean | null;
  instance: IMigrationFileEntity | null;
  name: string;
  timestamp: number;
  value: { applied: boolean; name: string; timestamp: number };
}

export interface IMigrationFileEntity {
  /** Applies the migrations. */
  up(databaseService: DatabaseService): Promise<void>;
  /** Reverse the migrations. */
  down(databaseService: DatabaseService): Promise<void>;
}

export interface IMigrationRepository {
  deleteMigration(migration: IMigrationEntity): Promise<boolean>;
  insertMigration(migration: IMigrationEntity): Promise<IMigrationEntity>;
  listMigrations(): Promise<IMigrationEntity[]>;
}
