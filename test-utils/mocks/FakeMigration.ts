import type { Databases } from 'node-appwrite';

import { MigrationFileEntity } from '../../src/lib/repositories/entities/MigrationFileEntity';

export default class Migration_1704463536_FakeMigration extends MigrationFileEntity {
  constructor() {
    super();
  }

  async up(_: Databases) {
    Promise.resolve('up done');
  }

  async down(_: Databases) {
    Promise.resolve('down done');
  }
}
