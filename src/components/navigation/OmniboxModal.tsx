import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  FileText, 
  Settings, 
  Shield, 
  Stethoscope, 
  X, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

export interface OmniboxPatientResult {
  id: string;
  name: string;
  mrn: string;
  phone: string;
  dob?: string;
  specialty?: string;
}

interface OmniboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onBookSlot?: (patient: OmniboxPatientResult) => void;
  onAddToQueue?: (patient: OmniboxPatientResult) => void;
}

export const OmniboxModal: React.FC<OmniboxModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onBookSlot,
  onAddToQueue
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, isRtl } = useLanguageSwitcher();

  // 200ms Debounce as specified in requirements
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Master clinic directory for instant patient search
  const patientDirectory: OmniboxPatientResult[] = [
    { id: 'pat-1', name: 'Eleanor Vance', mrn: 'MRN-2026-0842', phone: '+1-555-019-2831', dob: '1988-04-14', specialty: 'Pediatrics' },
    { id: 'pat-2', name: 'Jane Doe', mrn: 'MRN-2026-0891', phone: '+1-555-234-5678', dob: '2019-04-12', specialty: 'Pediatrics' },
    { id: 'pat-3', name: 'Michael Chang', mrn: 'MRN-2026-0412', phone: '+1-555-839-1029', dob: '1975-09-22', specialty: 'Cardiology' },
    { id: 'pat-4', name: 'Amina Mansour', mrn: 'MRN-2026-0911', phone: '+1-555-728-3920', dob: '1992-11-03', specialty: 'Dermatology' },
    { id: 'pat-5', name: 'David Miller', mrn: 'MRN-2026-0155', phone: '+1-555-481-9201', dob: '1964-06-18', specialty: 'General' },
    { id: 'pat-6', name: 'Sarah Al-Mansoor', mrn: 'MRN-2026-0312', phone: '+1-555-901-4421', dob: '1995-02-28', specialty: 'General' },
    { id: 'pat-7', name: 'Robert Chen', mrn: 'MRN-2026-0567', phone: '+1-555-312-8874', dob: '2001-08-19', specialty: 'Pediatrics' }
  ];

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

  const filteredPatients = debouncedQuery.trim()
    ? patientDirectory.filter((p) => {
        const target = `${p.name} ${p.phone} ${p.mrn}`.toLowerCase();
        return target.includes(debouncedQuery.toLowerCase());
      })
    : [];

  const filteredLinks = quickLinks.filter((item) =>
    item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const handleActionBookSlot = (patient: OmniboxPatientResult) => {
    if (onBookSlot) {
      onBookSlot(patient);
    }
    onClose();
  };

  const handleActionAddToQueue = (patient: OmniboxPatientResult) => {
    if (onAddToQueue) {
      onAddToQueue(patient);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث بالاسم أو رقم الهاتف أو الرقم الطبي (MRN)...' : 'Search patient by name, phone (+1-555-...), or MRN...'}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[28rem] overflow-y-auto p-3 space-y-4">
          {/* Patient Search Results with Instant Dual Actions */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                <span>{isRtl ? 'المرضى الذين تم العثور عليهم' : 'Patients Found'} ({filteredPatients.length})</span>
                <span className="text-[10px] text-slate-500 font-mono">200ms debounced</span>
              </div>
              <div className="space-y-1.5 mt-1">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    {/* Patient Summary */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 text-xs font-bold shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                          <span className="truncate">{patient.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-normal">
                            ({patient.mrn})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{patient.phone}</span>
                          {patient.specialty && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-500">{patient.specialty}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* TWO Instant Actions per patient: [Book Slot] or [Add to Waiting Queue Now] */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleActionBookSlot(patient)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                        title="Open Quick Booking modal for this patient"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isRtl ? 'حجز موعد' : 'Book Slot'}</span>
                      </button>

                      <button
                        onClick={() => handleActionAddToQueue(patient)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm"
                        title="Instantly add patient to today's active waiting queue"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'إضافة للانتظار فوراً' : 'Add to Queue Now'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module Navigation Jump Links */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {isRtl ? 'التنقل السريع بين الشاشات' : 'Navigation & Workspaces'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
              {filteredLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg text-start hover:bg-slate-800/70 text-slate-300 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.category}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {filteredPatients.length === 0 && filteredLinks.length === 0 && (
            <div className="py-10 text-center text-xs text-slate-500">
              {t.common.noResults}
            </div>
          )}
        </div>

        {/* Omnibox Footer Shortcut Indicator */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                N
              </kbd>
              <span>{isRtl ? 'حجز سريع' : 'Quick Booking'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                ESC
              </kbd>
              <span>{isRtl ? 'إغلاق' : 'Close'}</span>
            </span>
          </div>
          <div className="font-mono text-[10px] text-cyan-400">
            Micro-PMS High-Velocity Desk
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniboxModal;
