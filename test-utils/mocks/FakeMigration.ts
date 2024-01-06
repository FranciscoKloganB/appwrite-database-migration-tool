import { DatabaseService } from '../../lib';
import { MigrationFileEntity } from '../../src/lib/repositories/entities/MigrationFileEntity';

export default class Migration_1704463536_FakeMigration extends MigrationFileEntity {
  constructor() {
    super();
  }

  async up(_: DatabaseService) {
    Promise.resolve('up done');
  }

  async down(_: DatabaseService) {
    Promise.resolve('down done');
  }
}
