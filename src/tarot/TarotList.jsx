import { useState } from 'react'
import { useEntityList } from '../hooks/useEntityList'
import { createEntity } from '../utils'
import { drawSpread } from './useTarotDraw'
import SpreadSelector from './SpreadSelector'
import ActiveReading from './ActiveReading'
import TarotReadingCard from './TarotReadingCard'

function TarotList() {
  const [readings, addReading, , deleteReading] = useEntityList('tarot-readings')
  const [phase, setPhase] = useState('history')
  const [activeSpread, setActiveSpread] = useState(null)
  const [drawnCards, setDrawnCards] = useState([])
  const [reflection, setReflection] = useState('')

  function reset() {
    setActiveSpread(null)
    setDrawnCards([])
    setReflection('')
    setPhase('history')
  }

  function handleSpreadSelect(spread) {
    setActiveSpread(spread)
    setDrawnCards(drawSpread(spread))
    setPhase('reading')
  }

  function handleSave() {
    addReading(createEntity({
      spreadType: activeSpread.id,
      spreadLabel: activeSpread.label,
      cards: drawnCards,
      reflection: reflection.trim()
    }))
    reset()
  }

  if (phase === 'select') {
    return <SpreadSelector onSelect={handleSpreadSelect} />
  }

  if (phase === 'reading') {
    return (
      <ActiveReading
        spread={activeSpread}
        cards={drawnCards}
        reflection={reflection}
        onReflectionChange={setReflection}
        onSave={handleSave}
        onDiscard={reset}
      />
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2>Tarot</h2>
        <button className="btn btn-primary" onClick={() => setPhase('select')}>New Reading</button>
      </div>
      {readings.length === 0 && (
        <p className="empty-state">No readings yet. Draw your first spread.</p>
      )}
      {[...readings].reverse().map(reading => (
        <TarotReadingCard key={reading.id} reading={reading} onDelete={deleteReading} />
      ))}
    </div>
  )
}

export default TarotList
