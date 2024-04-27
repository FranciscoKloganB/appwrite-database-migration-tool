import { createId } from '@lib/utils'

import { RemoteMigrationEntity } from './RemoteMigrationEntity'

describe('RemoteMigrationEntity', () => {
  const baseRemoteDocumentProps = {
    id: createId(),
    applied: true,
    name: 'SampleMigration',
    timestamp: 1234567890,
  }

  it('should create an instance from remote document', () => {
    const entity = new RemoteMigrationEntity(
      baseRemoteDocumentProps.id,
      baseRemoteDocumentProps.applied,
      baseRemoteDocumentProps.name,
      baseRemoteDocumentProps.timestamp,
    )

    expect(entity).toBeInstanceOf(RemoteMigrationEntity)

    expect(entity.$id).toBe(baseRemoteDocumentProps.id)
    expect(entity.applied).toBe(baseRemoteDocumentProps.applied)
    expect(entity.name).toBe(baseRemoteDocumentProps.name)
    expect(entity.timestamp).toBe(baseRemoteDocumentProps.timestamp)
  })

  it('should have undefined migration file instance ', () => {
    const entity = new RemoteMigrationEntity(
      baseRemoteDocumentProps.id,
      baseRemoteDocumentProps.applied,
      baseRemoteDocumentProps.name,
      baseRemoteDocumentProps.timestamp,
    )

    expect(entity.instance).toBeUndefined()
  })

  it('should expose a value getter', () => {
    const entity = new RemoteMigrationEntity(
      baseRemoteDocumentProps.id,
      baseRemoteDocumentProps.applied,
      baseRemoteDocumentProps.name,
      baseRemoteDocumentProps.timestamp,
    )

    expect(entity.value).toMatchObject({
      applied: entity.applied,
      name: entity.name,
      timestamp: entity.timestamp,
    })
  })

  it('should be possible to apply the migration', () => {
    const entity = new RemoteMigrationEntity(
      baseRemoteDocumentProps.id,
      baseRemoteDocumentProps.applied,
      baseRemoteDocumentProps.name,
      baseRemoteDocumentProps.timestamp,
    )

    entity.apply()

    expect(entity.applied).toBe(true)
  })

  it('should be possible to unapply the migration', () => {
    const entity = new RemoteMigrationEntity(
      baseRemoteDocumentProps.id,
      baseRemoteDocumentProps.applied,
      baseRemoteDocumentProps.name,
      baseRemoteDocumentProps.timestamp,
    )

    entity.unapply()

    expect(entity.applied).toBe(false)
  })

  describe('create method', () => {
    it('should create an instance using the create method', () => {
      const props = { ...baseRemoteDocumentProps }

      const entity = RemoteMigrationEntity.create(props)

      expect(entity).toBeInstanceOf(RemoteMigrationEntity)
      expect(entity.$id).toBe(props.id)
      expect(entity.applied).toBe(props.applied)
      expect(entity.name).toBe(props.name)
      expect(entity.timestamp).toBe(props.timestamp)
      expect(entity.value).toMatchObject({
        applied: props.applied,
        name: props.name,
        timestamp: props.timestamp,
      })
    })
  })
})
