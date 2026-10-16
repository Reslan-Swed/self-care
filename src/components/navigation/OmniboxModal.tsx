import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, User, FileText, Settings, Shield, Stethoscope, ArrowRight, X } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

interface OmniboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const OmniboxModal: React.FC<OmniboxModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, isRtl } = useLanguageSwitcher();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { id: '/reception/cockpit', title: t.nav.receptionDesk, category: t.nav.sectionOperations, icon: FileText },
    { id: '/calendar', title: t.nav.calendar, category: t.nav.sectionOperations, icon: Calendar },
    { id: '/clinical/workspace/apt-101', title: t.nav.clinicalWorkspace, category: t.nav.sectionClinical, icon: Stethoscope },
    { id: '/patients', title: t.nav.patientsDirectory, category: t.nav.sectionOperations, icon: User },
    { id: '/billing/shifts', title: t.nav.cashRegister, category: t.nav.sectionAdministration, icon: FileText },
    { id: '/settings', title: t.nav.clinicSettings, category: t.nav.sectionAdministration, icon: Settings },
    { id: '/platform/analytics', title: t.nav.platformAnalytics, category: t.nav.sectionPlatform, icon: Shield },
    { id: '/architecture', title: t.nav.architectureInspector, category: 'Engineering & RLS', icon: Shield }
  ];

  const simulatedPatients = [
    { id: 'pat-1', name: 'Eleanor Vance', mrn: 'MRN-2026-0842', phone: '+1-555-019-2831', specialty: 'Pediatrics' },
    { id: 'pat-2', name: 'Michael Chang', mrn: 'MRN-2026-0412', phone: '+1-555-839-1029', specialty: 'Cardiology' },
    { id: 'pat-3', name: 'Amina Mansour', mrn: 'MRN-2026-0911', phone: '+1-555-728-3920', specialty: 'Dermatology' },
    { id: 'pat-4', name: 'David Miller', mrn: 'MRN-2026-0155', phone: '+1-555-481-9201', specialty: 'General' }
  ];

  const filteredLinks = quickLinks.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPatients = query.trim()
    ? simulatedPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.mrn.toLowerCase().includes(query.toLowerCase()) ||
          p.phone.includes(query)
      )
    : [];

  const handleSelect = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Patients Search Matches */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {isRtl ? 'المرضى المطابقون' : 'Matching Patients'}
              </div>
              <div className="space-y-0.5">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelect('/patients')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-start hover:bg-slate-800/80 text-slate-200 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 text-xs font-semibold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-100">{patient.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                          <span>{patient.mrn}</span>
                          <span aria-hidden="true">·</span>
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigation Items */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isRtl ? 'التنقل السريع بين الوحدات' : 'Navigation & Modules'}
            </div>
            <div className="space-y-0.5">
              {filteredLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-start hover:bg-slate-800/80 text-slate-200 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-100">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.category}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                      {item.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredLinks.length === 0 && filteredPatients.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              {t.common.noResults}
            </div>
          )}
        </div>

        {/* Keyboard Footer Hint */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              ESC
            </kbd>
            <span>{isRtl ? 'للإغلاق' : 'to close'}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Ctrl+K
            </kbd>
            <span>{isRtl ? 'لإعادة الفتح' : 'to toggle'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniboxModal;
