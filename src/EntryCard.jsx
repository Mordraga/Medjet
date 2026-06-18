import { useState } from 'react'
import EditForm from './EditForm'
import Modal from './Modal'
import { entryFields } from './FieldConfigs'
import { getCurrentTime } from './utils'

function EntryCard({ entry, onUpdate, onDelete, autoEdit = false }) {
  const [modalOpen, setModalOpen] = useState(autoEdit)
  const [form, setForm] = useState({ ...entry })

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onUpdate({ ...form, time: getCurrentTime() })
    setModalOpen(false)
  }

  function handleCancel() {
    setForm({ ...entry })
    setModalOpen(false)
  }

  function openEdit() {
    setForm({ ...entry })
    setModalOpen(true)
  }

  return (
    <>
      <div className="card">
        <h3>{entry.title}</h3>
        <p className="card-body">{entry.body}</p>
        {entry.time && <p className="card-meta">Last edited {entry.time}</p>}
        <div className="card-actions">
          <button className="btn btn-danger" onClick={() => onDelete(entry.id)}>Delete</button>
          <button className="btn btn-ghost" onClick={openEdit}>Edit</button>
        </div>
      </div>
      {modalOpen && (
        <Modal
          title="Edit Entry"
          onClose={handleCancel}
          footer={
            <>
              <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </>
          }
        >
          <EditForm data={form} fields={entryFields} onChange={handleChange} />
        </Modal>
      )}
    </>
  )
}

export default EntryCard
