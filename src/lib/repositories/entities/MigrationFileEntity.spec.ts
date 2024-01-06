import { createMock } from '@golevelup/ts-jest';

import { DatabaseService } from '@lib/domain';

import { MigrationFileEntity } from './MigrationFileEntity';

describe('MigrationFileEntity', () => {
  const errorMessage = 'Method not implemented.';
  const databaseService = createMock<DatabaseService>();

  const entity = new MigrationFileEntity();

  it('should have an up method', () => {
    expect(entity.up).toBeDefined();
  });

  it('should have a down method', () => {
    expect(entity.down).toBeDefined();
  });

  it('should implement the up method', async () => {
    await expect(async () => await entity.up(databaseService)).rejects.toThrow(errorMessage);
  });

  it('should implement the down method', async () => {
    await expect(async () => await entity.down(databaseService)).rejects.toThrow(errorMessage);
  });
});
