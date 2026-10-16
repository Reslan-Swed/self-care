import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { PatientDetailsDrawer, PatientDirectoryItem } from './PatientDetailsDrawer';
import { PaymentModal } from '../billing/PaymentModal';

type SortField = 'mrn' | 'name' | 'phone' | 'age' | 'lastVisitDate';
type SortOrder = 'asc' | 'desc';

const INITIAL_DIRECTORY: PatientDirectoryItem[] = [
  {
    id: 'p-1',
    mrn: 'MRN-2026-0842',
    firstName: 'Eleanor',
    lastName: 'Vance',
    phone: '+1-555-019-2831',
    email: 'eleanor.vance@example.com',
    dob: '1988-04-14',
    age: '38y',
    gender: 'FEMALE',
    bloodGroup: 'A+',
    lastVisitDate: '2026-10-16',
    allergies: 'Penicillin (mild hives)',
    chronicConditions: 'Mild intermittent asthma',
    primaryDoctor: 'Dr. Sarah Jenkins, MD',
    totalVisits: 7,
    outstandingBalance: 0
  },
  {
    id: 'p-2',
    mrn: 'MRN-2026-0891',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1-555-234-5678',
    email: 'jane.doe@example.com',
    dob: '2019-04-12',
    age: '7y',
    gender: 'FEMALE',
    bloodGroup: 'O+',
    lastVisitDate: '2026-10-16',
    allergies: 'Severe Penicillin (Anaphylaxis risk)',
    chronicConditions: 'None',
    primaryDoctor: 'Dr. Sarah Jenkins, MD',
    totalVisits: 5,
    outstandingBalance: 185.0
  },
  {
    id: 'p-3',
    mrn: 'MRN-2026-0412',
    firstName: 'Michael',
    lastName: 'Chang',
    phone: '+1-555-839-1029',
    email: 'm.chang@example.com',
    dob: '1975-09-22',
    age: '51y',
    gender: 'MALE',
    bloodGroup: 'B+',
    lastVisitDate: '2026-10-14',
    allergies: 'Sulfa antibiotics',
    chronicConditions: 'Hypertension, Dyslipidemia',
    primaryDoctor: 'Dr. Alexander Vance, MD',
    totalVisits: 12,
    outstandingBalance: 0
  },
  {
    id: 'p-4',
    mrn: 'MRN-2026-0911',
    firstName: 'Amina',
    lastName: 'Mansour',
    phone: '+1-555-728-3920',
    email: 'amina.m@example.com',
    dob: '1992-11-03',
    age: '33y',
    gender: 'FEMALE',
    bloodGroup: 'O-',
    lastVisitDate: '2026-10-09',
    allergies: 'Latex, NSAIDs',
    chronicConditions: 'Atopic dermatitis',
    primaryDoctor: 'Dr. Fatima Zahra, MD',
    totalVisits: 4,
    outstandingBalance: 0
  },
  {
    id: 'p-5',
    mrn: 'MRN-2026-0155',
    firstName: 'David',
    lastName: 'Miller',
    phone: '+1-555-481-9201',
    email: 'david.miller@example.com',
    dob: '1964-06-18',
    age: '62y',
    gender: 'MALE',
    bloodGroup: 'A-',
    lastVisitDate: '2026-09-28',
    allergies: 'None reported',
    chronicConditions: 'Type 2 Diabetes Mellitus',
    primaryDoctor: 'Dr. Sarah Jenkins, MD',
    totalVisits: 9,
    outstandingBalance: 45.0
  },
  {
    id: 'p-6',
    mrn: 'MRN-2026-0312',
    firstName: 'Sarah',
    lastName: 'Al-Mansoor',
    phone: '+1-555-901-4421',
    email: 'sarah.almansoor@example.com',
    dob: '1995-02-28',
    age: '31y',
    gender: 'FEMALE',
    bloodGroup: 'AB+',
    lastVisitDate: '2026-09-15',
    allergies: 'None',
    chronicConditions: 'None',
    primaryDoctor: 'Dr. Fatima Zahra, MD',
    totalVisits: 3,
    outstandingBalance: 0
  },
  {
    id: 'p-7',
    mrn: 'MRN-2026-0567',
    firstName: 'Robert',
    lastName: 'Chen',
    phone: '+1-555-312-8874',
    email: 'robert.chen@example.com',
    dob: '2001-08-19',
    age: '25y',
    gender: 'MALE',
    bloodGroup: 'B-',
    lastVisitDate: '2026-08-30',
    allergies: 'Penicillin',
    chronicConditions: 'Allergic rhinitis',
    primaryDoctor: 'Dr. Alexander Vance, MD',
    totalVisits: 2,
    outstandingBalance: 0
  }
];

