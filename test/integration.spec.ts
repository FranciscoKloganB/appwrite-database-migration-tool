import { migrationsCreateCollection } from '@lib/migrationsCreateCollection';
import { migrationsCreateDatabase } from '@lib/migrationsCreateDatabase';
import { migrationsRunSequence } from '@lib/migrationsRunSequence';
import { MigrationFileEntity } from '@lib/repositories';

describe('migrationsCreateCollection', () => {
  it('should be defined', () => {
    expect(migrationsCreateCollection).toBeDefined();
    expect(migrationsCreateCollection).toBeInstanceOf(Function);
  });
});

describe('migrationsCreateDatabase', () => {
  it('should be defined', () => {
    expect(migrationsCreateDatabase).toBeDefined();
    expect(migrationsCreateDatabase).toBeInstanceOf(Function);
  });
});

describe('migrationsRunSequence', () => {
  it('should be defined', () => {
    expect(migrationsRunSequence).toBeDefined();
    expect(migrationsRunSequence).toBeInstanceOf(Function);
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
