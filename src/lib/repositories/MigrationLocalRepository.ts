import * as fs from 'fs';
import * as path from 'path';
import invariant from 'tiny-invariant';

import { MIGRATIONS_HOME_FOLDER } from '@lib/constants';
import type { Logger } from '@lib/types';
import { isClass } from '@lib/utils/type-guards';

import { MigrationEntity } from './entities';
import type { MigrationFileEntity } from './entities/MigrationFileEntity';
import type { IMigrationRepository } from './interfaces';

type MigrationLocalRepositoryProps = {
  error: Logger;
  log: Logger;
};

export class MigrationLocalRepository implements IMigrationRepository {
  /** A function that can be used to log error messages */
  readonly #error: Logger;
  /** A function that can be used to log information messages */
  readonly #log: Logger;
  /** A relative path to the location where local Migration documents can be found */
  readonly #store: string;
  /* -------------------------------------------------------------------------- */
  /*                                 constructor                                */
  /* -------------------------------------------------------------------------- */

  private constructor(props: MigrationLocalRepositoryProps) {
    this.#error = props.error;
    this.#log = props.log;
    this.#store = process.env['MIGRATIONS_HOME_FOLDER'] ?? MIGRATIONS_HOME_FOLDER;

    invariant(this.#store, 'MIGRATIONS_HOME_FOLDER');
  }

  static create(props: MigrationLocalRepositoryProps) {
    return new MigrationLocalRepository(props);
  }

  /* -------------------------------------------------------------------------- */
  /*                               public methods                               */
  /* -------------------------------------------------------------------------- */

  async deleteMigration(_: MigrationEntity): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async insertMigration(_: MigrationEntity): Promise<MigrationEntity> {
    throw new Error('Method not implemented.');
  }

  async listMigrations() {
    const folder = path.join(process.cwd(), this.#store);
    const files = await this.getFiles(folder, ['js', 'ts']);
    const imports = files.map((file) => import(path.resolve(this.#store, file)));
    const modules = await Promise.all(imports);

    const entities = modules
      .filter((module) => this.isMigrationFileClass(module.default))
      .map((module) => {
        const instance = new module.default();
        const name = instance.constructor.name;
        const timestamp = this.getTimestampFromClassname(name);

        this.#log(
          `Loaded module (name, timestamp, instance JSON): ${name}, ${timestamp}, ${JSON.stringify(
            instance,
          )} `,
        );

        return MigrationEntity.createFromLocalDocument({
          instance,
          name,
          timestamp,
        });
      });

    this.#log(`Local entities retrieved: ${JSON.stringify(entities.map((x) => x.name))}`);

    return entities;
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
    return isClass(value) && 'up' in value.prototype && 'down' in value.prototype;
  }

  private getTimestampFromClassname(name: string) {
    const matches = name.match(/_(\d+)_/);

    if (matches && typeof matches.at(1) === 'string') {
      return Number(matches.at(1));
    }

    throw new Error(
      `Unable to extract timestamp from migration file. Expected class name to have format 'Migration_<timestamp>_<description>', got: '${name}'. We suggest using our codegen tools when you need to write new migration files.`,
    );
  }
}
