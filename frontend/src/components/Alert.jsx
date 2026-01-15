import React, { useEffect, useState } from 'react';

export function Alert({ message, type = 'info', autoClose = true, duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose || !message) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, autoClose, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
      <button 
        className="alert-close"
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}

export function AlertContainer({ error, success, onClearError, onClearSuccess }) {
  return (
    <div className="alert-container">
      {error && (
        <Alert
          message={error}
          type="danger"
          autoClose={true}
          duration={6000}
          onClose={onClearError}
        />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          autoClose={true}
          duration={4000}
          onClose={onClearSuccess}
        />
      )}
    </div>
  );
}
