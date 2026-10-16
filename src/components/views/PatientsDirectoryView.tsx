import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Calendar, ArrowRight } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface PatientRecord {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  lastVisit: string;
}

export const PatientsDirectoryView: React.FC = () => {
  const { t } = useLanguageSwitcher();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [patients, setPatients] = useState<PatientRecord[]>([
    {
      id: 'p-1',
      mrn: 'MRN-2026-0842',
      firstName: 'Eleanor',
      lastName: 'Vance',
      dob: '1988-04-14',
      gender: 'FEMALE',
      phone: '+1-555-019-2831',
      email: 'eleanor.vance@example.com',
      lastVisit: '2026-10-16'
    },
    {
      id: 'p-2',
      mrn: 'MRN-2026-0891',
      firstName: 'Jane',
      lastName: 'Doe',
      dob: '2019-04-12',
      gender: 'FEMALE',
      phone: '+1-555-234-5678',
      email: 'jane.doe@example.com',
      lastVisit: '2026-10-16'
    },
    {
      id: 'p-3',
      mrn: 'MRN-2026-0412',
      firstName: 'Michael',
      lastName: 'Chang',
      dob: '1975-09-22',
      gender: 'MALE',
      phone: '+1-555-839-1029',
      email: 'm.chang@example.com',
      lastVisit: '2026-10-14'
    },
    {
      id: 'p-4',
      mrn: 'MRN-2026-0911',
      firstName: 'Amina',
      lastName: 'Mansour',
      dob: '1992-11-03',
      gender: 'FEMALE',
      phone: '+1-555-728-3920',
      email: 'amina.m@example.com',
      lastVisit: '2026-10-09'
    },
    {
      id: 'p-5',
      mrn: 'MRN-2026-0155',
      firstName: 'David',
      lastName: 'Miller',
      dob: '1964-06-18',
      gender: 'MALE',
      phone: '+1-555-481-9201',
      email: 'david.miller@example.com',
      lastVisit: '2026-09-28'
    }
  ]);

  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formGender, setFormGender] = useState('FEMALE');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const filteredPatients = patients.filter((p) => {
    const full = `${p.firstName} ${p.lastName} ${p.mrn} ${p.phone}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) return;

    const newRecord: PatientRecord = {
      id: `p-${Date.now()}`,
      mrn: `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      dob: formDob || '1990-01-01',
      gender: formGender,
      phone: formPhone || '+1-555-000-0000',
      email: formEmail || 'patient@example.com',
      lastVisit: 'Never'
    };

    setPatients((prev) => [newRecord, ...prev]);
    setShowRegisterModal(false);
    setFormFirstName('');
    setFormLastName('');
    setFormDob('');
    setFormPhone('');
    setFormEmail('');

    addToast({
      type: 'success',
      title: 'Patient Registered',
      message: `${newRecord.firstName} ${newRecord.lastName} registered with unique MRN ${newRecord.mrn}.`
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.patientsDirectory}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized practice medical record numbers (MRN), demographics, and patient directory.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.common.newPatient}</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name, MRN, or phone number..."
          className="w-full ps-9 pe-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                <th className="py-3 px-4 font-semibold text-start">MRN</th>
                <th className="py-3 px-4 font-semibold text-start">Full Name</th>
                <th className="py-3 px-4 font-semibold text-start">Date of Birth / Gender</th>
                <th className="py-3 px-4 font-semibold text-start">Contact Phone</th>
                <th className="py-3 px-4 font-semibold text-start">Last Recorded Visit</th>
                <th className="py-3 px-4 font-semibold text-end">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-cyan-400">
                    {patient.mrn}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-100">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="font-mono">{patient.dob}</span> · {patient.gender}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {patient.phone}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {patient.lastVisit}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <button
                      onClick={() => addToast({ type: 'info', title: 'Patient Profile', message: `Opening chart for ${patient.firstName} ${patient.lastName}` })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                    >
                      <span>Chart</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100">{t.common.newPatient}</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  Save & Issue MRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsDirectoryView;
