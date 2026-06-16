import ReadingScreen from './ReadingScreen'
import ReadingCardEntry from './ReadingCardEntry'

function ActiveReading({ spread, cards, reflection, onReflectionChange, onSave, onDiscard }) {
  return (
    <div>
      <div className="tarot-reading-header">
        <h2>{spread.label}</h2>
        <button className="btn btn-ghost" onClick={onDiscard}>Discard</button>
      </div>

      <ReadingScreen spread={spread} cards={cards} />

      <div className="reading-card-entries">
        {cards.map((card, idx) => (
          <ReadingCardEntry key={idx} card={card} />
        ))}
      </div>

      <div className="field" style={{ marginTop: '20px' }}>
        <label>Your Reflection</label>
        <textarea
          value={reflection}
          onChange={e => onReflectionChange(e.target.value)}
          placeholder="Record your thoughts on this reading…"
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={onSave}>Save to Journal</button>
      </div>
    </div>
  )
}

export default ActiveReading
