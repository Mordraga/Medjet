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
  const [question, setQuestion] = useState('')
  const [activeSpread, setActiveSpread] = useState(null)
  const [drawnCards, setDrawnCards] = useState([])
  const [reflection, setReflection] = useState('')

  function reset() {
    setActiveSpread(null)
    setDrawnCards([])
    setReflection('')
    setQuestion('')
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
      question: question.trim(),
      cards: drawnCards,
      reflection: reflection.trim()
    }))
    reset()
  }

  if (phase === 'question') {
    return (
      <div>
        <div className="page-header">
          <h2>New Reading</h2>
        </div>
        <div className="field">
          <label>Your Question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What would you like to explore? (optional)"
            rows={3}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={reset}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setPhase('select')}>Choose Spread</button>
        </div>
      </div>
    )
  }

  if (phase === 'select') {
    return <SpreadSelector onSelect={handleSpreadSelect} />
  }

  if (phase === 'reading') {
    return (
      <ActiveReading
        spread={activeSpread}
        question={question}
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
        <button className="btn btn-primary" onClick={() => setPhase('question')}>New Reading</button>
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
