import { SPREADS } from './spreadConfig'

function SpreadSelector({ onSelect }) {
  return (
    <div>
      <div className="page-header">
        <h2>Choose a Spread</h2>
      </div>
      <div className="tarot-spread-options">
        {SPREADS.map(spread => (
          <button
            key={spread.id}
            className="btn btn-ghost tarot-spread-btn"
            onClick={() => onSelect(spread)}
          >
            <span className="tarot-spread-btn-label">{spread.label}</span>
            <span className="tarot-spread-btn-count">{spread.positions.length} card{spread.positions.length > 1 ? 's' : ''}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SpreadSelector
