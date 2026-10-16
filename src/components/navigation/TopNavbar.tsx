import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronDown, Check, UserCheck, Shield, Stethoscope, Building2, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { UserRole } from '../../types/auth';

interface TopNavbarProps {
  onOpenOmnibox: () => void;
  onToggleSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenOmnibox }) => {
  const { user, tenant, role, switchRole, logout } = useAuth();
  const { language, toggleLanguage, t, isRtl } = useLanguageSwitcher();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Connection status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; label: string; icon: any }[] = [
    { role: 'RECEPTIONIST', label: t.roles.RECEPTIONIST, icon: UserCheck },
    { role: 'DOCTOR', label: t.roles.DOCTOR, icon: Stethoscope },
    { role: 'CLINIC_ADMIN', label: t.roles.CLINIC_ADMIN, icon: Building2 },
    { role: 'SUPER_ADMIN', label: t.roles.SUPER_ADMIN, icon: Shield }
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Zone 1: Clinic Brand Wordmark & Tenancy Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-slate-100 whitespace-nowrap">
              {tenant ? tenant.name : 'SaaS Control Plane'}
            </span>
            {tenant?.specialty && (
              <span className="text-[10px] text-cyan-400 font-mono hidden sm:inline">
                ({tenant.specialty})
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 leading-none">
            {tenant ? `${tenant.slug}.micropms.io` : 'superadmin.micropms.io'}
          </span>
        </div>
      </div>

      {/* Zone 2: Omnibox Quick Search Bar (Ctrl+K trigger) */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenOmnibox}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
            <span className="truncate">{t.common.searchPlaceholder}</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded shrink-0">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Zone 3: Connection Status, Language Switcher, and User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenOmnibox}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Live Connection Status Badge (Online 🟢 / Offline 🔴) */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-colors ${
            isOnline
              ? 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/70 border-rose-800/80 text-rose-300'
          }`}
          title={isOnline ? t.common.connectionLive : t.common.connectionLost}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">{t.common.online}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">{t.common.offline}</span>
            </>
          )}
        </div>

        {/* Dual-Language RTL Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          title={language === 'en' ? 'تبديل إلى العربية (RTL)' : 'Switch to English (LTR)'}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-xs">{language === 'en' ? 'العربية' : 'EN'}</span>
        </button>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 text-start rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-300 text-xs font-semibold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {user?.fullName || 'Clinic Staff'}
              </div>
              <div className="text-[10px] text-slate-400">
                {role ? t.roles[role] : 'Staff'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
          </button>

          {/* Profile Dropdown Popover */}
          {profileMenuOpen && (
            <div 
              className={`absolute top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl z-50 p-2 text-xs divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100 ${
                isRtl ? 'start-0' : 'end-0'
              }`}
            >
              {/* Account Header */}
              <div className="p-3">
                <div className="font-semibold text-slate-100">{user?.fullName}</div>
                <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {role ? t.roles[role] : ''}
                </div>
              </div>

              {/* Security Authorities Count */}
              <div className="p-2.5 text-slate-400 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Authorities Granted:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{user?.authorities.length || 0}</span>
                </div>
              </div>

              {/* Interactive Staff Role Switcher for Demonstration */}
              <div className="p-2">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t.roles.switchRole}
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((item) => {
                    const Icon = item.icon;
                    const isActive = role === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-start transition-colors ${
                          isActive
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Option */}
              <div className="p-1">
                <button
                  onClick={() => {
                    logout();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-start px-3 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
                >
                  {t.common.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
