import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import herbs from '../data/herbs.json'
import astrology from '../data/astrology.json'
import alchemy from '../data/alchemy.json'
import crystals from '../data/crystals.json'
import mushrooms from '../data/mushrooms.json'
import recipes from '../data/recipes.json'
import entitiesData from '../data/entities.json'
import FilterPills from '../FilterPills'
import { useEntityWorkingWith } from '../hooks/useEntityWorkingWith'

const CATEGORIES = [
  { id: 'entities',   label: 'Entities',   mode: 'entities' },
  { id: 'herbs',      label: 'Herbs',      mode: 'track',   refillLabel: 'Refill' },
  { id: 'crystals',   label: 'Crystals',   mode: 'track',   refillLabel: 'Source' },
  { id: 'mushrooms',  label: 'Mushrooms',  mode: 'track',   refillLabel: 'Refill' },
  { id: 'astrology',  label: 'Astrology',  mode: 'ref'     },
  { id: 'alchemy',    label: 'Alchemy',    mode: 'ref'     },
  { id: 'recipes',    label: 'Recipes',    mode: 'recipes' }
]

const STATUS_LABEL = { have: 'Have', refill: 'Refill', want: 'Want' }

const SELLERS = {
  herbs: [
    { name: 'Mountain Rose Herbs', url: 'https://www.mountainroseherbs.com/', region: 'North America', note: 'Bulk organic, certified' },
    { name: 'Starwest Botanicals',  url: 'https://www.starwest-botanicals.com/', region: 'North America', note: 'Large selection, US-based' },
    { name: 'Baldwins',             url: 'https://www.baldwins.co.uk/',          region: 'UK & Europe',   note: 'Est. 1844 — London herbalist' },
  ],
  crystals: [
    { name: 'Energy Muse',       url: 'https://www.energymuse.com/',       region: 'North America',  note: 'Ethically sourced' },
    { name: 'Healing Crystals',  url: 'https://www.healingcrystals.com/',  region: 'North America',  note: 'Extensive inventory' },
    { name: 'Moonrise Crystals', url: 'https://moonrisecrystals.com/',     region: 'Ships Worldwide', note: 'Ethical sourcing focus' },
  ],
  mushrooms: [
    { name: 'Real Mushrooms', url: 'https://www.realmushrooms.com/', region: 'North America', note: 'Third-party tested, no fillers' },
    { name: 'Fungi Perfecti', url: 'https://www.fungi.com/',          region: 'North America', note: "Paul Stamets' Host Defense line" },
  ],
}

function readStorage(key) { try { return JSON.parse(localStorage.getItem(key)) ?? {} } catch { return {} } }

function useInventory(storageKey) {
  const [inv, setInv] = useState(() => readStorage(storageKey))
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(inv)) }, [inv, storageKey])
  function set(name, status) {
    setInv(prev => {
      if (prev[name] === status) { const { [name]: _, ...rest } = prev; return rest }
      return { ...prev, [name]: status }
    })
  }
  return [inv, set]
}

function getTrackEntries(category) {
  if (category === 'herbs')     return herbs.map(h => ({ ...h, _type: 'herb' }))
  if (category === 'crystals')  return crystals.map(c => ({ ...c, _type: 'crystal' }))
  if (category === 'mushrooms') return mushrooms.map(m => ({ ...m, _type: 'mushroom' }))
  return []
}

const TYPE_LABEL = { herb: 'Herb', crystal: 'Crystal', mushroom: 'Mushroom' }

// Restricted content gate — shown once, acknowledgment stored in localStorage
function RestrictedGate({ onAcknowledge }) {
  return (
    <div className="guide-full-card card">
      <div className="guide-full-card-body">
        <span className="guide-type-chip guide-type-chip--restricted">⚠ Restricted Content</span>
        <h3 className="guide-full-name">Sacred & Legally Sensitive</h3>
        <p className="guide-full-meta">For reference only</p>
        <p className="guide-full-desc">
          The following entries document plants and fungi that are extremely
          toxic, legally restricted, or both. They appear here solely to record
          their historical, cultural, and spiritual significance within traditions
          that predate modern law by thousands of years.
        </p>
        <p className="guide-full-desc">
          This app provides no guidance on obtaining, preparing, or using these
          substances. Baneful herbs can kill through ingestion, skin contact, or
          inhalation. Legal status of controlled substances varies by
          jurisdiction. Approach all of these with respect — for the plants
          themselves, and for the cultures they come from.
        </p>
      </div>
      <div className="guide-status-row">
        <button className="guide-gate-btn" onClick={onAcknowledge}>
          Understood — this is reference only
        </button>
      </div>
    </div>
  )
}

