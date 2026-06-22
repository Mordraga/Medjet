import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import herbs from '../data/herbs.json'
import astrology from '../data/astrology.json'
import alchemy from '../data/alchemy.json'
import crystals from '../data/crystals.json'
import mushrooms from '../data/mushrooms.json'
import recipes from '../data/recipes.json'
import entitiesData from '../data/entities.json'
import magicData from '../data/magic.json'
import glossaryData from '../data/glossary.json'
import colorsData from '../data/colors.json'
import FilterPills from '../FilterPills'
import Modal from '../Modal'
import { useEntityWorkingWith } from '../hooks/useEntityWorkingWith'
import { useEntityList } from '../hooks/useEntityList'
import { createEntity } from '../utils'
import { getMoonAge, getMoonPhaseInfo, getPlanetaryHours } from '../utils/astro'

const CATEGORIES = [
  { id: 'entities',   label: 'Entities',   mode: 'entities' },
  { id: 'magic',      label: 'Magic',      mode: 'magic'    },
  { id: 'glossary',        label: 'Glossary',   mode: 'glossary'  },
  { id: 'colors',          label: 'Colors',     mode: 'colors'    },
  { id: 'planetary-hours', label: 'P. Hours',   mode: 'planetary' },
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

      {entity.syncretic_with?.length > 0 && (
        <div className="entity-syncretic">
          <span className="entity-syncretic-label">Commonly syncretized with:</span>
          <span className="entity-syncretic-list">{entity.syncretic_with.join(' · ')}</span>
        </div>
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

// ── Colors ────────────────────────────────────────────────────────────────────

function ColorsSection() {
  return (
    <div>
      {colorsData.map(c => (
        <div key={c.name} id={entryId(c.name)} className="card color-ref-card">
          <div className="color-ref-header">
            <span className="color-swatch" style={{ background: c.hex }} />
            <h3 className="color-ref-name">{c.name}</h3>
            <div className="color-ref-assoc">
              {c.associations.map(a => <span key={a} className="entity-domain-tag">{a}</span>)}
            </div>
          </div>
          <div className="guide-keywords" style={{ marginTop: 6 }}>
            {c.keywords.map(k => <span key={k} className="guide-keyword">{k}</span>)}
          </div>
          {c.description && <p className="guide-card-desc" style={{ marginTop: 8 }}>{c.description}</p>}
        </div>
      ))}
    </div>
  )
}

// ── Planetary Hours ───────────────────────────────────────────────────────────

function fmtHourTime(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function PlanetaryHoursSection() {
  const [loc, setLoc]       = useState(() => { try { return JSON.parse(localStorage.getItem('guide-location')) } catch { return null } })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const now = new Date()
  const result = useMemo(() => loc ? getPlanetaryHours(now, loc.lat, loc.lon) : null, [loc])
  const currentHour = result?.hours.find(h => now >= h.start && now < h.end) ?? null

  function detect() {
    if (!navigator.geolocation) { setError('Geolocation not available on this device.'); return }
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const l = { lat: pos.coords.latitude, lon: pos.coords.longitude }
        localStorage.setItem('guide-location', JSON.stringify(l))
        setLoc(l)
        setLoading(false)
      },
      () => { setError('Location access denied. Check your device settings.'); setLoading(false) },
      { timeout: 10000 }
    )
  }

  if (!loc) {
    return (
      <div className="planetary-gate">
        <p className="planetary-gate-msg">
          Planetary hours require your location to calculate today's sunrise and sunset.
          Your location is stored only on your device.
        </p>
        <button className="btn btn-primary" onClick={detect} disabled={loading}>
          {loading ? 'Detecting…' : 'Use My Location'}
        </button>
        {error && <p className="planetary-error">{error}</p>}
      </div>
    )
  }

  if (!result) return <p className="empty-state">Unable to calculate hours for this location.</p>

  return (
    <div className="planetary-section">
      <div className="planetary-meta-row">
        <span>Sunrise {fmtHourTime(result.sunrise)}</span>
        <span>·</span>
        <span>Sunset {fmtHourTime(result.sunset)}</span>
      </div>

      {currentHour ? (
        <div className="card planetary-now-card">
          <div className="planetary-now-label">Current Hour</div>
          <div className="planetary-now-body">
            <span className="planetary-now-symbol">{currentHour.symbol}</span>
            <div>
              <div className="planetary-now-planet">Hour of {currentHour.planet}</div>
              <div className="planetary-now-time">{fmtHourTime(currentHour.start)} – {fmtHourTime(currentHour.end)}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="entity-historic" style={{ marginBottom: 8 }}>
          No planetary hour calculated for this moment — check night hours below.
        </p>
      )}

      <div className="planetary-list">
        {result.hours.map((h, i) => (
          <div
            key={i}
            className={`planetary-row${h === currentHour ? ' planetary-row--current' : ''}`}
          >
            <span className="planetary-row-period">{h.period === 'day' ? '☀' : '☽'} {h.num}</span>
            <span className="planetary-row-symbol">{h.symbol}</span>
            <span className="planetary-row-planet">{h.planet}</span>
            <span className="planetary-row-time">{fmtHourTime(h.start)}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-ghost"
        style={{ marginTop: 12, fontSize: 12 }}
        onClick={() => { localStorage.removeItem('guide-location'); setLoc(null) }}
      >
        Change Location
      </button>
    </div>
  )
}

// ── Glossary ──────────────────────────────────────────────────────────────────

const GLOSSARY_CATEGORY_LABELS = {
  practice:   'Practice',
  history:    'History',
  cosmology:  'Cosmology',
  tradition:  'Tradition',
}

const GLOSSARY_CAT_COLORS = {
  practice:   { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', border: 'rgba(139,92,246,0.3)'  },
  history:    { bg: 'rgba(217,119,6,0.1)',   color: '#b45309', border: 'rgba(217,119,6,0.3)'   },
  cosmology:  { bg: 'rgba(8,145,178,0.1)',   color: '#0e7490', border: 'rgba(8,145,178,0.3)'   },
  tradition:  { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.3)'   },
}

function GlossaryCard({ entry }) {
  const cc = GLOSSARY_CAT_COLORS[entry.category] ?? GLOSSARY_CAT_COLORS.practice
  return (
    <div id={entryId(entry.term)} className="card entity-guide-card">
      <div className="entity-guide-top">
        <div className="entity-guide-title-block">
          <h3 className="entity-guide-name">{entry.term}</h3>
          <div className="entity-guide-meta-row">
            <span
              className="magic-type-chip"
              style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}
            >
              {GLOSSARY_CATEGORY_LABELS[entry.category] ?? entry.category}
            </span>
            {entry.tradition?.map(t => (
              <span key={t} className="entity-domain-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="entity-description">{entry.short}</p>
      {entry.detail && <p className="entity-historic">{entry.detail}</p>}
      {entry.related?.length > 0 && (
        <div className="entity-syncretic">
          <span className="entity-syncretic-label">See also:</span>
          <span className="entity-syncretic-list">{entry.related.join(' · ')}</span>
        </div>
      )}
    </div>
  )
}

function GlossarySection() {
  const [filterCat, setFilterCat] = useState(null)

  const filtered = useMemo(
    () => filterCat ? glossaryData.filter(e => e.category === filterCat) : glossaryData,
    [filterCat]
  )

  return (
    <div className="entity-section">
      <FilterPills
        options={['practice', 'history', 'cosmology', 'tradition']}
        active={filterCat}
        onChange={setFilterCat}
      />
      {filtered.map(entry => (
        <GlossaryCard key={entry.term} entry={entry} />
      ))}
    </div>
  )
}

// ── Magic Guide ───────────────────────────────────────────────────────────────

function currentMoonPhaseName() {
  return getMoonPhaseInfo(getMoonAge()).name
}

const MAGIC_TYPE_COLORS = {
  folk:        { bg: 'rgba(22,163,74,0.1)',    color: '#15803d', border: 'rgba(22,163,74,0.3)'    },
  sympathetic: { bg: 'rgba(217,119,6,0.1)',    color: '#b45309', border: 'rgba(217,119,6,0.3)'    },
  written:     { bg: 'rgba(139,92,246,0.1)',   color: '#7c3aed', border: 'rgba(139,92,246,0.3)'   },
  spirit:      { bg: 'rgba(99,102,241,0.1)',   color: '#4338ca', border: 'rgba(99,102,241,0.3)'   },
  ceremonial:  { bg: 'rgba(8,145,178,0.1)',    color: '#0e7490', border: 'rgba(8,145,178,0.3)'    },
}

function QuickSpellModal({ magic, onSave, onClose }) {
  const [name, setName]           = useState(`${magic.name} Working`)
  const [intention, setIntention] = useState('')
  const [moonPhase, setMoonPhase] = useState(currentMoonPhaseName)

  function handleSave() {
    onSave({ name, intention, moonPhase, practiceType: magic.name })
    onClose()
  }

  const tc = MAGIC_TYPE_COLORS[magic.type] ?? MAGIC_TYPE_COLORS.folk

  return (
    <Modal
      title={`Quick Spell — ${magic.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim()}>
            Add to Journal
          </button>
        </>
      }
    >
      <div className="spell-form">
        <div className="quick-spell-prefill">
          <span className="spell-label" style={{ margin: 0 }}>Practice Type</span>
          <span
            className="magic-type-chip"
            style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
          >
            {magic.name}
          </span>
        </div>

        <label className="spell-label">Name</label>
        <input
          className="spell-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className="spell-label">Intention</label>
        <input
          className="spell-input"
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="What is the purpose of this working?"
        />

        <label className="spell-label">Moon Phase</label>
        <input
          className="spell-input"
          value={moonPhase}
          onChange={e => setMoonPhase(e.target.value)}
        />

        <p className="quick-spell-hint">
          Ingredients, method, and outcome can be added from your journal.
        </p>
      </div>
    </Modal>
  )
}

function MagicGuideCard({ magic, onQuickSpell }) {
  const tc = MAGIC_TYPE_COLORS[magic.type] ?? MAGIC_TYPE_COLORS.folk
  return (
    <div id={entryId(magic.name)} className="card entity-guide-card">
      <div className="entity-guide-top">
        <div className="entity-guide-title-block">
          <h3 className="entity-guide-name">{magic.name}</h3>
          <div className="entity-guide-meta-row">
            <span
              className="magic-type-chip"
              style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
            >
              {magic.type}
            </span>
            {magic.practice && (
              <span className={`entity-practice-badge entity-practice-badge--${magic.practice}`}>
                {magic.practice === 'open' ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
        <button className="entity-working-with-btn" onClick={() => onQuickSpell(magic)}>
          + Quick Spell
        </button>
      </div>

      {magic.practice_note && (
        <p className="entity-practice-note">{magic.practice_note}</p>
      )}

      {magic.tradition?.length > 0 && (
        <div className="entity-domains">
          {magic.tradition.map(t => (
            <span key={t} className="entity-domain-tag">{t}</span>
          ))}
        </div>
      )}

      {magic.description && (
        <p className="entity-description">{magic.description}</p>
      )}

      {magic.historic_data && (
        <p className="entity-historic">{magic.historic_data}</p>
      )}
    </div>
  )
}

function MagicSection({ addSpell }) {
  const [filterType,     setFilterType]     = useState(null)
  const [filterPractice, setFilterPractice] = useState(null)
  const [quickSpell,     setQuickSpell]     = useState(null)

  const filtered = useMemo(() => magicData.filter(m => {
    if (filterType     && m.type     !== filterType)     return false
    if (filterPractice && m.practice !== filterPractice) return false
    return true
  }), [filterType, filterPractice])

  function handleSave({ name, intention, moonPhase, practiceType }) {
    addSpell(createEntity({
      name,
      type:          'spell',
      practice_type: practiceType,
      intention,
      moon_phase:    moonPhase,
      ingredients:   '',
      method:        '',
      outcome:       ''
    }))
  }

  return (
    <div className="entity-section">
      <FilterPills
        options={['folk', 'sympathetic', 'written', 'spirit', 'ceremonial']}
        active={filterType}
        onChange={setFilterType}
      />
      <FilterPills
        options={['open', 'closed']}
        active={filterPractice}
        onChange={setFilterPractice}
      />

      {filtered.length === 0 ? (
        <p className="empty-state">No practices match the current filters.</p>
      ) : (
        filtered.map(magic => (
          <MagicGuideCard key={magic.name} magic={magic} onQuickSpell={setQuickSpell} />
        ))
      )}

      {quickSpell && (
        <QuickSpellModal
          magic={quickSpell}
          onSave={handleSave}
          onClose={() => setQuickSpell(null)}
        />
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
  const [, addSpell] = useEntityList('spells')

  const catMeta      = CATEGORIES.find(c => c.id === category)
  const isTrack      = catMeta.mode === 'track'
  const isEntities   = catMeta.mode === 'entities'
  const isMagic      = catMeta.mode === 'magic'
  const isGlossary   = catMeta.mode === 'glossary'
  const isColors     = catMeta.mode === 'colors'
  const isPlanetary  = catMeta.mode === 'planetary'
  const trackEntries = useMemo(() => getTrackEntries(category), [category])
  const refNames     = useMemo(() => getRefNames(category), [category])
  const searchNames  = useMemo(() => {
    if (isTrack)    return trackEntries.map(e => e.name)
    if (isEntities) return entitiesData.map(e => e.name)
    if (isMagic)    return magicData.map(m => m.name)
    if (isGlossary) return glossaryData.map(g => g.term)
    if (isColors)   return colorsData.map(c => c.name)
    return refNames
  }, [isTrack, isEntities, isMagic, isGlossary, isColors, trackEntries, refNames])

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
    <div className={`page${isTrack ? ' page--locked' : ''}`} style={(isEntities || isMagic) ? { paddingBottom: 80 } : {}}>
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

      {isMagic    && <MagicSection addSpell={addSpell} />}
      {isGlossary   && <GlossarySection />}
      {isColors     && <ColorsSection />}
      {isPlanetary  && <PlanetaryHoursSection />}

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
