import React from 'react';
import { LanguageProvider } from './i18n/useLanguageSwitcher';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/navigation/AppLayout';

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
