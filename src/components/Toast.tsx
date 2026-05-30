import React, { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  tipo: 'success' | 'error' | 'info' | 'warning';
  mensaje: string;
  duracion?: number;
}

interface ToastContainerProps {
  toasts?: Toast[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts: initialToasts = [] }) => {
  const [toasts, setToasts] = useState<Toast[]>(initialToasts);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers: NodeJS.Timeout[] = [];

    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duracion || 4000);

      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.tipo} animate-slideUp`}
        >
          <div className="flex items-start gap-3">
            <span className="toast-icon">
              {toast.tipo === 'success' && '✅'}
              {toast.tipo === 'error' && '❌'}
              {toast.tipo === 'info' && 'ℹ️'}
              {toast.tipo === 'warning' && '⚠️'}
            </span>
            <p className="toast-mensaje flex-1">{toast.mensaje}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook para usar toasts
export const useToast = () => {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    return { id, ...toast };
  };

  return { addToast };
};

export default ToastContainer;
