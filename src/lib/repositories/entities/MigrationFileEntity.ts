import { DatabaseService } from '@lib/domain';
import type { IMigrationFileEntity } from '@lib/repositories/interfaces';

export class MigrationFileEntity implements IMigrationFileEntity {
  up(databaseService: DatabaseService): Promise<void> {
    throw new Error('Method not implemented.');
  }

  down(databaseService: DatabaseService): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
