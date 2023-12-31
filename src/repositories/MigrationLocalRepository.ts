import fs from 'fs';
import path from 'path';
import invariant from 'tiny-invariant';

import { MIGRATIONS_HOME } from '@constants';
import type { Logger } from '@types';

import { MigrationEntity } from './entities';
import type { MigrationFileEntity } from './entities/MigrationFileEntity';
import type { IMigrationRepository } from './interfaces';

type MigrationLocalRepositoryProps = {
  error: Logger;
  log: Logger;
};

const migrationsHome = process.env['MIGRATIONS_HOME'] ?? MIGRATIONS_HOME;
invariant(migrationsHome, 'MIGRATIONS_HOME');

export class MigrationLocalRepository implements IMigrationRepository {
  /** A function that can be used to log error messages */
  readonly #error: Logger;
  /** A function that can be used to log information messages */
  readonly #log: Logger;

  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */

  private constructor(props: MigrationLocalRepositoryProps) {
    this.#error = props.error;
    this.#log = props.log;
  }

  static create(props: MigrationLocalRepositoryProps) {
    return new MigrationLocalRepository(props);
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */

  async deleteMigration(_: MigrationEntity): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  async insertMigration(_: MigrationEntity): Promise<MigrationEntity> {
    throw new Error('Method not implemented');
  }

  async listMigrations() {
    const files = await this.getFiles(path.join(process.cwd(), migrationsHome), ['js', 'ts']);
    const imports = files.map((file) => import(path.resolve(migrationsHome, file)));
    const modules = await Promise.all(imports);

    return modules.filter(this.isMigrationFileClass).map((Class) => {
      const instance = new Class();
      const name = instance.constructor.name;
      const timestamp = this.getTimestampFromClassname(name);

      return MigrationEntity.createFromLocalDocument({
        instance,
        name,
        timestamp,
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 type-guards                                */
  /* -------------------------------------------------------------------------- */

  private async getFiles(dir: string, extensions: string[]): Promise<string[]> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

    const files = dirents
      .filter((dent) => dent.isFile() && extensions.includes(dent.name.split('.').pop() || ''))
      .map((file) => path.resolve(dir, file.name));

    return files;
  }

  private isMigrationFileClass(value: unknown): value is typeof MigrationFileEntity {
    return (
      typeof value === 'function' &&
      !!value.prototype &&
      !!value.prototype.constructor.name &&
      'up' in value.prototype &&
      'down' in value.prototype
    );
  }

  private getTimestampFromClassname(name: string) {
    const matches = name.match(/_(\d+)_/);

    if (matches && matches.length === 3) {
      return Number(matches[1]);
    }

    throw new Error(
      `Unable to extract timestamp from migration file. Expected class name to have format 'Migration_<timestamp>_<description>', got: '${name}'. We suggest using our codegen tools when you need to write new migration files.`,
    );
  }
}
