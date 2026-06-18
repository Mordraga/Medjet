import { useState } from 'react'
import DeityCard from './DeityCard'
import { useEntityList } from './hooks/useEntityList'
import { createEntity } from './utils'

const INITIAL = [
  { id: 1, time: '', name: 'Anubis', domain: 'Death & Mummification', description: 'God of the dead, mummification, and the afterlife. Guide of souls.', symbols: 'Jackal, scales of justice', notes: '' }
]

function DeityList() {
  const [deities, addDeity, updateDeity, deleteDeity] = useEntityList('deities', INITIAL)
  const [newId, setNewId] = useState(null)

  function handleAdd() {
    const deity = createEntity({ name: 'New Deity', domain: '', description: '', symbols: '', notes: '' })
    addDeity(deity)
    setNewId(deity.id)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Deity Registry</h2>
        <button className="btn btn-primary" onClick={handleAdd}>Add Deity</button>
      </div>
      {deities.length === 0 && (
        <p className="empty-state">No deities recorded yet.</p>
      )}
      {[...deities].reverse().map(deity => (
        <DeityCard
          key={deity.id}
          deity={deity}
          onUpdate={updateDeity}
          onDelete={deleteDeity}
          autoEdit={deity.id === newId}
        />
      ))}
    </div>
  )
}

export default DeityList
