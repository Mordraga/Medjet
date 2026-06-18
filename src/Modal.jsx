import { useEffect } from 'react'

function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-header">
          <span className="edit-modal-title">{title}</span>
          <button className="edit-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="edit-modal-body">
          {children}
        </div>
        {footer && (
          <div className="edit-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
