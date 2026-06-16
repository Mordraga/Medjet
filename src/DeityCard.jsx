import { useState } from 'react'
import EditForm from './EditForm'
import { deityFields } from './FieldConfigs'

function DeityCard({ deity, onUpdate, onDelete, autoEdit = false }) {
  const [isEditing, setIsEditing] = useState(autoEdit)
  const [form, setForm] = useState({ ...deity })

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onUpdate(form)
    setIsEditing(false)
  }

  function handleCancel() {
    setForm({ ...deity })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="card">
        <EditForm data={form} fields={deityFields} onChange={handleChange} />
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    )
  }

  return (
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
        <button className="btn btn-ghost" onClick={() => setIsEditing(true)}>Edit</button>
      </div>
    </div>
  )
}

export default DeityCard
