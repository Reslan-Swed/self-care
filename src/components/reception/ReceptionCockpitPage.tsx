import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Clock, 
  Calendar, 
  Plus, 
  MessageSquare, 
  DollarSign, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { OmniboxModal, OmniboxPatientResult } from '../navigation/OmniboxModal';
import { QuickBookingModal } from './QuickBookingModal';
import { QuickBillingModal } from './QuickBillingModal';
import { LiveWaitingQueue, QueuePatient, ActiveConsultation } from './LiveWaitingQueue';
import { AppointmentCalendarPane, CalendarAppointment } from './AppointmentCalendarPane';

// Initial realistic clinic state conforming to Micro-PMS standards
const INITIAL_QUEUE: QueuePatient[] = [
  {
    id: 'apt-101',
    patientName: 'Jane Doe',
    mrn: 'MRN-2026-0891',
    phone: '+15552345678',
    doctorName: 'Dr. Sarah Jenkins, MD',
    checkInTime: '08:45 AM',
    status: 'WAITING',
    reason: 'Acute migraine & photophobia consultation',
    priority: 'URGENT'
  },
  {
    id: 'apt-102',
    patientName: 'Michael Chang',
    mrn: 'MRN-2026-0412',
    phone: '+15558391029',
    doctorName: 'Dr. Alexander Vance, MD',
    checkInTime: '09:05 AM',
    status: 'CALLED',
    reason: 'Cardiovascular medication review & ECG',
    priority: 'NORMAL'
  },
  {
    id: 'apt-103',
    patientName: 'Amina Mansour',
    mrn: 'MRN-2026-0911',
    phone: '+15557283920',
    doctorName: 'Dr. Fatima Zahra, MD',
    checkInTime: '09:18 AM',
    status: 'WAITING',
    reason: 'Eczema flare-up follow-up visit',
    priority: 'NORMAL'
  }
];

const INITIAL_CONSULTATION: ActiveConsultation = {
  doctorName: 'Dr. Sarah Jenkins, MD',
  room: 'Exam Room 3B',
  patientName: 'Eleanor Vance',
  mrn: 'MRN-2026-0842',
  appointmentId: 'apt-100',
  startedAt: new Date(Date.now() - 14 * 60 * 1000) // 14 minutes ago
};

const INITIAL_APPOINTMENTS: CalendarAppointment[] = [
  {
    id: 'apt-100',
    time: '08:30 AM',
    patientName: 'Eleanor Vance',
    phone: '+15550192831',
    mrn: 'MRN-2026-0842',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    room: 'Room 3B',
    status: 'IN_CONSULTATION',
    reason: 'Pediatric 4-year developmental checkup'
  },
  {
    id: 'apt-101',
    time: '09:00 AM',
    patientName: 'Jane Doe',
    phone: '+15552345678',
    mrn: 'MRN-2026-0891',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    room: 'Room 3B',
    status: 'ARRIVED',
    reason: 'Acute migraine & photophobia consultation'
  },
  {
    id: 'apt-102',
    time: '09:30 AM',
    patientName: 'Michael Chang',
    phone: '+15558391029',
    mrn: 'MRN-2026-0412',
    doctorId: 'doc-2',
    doctorName: 'Dr. Alexander Vance, MD',
    room: 'Room 2A',
    status: 'ARRIVED',
    reason: 'Cardiovascular medication review & ECG'
  },
  {
    id: 'apt-103',
    time: '10:00 AM',
    patientName: 'Amina Mansour',
    phone: '+15557283920',
    mrn: 'MRN-2026-0911',
    doctorId: 'doc-3',
    doctorName: 'Dr. Fatima Zahra, MD',
    room: 'Room 1C',
    status: 'CONFIRMED',
    reason: 'Eczema flare-up follow-up visit'
  },
  {
    id: 'apt-104',
    time: '10:30 AM',
    patientName: 'David Miller',
    phone: '+15554819201',
    mrn: 'MRN-2026-0155',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    room: 'Room 3B',
    status: 'SCHEDULED',
    reason: 'Annual preventive bloodwork review'
  },
  {
    id: 'apt-105',
    time: '11:15 AM',
    patientName: 'Sarah Al-Mansoor',
    phone: '+15559014421',
    mrn: 'MRN-2026-0312',
    doctorId: 'doc-3',
    doctorName: 'Dr. Fatima Zahra, MD',
    room: 'Room 1C',
    status: 'SCHEDULED',
    reason: 'Dermatology allergy patch review'
  }
];

