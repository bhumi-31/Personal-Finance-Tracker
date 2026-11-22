import React, { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-forge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-forge">
          <span>{title}</span>
          <button className="modal-close-forge" onClick={onClose} aria-label="Close">
            [ × ]
          </button>
        </div>
        <div className="modal-body-forge">{children}</div>
      </div>
    </div>
  );
}
