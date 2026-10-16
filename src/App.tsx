import React from 'react';
import { LanguageProvider } from './i18n/useLanguageSwitcher';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { TanStackQueryProvider } from './context/QueryProvider';
import { AppLayout } from './components/navigation/AppLayout';

export default function App() {
  return (
    <TanStackQueryProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </TanStackQueryProvider>
  );
}

