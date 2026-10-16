import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  DollarSign, 
  CheckCircle2, 
  Bell, 
  UserCheck,
  Flame,
  AlertCircle
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { sendWhatsAppNotification } from '../../services/whatsappService';

export interface QueuePatient {
  id: string;
  patientName: string;
  mrn: string;
  phone: string;
  doctorName: string;
  checkInTime: string;
  status: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED';
  reason: string;
  priority?: 'NORMAL' | 'URGENT';
}

export interface ActiveConsultation {
  doctorName: string;
  room: string;
  patientName: string;
  mrn: string;
  appointmentId: string;
  startedAt: Date;
}

interface LiveWaitingQueueProps {
  queue: QueuePatient[];
  activeConsultation: ActiveConsultation | null;
  onCheckInPatient: (patientId: string) => void;
  onCallToDoctor: (patient: QueuePatient) => void;
  onCompleteConsultation: () => void;
  onOpenBilling: (patient: QueuePatient) => void;
}

export const LiveWaitingQueue: React.FC<LiveWaitingQueueProps> = ({
  queue,
  activeConsultation,
  onCheckInPatient,
  onCallToDoctor,
  onCompleteConsultation,
  onOpenBilling
}) => {
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  // Live ticking counter for active consultation
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeConsultation) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - activeConsultation.startedAt.getTime();
      setElapsedSeconds(Math.max(0, Math.floor(diffMs / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeConsultation]);

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWhatsAppClick = async (patient: QueuePatient) => {
    const res = await sendWhatsAppNotification({
      appointmentId: patient.id,
      patientName: patient.patientName,
      phone: patient.phone,
      doctorName: patient.doctorName,
      scheduledTime: 'Today',
      clinicName: 'Metro Health Medical Center'
    }, true);

    addToast({
      type: 'success',
      title: 'WhatsApp Reminder Dispatched',
      message: `Triggered free zero-cost WhatsApp Click-to-Chat reminder to ${patient.phone}.`
    });
  };

  const waitingList = queue.filter(
    (item) => item.status === 'WAITING' || item.status === 'CALLED'
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ============================================================== */}
      {/* TOP SECTION: Current Patient Inside Consultation Room           */}
      {/* ============================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">
              {isRtl ? 'حالة غرفة الكشف الحالية' : 'Active In Consultation'}
            </span>
          </div>
          {activeConsultation && (
            <span className="text-[11px] font-mono text-slate-400">
              {activeConsultation.room}
            </span>
          )}
        </div>

        {activeConsultation ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{activeConsultation.patientName}</span>
                  <span className="text-xs font-mono font-normal text-cyan-400">
                    ({activeConsultation.mrn})
                  </span>
                </h4>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeConsultation.doctorName}</span>
                </div>
              </div>

              {/* Live Elapsed Minutes Counter */}
              <div className="text-end shrink-0">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {isRtl ? 'الوقت المنقضي' : 'Elapsed'}
                </div>
                <div className={`text-lg font-bold font-mono tabular-nums ${elapsedSeconds > 1200 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatElapsed(elapsedSeconds)}
                </div>
              </div>
            </div>

            {/* Quick Consultation Complete / Discharge Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400">
                Examination in progress
              </span>
              <button
                onClick={onCompleteConsultation}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إتمام الكشف وإخلاء الغرفة' : 'Complete Visit ➔ Room Ready'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-1">
            <Stethoscope className="w-5 h-5 opacity-40 mb-1" />
            <span>Consultation room is currently open & ready for next patient.</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BOTTOM SECTION: Live Waiting List Ordered by Check-in Time       */}
      {/* ============================================================== */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              {isRtl ? 'قائمة انتظار العيادة اليوم' : 'Live Clinic Waiting Queue'}
            </h3>
          </div>
          <span className="text-xs font-mono font-medium text-amber-400">
            {waitingList.length} {isRtl ? 'في الانتظار' : 'Waiting'}
          </span>
        </div>

        {/* Scrollable Patient List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {waitingList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No patients currently waiting in the lobby.
            </div>
          ) : (
            waitingList.map((item, index) => {
              const isCalled = item.status === 'CALLED';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isCalled
                      ? 'bg-amber-950/40 border-amber-800/80'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 font-bold">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {item.patientName}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {item.mrn}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="truncate">{item.reason}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                        <span>Check-in: {item.checkInTime}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.doctorName}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isCalled
                            ? 'bg-amber-950 text-amber-300 border-amber-800 font-bold animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* 4 Quick Actions per Patient */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-1.5 flex-wrap">
                    {/* Action 1: Call to Doctor ➔ */}
                    <button
                      onClick={() => onCallToDoctor(item)}
                      className="px-2 py-1 text-[11px] font-semibold rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors flex items-center gap-1"
                      title="Move patient into doctor examination room"
                    >
                      <span>{isRtl ? 'استدعاء للطبيب' : 'Call to Doctor'}</span>
                      <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Action 2: Check-in / Arrived 🟢 */}
                    <button
                      onClick={() => onCheckInPatient(item.id)}
                      className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                      title="Verify lobby presence"
                    >
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>{isRtl ? 'تأكيد الحضور' : 'Check-in 🟢'}</span>
                    </button>

                    {/* Action 3: Free WhatsApp Reminder 💬 */}
                    <button
                      onClick={() => handleWhatsAppClick(item)}
                      className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 transition-colors flex items-center gap-1"
                      title="Free zero-cost WhatsApp reminder via Click-to-Chat URL"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>{isRtl ? 'واتساب' : 'WhatsApp 💬'}</span>
                    </button>

                    {/* Action 4: Open Bill 💳 */}
                    <button
                      onClick={() => onOpenBilling(item)}
                      className="px-2 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                      title="Collect visit payment or print receipt"
                    >
                      <DollarSign className="w-3 h-3 text-amber-400" />
                      <span>{isRtl ? 'الفاتورة' : 'Open Bill 💳'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveWaitingQueue;