export const PatientsDirectoryPage: React.FC = () => {
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [patients, setPatients] = useState<PatientDirectoryItem[]>(INITIAL_DIRECTORY);
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('lastVisitDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Selected Patient Drawer
  const [selectedPatient, setSelectedPatient] = useState<PatientDirectoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Quick Payment Modal Trigger
  const [billingPatient, setBillingPatient] = useState<PatientDirectoryItem | null>(null);

  // New Patient Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDob, setNewDob] = useState('1990-01-01');
  const [newGender, setNewGender] = useState('FEMALE');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');

  // Filtered & Sorted Patients
  const filteredAndSortedPatients = useMemo(() => {
    let result = patients.filter((p) => {
      const q = searchTerm.toLowerCase();
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      if (sortField === 'name') {
        valA = `${a.firstName} ${a.lastName}`;
        valB = `${b.firstName} ${b.lastName}`;
      } else if (sortField === 'mrn') {
        valA = a.mrn;
        valB = b.mrn;
      } else if (sortField === 'phone') {
        valA = a.phone;
        valB = b.phone;
      } else if (sortField === 'age') {
        valA = a.dob; // older dob = older age
        valB = b.dob;
      } else if (sortField === 'lastVisitDate') {
        valA = a.lastVisitDate;
        valB = b.lastVisitDate;
      }

      const comparison = valA.localeCompare(valB);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [patients, searchTerm, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedPatients.length / rowsPerPage));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedPatients.slice(start, start + rowsPerPage);
  }, [filteredAndSortedPatients, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleOpenDrawer = (patient: PatientDirectoryItem) => {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  };

  const handleUpdatePatient = (updated: PatientDirectoryItem) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPatient(updated);
  };

  const handleRegisterNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newPhone.trim()) return;

    const birthYear = new Date(newDob).getFullYear();
    const calculatedAge = `${new Date().getFullYear() - birthYear}y`;

    const newRecord: PatientDirectoryItem = {
      id: `p-${Date.now()}`,
      mrn: `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      phone: newPhone.trim(),
      email: `${newFirstName.toLowerCase()}.${newLastName.toLowerCase()}@example.com`,
      dob: newDob,
      age: calculatedAge,
      gender: newGender,
      bloodGroup: newBloodGroup,
      lastVisitDate: new Date().toISOString().split('T')[0],
      totalVisits: 1,
      outstandingBalance: 0
    };

    setPatients((prev) => [newRecord, ...prev]);
    setShowRegisterModal(false);
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('');

    addToast({
      type: 'success',
      title: 'Patient File Registered',
      message: `Created medical file ${newRecord.mrn} for ${newRecord.firstName} ${newRecord.lastName}.`
    });
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {isRtl ? 'دليل وسجلات المرضى' : 'Patients Directory & Health Records'}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {patients.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, sort, and manage patient files with quick slide-out demographic and clinical drawers.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRtl ? 'تسجيل مريض جديد' : 'New Patient File'}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute start-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, MRN file number, or phone..."
            className="w-full ps-9 pe-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center justify-between sm:justify-end gap-3">
          <span>Showing {paginatedPatients.length} of {filteredAndSortedPatients.length}</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PATIENT DATA TABLE WITH SORTING & PAGINATION                   */}
      {/* ============================================================== */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-start select-none">
                {/* 1. File Number (MRN) */}
                <th 
                  onClick={() => handleSort('mrn')}
                  className="py-3 px-4 font-semibold text-start cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>File Number (MRN)</span>
                    {sortField === 'mrn' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 2. Patient Name */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold text-start cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Patient Name</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 3. Phone */}
                <th 
                  onClick={() => handleSort('phone')}
                  className="py-3 px-4 font-semibold text-start cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phone Number</span>
                    {sortField === 'phone' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 4. Age & Gender */}
                <th 
                  onClick={() => handleSort('age')}
                  className="py-3 px-4 font-semibold text-start cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Age / Gender</span>
                    {sortField === 'age' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 5. Last Visit Date */}
                <th 
                  onClick={() => handleSort('lastVisitDate')}
                  className="py-3 px-4 font-semibold text-start cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Last Visit Date</span>
                    {sortField === 'lastVisitDate' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-4 font-semibold text-end">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((p) => (
                  <tr 
                    key={p.id}
                    onClick={() => handleOpenDrawer(p)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* File Number */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {p.mrn}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{p.firstName} {p.lastName}</span>
                        {p.allergies && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Has documented allergies"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {p.phone}
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4">
                      <span className="text-slate-200">{p.age}</span>
                      <span className="text-slate-500 mx-1">·</span>
                      <span className="text-slate-400">{p.gender}</span>
                    </td>

                    {/* Last Visit */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {p.lastVisitDate}
                    </td>

                    {/* Quick Action Drawer Trigger */}
                    <td className="py-3 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDrawer(p)}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                          title="Open Slide-out Drawer to view or edit"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>View Profile</span>
                        </button>
                        {p.outstandingBalance && p.outstandingBalance > 0 ? (
                          <button
                            onClick={() => setBillingPatient(p)}
                            className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1"
                            title="Open Billing"
                          >
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>${p.outstandingBalance.toFixed(0)}</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Showing Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs rounded border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                  currentPage === pageNum
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs rounded border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* QUICK ACTION DRAWER (VIEW / EDIT WITHOUT LEAVING PAGE)         */}
      {/* ============================================================== */}
      <PatientDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        patient={selectedPatient}
        onUpdatePatient={handleUpdatePatient}
        onOpenBilling={(p) => {
          setIsDrawerOpen(false);
          setBillingPatient(p);
        }}
      />

      {/* Payment Modal */}
      {billingPatient && (
        <PaymentModal
          isOpen={true}
          onClose={() => setBillingPatient(null)}
          patientName={`${billingPatient.firstName} ${billingPatient.lastName}`}
          mrn={billingPatient.mrn}
          appointmentId={`apt-${billingPatient.id}`}
        />
      )}

      {/* New Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {isRtl ? 'تسجيل ملف مريض جديد' : 'Register New Patient File'}
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterNewPatient} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Connor"
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
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
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
                >
                  Create Medical File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsDirectoryPage;
