import { resolveCardImage } from './useTarotDraw'

function ReadingScreen({ spread, cards }) {
  return (
    <div
      className="tarot-spread-grid"
      style={{ gridTemplateColumns: `repeat(${spread.gridCols}, 1fr)` }}
    >
      {cards.map((card, idx) => {
        const [row, col] = spread.layout[idx]
        return (
          <div key={idx} style={{ gridRow: row, gridColumn: col }}>
            <img
              src={resolveCardImage(card.img)}
              alt={card.name}
              className={`tarot-card-img${card.reversed ? ' tarot-card-img--reversed' : ''}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export default ReadingScreen
