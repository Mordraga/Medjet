function ReadingCardEntry({ card }) {
  return (
    <div className="reading-card-entry">
      <div className="reading-card-entry-header">
        <span className="tarot-card-position">{card.position}</span>
        <span className="tarot-card-name">
          {card.name}
          {card.reversed && <span className="tarot-reversed-indicator"> ↓</span>}
        </span>
      </div>
      <p className="tarot-card-meta">{card.arcana} · {card.suit}</p>
      {card.yesNoMaybe && (
        <span className={`yesno-badge yesno-badge--${card.yesNoMaybe}`}>{card.yesNoMaybe}</span>
      )}
      <div className={`tarot-keywords${card.reversed ? ' tarot-keywords--reversed' : ''}`}>
        {card.keywords.map(k => (
          <span key={k} className="tarot-keyword">{k}</span>
        ))}
      </div>
    </div>
  )
}

export default ReadingCardEntry