// ── Search Combobox (replaces native datalist — avoids Android transparency/keyboard bugs) ──

function SearchCombobox({ options, onSelect, placeholder }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(
    () => text.length > 0
      ? options.filter(o => o.toLowerCase().includes(text.toLowerCase())).slice(0, 8)
      : [],
    [text, options]
  )

  function select(name) {
    onSelect(name)
    setText('')
    setOpen(false)
  }

  return (
    <div className="combobox">
      <input
        className="guide-search"
        type="text"
        value={text}
        placeholder={placeholder}
        onChange={e => { setText(e.target.value); setOpen(true) }}
        onFocus={() => text && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div className="combobox-list">
          {filtered.map(name => (
            <button
              key={name}
              className="combobox-item"
              onMouseDown={e => { e.preventDefault(); select(name) }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getRefNames(category) {
  if (category === 'astrology') return [
    ...astrology.signs.map(s => s.name),
    ...astrology.planets.map(p => p.name)
  ]
  if (category === 'alchemy') return [
    ...alchemy.elements.map(e => e.name),
    ...alchemy.metals.map(m => m.name),
    ...alchemy.stages.map(s => s.name),
    ...alchemy.operations.map(o => o.name)
  ]
  if (category === 'recipes') return recipes.map(r => r.name)
  return []
}

function entryId(name) {
  return `guide-entry-${name.replace(/\s+/g, '-').toLowerCase()}`
}

function scrollToEntry(name) {
  const el = document.getElementById(entryId(name))
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 68
  window.scrollTo({ top, behavior: 'smooth' })
}

// ── Refill Toast ───────────────────────────────────────────────────────────────

function RefillToast({ name, sellers, onClose }) {
  return (
    <div className="refill-toast-backdrop" onClick={onClose}>
      <div className="refill-toast" onClick={e => e.stopPropagation()}>
        <div className="refill-toast-header">
          <span className="refill-toast-msg">Shop for {name}</span>
          <span className="refill-toast-sub">Tap a source — you'll leave the app.</span>

        </div>
        <div className="refill-seller-list">
          {sellers.map(s => (
            <button
              key={s.name}
              className="refill-seller-row"
              onClick={() => { window.open(s.url, '_blank'); onClose() }}
            >
              <div className="refill-seller-info">
                <span className="refill-seller-name">{s.name}</span>
                <span className="refill-seller-note">{s.note}</span>
              </div>
              <span className="refill-seller-region">{s.region}</span>
            </button>
          ))}
        </div>
        <span className="refill-toast-sub">None of these sites sponsor, or are affiliated with <italic>Medjet</italic>. I can not guarantee the availability of stock.</span>
        <button className="refill-toast-btn refill-toast-btn--cancel" onClick={onClose}>Later</button>
      </div>
    </div>
  )
}

// ── Herb Modal (full-screen card) ─────────────────────────────────────────────

function HerbModal({ herb, inv, setStatus, onRefill, onClose }) {
  const [ack, setAck] = useState(() => !!localStorage.getItem('guide-restricted-ack'))
  const isRestricted = herb.restricted
  const status = inv[herb.name]

  function acknowledge() {
    localStorage.setItem('guide-restricted-ack', '1')
    setAck(true)
  }

  return (
    <div className="herb-modal-overlay">
      <div className="herb-modal-header">
        <span className="herb-modal-title">Herb Entry</span>
        <button className="herb-modal-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {isRestricted && !ack ? (
        <>
          <div className="herb-modal-body">
            <span className="guide-type-chip guide-type-chip--restricted">⚠ Restricted</span>
            <h3 className="guide-full-name">{herb.name}</h3>
            <p className="guide-full-desc">
              This herb is restricted — toxic, legally sensitive, or both. It is documented
              here for historical and spiritual reference only. No guidance on obtaining or
              preparing it is provided.
            </p>
          </div>
          <div className="guide-status-row">
            <button className="guide-gate-btn" onClick={acknowledge}>
              Understood — reference only
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="herb-modal-body">
            <span className={`guide-type-chip${isRestricted ? ' guide-type-chip--restricted' : ''}`}>
              {isRestricted ? '⚠ ' : ''}Herb{herb.latin ? ` · ${herb.latin}` : ''}
            </span>

            <h3 className="guide-full-name">{herb.name}</h3>

            <p className="guide-full-meta">
              {[herb.element, herb.planet].filter(Boolean).join(' · ')}
            </p>

            {herb.description && (
              <p className="guide-full-desc">{herb.description}</p>
            )}

            {(herb.magical_uses || []).length > 0 && (
              <div className="guide-keywords">
                {herb.magical_uses.map(k => (
                  <span key={k} className="guide-keyword">{k}</span>
                ))}
              </div>
            )}

            {herb.safety && (
              <div className="guide-safety">⚠ {herb.safety}</div>
            )}

            {herb.folk_names?.length > 0 && (
              <div className="herb-extra-field">
                <div className="card-field-label">Folk Names</div>
                <div className="card-field-value">{herb.folk_names.join(', ')}</div>
              </div>
            )}

            {herb.nativity && (
              <div className="herb-extra-field">
                <div className="card-field-label">Native To</div>
                <div className="card-field-value">{herb.nativity}</div>
              </div>
            )}

            {herb.medical_use && (
              <div className="herb-extra-field">
                <div className="card-field-label">Medical Use</div>
                <div className="card-field-value">{herb.medical_use}</div>
              </div>
            )}

            {herb.historic_use && (
              <div className="herb-extra-field">
                <div className="card-field-label">Historic Use</div>
                <div className="card-field-value">{herb.historic_use}</div>
              </div>
            )}

            {herb.wikipedia && (
              <a
                className="herb-wiki-link"
                href={herb.wikipedia}
                target="_blank"
                rel="noreferrer"
              >
                Wikipedia ↗
              </a>
            )}
          </div>

          <div className="guide-status-row">
            {['want', 'refill', 'have'].map(s => (
              <button
                key={s}
                className={`guide-status-row-btn guide-status-row-btn--${s}${status === s ? ' active' : ''}`}
                onClick={() => {
                  const toggling = status === s
                  setStatus(herb.name, s)
                  if (s === 'refill' && !toggling) onRefill(herb.name)
                }}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Tracking card (herbs / crystals / mushrooms) ───────────────────────────────

function TrackSection({ entries, index, onPrev, onNext, inv, setStatus, onRefill, refillLabel = 'Refill' }) {
  const touchX   = useRef(null)
  const [ack, setAck] = useState(() => !!localStorage.getItem('guide-restricted-ack'))

  function acknowledge() {
    localStorage.setItem('guide-restricted-ack', '1')
    setAck(true)
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const delta = e.changedTouches[0].clientX - touchX.current
    if (delta > 50) onPrev()
    if (delta < -50) onNext()
    touchX.current = null
  }

  const entry      = entries[index]
  const isRestricted = entry?.restricted
  const status     = entry ? inv[entry.name] : null
  if (!entry) return null

  const showGate = isRestricted && !ack

  return (
    <>
      <div className="guide-nav">
        <button className="guide-nav-btn" onClick={onPrev}>‹</button>
        <span className="guide-nav-counter">{index + 1} / {entries.length}</span>
        <button className="guide-nav-btn" onClick={onNext}>›</button>
      </div>

      {showGate ? (
        <RestrictedGate onAcknowledge={acknowledge} />
      ) : (
        <div
          className="guide-full-card card"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="guide-full-card-body">
            <span className={`guide-type-chip${isRestricted ? ' guide-type-chip--restricted' : ''}`}>
              {isRestricted ? '⚠ ' : ''}{TYPE_LABEL[entry._type] ?? entry._type}
              {entry.latin && ` · ${entry.latin}`}
            </span>

            <h3 className="guide-full-name">{entry.name}</h3>

            <p className="guide-full-meta">
              {[entry.element, entry.planet, entry.chakra].filter(Boolean).join(' · ')}
            </p>

            {entry.description && (
              <p className="guide-full-desc">{entry.description}</p>
            )}

            {(entry.magical_uses || []).length > 0 && (
              <div className="guide-keywords">
                {entry.magical_uses.map(k => (
                  <span key={k} className="guide-keyword">{k}</span>
                ))}
              </div>
            )}

            {entry.safety && (
              <div className="guide-safety">⚠ {entry.safety}</div>
            )}

            {entry.folk_names?.length > 0 && (
              <div className="herb-extra-field">
                <div className="card-field-label">Folk Names</div>
                <div className="card-field-value">{entry.folk_names.join(', ')}</div>
              </div>
            )}

            {entry.nativity && (
              <div className="herb-extra-field">
                <div className="card-field-label">Native To</div>
                <div className="card-field-value">{entry.nativity}</div>
              </div>
            )}

            {entry.medical_use && (
              <div className="herb-extra-field">
                <div className="card-field-label">Medical Use</div>
                <div className="card-field-value">{entry.medical_use}</div>
              </div>
            )}

            {entry.historic_use && (
              <div className="herb-extra-field">
                <div className="card-field-label">Historic Use</div>
                <div className="card-field-value">{entry.historic_use}</div>
              </div>
            )}

            {entry.wikipedia && (
              <a
                className="herb-wiki-link"
                href={entry.wikipedia}
                target="_blank"
                rel="noreferrer"
              >
                Wikipedia ↗
              </a>
            )}
          </div>

          <div className="guide-status-row">
            {['want', 'refill', 'have'].map(s => (
              <button
                key={s}
                className={`guide-status-row-btn guide-status-row-btn--${s}${status === s ? ' active' : ''}`}
                onClick={() => {
                  const toggling = status === s
                  setStatus(entry.name, s)
                  if (s === 'refill' && !toggling) onRefill(entry.name)
                }}
              >
                {s === 'refill' ? refillLabel : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Reference sections ─────────────────────────────────────────────────────────

function RefCard({ name, title, subtitle, meta, desc, tags, symbol }) {
  return (
    <div id={entryId(name)} className="guide-card card">
      <div className="guide-card-title-row">
        <span className="guide-card-name">{symbol ? `${symbol} ` : ''}{title}</span>
        {subtitle && <span className="guide-card-dates">{subtitle}</span>}
      </div>
      {meta && <p className="guide-card-meta">{meta}</p>}
      {desc  && <p className="guide-card-desc" style={{ marginTop: 6 }}>{desc}</p>}
      {tags?.length > 0 && (
        <div className="guide-keywords" style={{ marginTop: 8 }}>
          {tags.map(k => <span key={k} className="guide-keyword">{k}</span>)}
        </div>
      )}
    </div>
  )
}

function AstrologySection() {
  return (
    <>
      <p className="guide-section-heading">Signs</p>
      {astrology.signs.map(s => (
        <RefCard key={s.name} name={s.name} symbol={s.symbol} title={s.name}
          subtitle={s.dates}
          meta={`${s.element} · ${s.modality} · ${s.ruler}`}
          tags={s.keywords} />
      ))}
      <p className="guide-section-heading" style={{ marginTop: 20 }}>Planets</p>
      {astrology.planets.map(p => (
        <RefCard key={p.name} name={p.name} symbol={p.symbol} title={p.name}
          subtitle={p.day !== '—' ? p.day : undefined}
          meta={[p.rules, p.metal !== '—' ? p.metal : null].filter(Boolean).join(' · ')}
          tags={p.keywords} />
      ))}
    </>
  )
}

function AlchemySection() {
  return (
    <>
      <p className="guide-section-heading">Classical Elements</p>
      {alchemy.elements.map(e => (
        <RefCard key={e.name} name={e.name} symbol={e.symbol} title={e.name}
          subtitle={e.direction}
          meta={`${e.qualities.join(' & ')} · ${e.season} · ${e.spirit} · ${e.tarot}`}
          tags={e.keywords} />
      ))}
      <p className="guide-section-heading" style={{ marginTop: 20 }}>Planetary Metals</p>
      {alchemy.metals.map(m => (
        <RefCard key={m.name} name={m.name} symbol={m.symbol} title={m.name}
          subtitle={m.planet} tags={m.keywords} />
      ))}
      <p className="guide-section-heading" style={{ marginTop: 20 }}>Great Work</p>
      {alchemy.stages.map(s => (
        <RefCard key={s.name} name={s.name} title={s.name}
          subtitle={s.subtitle} desc={s.description} tags={s.keywords} />
      ))}
      <p className="guide-section-heading" style={{ marginTop: 20 }}>Operations</p>
      {alchemy.operations.map(o => (
        <RefCard key={o.name} name={o.name} title={o.name}
          desc={o.description} tags={o.keywords} />
      ))}
    </>
  )
}

// ── Recipes section ────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  sachet:    { bg: 'rgba(236,72,153,0.1)',  color: '#be185d', border: 'rgba(236,72,153,0.3)' },
  'spell jar': { bg: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: 'rgba(139,92,246,0.3)' },
  oil:       { bg: 'rgba(217,119,6,0.12)', color: '#b45309', border: 'rgba(217,119,6,0.3)' },
  incense:   { bg: 'rgba(120,113,108,0.12)', color: '#57534e', border: 'rgba(120,113,108,0.3)' },
  bath:      { bg: 'rgba(8,145,178,0.1)',  color: '#0e7490', border: 'rgba(8,145,178,0.3)' },
  pillow:    { bg: 'rgba(99,102,241,0.1)', color: '#4338ca', border: 'rgba(99,102,241,0.3)' }
}

function RecipesSection({ onHerbClick }) {
  return (
    <>
      {recipes.map(recipe => {
        const color = CATEGORY_COLORS[recipe.category] ?? CATEGORY_COLORS['spell jar']
        return (
          <div key={recipe.name} id={entryId(recipe.name)} className="card recipe-card">
            <div className="recipe-header">
              <span
                className="recipe-category-badge"
                style={{ background: color.bg, color: color.color, border: `1px solid ${color.border}` }}
              >
                {recipe.category}
              </span>
              {recipe.intention && (
                <span className="recipe-intention">{recipe.intention}</span>
              )}
            </div>

            <h3 className="recipe-name">{recipe.name}</h3>

            {recipe.description && (
              <p className="recipe-desc">{recipe.description}</p>
            )}

            <p className="recipe-section-label">Ingredients</p>
            <ul className="recipe-ingredient-list">
              {recipe.ingredients.map((ing, i) => {
                if (ing.herb) {
                  const match = herbs.find(h => h.name === ing.herb)
                  return (
                    <li key={i} className="recipe-ingredient">
                      {match ? (
                        <button className="recipe-herb-link" onClick={() => onHerbClick(match)}>
                          {ing.herb}
                        </button>
                      ) : (
                        <span>{ing.herb}</span>
                      )}
                      {ing.amount && <span className="recipe-ingredient-amount"> — {ing.amount}</span>}
                    </li>
                  )
                }
                return (
                  <li key={i} className="recipe-ingredient">
                    <span>{ing.item}</span>
                    {ing.amount && <span className="recipe-ingredient-amount"> — {ing.amount}</span>}
                  </li>
                )
              })}
            </ul>

            {recipe.steps?.length > 0 && (
              <>
                <p className="recipe-section-label">Method</p>
                <ol className="recipe-steps">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="recipe-step">{step}</li>
                  ))}
                </ol>
              </>
            )}

            {recipe.notes && (
              <p className="recipe-notes">{recipe.notes}</p>
            )}
          </div>
        )
      })}
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

// ── Practice notes by pantheon ────────────────────────────────────────────────

const PRACTICE_NOTES = {
  Yoruba: 'Traditional Orisha worship through Candomblé, Santería/Lucumí, and Ifá requires initiation into a lineage tradition. These are living practices of West African and African diaspora communities — approach with respect for that lineage.',
  Nahuatl: 'Traditional Aztec/Mexica ceremonies and spiritual practices are tied to Indigenous Mesoamerican communities. Many Native practitioners consider core ritual elements and sacred knowledge closed to outside participation.',
  Abrahamic: 'These figures appear widely in folk magic, Hoodoo, and syncretic traditions. Hoodoo in particular is rooted in African American history and culture — approach those practices with awareness of their origins.',
}

// ── Entity Guide Card ─────────────────────────────────────────────────────────

function EntityGuideCard({ entity, workingWith, onToggle }) {
  return (
    <div id={entryId(entity.name)} className="card entity-guide-card">
      <div className="entity-guide-top">
        <div className="entity-guide-title-block">
          <h3 className="entity-guide-name">{entity.name}</h3>
          <div className="entity-guide-meta-row">
            <span className="entity-pantheon-badge">{entity.pantheon}</span>
            <span className="entity-type-chip">{entity.type}</span>
            {entity.prominence === 'major' && (
              <span className="entity-prominence-chip">Major</span>
            )}
            {entity.practice && (
              <span className={`entity-practice-badge entity-practice-badge--${entity.practice}`}>
                {entity.practice === 'open' ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
        <button
          className={`entity-working-with-btn${workingWith ? ' active' : ''}`}
          onClick={onToggle}
        >
          {workingWith ? '★ Working With' : '☆ Working With'}
        </button>
      </div>

      {PRACTICE_NOTES[entity.pantheon] && (
        <p className="entity-practice-note">{PRACTICE_NOTES[entity.pantheon]}</p>
      )}

      {entity.epithets?.length > 0 && (
        <p className="entity-epithets">{entity.epithets.join(' · ')}</p>
      )}

      {entity.domain?.length > 0 && (
        <div className="entity-domains">
          {entity.domain.map(d => (
            <span key={d} className="entity-domain-tag">{d}</span>
          ))}
        </div>
      )}

      {entity.description && (
        <p className="entity-description">{entity.description}</p>
      )}

      {entity.historic_data && (
        <p className="entity-historic">{entity.historic_data}</p>
      )}

      {entity.associations && (entity.associations.element || entity.associations.planet) && (
        <p className="entity-associations">
          {[entity.associations.element, entity.associations.planet].filter(Boolean).join(' · ')}
        </p>
      )}

      {entity.wikipedia && (
        <a className="herb-wiki-link" href={entity.wikipedia} target="_blank" rel="noreferrer">
          Wikipedia ↗
        </a>
      )}
    </div>
  )
}

// ── Entity Section ────────────────────────────────────────────────────────────

function EntitySection({ entities, isWorkingWith, onToggle }) {
  const [filterWorkingWith, setFilterWorkingWith] = useState(false)
  const [filterPractice,    setFilterPractice]    = useState(null)
  const [filterType,        setFilterType]        = useState(null)
  const [filterProminence,  setFilterProminence]  = useState(null)
  const [filterPantheon,    setFilterPantheon]    = useState(null)

  const pantheons = useMemo(
    () => [...new Set(entities.map(e => e.pantheon))].sort(),
    [entities]
  )

  const filtered = useMemo(() => entities.filter(e => {
    if (filterWorkingWith && !isWorkingWith(e.name)) return false
    if (filterPractice   && e.practice   !== filterPractice)   return false
    if (filterType       && e.type       !== filterType)       return false
    if (filterProminence && e.prominence !== filterProminence) return false
    if (filterPantheon   && e.pantheon   !== filterPantheon)   return false
    return true
  }), [entities, filterWorkingWith, filterPractice, filterType, filterProminence, filterPantheon, isWorkingWith])

  return (
    <div className="entity-section">
      <div className="entity-filter-working-with">
        <button
          className={`filter-pill${filterWorkingWith ? ' active' : ''}`}
          onClick={() => setFilterWorkingWith(v => !v)}
        >
          ★ Working With
        </button>
      </div>

      <FilterPills
        options={['open', 'closed']}
        active={filterPractice}
        onChange={setFilterPractice}
      />
      <FilterPills
        options={['deity', 'spirit', 'mythological', 'ancestor']}
        active={filterType}
        onChange={setFilterType}
      />
      <FilterPills
        options={['major', 'minor']}
        active={filterProminence}
        onChange={setFilterProminence}
      />
      <FilterPills
        options={pantheons}
        active={filterPantheon}
        onChange={setFilterPantheon}
        scrollable
      />

      {filtered.length === 0 ? (
        <p className="empty-state">No entities match the current filters.</p>
      ) : (
        filtered.map(entity => (
          <EntityGuideCard
            key={entity.name}
            entity={entity}
            workingWith={isWorkingWith(entity.name)}
            onToggle={() => onToggle(entity)}
          />
        ))
      )}
    </div>
  )
}

function GuidePage() {
  const [category, setCategory] = useState('herbs')
  const [trackIndex, setTrackIndex] = useState(0)
  const [modalHerb, setModalHerb]   = useState(null)
  const [refillItem, setRefillItem] = useState(null) // { name, sellers }
  const [herbInv,     setHerbStatus]     = useInventory('guide-herbs')
  const [crystalInv,  setCrystalStatus]  = useInventory('guide-crystals')
  const [mushroomInv, setMushroomStatus] = useInventory('guide-mushrooms')

  const { isWorkingWith, toggle: toggleWorkingWith } = useEntityWorkingWith()

  const catMeta      = CATEGORIES.find(c => c.id === category)
  const isTrack      = catMeta.mode === 'track'
  const isEntities   = catMeta.mode === 'entities'
  const trackEntries = useMemo(() => getTrackEntries(category), [category])
  const refNames     = useMemo(() => getRefNames(category), [category])
  const searchNames  = useMemo(() => {
    if (isTrack)    return trackEntries.map(e => e.name)
    if (isEntities) return entitiesData.map(e => e.name)
    return refNames
  }, [isTrack, isEntities, trackEntries, refNames])

  useEffect(() => { setTrackIndex(0) }, [category])

  const handleSearch = useCallback((val) => {
    if (isTrack) {
      const idx = trackEntries.findIndex(e => e.name.toLowerCase() === val.toLowerCase())
      if (idx !== -1) setTrackIndex(idx)
    } else {
      const match = searchNames.find(n => n.toLowerCase() === val.toLowerCase())
      if (match) scrollToEntry(match)
    }
  }, [isTrack, trackEntries, searchNames])

  function handleRefill(name) { setRefillItem({ name, sellers: SELLERS[category] ?? SELLERS.herbs }) }

  const inv       = category === 'herbs' ? herbInv : category === 'crystals' ? crystalInv : mushroomInv
  const setStatus = category === 'herbs' ? setHerbStatus : category === 'crystals' ? setCrystalStatus : setMushroomStatus

  return (
    <div className={`page${isTrack ? ' page--locked' : ''}`} style={isEntities ? { paddingBottom: 80 } : {}}>
      <div className="page-header">
        <h2>Field Guide</h2>
      </div>

      {/* Category + search always on one row */}
      <div className="guide-controls">
        <select
          className="guide-category-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <SearchCombobox
          options={searchNames}
          onSelect={handleSearch}
          placeholder="Jump to…"
        />
      </div>

      {isTrack && (
        <div className="guide-track-wrapper">
          <TrackSection
            entries={trackEntries}
            index={trackIndex}
            onPrev={() => setTrackIndex(i => (i - 1 + trackEntries.length) % trackEntries.length)}
            onNext={() => setTrackIndex(i => (i + 1) % trackEntries.length)}
            inv={inv}
            setStatus={setStatus}
            onRefill={handleRefill}
            refillLabel={catMeta.refillLabel ?? 'Refill'}
          />
        </div>
      )}

      {isEntities && (
        <EntitySection
          entities={entitiesData}
          isWorkingWith={isWorkingWith}
          onToggle={toggleWorkingWith}
        />
      )}

      {catMeta.mode === 'ref' && category === 'astrology' && <AstrologySection />}
      {catMeta.mode === 'ref' && category === 'alchemy'   && <AlchemySection />}

      {catMeta.mode === 'recipes' && (
        <RecipesSection onHerbClick={setModalHerb} />
      )}

      {/* Herb modal — renders on top of any guide view */}
      {modalHerb && (
        <HerbModal
          herb={modalHerb}
          inv={herbInv}
          setStatus={setHerbStatus}
          onRefill={name => setRefillItem({ name, sellers: SELLERS.herbs })}
          onClose={() => setModalHerb(null)}
        />
      )}

      {/* Refill toast — above everything including herb modal */}
      {refillItem && (
        <RefillToast
          name={refillItem.name}
          sellers={refillItem.sellers}
          onClose={() => setRefillItem(null)}
        />
      )}
    </div>
  )
}

export default GuidePage
