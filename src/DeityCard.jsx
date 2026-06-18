import { useState } from 'react'
import EditForm from './EditForm'
import Modal from './Modal'
import { deityFields } from './FieldConfigs'

function DeityCard({ deity, onUpdate, onDelete, autoEdit = false }) {
  const [modalOpen, setModalOpen] = useState(autoEdit)
  const [form, setForm] = useState({ ...deity })

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onUpdate(form)
    setModalOpen(false)
  }

  function handleCancel() {
    setForm({ ...deity })
    setModalOpen(false)
  }

  return (
    <>
      <div className="card">
        <h3>{deity.name}</h3>
        {deity.domain && (
          <div className="card-field">
            <div className="card-field-label">Domain</div>
            <div className="card-field-value">{deity.domain}</div>
          </div>
        )}
        {deity.description && (
          <div className="card-field">
            <div className="card-field-label">Description</div>
            <div className="card-field-value">{deity.description}</div>
          </div>
        )}
        {deity.symbols && (
          <div className="card-field">
            <div className="card-field-label">Symbols</div>
            <div className="card-field-value">{deity.symbols}</div>
          </div>
        )}
        {deity.notes && (
          <div className="card-field">
            <div className="card-field-label">UPG / Notes</div>
            <div className="card-field-value">{deity.notes}</div>
          </div>
        )}
        <div className="card-actions">
          <button className="btn btn-danger" onClick={() => onDelete(deity.id)}>Delete</button>
          <button className="btn btn-ghost" onClick={() => { setForm({ ...deity }); setModalOpen(true) }}>Edit</button>
        </div>
      </div>
      {modalOpen && (
        <Modal
          title="Edit Deity"
          onClose={handleCancel}
          footer={
            <>
              <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </>
          }
        >
          <EditForm data={form} fields={deityFields} onChange={handleChange} />
        </Modal>
      )}
    </>
  )
}

export default DeityCard
