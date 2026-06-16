export function EditForm({ data, fields, onChange }) {
  return (
    <>
      {fields.map(field => (
        <div className="field" key={field.key}>
          <label>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              value={data[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
            />
          ) : (
            <input
              type="text"
              value={data[field.key] || ''}
              onChange={e => onChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </>
  )
}

export default EditForm
