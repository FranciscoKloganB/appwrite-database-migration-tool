import type { IMigrationEntity, IMigrationFileEntity } from '@lib/repositories/interfaces';
import { createId } from '@lib/utils';

/** Represents a migration collection document. */
export class MigrationEntity implements IMigrationEntity {
  /** The wether the migration has been applied (executed vs. pending, stored as a document vs. local file only) */
  #applied: boolean | null;
  /** An appwrite document ID */
  #id: string;
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFileEntity | null;
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string;
  /** The timestamp in which the migration was applied if it was applied, it probably does not match class name timestamp */
  #timestamp: number;

  public constructor(
    applied: boolean | null,
    id: string,
    instance: IMigrationFileEntity | null,
    name: string,
    timestamp: number,
  ) {
    this.#applied = applied;
    this.#id = id;
    this.#instance = instance;
    this.#name = name;
    this.#timestamp = timestamp;
  }

  static create(props: {
    applied: boolean;
    id: string;
    instance: IMigrationFileEntity;
    name: string;
    timestamp: number;
  }) {
    return new MigrationEntity(
      props.applied,
      props.id,
      props.instance,
      props.name,
      props.timestamp,
    );
  }

  static createFromLocalDocument(props: {
    instance: IMigrationFileEntity;
    name: string;
    timestamp: number;
  }) {
    return new MigrationEntity(null, createId(), props.instance, props.name, props.timestamp);
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
      applied: !!this.applied,
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
