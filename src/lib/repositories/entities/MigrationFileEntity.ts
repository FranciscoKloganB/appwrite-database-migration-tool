import type { IMigrationCommandParams, IMigrationFileEntity } from '@lib/repositories/interfaces';

export class MigrationFileEntity implements IMigrationFileEntity {
  up({ db, log, error }: IMigrationCommandParams): Promise<void> {
    throw new Error('Method not implemented.');
  }

  down({ db, log, error }: IMigrationCommandParams): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
