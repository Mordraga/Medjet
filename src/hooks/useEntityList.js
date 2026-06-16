import { useState, useEffect } from 'react'
import { updateById, deleteById } from '../utils'

export function useEntityList(storageKey, initial = []) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) ?? initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey])

  function add(item) {
    setItems(prev => [...prev, item])
  }

  function update(updated) {
    setItems(prev => updateById(prev, updated))
  }

  function remove(id) {
    setItems(prev => deleteById(prev, id))
  }

  return [items, add, update, remove]
}
