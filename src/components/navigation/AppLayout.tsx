import React, { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { OmniboxModal } from './OmniboxModal';
import { ToastContainer } from '../notifications/ToastContainer';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

// Import Views
import ReceptionCockpitView from '../views/ReceptionCockpitView';
import CalendarAppointmentsView from '../views/CalendarAppointmentsView';
import ClinicalWorkspaceView from '../views/ClinicalWorkspaceView';
import PatientsDirectoryView from '../views/PatientsDirectoryView';
import CashRegisterShiftsView from '../views/CashRegisterShiftsView';
import ClinicSettingsEavView from '../views/ClinicSettingsEavView';
import PlatformAnalyticsView from '../views/PlatformAnalyticsView';
import ArchitectureCodeView from '../views/ArchitectureCodeView';

export const AppLayout: React.FC = () => {
  const { role, userType } = useAuth();
  const { isRtl } = useLanguageSwitcher();
  const [currentRoute, setCurrentRoute] = useState<string>('/reception/cockpit');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [omniboxOpen, setOmniboxOpen] = useState<boolean>(false);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  // Render view based on route inside ProtectedRoute guards
  const renderCurrentView = () => {
    if (currentRoute === '/reception/cockpit') {
      return (
        <ProtectedRoute
          allowedRoles={['RECEPTIONIST', 'CLINIC_ADMIN', 'SUPER_ADMIN']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/reception/cockpit"
          onNavigateHome={() => setCurrentRoute('/architecture')}
        >
          <ReceptionCockpitView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/calendar') {
      return (
        <ProtectedRoute
          allowedRoles={['RECEPTIONIST', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/calendar"
          onNavigateHome={() => setCurrentRoute('/architecture')}
        >
          <CalendarAppointmentsView />
        </ProtectedRoute>
      );
    }

    if (currentRoute.startsWith('/clinical/workspace')) {
      return (
        <ProtectedRoute
          allowedRoles={['DOCTOR', 'SUPER_ADMIN']}
          requiredAuthorities={['encounter:clinical:read']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/clinical/workspace"
          onNavigateHome={() => setCurrentRoute('/reception/cockpit')}
        >
          <ClinicalWorkspaceView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/patients') {
      return (
        <ProtectedRoute
          allowedRoles={['RECEPTIONIST', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/patients"
          onNavigateHome={() => setCurrentRoute('/architecture')}
        >
          <PatientsDirectoryView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/billing/shifts') {
      return (
        <ProtectedRoute
          allowedRoles={['RECEPTIONIST', 'CLINIC_ADMIN', 'SUPER_ADMIN']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/billing/shifts"
          onNavigateHome={() => setCurrentRoute('/architecture')}
        >
          <CashRegisterShiftsView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/settings') {
      return (
        <ProtectedRoute
          allowedRoles={['CLINIC_ADMIN', 'SUPER_ADMIN']}
          requiredAuthorities={['clinic:settings:manage']}
          allowedUserTypes={['TENANT_USER', 'PLATFORM_ADMIN']}
          routePath="/settings"
          onNavigateHome={() => setCurrentRoute('/reception/cockpit')}
        >
          <ClinicSettingsEavView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/platform/analytics') {
      return (
        <ProtectedRoute
          allowedRoles={['SUPER_ADMIN']}
          allowedUserTypes={['PLATFORM_ADMIN']}
          requiredAuthorities={['platform:subscriptions:manage']}
          routePath="/platform/analytics"
          onNavigateHome={() => setCurrentRoute('/architecture')}
        >
          <PlatformAnalyticsView />
        </ProtectedRoute>
      );
    }

    if (currentRoute === '/architecture') {
      return <ArchitectureCodeView />;
    }

    // Default fallback
    return <ReceptionCockpitView />;
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Top Bar Contract with 3 zones: Brand, Omnibox, Actions */}
      <TopNavbar
        onOpenOmnibox={() => setOmniboxOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Role-Based Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {renderCurrentView()}
        </main>
      </div>

      {/* Omnibox Modal (Ctrl+K) */}
      <OmniboxModal
        isOpen={omniboxOpen}
        onClose={() => setOmniboxOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
