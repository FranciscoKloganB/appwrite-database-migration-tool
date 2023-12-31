import type { IMigrationEntity, IMigrationFile } from '@repositories/interfaces';

/** Represents a migration collection document. */
export class MigrationEntity implements IMigrationEntity {
  /** The wether the migration has been applied (executed vs. pending, stored as a document vs. local file only) */
  #applied: boolean | null;
  /** An appwrite document ID */
  #id: string | null;
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFile | null;
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string;
  /** The timestamp in which the migration was applied if it was applied, it probably does not match class name timestamp */
  #timestamp: number;

  private constructor(
    applied: boolean | null,
    id: string | null,
    instance: IMigrationFile | null,
    name: string,
    timestamp: number,
  ) {
    this.#applied = applied;
    this.#id = id;
    this.#instance = instance;
    this.#name = name;
    this.#timestamp = timestamp;
  }

  static createFromLocalDocument(props: {
    instance: IMigrationFile;
    name: string;
    timestamp: number;
  }) {
    return new MigrationEntity(null, null, props.instance, props.name, props.timestamp);
  }

  static createFromRemoteDocument(props: {
    applied: boolean;
    id: string;
    name: string;
    timestamp: number;
  }) {
    return new MigrationEntity(props.applied, props.id, null, props.name, props.timestamp);
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
      applied: this.applied,
      name: this.name,
      timestamp: this.timestamp,
    } as const;
  }

  apply() {
    this.#applied = true;
  }

  unapply() {
    this.#applied = false;
  }
}
