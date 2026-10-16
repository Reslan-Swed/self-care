import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  ShieldAlert, 
  Edit3, 
  Save, 
  FileText, 
  Clock, 
  CheckCircle2,
  Stethoscope,
  DollarSign
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

export interface PatientDirectoryItem {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  age: string;
  gender: string;
  bloodGroup: string;
  lastVisitDate: string;
  allergies?: string;
  chronicConditions?: string;
  primaryDoctor?: string;
  totalVisits?: number;
  outstandingBalance?: number;
}

interface PatientDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDirectoryItem | null;
  onUpdatePatient?: (updated: PatientDirectoryItem) => void;
  onBookAppointment?: (patient: PatientDirectoryItem) => void;
  onOpenBilling?: (patient: PatientDirectoryItem) => void;
}

export const PatientDetailsDrawer: React.FC<PatientDetailsDrawerProps> = ({
  isOpen,
  onClose,
  patient,
  onUpdatePatient,
  onBookAppointment,
  onOpenBilling
}) => {
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'clinical' | 'billing'>('profile');

  // Form states for editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setPhone(patient.phone);
      setEmail(patient.email);
      setBloodGroup(patient.bloodGroup || 'O+');
      setAllergies(patient.allergies || '');
      setChronicConditions(patient.chronicConditions || '');
      setIsEditing(false);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSaveDemographics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;

    const updated: PatientDirectoryItem = {
      ...patient,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bloodGroup,
      allergies,
      chronicConditions
    };

    if (onUpdatePatient) {
      onUpdatePatient(updated);
    }

    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Demographics Updated',
      message: `Updated patient details for ${updated.firstName} ${updated.lastName} (${updated.mrn}).`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border-s border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-end duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold text-sm">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  {patient.firstName} {patient.lastName}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {patient.age} · {patient.gender} · {patient.bloodGroup}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'البيانات الشخصية' : 'Demographics & Profile'}
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'clinical'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'الملف السريري' : 'Clinical Summary & Alerts'}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'billing'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isRtl ? 'الفواتير والمدفوعات' : 'Billing & Balances'}
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: DEMOGRAPHICS / EDIT FORM */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSaveDemographics} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={patient.dob}
                        disabled
                        className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Demographics</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">File Number (MRN)</span>
                      <span className="font-mono font-bold text-slate-100">{patient.mrn}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Date of Birth & Age</span>
                      <span className="font-mono text-slate-200">{patient.dob} ({patient.age})</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Primary Contact Phone</span>
                      <span className="font-mono font-semibold text-cyan-400">{patient.phone}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-mono text-slate-200">{patient.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Last Recorded Visit</span>
                      <span className="font-mono text-slate-200">{patient.lastVisitDate}</span>
                    </div>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    {onBookAppointment && (
                      <button
                        onClick={() => onBookAppointment(patient)}
                        className="flex-1 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Appointment</span>
                      </button>
                    )}
                    {onOpenBilling && (
                      <button
                        onClick={() => onOpenBilling(patient)}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Open Bill</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLINICAL SUMMARY & ALERTS */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 text-xs">
              {/* Allergy Warning */}
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl space-y-1">
                <div className="font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Documented Clinical Allergies</span>
                </div>
                <p className="text-rose-100 font-medium">
                  {patient.allergies || 'No known drug allergies reported (NKDA).'}
                </p>
              </div>

              {/* Chronic Conditions */}
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <span>Chronic Diagnoses & Medical History</span>
                </div>
                <p className="text-amber-100">
                  {patient.chronicConditions || 'No active chronic diagnoses recorded.'}
                </p>
              </div>

              {/* Physician & Care Team */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-slate-200">Care Team & Specialty</div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Assigned Physician:</span>
                  <span className="font-semibold text-slate-200">{patient.primaryDoctor || 'Dr. Sarah Jenkins, MD'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Lifetime Encounters:</span>
                  <span className="font-mono font-bold text-cyan-400">{patient.totalVisits || 6} encounters</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & BALANCES */}
          {activeTab === 'billing' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Outstanding Balance</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${(patient.outstandingBalance || 0).toFixed(2)}
                  </span>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  ACCOUNT IN GOOD STANDING
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-200">Recent Invoice History</div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-slate-200">INV-2026-894210</div>
                      <div className="text-[10px] text-slate-500 font-mono">2026-10-16 · Consultation & Vitals</div>
                    </div>
                    <div className="text-end">
                      <div className="font-mono font-bold text-slate-100">$185.00</div>
                      <span className="text-[10px] font-mono text-emerald-400">PAID</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                    <div>
                      <div className="font-bold text-slate-200">INV-2025-412093</div>
                      <div className="text-[10px] text-slate-500 font-mono">2025-11-04 · Pediatric Care & Rx</div>
                    </div>
                    <div className="text-end">
                      <div className="font-mono font-bold text-slate-100">$140.00</div>
                      <span className="text-[10px] font-mono text-emerald-400">PAID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsDrawer;
