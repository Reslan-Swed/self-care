import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  Send, 
  ExternalLink, 
  Phone, 
  FileText,
  UserCheck
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface QueueItem {
  id: string;
  patientName: string;
  mrn: string;
  phone: string;
  doctorName: string;
  scheduledTime: string;
  waitTimeMins: number;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';
  reason: string;
}

export const ReceptionCockpitView: React.FC = () => {
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [queue, setQueue] = useState<QueueItem[]>([
    {
      id: 'apt-101',
      patientName: 'Jane Doe',
      mrn: 'MRN-2026-0891',
      phone: '+15552345678',
      doctorName: 'Dr. Sarah Jenkins, MD',
      scheduledTime: '09:00 AM',
      waitTimeMins: 14,
      status: 'WAITING',
      reason: 'Acute migraine consultation'
    },
    {
      id: 'apt-102',
      patientName: 'Michael Chang',
      mrn: 'MRN-2026-0412',
      phone: '+15558391029',
      doctorName: 'Dr. Sarah Jenkins, MD',
      scheduledTime: '09:30 AM',
      waitTimeMins: 2,
      status: 'IN_CONSULTATION',
      reason: 'Hypertension routine follow-up'
    },
    {
      id: 'apt-103',
      patientName: 'Eleanor Vance',
      mrn: 'MRN-2026-0842',
      phone: '+15550192831',
      doctorName: 'Dr. Sarah Jenkins, MD',
      scheduledTime: '08:30 AM',
      waitTimeMins: 0,
      status: 'COMPLETED',
      reason: 'Pediatric wellness exam'
    }
  ]);

  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('');

  const waitingCount = queue.filter((q) => q.status === 'WAITING').length;
  const inConsultCount = queue.filter((q) => q.status === 'IN_CONSULTATION').length;
  const completedCount = queue.filter((q) => q.status === 'COMPLETED').length;

  const handleUpdateStatus = (id: string, newStatus: QueueItem['status']) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    addToast({
      type: 'info',
      title: 'Queue Status Updated',
      message: `Patient appointment status changed to ${newStatus}.`
    });
  };

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPhone.trim()) return;

    const newItem: QueueItem = {
      id: `apt-${Date.now()}`,
      patientName: newPatientName.trim(),
      mrn: `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: newPhone.trim(),
      doctorName: 'Dr. Sarah Jenkins, MD',
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitTimeMins: 0,
      status: 'WAITING',
      reason: newReason || 'General checkup'
    };

    setQueue((prev) => [newItem, ...prev]);
    setShowQuickBookModal(false);
    setNewPatientName('');
    setNewPhone('');
    setNewReason('');

    addToast({
      type: 'success',
      title: 'Appointment Booked',
      message: `Added ${newItem.patientName} directly to today's active waiting queue.`
    });
  };

  const handleSendWhatsApp = (item: QueueItem) => {
    const text = encodeURIComponent(
      `Hello ${item.patientName}, your appointment at Metro Health with ${item.doctorName} is confirmed for ${item.scheduledTime}.`
    );
    const url = `https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    addToast({
      type: 'success',
      title: 'WhatsApp Link Generated',
      message: 'Click-to-Chat window launched. Zero credit consumed.'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.receptionDesk}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time patient check-in, lobby queue progression, and dual-mode appointment messaging.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowQuickBookModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.common.quickBook}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Single-Elevation, anti-pill discipline) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">{t.cockpit.waitingPatients}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
              {waitingCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">{t.cockpit.inConsultation}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
              {inConsultCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">{t.cockpit.completedToday}</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              {completedCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Today's Queue Data Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              {t.cockpit.todayQueue}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {queue.length} Total Patients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-start">
                <th className="py-3 px-4 font-semibold text-start">Patient Details</th>
                <th className="py-3 px-4 font-semibold text-start">Doctor Assigned</th>
                <th className="py-3 px-4 font-semibold text-start">Schedule & Wait</th>
                <th className="py-3 px-4 font-semibold text-start">Reason for Visit</th>
                <th className="py-3 px-4 font-semibold text-start">Status & Actions</th>
                <th className="py-3 px-4 font-semibold text-end">Messaging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Patient Name & MRN */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{item.patientName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.mrn}</div>
                  </td>

                  {/* Doctor */}
                  <td className="py-3 px-4 text-slate-300">
                    <div>{item.doctorName}</div>
                  </td>

                  {/* Schedule */}
                  <td className="py-3 px-4 font-mono">
                    <div className="tabular-nums text-slate-200">{item.scheduledTime}</div>
                    <div className="text-[11px] text-slate-500">Wait: {item.waitTimeMins}m</div>
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                    {item.reason}
                  </td>

                  {/* Queue Status Transitions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.status === 'WAITING' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'IN_CONSULTATION')}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 hover:bg-amber-900 transition-colors"
                        >
                          Send to Doctor
                        </button>
                      )}
                      {item.status === 'IN_CONSULTATION' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900 transition-colors"
                        >
                          Complete Visit
                        </button>
                      )}
                      {item.status === 'COMPLETED' && (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Discharged</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dual-Mode WhatsApp Dispatch */}
                  <td className="py-3 px-4 text-end">
                    <button
                      onClick={() => handleSendWhatsApp(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-md transition-colors"
                      title="Send WhatsApp confirmation via Click-to-Chat URL"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Book Modal */}
      {showQuickBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100">
                {t.common.quickBook}
              </h3>
              <button
                onClick={() => setShowQuickBookModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickBook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Fever and persistent sore throat"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickBookModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  Check In Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionCockpitView;
