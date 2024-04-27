import type { IMigrationCommandParams } from '../../lib'
import { MigrationFileEntity } from '../../src/lib/repositories/entities/MigrationFileEntity'

export default class Migration_1704463536_FakeMigration extends MigrationFileEntity {
  async up(_: IMigrationCommandParams) {
    Promise.resolve({
      $id: 'mock-id',
      applied: true,
      name: 'Migration_1704463536_FakeMigration',
      timestamp: Date.now(),
    })
  }

  async down(_: IMigrationCommandParams) {
    Promise.resolve({
      $id: 'mock-id',
      applied: false,
      name: 'Migration_1704463536_FakeMigration',
      timestamp: Date.now(),
    })
  }
}
