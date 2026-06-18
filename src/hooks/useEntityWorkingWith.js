import { useEntityList } from './useEntityList'
import { createEntity } from '../utils'

export function useEntityWorkingWith() {
  const [registry, addEntity, updateEntity] = useEntityList('deities')

  function isWorkingWith(name) {
    return registry.some(e => e.name === name && e.working_with)
  }

  function toggle(seedEntity) {
    const existing = registry.find(e => e.name === seedEntity.name)
    if (existing) {
      updateEntity({ ...existing, working_with: !existing.working_with })
    } else {
      addEntity(createEntity({
        ...seedEntity,
        notes: '',
        upg: '',
        offerings: '',
        first_contact: '',
        working_since: '',
        working_with: true,
        source: 'field-guide'
      }))
    }
  }

  return { isWorkingWith, toggle }
}
