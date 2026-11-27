import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderLeft: '4px solid #059669', iconColor: '#059669', icon: '✓' };
      case 'error':
        return { borderLeft: '4px solid #dc2626', iconColor: '#dc2626', icon: '!' };
      case 'warning':
        return { borderLeft: '4px solid #d97706', iconColor: '#d97706', icon: '⚠' };
      default:
        return { borderLeft: '4px solid #ea580c', iconColor: '#ea580c', icon: 'ℹ' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const styleInfo = getTypeStyle(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                background: '#ffffff',
                color: '#111827',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                borderLeft: styleInfo.borderLeft,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '0.95rem',
                fontWeight: '500',
                pointerEvents: 'auto',
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    color: styleInfo.iconColor,
                    fontWeight: '700',
                    fontSize: '1rem',
                  }}
                >
                  {styleInfo.icon}
                </span>
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  padding: '0 4px',
                }}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
