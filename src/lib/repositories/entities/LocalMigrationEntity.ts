import type { IMigrationEntity, IMigrationFileEntity } from '@lib/repositories/interfaces';

/** Represents a migration entity for local documents. */
export class LocalMigrationEntity implements IMigrationEntity {
  /** The wether the migration has been applied */
  #applied: boolean;
  /** An appwrite document ID */
  #id: undefined;
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFileEntity;
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string;
  /** The timestamp in which the migration was applied */
  #timestamp: number;

  public constructor(instance: IMigrationFileEntity, name: string, timestamp: number) {
    this.#applied = false;
    this.#id = undefined;
    this.#instance = instance;
    this.#name = name;
    this.#timestamp = timestamp;
  }

  static create(props: { instance: IMigrationFileEntity; name: string; timestamp: number }) {
    return new LocalMigrationEntity(props.instance, props.name, props.timestamp);
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
      instance: this.instance,
    } as const;
  }

  public apply() {
    this.#applied = true;
  }

  public unapply() {
    this.#applied = false;
  }
}
