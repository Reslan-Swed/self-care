import React from 'react';
import { 
  FileText, 
  Calendar, 
  Stethoscope, 
  Users, 
  DollarSign, 
  Settings, 
  ShieldAlert, 
  Code2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemConfig {
  id: string;
  titleKey: 'receptionDesk' | 'calendar' | 'clinicalWorkspace' | 'patientsDirectory' | 'cashRegister' | 'clinicSettings' | 'platformAnalytics' | 'architectureInspector';
  sectionKey: 'sectionOperations' | 'sectionClinical' | 'sectionAdministration' | 'sectionPlatform';
  icon: any;
  allowedRoles: ('RECEPTIONIST' | 'DOCTOR' | 'CLINIC_ADMIN' | 'SUPER_ADMIN')[];
  requiredAuthority?: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const { role, hasAuthority } = useAuth();
  const { t, isRtl } = useLanguageSwitcher();

  const navItems: NavItemConfig[] = [
    // 1. Reception Desk & Queue -> for RECEPTIONIST, CLINIC_ADMIN
    {
      id: '/reception/cockpit',
      titleKey: 'receptionDesk',
      sectionKey: 'sectionOperations',
      icon: FileText,
      allowedRoles: ['RECEPTIONIST', 'CLINIC_ADMIN', 'SUPER_ADMIN'],
      badge: 'Live'
    },
    // 2. Calendar & Appointments -> for RECEPTIONIST, DOCTOR, CLINIC_ADMIN
    {
      id: '/calendar',
      titleKey: 'calendar',
      sectionKey: 'sectionOperations',
      icon: Calendar,
      allowedRoles: ['RECEPTIONIST', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']
    },
    // 3. Clinical Workspace -> for DOCTOR
    {
      id: '/clinical/workspace/apt-101',
      titleKey: 'clinicalWorkspace',
      sectionKey: 'sectionClinical',
      icon: Stethoscope,
      allowedRoles: ['DOCTOR', 'SUPER_ADMIN'],
      requiredAuthority: 'encounter:clinical:read'
    },
    // 4. Patients Directory -> for RECEPTIONIST, DOCTOR, CLINIC_ADMIN
    {
      id: '/patients',
      titleKey: 'patientsDirectory',
      sectionKey: 'sectionOperations',
      icon: Users,
      allowedRoles: ['RECEPTIONIST', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']
    },
    // 5. Cash Register & Daily Shifts -> for RECEPTIONIST, CLINIC_ADMIN
    {
      id: '/billing/shifts',
      titleKey: 'cashRegister',
      sectionKey: 'sectionAdministration',
      icon: DollarSign,
      allowedRoles: ['RECEPTIONIST', 'CLINIC_ADMIN', 'SUPER_ADMIN'],
      badge: 'Drawer'
    },
    // 6. Clinic Settings & EAV Schema -> for CLINIC_ADMIN
    {
      id: '/settings',
      titleKey: 'clinicSettings',
      sectionKey: 'sectionAdministration',
      icon: Settings,
      allowedRoles: ['CLINIC_ADMIN', 'SUPER_ADMIN'],
      requiredAuthority: 'clinic:settings:manage'
    },
    // 7. Platform Analytics (SaaS Control Plane) -> for SUPER_ADMIN
    {
      id: '/platform/analytics',
      titleKey: 'platformAnalytics',
      sectionKey: 'sectionPlatform',
      icon: ShieldAlert,
      allowedRoles: ['SUPER_ADMIN'],
      requiredAuthority: 'platform:subscriptions:manage'
    },
    // 8. Architecture & Code Inspector -> for ALL
    {
      id: '/architecture',
      titleKey: 'architectureInspector',
      sectionKey: 'sectionAdministration',
      icon: Code2,
      allowedRoles: ['RECEPTIONIST', 'DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN']
    }
  ];

  // Filter items by active role and authorities
  const visibleItems = navItems.filter((item) => {
    if (!role) return false;
    const roleAllowed = item.allowedRoles.includes(role);
    if (!roleAllowed) return false;
    if (item.requiredAuthority && !hasAuthority(item.requiredAuthority)) {
      return false;
    }
    return true;
  });

  // Group visible items by section
  const sections: { key: NavItemConfig['sectionKey']; label: string; items: NavItemConfig[] }[] = [
    {
      key: 'sectionOperations',
      label: t.nav.sectionOperations,
      items: visibleItems.filter((i) => i.sectionKey === 'sectionOperations')
    },
    {
      key: 'sectionClinical',
      label: t.nav.sectionClinical,
      items: visibleItems.filter((i) => i.sectionKey === 'sectionClinical')
    },
    {
      key: 'sectionAdministration',
      label: t.nav.sectionAdministration,
      items: visibleItems.filter((i) => i.sectionKey === 'sectionAdministration')
    },
    {
      key: 'sectionPlatform',
      label: t.nav.sectionPlatform,
      items: visibleItems.filter((i) => i.sectionKey === 'sectionPlatform')
    }
  ].filter((s) => s.items.length > 0) as { key: NavItemConfig['sectionKey']; label: string; items: NavItemConfig[] }[];

  return (
    <aside
      className={`bg-slate-900/60 border-e border-slate-800 flex flex-col shrink-0 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-500 font-mono">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id || (item.id !== '/reception/cockpit' && currentRoute.startsWith(item.id));
                const label = t.nav[item.titleKey];

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-start ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        {!collapsed && (
          <div className="flex items-center gap-2 truncate text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="truncate">{role}</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
