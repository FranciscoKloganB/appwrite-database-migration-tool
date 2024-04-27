import { createMock } from '@golevelup/ts-jest'

import type { IMigrationFileEntity } from '@lib/repositories/interfaces'

import { LocalMigrationEntity } from './LocalMigrationEntity'

describe('LocalMigrationEntity', () => {
  const instanceMock = createMock<IMigrationFileEntity>()

  const baseLocalDocumentProps = {
    instance: instanceMock,
    name: 'SampleMigration',
    timestamp: 1234567890,
  }

  it('should create an instance from local document', () => {
    const entity = new LocalMigrationEntity(
      baseLocalDocumentProps.instance,
      baseLocalDocumentProps.name,
      baseLocalDocumentProps.timestamp,
    )

    expect(entity).toBeInstanceOf(LocalMigrationEntity)

    expect(entity.$id).toBeUndefined()
    expect(entity.instance).toBe(baseLocalDocumentProps.instance)
    expect(entity.name).toBe(baseLocalDocumentProps.name)
    expect(entity.timestamp).toBe(baseLocalDocumentProps.timestamp)
  })

  it('should begin in state unapplied ', () => {
    const entity = new LocalMigrationEntity(
      baseLocalDocumentProps.instance,
      baseLocalDocumentProps.name,
      baseLocalDocumentProps.timestamp,
    )

    expect(entity.applied).toBe(false)
  })

  it('should have an undefined id ', () => {
    const entity = new LocalMigrationEntity(
      baseLocalDocumentProps.instance,
      baseLocalDocumentProps.name,
      baseLocalDocumentProps.timestamp,
    )

    expect(entity.$id).toBeUndefined()
  })

  it('should have defined migration file instance ', () => {
    const entity = new LocalMigrationEntity(
      baseLocalDocumentProps.instance,
      baseLocalDocumentProps.name,
      baseLocalDocumentProps.timestamp,
    )

    expect(entity.instance).toBeDefined()
  })

  it('should expose a value getter', () => {
    const entity = new LocalMigrationEntity(
      baseLocalDocumentProps.instance,
      baseLocalDocumentProps.name,
      baseLocalDocumentProps.timestamp,
    )

    expect(entity.value).toMatchObject({
      applied: false,
      name: entity.name,
      timestamp: entity.timestamp,
    })
  })

  describe('create', () => {
    it('should create an instance using the create method', () => {
      const props = { ...baseLocalDocumentProps }

      const entity = LocalMigrationEntity.create(props)

      expect(entity).toBeInstanceOf(LocalMigrationEntity)
      expect(entity.$id).toBeUndefined()
      expect(entity.instance).toBe(props.instance)
      expect(entity.name).toBe(props.name)
      expect(entity.timestamp).toBe(props.timestamp)
      expect(entity.value).toMatchObject({
        applied: false,
        name: props.name,
        timestamp: props.timestamp,
      })
    })
  })
})
