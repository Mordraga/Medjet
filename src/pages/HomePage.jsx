import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMoonAge, getMoonPhaseInfo, getNextLunarEvent,
  getMoonSign, getSunSign, getPlanetaryDay, getNextSabbat
} from '../utils/astro'

const REPO = 'Mordraga/Medjet'
const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION ?? null

const SOURCE_ROUTE = {
  journal:    { to: '/journal', state: { section: 'journal'    } },
  deity:      { to: '/journal', state: { section: 'deities'    } },
  spell:      { to: '/journal', state: { section: 'spells'     } },
  tarot:      { to: '/tarot',   state: {}                        },
  divination: { to: '/journal', state: { section: 'divination' } },
  offering:   { to: '/journal', state: { section: 'offerings'  } },
}

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}

function HomePage() {
  const navigate = useNavigate()
  const now = new Date()
  const age = getMoonAge(now)
  const phase = getMoonPhaseInfo(age)
  const nextEvent = getNextLunarEvent(age)
  const moonSign = getMoonSign(now)
  const sunSign = getSunSign(now)
  const planetary = getPlanetaryDay(now)
  const nextSabbat = getNextSabbat(now)

  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const [updateTag, setUpdateTag] = useState(null)

  useEffect(() => {
    if (!CURRENT_VERSION) return
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then(r => r.json())
      .then(data => { if (data.tag_name && data.tag_name !== CURRENT_VERSION) setUpdateTag(data.tag_name) })
      .catch(() => {})
  }, [])

  const [recent] = useState(() => {
    const all = [
      ...readStorage('entries').map(e => ({ id: e.id, time: e.time, source: 'journal', title: e.title || 'Untitled' })),
      ...readStorage('deities').map(d => ({ id: d.id, time: d.time, source: 'deity',   title: d.name  || 'Unknown' })),
      ...readStorage('tarot-readings').map(t => ({ id: t.id, time: t.time, source: 'tarot', title: t.question || `${t.spreadLabel} Reading` })),
      ...readStorage('spells').map(s => ({ id: s.id, time: s.time, source: 'spell', title: s.name || 'Untitled Working' })),
      ...readStorage('divinations').map(d => ({ id: d.id, time: d.time, source: 'divination', title: d.question || 'Divination' })),
      ...readStorage('offerings').map(o => ({ id: o.id, time: o.time, source: 'offering', title: o.recipient ? `Offering to ${o.recipient}` : 'Offering' }))
    ]
    return all.sort((a, b) => b.id - a.id).slice(0, 5)
  })

  const sourceLabel = { journal: 'Journal', deity: 'Deity', tarot: 'Tarot', spell: 'Spell', divination: 'Divination', offering: 'Offering' }

  return (
    <div className="page">

      {/* Update banner */}
      {updateTag && (
        <div className="update-banner">
          <span className="update-banner-text">Update available: {updateTag}</span>
          <a
            className="update-banner-link"
            href={`https://github.com/${REPO}/releases/latest`}
            target="_blank"
            rel="noreferrer"
          >
            Download ↗
          </a>
          <button className="update-banner-dismiss" onClick={() => setUpdateTag(null)}>✕</button>
        </div>
      )}

      {/* Date + planetary day */}
      <div className="glance-header">
        <div className="glance-date">
          <span className="glance-weekday">{weekday}</span>
          <span className="glance-datestr">{dateStr}</span>
        </div>
        <div className="glance-planetary">
          <span className="glance-planet-symbol">{planetary.symbol}</span>
          <span>Day of {planetary.planet}</span>
        </div>
      </div>

      {/* Moon */}
      <div className="card glance-moon-card">
        <div className="glance-moon-top">
          <span className="glance-moon-emoji">{phase.emoji}</span>
          <div className="glance-moon-info">
            <div className="glance-moon-phase">{phase.name}</div>
            <div className="glance-moon-detail">{phase.illumination}% illuminated</div>
            <div className="glance-moon-detail">☽ Moon in {moonSign.symbol} {moonSign.name}</div>
          </div>
        </div>
        <div className="glance-next-event">
          {nextEvent.emoji} {nextEvent.name} in {nextEvent.days} day{nextEvent.days !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sun sign */}
      <div className="glance-sun-row">
        <span className="glance-sun-symbol">☉</span>
        <span>Sun in {sunSign.symbol} {sunSign.name}</span>
      </div>

      {/* Next sabbat */}
      <div className="glance-sabbat-row">
        <span className="glance-sabbat-icon">{nextSabbat.emoji}</span>
        <div className="glance-sabbat-body">
          <div className="glance-sabbat-name">
            {nextSabbat.name}
            <span className="glance-sabbat-days">
              {nextSabbat.days === 0 ? ' — Today' : nextSabbat.days === 1 ? ' — Tomorrow' : ` — ${nextSabbat.days} days`}
            </span>
          </div>
          <div className="glance-sabbat-short">{nextSabbat.short}</div>
        </div>
      </div>

      {/* Recent */}
      <div className="glance-section-label glance-section-label--prominent">Recent</div>
      {recent.length === 0 ? (
        <p className="empty-state" style={{ padding: '20px 0', textAlign: 'left' }}>Nothing recorded yet.</p>
      ) : (
        <div className="card recent-list">
          {recent.map(item => {
            const route = SOURCE_ROUTE[item.source]
            return (
              <button
                key={`${item.source}-${item.id}`}
                className="recent-entry recent-entry--link"
                onClick={() => navigate(route.to, { state: route.state })}
              >
                <span className={`source-badge source-badge--${item.source}`}>
                  {sourceLabel[item.source]}
                </span>
                <span className="recent-entry-title">{item.title}</span>
                <span className="recent-entry-chevron">›</span>
              </button>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default HomePage
