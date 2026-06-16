import { useState } from 'react'

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}

const SECTIONS = [
  {
    key: 'entries',
    label: 'Journal',
    source: 'journal',
    getTitle: e => e.title || 'Untitled'
  },
  {
    key: 'deities',
    label: 'Deities',
    source: 'deity',
    getTitle: d => d.name || 'Unknown'
  },
  {
    key: 'tarot-readings',
    label: 'Tarot',
    source: 'tarot',
    getTitle: t => `${t.spreadLabel} Reading`
  }
]

function LogPage() {
  const [sections] = useState(() =>
    SECTIONS.map(s => ({
      ...s,
      items: [...readStorage(s.key)].reverse()
    }))
  )

  return (
    <div className="page">
      <div className="page-header">
        <h2>Log</h2>
      </div>
      {SECTIONS.map((s, si) => {
        const section = sections[si]
        return (
          <div key={s.key} className="log-section">
            <p className={`log-section-title log-section-title--${s.source}`}>{s.label}</p>
            {section.items.length === 0 ? (
              <p className="log-empty">Nothing here yet.</p>
            ) : (
              section.items.map(item => (
                <div key={item.id} className="log-entry-row">
                  <span className="log-entry-title">{s.getTitle(item)}</span>
                  <span className="log-entry-time">{item.time}</span>
                </div>
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}

export default LogPage
