import { useState } from 'react'
import { useEntityList } from './hooks/useEntityList'
import { createEntity } from './utils'
import Modal from './Modal'

const OCCASIONS = ['gratitude', 'petition', 'sabbat', 'esbat', 'ancestor work', 'daily practice', 'other']

const OCCASION_COLORS = {
  gratitude:      { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.3)'   },
  petition:       { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed', border: 'rgba(139,92,246,0.3)'  },
  sabbat:         { bg: 'rgba(217,119,6,0.12)',  color: '#b45309', border: 'rgba(217,119,6,0.3)'   },
  esbat:          { bg: 'rgba(8,145,178,0.1)',   color: '#0e7490', border: 'rgba(8,145,178,0.3)'   },
  'ancestor work':{ bg: 'rgba(99,102,241,0.1)',  color: '#4338ca', border: 'rgba(99,102,241,0.3)'  },
  'daily practice':{ bg: 'rgba(22,163,74,0.08)', color: '#15803d', border: 'rgba(22,163,74,0.25)' },
  other:          { bg: 'rgba(120,113,108,0.12)',color: '#57534e', border: 'rgba(120,113,108,0.3)' },
}

function OfferingCard({ offering, onUpdate, onDelete, autoEdit }) {
  const [modalOpen, setModalOpen] = useState(!!autoEdit)
  const [draft, setDraft] = useState({ ...offering })

  function set(key, val) { setDraft(prev => ({ ...prev, [key]: val })) }
  function save()   { onUpdate(draft); setModalOpen(false) }
  function cancel() { setDraft({ ...offering }); setModalOpen(false) }

  const tc = OCCASION_COLORS[offering.occasion] ?? OCCASION_COLORS.other

  const editForm = (
    <div className="spell-form">
      <label className="spell-label">Recipient</label>
      <input
        className="spell-input"
        value={draft.recipient ?? ''}
        onChange={e => set('recipient', e.target.value)}
        placeholder="Deity, ancestor, spirit, or entity…"
      />

      <label className="spell-label">Offering</label>
      <input
        className="spell-input"
        value={draft.offering ?? ''}
        onChange={e => set('offering', e.target.value)}
        placeholder="Food, candle, incense, libation, art, time…"
      />

      <label className="spell-label">Occasion</label>
      <select className="spell-select" value={draft.occasion ?? 'gratitude'} onChange={e => set('occasion', e.target.value)}>
        {OCCASIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>

      <label className="spell-label">Notes</label>
      <textarea
        className="spell-textarea"
        value={draft.notes ?? ''}
        onChange={e => set('notes', e.target.value)}
        rows={4}
        placeholder="Observations, signs, feelings, response…"
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
              {offering.occasion ?? 'offering'}
            </span>
            <h3 className="spell-name">
              {offering.recipient ? `To ${offering.recipient}` : 'Offering'}
            </h3>
          </div>
          <span className="spell-time">{offering.time}</span>
        </div>

        {offering.offering && (
          <div className="card-field">
            <div className="card-field-label">Offered</div>
            <div className="card-field-value">{offering.offering}</div>
          </div>
        )}
        {offering.notes && (
          <div className="card-field">
            <div className="card-field-label">Notes</div>
            <div className="card-field-value">{offering.notes}</div>
          </div>
        )}

        <div className="card-actions">
          <button className="btn btn-danger" onClick={() => onDelete(offering.id)}>Delete</button>
          <button className="btn btn-ghost" onClick={() => { setDraft({ ...offering }); setModalOpen(true) }}>Edit</button>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title="Edit Offering"
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

function OfferingList() {
  const [offerings, addOffering, updateOffering, deleteOffering] = useEntityList('offerings')
  const [newId, setNewId] = useState(null)

  function handleAdd() {
    const o = createEntity({
      recipient: '',
      offering:  '',
      occasion:  'gratitude',
      notes:     '',
    })
    addOffering(o)
    setNewId(o.id)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Offerings</h2>
        <button className="btn btn-primary" onClick={handleAdd}>New Offering</button>
      </div>
      {offerings.length === 0 && (
        <p className="empty-state">No offerings recorded yet.</p>
      )}
      {[...offerings].reverse().map(o => (
        <OfferingCard
          key={o.id}
          offering={o}
          onUpdate={updateOffering}
          onDelete={deleteOffering}
          autoEdit={o.id === newId}
        />
      ))}
    </div>
  )
}

export default OfferingList
