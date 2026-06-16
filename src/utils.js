export function getCurrentTime() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  })
}

export function createEntity(defaults) {
  return { id: Date.now(), time: getCurrentTime(), ...defaults }
}

export function updateById(list, updated) {
  return list.map(item => item.id === updated.id ? updated : item)
}

export function deleteById(list, id) {
  return list.filter(item => item.id !== id)
}
