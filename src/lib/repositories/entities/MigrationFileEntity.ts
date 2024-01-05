import type { Databases } from 'node-appwrite';

import type { IMigrationFile } from '@lib/repositories/interfaces';

export class MigrationFileEntity implements IMigrationFile {
  up(databaseService: Databases): Promise<void> {
    throw new Error('Method not implemented.');
  }

  down(databaseService: Databases): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
