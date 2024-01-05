import type { Databases } from 'node-appwrite';

import type { IMigrationFileEntity } from '@lib/repositories/interfaces';

export class MigrationFileEntity implements IMigrationFileEntity {
  up(databaseService: Databases): Promise<void> {
    throw new Error('Method not implemented.');
  }

  down(databaseService: Databases): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
