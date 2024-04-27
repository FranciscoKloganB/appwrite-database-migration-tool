import type {
  IMigrationEntity,
  IMigrationFileEntity,
} from '@lib/repositories/interfaces'

/** Represents a migration entity for local documents. */
export class LocalMigrationEntity implements IMigrationEntity {
  /** The wether the migration has been applied */
  #applied: boolean
  /** An appwrite document ID */
  #id: undefined
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFileEntity
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string
  /** The timestamp in which the migration was applied */
  #timestamp: number

  public constructor(instance: IMigrationFileEntity, name: string, timestamp: number) {
    this.#applied = false
    this.#id = undefined
    this.#instance = instance
    this.#name = name
    this.#timestamp = timestamp
  }

  static create(props: {
    instance: IMigrationFileEntity
    name: string
    timestamp: number
  }) {
    return new LocalMigrationEntity(props.instance, props.name, props.timestamp)
  }

  public get $id() {
    return this.#id
  }

  public get applied() {
    return this.#applied
  }

  public get instance() {
    return this.#instance
  }

  public get name() {
    return this.#name
  }

  public get timestamp() {
    return this.#timestamp
  }

  public get value() {
    return {
      $id: this.$id,
      applied: this.applied,
      name: this.name,
      timestamp: this.timestamp,
      instance: this.instance,
    } as const
  }

  public apply() {
    this.#applied = true
  }

  public unapply() {
    this.#applied = false
  }
}
