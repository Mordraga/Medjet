import { useState } from 'react'
import EntryCard from './EntryCard'
import { useEntityList } from './hooks/useEntityList'
import { createEntity } from './utils'

function EntryList() {
  const [entries, addEntry, updateEntry, deleteEntry] = useEntityList('entries')
  const [newId, setNewId] = useState(null)

  function handleAdd() {
    const entry = createEntity({ title: 'Untitled Entry', body: '' })
    addEntry(entry)
    setNewId(entry.id)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Journal</h2>
        <button className="btn btn-primary" onClick={handleAdd}>New Entry</button>
      </div>
      {entries.length === 0 && (
        <p className="empty-state">No entries yet. Start writing.</p>
      )}
      {[...entries].reverse().map(entry => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
          autoEdit={entry.id === newId}
        />
      ))}
    </div>
  )
}

export default EntryList
