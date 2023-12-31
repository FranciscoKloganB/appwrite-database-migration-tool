import type { Databases } from 'node-appwrite';

import type { IMigrationFile } from '@repositories/interfaces';

export class MigrationFileEntity implements IMigrationFile {
  up(databaseService: Databases): Promise<boolean> {
    throw Error('Method not implemented.');
  }

  down(databaseService: Databases): Promise<boolean> {
    throw Error('Method not implemented.');
  }
}
