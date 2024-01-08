import { DatabaseService } from '@lib/domain';

export interface IMigrationEntity {
  $id?: string;
  applied?: boolean;
  instance?: IMigrationFileEntity;
  name: string;
  timestamp: number;
  value: {
    $id?: string | undefined;
    applied: boolean;
    instance?: IMigrationFileEntity | undefined;
    name: string;
    timestamp: number;
  };
  apply: () => void;
  unapply: () => void;
}

export interface IMigrationFileEntity {
  /** Applies the migrations. */
  up(databaseService: DatabaseService): Promise<void>;
  /** Reverse the migrations. */
  down(databaseService: DatabaseService): Promise<void>;
}

export interface IMigrationRepository {
  deleteMigration(m: Pick<Required<IMigrationEntity>, '$id'>): Promise<boolean>;

  insertMigration(m: Omit<Required<IMigrationEntity>, 'instance'>): Promise<IMigrationEntity>;

  listMigrations(): Promise<IMigrationEntity[]>;
}
