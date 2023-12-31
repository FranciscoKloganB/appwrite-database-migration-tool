import { createMigrationCollection, MigrationFileEntity, runMigrationSequence } from '@src';

describe('createMigrationCollection', () => {
  it('should be defined', () => {
    expect(createMigrationCollection).toBeDefined();
    expect(createMigrationCollection).toBeInstanceOf(Function);
  });
});

describe('runMigrationSequence', () => {
  it('should be defined', () => {
    expect(runMigrationSequence).toBeDefined();
    expect(runMigrationSequence).toBeInstanceOf(Function);
  });
});

describe('MigrationFileEntity', () => {
  it('should be defined', () => {
    expect(MigrationFileEntity).toBeDefined();
    expect(MigrationFileEntity).toBeInstanceOf(Function);
    expect(MigrationFileEntity.prototype).toBeDefined();
    expect(MigrationFileEntity.prototype.constructor).toBeDefined();
  });
});
