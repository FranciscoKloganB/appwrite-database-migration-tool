import { createMock } from '@golevelup/ts-jest';

import { DatabaseService } from '@lib/domain';

import { MigrationFileEntity } from './MigrationFileEntity';

describe('MigrationFileEntity', () => {
  const errorMessage = 'Method not implemented.';

  const db = createMock<DatabaseService>();
  const log = jest.fn();
  const error = jest.fn();

  const entity = new MigrationFileEntity();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have an up method', () => {
    expect(entity.up).toBeDefined();
  });

  it('should have a down method', () => {
    expect(entity.down).toBeDefined();
  });

  it('should implement the up method', async () => {
    await expect(async () => await entity.up({ db, log, error })).rejects.toThrow(errorMessage);
  });

  it('should implement the down method', async () => {
    await expect(async () => await entity.down({ db, log, error })).rejects.toThrow(errorMessage);
  });
});
