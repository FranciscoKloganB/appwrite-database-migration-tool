import { DatabaseService } from '@lib/domain';

import { Logger } from '../../../index-lib';

export interface IMigrationEntityValue {
  $id?: string | undefined;
  applied: boolean;
  instance?: IMigrationFileEntity | undefined;
  name: string;
  timestamp: number;
}

export interface IMigrationEntity {
  $id?: string;
  applied?: boolean;
  instance?: IMigrationFileEntity;
  name: string;
  timestamp: number;
  value: IMigrationEntityValue;
  apply: () => void;
  unapply: () => void;
}

export interface IMigrationCommandParams {
  db: DatabaseService;
  log: Logger;
  error: Logger;
}

export interface IMigrationFileEntity {
  /** Applies the migrations. */
  up(params: IMigrationCommandParams): Promise<void>;
  /** Reverse the migrations. */
  down(params: IMigrationCommandParams): Promise<void>;
}

export type CreateMigrationEntity = Required<Omit<IMigrationEntityValue, 'instance'>>;

export type DeleteMigrationEntity = Pick<Required<Omit<IMigrationEntityValue, 'instance'>>, '$id'>;

export type UpdateMigrationEntity = Pick<
  Required<Omit<IMigrationEntityValue, 'instance'>>,
  '$id' | 'applied'
>;

export interface IMigrationRepository {
  deleteMigration(m: DeleteMigrationEntity): Promise<boolean>;

  insertMigration(m: CreateMigrationEntity): Promise<IMigrationEntity>;

  listMigrations(): Promise<IMigrationEntity[]>;

  updateMigration(m: UpdateMigrationEntity): Promise<IMigrationEntity>;
}
