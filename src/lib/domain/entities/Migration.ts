import type { IMigrationCommandParams, IMigrationFileEntity } from '@lib/repositories';

export type MigrationProps = {
  applied: boolean;
  id: string;
  instance: IMigrationFileEntity;
  name: string;
  timestamp: number;
};

export class Migration {
  /** The wether the migration has been applied (executed vs. pending, stored as a document vs. local file only) */
  #applied: boolean;
  /** An appwrite document ID */
  #id: string;
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFileEntity;
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string;
  /** The timestamp in which the migration was applied if it was applied, it probably does not match class name timestamp */
  #timestamp: number;

  public constructor(
    applied: boolean,
    id: string,
    instance: IMigrationFileEntity,
    name: string,
    timestamp: number,
  ) {
    this.#applied = applied;
    this.#id = id;
    this.#instance = instance;
    this.#name = name;
    this.#timestamp = timestamp;
  }

  static create(props: MigrationProps) {
    return new Migration(props.applied, props.id, props.instance, props.name, props.timestamp);
  }

  get $id() {
    return this.#id;
  }

  get applied() {
    return this.#applied;
  }

  get instance() {
    return this.#instance;
  }

  get name() {
    return this.#name;
  }

  get timestamp() {
    return this.#timestamp;
  }

  get value() {
    return {
      $id: this.$id,
      applied: this.applied,
      name: this.name,
      timestamp: this.timestamp,
    } as const;
  }

  isExecuted() {
    return this.#applied;
  }

  isPending() {
    return !this.#applied;
  }

  async apply(params: IMigrationCommandParams) {
    if (this.isPending()) {
      await this.#instance.up(params);

      this.setApplied(true);
    }

    return this.value;
  }

  async unapply(params: IMigrationCommandParams) {
    if (this.isExecuted()) {
      await this.#instance.down(params);

      this.setApplied(false);
    }

    return this.value;
  }

  private setApplied(value: boolean) {
    this.#applied = value;
  }
}
