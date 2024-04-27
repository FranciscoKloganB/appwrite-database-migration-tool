import type { IMigrationCommandParams, IMigrationFileEntity } from '@lib/repositories'

export type MigrationProps = {
  applied: boolean
  id: string
  instance: IMigrationFileEntity
  name: string
  persisted: boolean
  timestamp: number
}

export class Migration {
  /** The wether the migration has been applied (executed vs. pending, stored as a document vs. local file only) */
  #applied: boolean
  /** An appwrite document ID */
  #id: string
  /** An instance of the migration file that matches this entity */
  #instance: IMigrationFileEntity
  /** The name of the migration (class name) which is also the name in the appwrite document */
  #name: string
  /** The timestamp in which the migration was applied if it was applied, it probably does not match class name timestamp */
  #timestamp: number
  /** Indicates wether or not this migration exists as a remote entity */
  #persisted: boolean

  public constructor(
    applied: boolean,
    id: string,
    instance: IMigrationFileEntity,
    name: string,
    persisted: boolean,
    timestamp: number,
  ) {
    this.#applied = applied
    this.#id = id
    this.#instance = instance
    this.#name = name
    this.#persisted = persisted
    this.#timestamp = timestamp
  }

  static create(props: MigrationProps) {
    return new Migration(
      props.applied,
      props.id,
      props.instance,
      props.name,
      props.persisted,
      props.timestamp,
    )
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

  get persisted() {
    return this.#persisted
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
    } as const
  }

  public isExecuted() {
    return this.#applied
  }

  public isPending() {
    return !this.#applied
  }

  public setPersisted(value: boolean) {
    this.#persisted = value
  }

  public async apply(params: IMigrationCommandParams) {
    if (this.isPending()) {
      await this.#instance.up(params)

      this.setApplied(true)
    }

    return this.value
  }

  public async unapply(params: IMigrationCommandParams) {
    if (this.isExecuted()) {
      await this.#instance.down(params)

      this.setApplied(false)
    }

    return this.value
  }

  private setApplied(value: boolean) {
    this.#applied = value
  }
}
