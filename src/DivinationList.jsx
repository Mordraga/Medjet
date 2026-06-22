import { useState } from 'react'
import { useEntityList } from './hooks/useEntityList'
import { createEntity } from './utils'
import { getMoonAge, getMoonPhaseInfo } from './utils/astro'
import Modal from './Modal'

const DIV_TYPES = ['rune', 'oracle', 'pendulum', 'scrying', 'dream', 'other']

const TYPE_LABELS = {
  rune:     'Rune Cast',
  oracle:   'Oracle',
  pendulum: 'Pendulum',
  scrying:  'Scrying',
  dream:    'Dream',
  other:    'Other',
}

const TYPE_COLORS = {
  rune:     { bg: 'rgba(217,119,6,0.12)',   color: '#b45309', border: 'rgba(217,119,6,0.3)'   },
  oracle:   { bg: 'rgba(139,92,246,0.12)',  color: '#7c3aed', border: 'rgba(139,92,246,0.3)'  },
  pendulum: { bg: 'rgba(8,145,178,0.12)',   color: '#0e7490', border: 'rgba(8,145,178,0.3)'   },
  scrying:  { bg: 'rgba(15,23,42,0.15)',    color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  dream:    { bg: 'rgba(99,102,241,0.12)',  color: '#4338ca', border: 'rgba(99,102,241,0.3)'  },
  other:    { bg: 'rgba(120,113,108,0.12)', color: '#57534e', border: 'rgba(120,113,108,0.3)' },
}

function currentMoonPhaseName() {
  return getMoonPhaseInfo(getMoonAge()).name
}

function DivCard({ div, onUpdate, onDelete, autoEdit }) {
  const [modalOpen, setModalOpen] = useState(!!autoEdit)
  const [draft, setDraft] = useState({ ...div })

  function set(key, val) { setDraft(prev => ({ ...prev, [key]: val })) }
  function save()   { onUpdate(draft); setModalOpen(false) }
  function cancel() { setDraft({ ...div }); setModalOpen(false) }

  const tc = TYPE_COLORS[div.type] ?? TYPE_COLORS.other

  const editForm = (
    <div className="spell-form">
      <label className="spell-label">Type</label>
      <select className="spell-select" value={draft.type} onChange={e => set('type', e.target.value)}>
        {DIV_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
      </select>

      <label className="spell-label">Question / Focus</label>
      <input
        className="spell-input"
        value={draft.question ?? ''}
        onChange={e => set('question', e.target.value)}
        placeholder="What were you seeking to understand?"
      />

      <label className="spell-label">Result</label>
      <textarea
        className="spell-textarea"
        value={draft.result ?? ''}
        onChange={e => set('result', e.target.value)}
        rows={3}
        placeholder="What came up — cards, runes, impressions, symbols…"
      />

      <label className="spell-label">Interpretation</label>
      <textarea
        className="spell-textarea"
        value={draft.interpretation ?? ''}
        onChange={e => set('interpretation', e.target.value)}
        rows={4}
        placeholder="What does it mean to you?"
      />

      <label className="spell-label">Moon Phase</label>
      <input
        className="spell-input"
        value={draft.moon_phase ?? ''}
        onChange={e => set('moon_phase', e.target.value)}
      />
    </div>
  )

  return (
    <>
      <div className="card spell-card">
        <div className="spell-header">
          <div className="spell-header-left">
            <span
              className="spell-type-badge"
              style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}
            >
              {TYPE_LABELS[div.type] ?? div.type}
            </span>
            <h3 className="spell-name">{div.question || 'Untitled Reading'}</h3>
          </div>
          <span className="spell-time">{div.time}</span>
        </div>

        {div.result && (
          <div className="card-field">
            <div className="card-field-label">Result</div>
            <div className="card-field-value">{div.result}</div>
          </div>
        )}
        {div.interpretation && (
          <div className="card-field">
            <div className="card-field-label">Interpretation</div>
            <div className="card-field-value">{div.interpretation}</div>
          </div>
        )}
        {div.moon_phase && (
          <div className="card-field">
            <div className="card-field-label">Moon Phase</div>
            <div className="card-field-value">{div.moon_phase}</div>
          </div>
        )}

        <div className="card-actions">
          <button className="btn btn-danger" onClick={() => onDelete(div.id)}>Delete</button>
          <button className="btn btn-ghost" onClick={() => { setDraft({ ...div }); setModalOpen(true) }}>Edit</button>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title="Edit Reading"
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

function DivinationList() {
  const [divs, addDiv, updateDiv, deleteDiv] = useEntityList('divinations')
  const [newId, setNewId] = useState(null)

  function handleAdd() {
    const d = createEntity({
      type:           'rune',
      question:       '',
      result:         '',
      interpretation: '',
      moon_phase:     currentMoonPhaseName(),
    })
    addDiv(d)
    setNewId(d.id)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Divination</h2>
        <button className="btn btn-primary" onClick={handleAdd}>New Reading</button>
      </div>
      {divs.length === 0 && (
        <p className="empty-state">No readings recorded yet.</p>
      )}
      {[...divs].reverse().map(d => (
        <DivCard
          key={d.id}
          div={d}
          onUpdate={updateDiv}
          onDelete={deleteDiv}
          autoEdit={d.id === newId}
        />
      ))}
    </div>
  )
}

export default DivinationList
