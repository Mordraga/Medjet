function TarotReadingCard({ reading, onDelete }) {
  return (
    <div className="card">
      <h3>{reading.spreadLabel} — {reading.time}</h3>
      <div className="tarot-history-cards">
        {reading.cards.map((card, idx) => (
          <div key={idx} className="tarot-history-card-row">
            <span className="position">{card.position}:</span>
            <span>{card.name}</span>
            {card.reversed && <span className="tarot-history-reversal"> ↓</span>}
          </div>
        ))}
      </div>
      {reading.reflection && (
        <div className="card-field">
          <div className="card-field-label">Reflection</div>
          <div className="card-field-value">{reading.reflection}</div>
        </div>
      )}
      <div className="card-actions">
        <button className="btn btn-danger" onClick={() => onDelete(reading.id)}>Delete</button>
      </div>
    </div>
  )
}

export default TarotReadingCard
