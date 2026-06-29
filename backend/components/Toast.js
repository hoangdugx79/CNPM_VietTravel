import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map((t) => {
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fas ${icons[t.type] || icons.info}`} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );

  return { showToast, ToastContainer };
}
