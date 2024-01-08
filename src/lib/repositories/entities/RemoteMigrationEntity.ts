import { IMigrationEntity } from '@lib/repositories/interfaces';

/** Represents a migration entity for remote documents. */
export class RemoteMigrationEntity implements IMigrationEntity {
  /** An appwrite document ID */
  #id: string;
  /** The wether the migration has been applied */
  #applied: boolean;
  /** An instance of the migration file that matches this entity */
  #instance: undefined;
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string;
  /** The timestamp in which the migration was applied */
  #timestamp: number;

  public constructor(id: string, applied: boolean, name: string, timestamp: number) {
    this.#applied = applied;
    this.#id = id;
    this.#instance = undefined;
    this.#name = name;
    this.#timestamp = timestamp;
  }

  static create(props: { id: string; applied: boolean; name: string; timestamp: number }) {
    return new RemoteMigrationEntity(props.id, props.applied, props.name, props.timestamp);
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

  apply() {
    this.#applied = true;
  }

  unapply() {
    this.#applied = false;
  }
}
