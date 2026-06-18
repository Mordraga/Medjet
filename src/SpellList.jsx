import { useState } from 'react'
import { useEntityList } from './hooks/useEntityList'
import { createEntity } from './utils'
import { getMoonAge, getMoonPhaseInfo } from './utils/astro'
import Modal from './Modal'

const SPELL_TYPES = ['spell', 'ritual', 'charm', 'sigil', 'rite', 'prayer']

const TYPE_LABELS = {
  spell:   'Spell',
  ritual:  'Ritual',
  charm:   'Charm',
  sigil:   'Sigil',
  rite:    'Rite',
  prayer:  'Prayer'
}

function currentMoonPhaseName() {
  return getMoonPhaseInfo(getMoonAge()).name
}

function SpellCard({ spell, onUpdate, onDelete, autoEdit }) {
  const [modalOpen, setModalOpen] = useState(!!autoEdit)
  const [draft, setDraft] = useState({ ...spell })

  function set(key, val) { setDraft(prev => ({ ...prev, [key]: val })) }

  function save() { onUpdate(draft); setModalOpen(false) }
  function cancel() { setDraft({ ...spell }); setModalOpen(false) }
  function openEdit() { setDraft({ ...spell }); setModalOpen(true) }

  const editForm = (
    <div className="spell-form">
      <label className="spell-label">Name</label>
      <input
        className="spell-input"
        value={draft.name}
        onChange={e => set('name', e.target.value)}
      />

      <label className="spell-label">Type</label>
      <select
        className="spell-select"
        value={draft.type}
        onChange={e => set('type', e.target.value)}
      >
        {SPELL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
      </select>

      <label className="spell-label">Intention</label>
      <input
        className="spell-input"
        value={draft.intention}
        onChange={e => set('intention', e.target.value)}
        placeholder="What is the purpose of this working?"
      />

      <label className="spell-label">Moon Phase</label>
      <input
        className="spell-input"
        value={draft.moon_phase}
        onChange={e => set('moon_phase', e.target.value)}
      />

      <label className="spell-label">Ingredients / Materials</label>
      <textarea
        className="spell-textarea"
        value={draft.ingredients}
        onChange={e => set('ingredients', e.target.value)}
        rows={3}
        placeholder="Herbs, crystals, candles, tools…"
      />

      <label className="spell-label">Method</label>
      <textarea
        className="spell-textarea"
        value={draft.method}
        onChange={e => set('method', e.target.value)}
        rows={6}
        placeholder="Describe how the working was performed…"
      />

      <label className="spell-label">Outcome</label>
      <textarea
        className="spell-textarea"
        value={draft.outcome}
        onChange={e => set('outcome', e.target.value)}
        rows={3}
        placeholder="Record results after the working…"
      />
    </div>
  )

  return (
    <>
      <div className="card spell-card">
        <div className="spell-header">
          <div className="spell-header-left">
            <span className={`spell-type-badge spell-type-badge--${spell.type}`}>
              {TYPE_LABELS[spell.type] ?? spell.type}
            </span>
            <h3 className="spell-name">{spell.name}</h3>
          </div>
          <span className="spell-time">{spell.time}</span>
        </div>

        {spell.intention && (
          <div className="card-field">
            <div className="card-field-label">Intention</div>
            <div className="card-field-value">{spell.intention}</div>
          </div>
        )}
        {spell.moon_phase && (
          <div className="card-field">
            <div className="card-field-label">Moon Phase</div>
            <div className="card-field-value">{spell.moon_phase}</div>
          </div>
        )}
        {spell.ingredients && (
          <div className="card-field">
            <div className="card-field-label">Ingredients</div>
            <div className="card-field-value">{spell.ingredients}</div>
          </div>
        )}
        {spell.method && (
          <div className="card-field">
            <div className="card-field-label">Method</div>
            <div className="card-field-value spell-method">{spell.method}</div>
          </div>
        )}
        {spell.outcome && (
          <div className="card-field">
            <div className="card-field-label">Outcome</div>
            <div className="card-field-value">{spell.outcome}</div>
          </div>
        )}

        <div className="card-actions">
          <button className="btn btn-danger" onClick={() => onDelete(spell.id)}>Delete</button>
          <button className="btn btn-ghost" onClick={openEdit}>Edit</button>
        </div>
      </div>
      {modalOpen && (
        <Modal
          title="Edit Working"
          onClose={cancel}
          footer={
            <>
              <button className="btn btn-ghost" onClick={cancel}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </>
          }
        >
          {editForm}
        </Modal>
      )}
    </>
  )
}

function SpellList() {
  const [spells, addSpell, updateSpell, deleteSpell] = useEntityList('spells')
  const [newId, setNewId] = useState(null)

  function handleAdd() {
    const spell = createEntity({
      name:        'New Working',
      type:        'spell',
      intention:   '',
      moon_phase:  currentMoonPhaseName(),
      ingredients: '',
      method:      '',
      outcome:     ''
    })
    addSpell(spell)
    setNewId(spell.id)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Spells</h2>
        <button className="btn btn-primary" onClick={handleAdd}>New Working</button>
      </div>
      {spells.length === 0 && (
        <p className="empty-state">No workings recorded yet.</p>
      )}
      {[...spells].reverse().map(spell => (
        <SpellCard
          key={spell.id}
          spell={spell}
          onUpdate={updateSpell}
          onDelete={deleteSpell}
          autoEdit={spell.id === newId}
        />
      ))}
    </div>
  )
}

export default SpellList