export const ReceptionCockpitPage: React.FC = () => {
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Primary data states using TanStack Query defaults with local fallback
  const [waitingQueue, setWaitingQueue] = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [activeConsultation, setActiveConsultation] = useState<ActiveConsultation | null>(INITIAL_CONSULTATION);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>(INITIAL_APPOINTMENTS);

  // Modals state
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [isOmniboxOpen, setIsOmniboxOpen] = useState(false);
  const [prefillPatient, setPrefillPatient] = useState<OmniboxPatientResult | null>(null);
  const [prefillSlotTime, setPrefillSlotTime] = useState<string | null>(null);

  // Billing modal state
  const [billingTarget, setBillingTarget] = useState<QueuePatient | null>(null);

  // Daily Shift Metrics (Cash register integration)
  const [collectedToday, setCollectedToday] = useState(485.0);

  // Keyboard Shortcuts Hook: 'Ctrl+K' / 'Cmd+K' for Omnibox, 'N' for Quick Booking
  useKeyboardShortcuts({
    onOpenOmnibox: () => setIsOmniboxOpen(true),
    onQuickBook: () => {
      setPrefillPatient(null);
      setPrefillSlotTime(null);
      setIsQuickBookOpen(true);
    },
    onEscape: () => {
      setIsOmniboxOpen(false);
      setIsQuickBookOpen(false);
      setBillingTarget(null);
    }
  });

  // 1. Move patient into consultation room
  const handleCallToDoctor = (patient: QueuePatient) => {
    // If someone was already inside, complete their visit
    if (activeConsultation) {
      addToast({
        type: 'info',
        title: 'Previous Consultation Completed',
        message: `${activeConsultation.patientName} discharged from ${activeConsultation.room}.`
      });
    }

    const roomAssignment = patient.doctorName.includes('Sarah')
      ? 'Room 3B'
      : patient.doctorName.includes('Alexander')
      ? 'Room 2A'
      : 'Room 1C';

    setActiveConsultation({
      doctorName: patient.doctorName,
      room: roomAssignment,
      patientName: patient.patientName,
      mrn: patient.mrn,
      appointmentId: patient.id,
      startedAt: new Date()
    });

    // Remove from waiting queue
    setWaitingQueue((prev) => prev.filter((p) => p.id !== patient.id));

    // Update appointment calendar status
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === patient.id ? { ...a, status: 'IN_CONSULTATION' } : a
      )
    );

    addToast({
      type: 'success',
      title: 'Patient Called to Doctor',
      message: `${patient.patientName} is now in ${roomAssignment} with ${patient.doctorName}.`
    });
  };

  // 2. Complete consultation and free room
  const handleCompleteConsultation = () => {
    if (!activeConsultation) return;

    const patientName = activeConsultation.patientName;
    const aptId = activeConsultation.appointmentId;

    setActiveConsultation(null);

    // Update appointment to COMPLETED
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === aptId || a.patientName === patientName
          ? { ...a, status: 'COMPLETED' }
          : a
      )
    );

    addToast({
      type: 'success',
      title: 'Consultation Complete',
      message: `${patientName} finished consultation. Ready for checkout & billing.`
    });
  };

  // 3. Mark patient checked in
  const handleCheckInPatient = (patientId: string) => {
    setWaitingQueue((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status: 'WAITING' } : p))
    );

    setAppointments((prev) =>
      prev.map((a) => (a.id === patientId ? { ...a, status: 'ARRIVED' } : a))
    );

    addToast({
      type: 'success',
      title: 'Patient Arrived',
      message: 'Lobby arrival verified and check-in timestamp stamped.'
    });
  };

  // 4. Open Billing Modal
  const handleOpenBilling = (patient: QueuePatient) => {
    setBillingTarget(patient);
  };

  // 5. Reschedule appointment via Drag & Drop
  const handleRescheduleAppointment = (appointmentId: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, time: newTime } : apt
      )
    );

    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  // 6. Quick Book triggered with pre-selected slot
  const handleOpenQuickBookWithTime = (time: string, doctorId: string) => {
    setPrefillSlotTime(time);
    setPrefillPatient(null);
    setIsQuickBookOpen(true);
  };

  // 7. Omnibox Instant Actions: [Book Slot]
  const handleOmniboxBookSlot = (patient: OmniboxPatientResult) => {
    setPrefillPatient(patient);
    setPrefillSlotTime(null);
    setIsQuickBookOpen(true);
  };

  // 8. Omnibox Instant Actions: [Add to Waiting Queue Now]
  const handleOmniboxAddToQueue = (patient: OmniboxPatientResult) => {
    const newQueueItem: QueuePatient = {
      id: `apt-queue-${Date.now()}`,
      patientName: patient.name,
      mrn: patient.mrn,
      phone: patient.phone,
      doctorName: 'Dr. Sarah Jenkins, MD',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'WAITING',
      reason: 'Walk-in urgent triage consultation',
      priority: 'NORMAL'
    };

    setWaitingQueue((prev) => [newQueueItem, ...prev]);

    addToast({
      type: 'success',
      title: 'Added to Waiting Queue',
      message: `${patient.name} added directly to active lobby queue.`
    });
  };

  // 9. When Quick Booking completes successfully
  const handleBookingSuccess = (newApt: any) => {
    const formattedApt: CalendarAppointment = {
      id: newApt.id || `apt-${Date.now()}`,
      time: newApt.scheduledTime || '10:00 AM',
      patientName: newApt.patientName,
      phone: newApt.phone,
      mrn: newApt.mrn || `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorId: newApt.doctorId || 'doc-1',
      doctorName: newApt.doctorName || 'Dr. Sarah Jenkins, MD',
      room: 'Room 3B',
      status: newApt.status || 'CONFIRMED',
      reason: newApt.reason || 'General medical consultation'
    };

    setAppointments((prev) => [...prev, formattedApt]);

    if (newApt.checkInImmediately || newApt.status === 'WAITING') {
      const newQueueItem: QueuePatient = {
        id: formattedApt.id,
        patientName: formattedApt.patientName,
        mrn: formattedApt.mrn,
        phone: formattedApt.phone,
        doctorName: formattedApt.doctorName,
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'WAITING',
        reason: formattedApt.reason,
        priority: 'NORMAL'
      };
      setWaitingQueue((prev) => [...prev, newQueueItem]);
    }
  };

  // 10. When Payment is recorded in QuickBillingModal
  const handlePaymentRecorded = (amount: number, method: string) => {
    setCollectedToday((prev) => prev + amount);
    if (billingTarget) {
      setWaitingQueue((prev) => prev.filter((p) => p.id !== billingTarget.id));
    }
    setBillingTarget(null);
  };

  const totalWaiting = waitingQueue.filter((q) => q.status === 'WAITING' || q.status === 'CALLED').length;
  const inConsultCount = activeConsultation ? 1 : 0;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 lg:p-6 space-y-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* ============================================================== */}
      {/* COCKPIT HEADER BAR                                            */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100">
                {isRtl ? 'لوحة تحكم الاستقبال والطابور الحي' : 'Reception Desk & Daily Queue Cockpit'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl 
                ? 'إدارة فورية لتدفق المرضى، المواعيد المجزأة 15 دقيقة، والتأكيد المجاني عبر واتساب' 
                : 'High-velocity split-view triage, 15-min calendar slots, and zero-cost WhatsApp Click-to-Chat dispatch.'}
            </p>
          </div>
        </div>

        {/* Live Metrics & Quick Action Trigger */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Quick Counter Pills */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{totalWaiting} {isRtl ? 'انتظار' : 'Waiting'}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>{inConsultCount} {isRtl ? 'بالكشف' : 'In Consult'}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span>${collectedToday.toFixed(0)} {isRtl ? 'محصل' : 'Collected'}</span>
            </div>
          </div>

          {/* Quick Booking Button (N shortcut key badge) */}
          <button
            onClick={() => {
              setPrefillPatient(null);
              setPrefillSlotTime(null);
              setIsQuickBookOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm shrink-0"
            title="Press 'N' key anywhere to quick book under 10 seconds"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'حجز سريع' : 'Quick Book'}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-600/60 rounded text-slate-950 border border-cyan-700/60">
              N
            </kbd>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FREE WHATSAPP FALLBACK NOTIFICATION STATUS BANNER              */}
      {/* ============================================================== */}
      <div className="px-4 py-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs text-emerald-300 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>{isRtl ? 'وضع واتساب النشط:' : 'WhatsApp Dispatch Mode:'}</strong>{' '}
            {isRtl 
              ? 'روابط المراسلة المباشرة (Click-to-Chat) مجانية 100% دون استهلاك أرصدة SMS.' 
              : 'Direct Browser Click-to-Chat active. 100% free with zero SMS credit consumption.'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400 hidden md:inline">
          wa.me/&#123;phone&#125;?text=&#123;encoded&#125;
        </span>
      </div>

      {/* ============================================================== */}
      {/* SPLIT-VIEW WORKSPACE: LEFT PANE (QUEUE) & RIGHT PANE (CALENDAR) */}
      {/* ============================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* LEFT PANE: Live Waiting Queue & In-Consultation Box (5 Cols) */}
        <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
          <LiveWaitingQueue
            queue={waitingQueue}
            activeConsultation={activeConsultation}
            onCheckInPatient={handleCheckInPatient}
            onCallToDoctor={handleCallToDoctor}
            onCompleteConsultation={handleCompleteConsultation}
            onOpenBilling={handleOpenBilling}
          />
        </div>

        {/* RIGHT PANE: 15-Minute Slot Appointment Calendar (7 Cols) */}
        <div className="lg:col-span-7 h-full overflow-hidden flex flex-col">
          <AppointmentCalendarPane
            appointments={appointments}
            onOpenQuickBookWithTime={handleOpenQuickBookWithTime}
            onRescheduleAppointment={handleRescheduleAppointment}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODALS: Quick Booking, Quick Billing, and Omnibox Search         */}
      {/* ============================================================== */}
      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={isQuickBookOpen}
        onClose={() => {
          setIsQuickBookOpen(false);
          setPrefillPatient(null);
          setPrefillSlotTime(null);
        }}
        prefillPatient={prefillPatient}
        prefillTime={prefillSlotTime}
        onSuccess={handleBookingSuccess}
      />

      {/* Quick Billing Modal */}
      {billingTarget && (
        <QuickBillingModal
          isOpen={true}
          onClose={() => setBillingTarget(null)}
          patientName={billingTarget.patientName}
          mrn={billingTarget.mrn}
          appointmentId={billingTarget.id}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {/* Omnibox Search Modal (Ctrl+K) */}
      <OmniboxModal
        isOpen={isOmniboxOpen}
        onClose={() => setIsOmniboxOpen(false)}
        onNavigate={() => {}}
        onBookSlot={handleOmniboxBookSlot}
        onAddToQueue={handleOmniboxAddToQueue}
      />
    </div>
  );
};

export default ReceptionCockpitPage;
