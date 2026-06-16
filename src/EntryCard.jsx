import { useState } from 'react'
import EditForm from './EditForm'
import { entryFields } from './FieldConfigs'
import { getCurrentTime } from './utils'

function EntryCard({ entry, onUpdate, onDelete, autoEdit = false }) {
  const [isEditing, setIsEditing] = useState(autoEdit)
  const [form, setForm] = useState({ ...entry })

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onUpdate({ ...form, time: getCurrentTime() })
    setIsEditing(false)
  }

  function handleCancel() {
    setForm({ ...entry })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="card">
        <EditForm data={form} fields={entryFields} onChange={handleChange} />
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>{entry.title}</h3>
      <p className="card-body">{entry.body}</p>
      {entry.time && <p className="card-meta">Last edited {entry.time}</p>}
      <div className="card-actions">
        <button className="btn btn-danger" onClick={() => onDelete(entry.id)}>Delete</button>
        <button className="btn btn-ghost" onClick={() => setIsEditing(true)}>Edit</button>
      </div>
    </div>
  )
}

export default EntryCard
