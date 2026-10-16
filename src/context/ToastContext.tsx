import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  showPermissionDenied: (message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global callback for axios interceptors where React hooks cannot be called directly
let globalAddToast: ((toast: Omit<ToastItem, 'id'>) => string) | null = null;

export function triggerGlobalToast(toast: Omit<ToastItem, 'id'>) {
  if (globalAddToast) {
    globalAddToast(toast);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.durationMs ?? 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  // Bind to global module ref
  globalAddToast = addToast;

  const showPermissionDenied = useCallback((message?: string) => {
    addToast({
      type: 'error',
      title: 'Access Denied (HTTP 403)',
      message: message || 'You do not have the required authorities to access this clinical or administrative resource.',
      durationMs: 5500
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showPermissionDenied }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
