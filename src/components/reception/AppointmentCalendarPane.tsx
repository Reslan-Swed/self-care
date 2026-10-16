import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  Send, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Move
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { DOCTOR_OPTIONS, TIME_SLOTS_15MIN } from './QuickBookingModal';
import { sendWhatsAppNotification } from '../../services/whatsappService';

export interface CalendarAppointment {
  id: string;
  time: string;
  patientName: string;
  phone: string;
  mrn: string;
  doctorId: string;
  doctorName: string;
  room: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'ARRIVED' | 'IN_CONSULTATION' | 'COMPLETED';
  reason: string;
}

interface AppointmentCalendarPaneProps {
  appointments: CalendarAppointment[];
  onOpenQuickBookWithTime: (time: string, doctorId: string) => void;
  onRescheduleAppointment: (appointmentId: string, newTime: string) => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export const AppointmentCalendarPane: React.FC<AppointmentCalendarPaneProps> = ({
  appointments,
  onOpenQuickBookWithTime,
  onRescheduleAppointment,
  onAppointmentClick
}) => {
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [draggedAptId, setDraggedAptId] = useState<string | null>(null);

  // Filter appointments by doctor
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDoctorId === 'all') return true;
    return apt.doctorId === selectedDoctorId;
  });

  const getAppointmentForSlot = (slot: string) => {
    return filteredAppointments.find((a) => a.time === slot);
  };

  const handleDragStart = (e: React.DragEvent, aptId: string) => {
    setDraggedAptId(aptId);
    e.dataTransfer.setData('text/plain', aptId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTime: string) => {
    e.preventDefault();
    const aptId = draggedAptId || e.dataTransfer.getData('text/plain');
    if (aptId) {
      onRescheduleAppointment(aptId, targetTime);
      setDraggedAptId(null);
      addToast({
        type: 'success',
        title: 'Appointment Rescheduled',
        message: `Appointment moved to slot ${targetTime}.`
      });
    }
  };

  const handleSendReminder = async (e: React.MouseEvent, apt: CalendarAppointment) => {
    e.stopPropagation();
    await sendWhatsAppNotification({
      appointmentId: apt.id,
      patientName: apt.patientName,
      phone: apt.phone,
      doctorName: apt.doctorName,
      scheduledTime: apt.time
    }, true);

    addToast({
      type: 'success',
      title: 'WhatsApp Reminder Dispatched',
      message: `Opened free WhatsApp confirmation link for ${apt.patientName}.`
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Controls: Doctor Selector Tabs */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            {isRtl ? 'جدول المواعيد لليوم (فترات 15 دقيقة)' : 'Appointment Calendar & 15-Min Slots'}
          </h3>
        </div>

        {/* Doctor Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDoctorId('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedDoctorId === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isRtl ? 'جميع الأطباء' : 'All Doctors'}
          </button>
          {DOCTOR_OPTIONS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedDoctorId === doc.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {doc.name.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 15-Minute Slot Day View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {TIME_SLOTS_15MIN.map((slot) => {
          const apt = getAppointmentForSlot(slot);

          if (apt) {
            // Status-based color coding
            const isConfirmed = apt.status === 'CONFIRMED';
            const isArrived = apt.status === 'ARRIVED';
            const isInConsultation = apt.status === 'IN_CONSULTATION';
            const isCompleted = apt.status === 'COMPLETED';

            return (
              <div
                key={slot}
                draggable
                onDragStart={(e) => handleDragStart(e, apt.id)}
                onClick={() => onAppointmentClick && onAppointmentClick(apt)}
                className={`p-2.5 rounded-lg border transition-all cursor-move flex items-center justify-between gap-3 ${
                  isInConsultation
                    ? 'bg-cyan-950/70 border-cyan-700/80'
                    : isArrived
                    ? 'bg-amber-950/70 border-amber-700/80'
                    : isConfirmed
                    ? 'bg-emerald-950/60 border-emerald-800/80'
                    : isCompleted
                    ? 'bg-slate-950/80 border-slate-800 opacity-60'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Time & Patient Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-20 font-mono font-bold text-xs text-cyan-400 shrink-0">
                    {slot}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-2 truncate">
                      <span className="truncate">{apt.patientName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({apt.mrn})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 truncate mt-0.5">
                      <span>{apt.doctorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isInConsultation
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse'
                        : isArrived
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : isConfirmed
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : isCompleted
                        ? 'bg-slate-900 text-slate-400 border-slate-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {apt.status}
                  </span>

                  {/* WhatsApp Reminder Button */}
                  <button
                    onClick={(e) => handleSendReminder(e, apt)}
                    className="p-1 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-400 border border-slate-700 transition-colors"
                    title="Send WhatsApp appointment confirmation"
                  >
                    <Send className="w-3 h-3" />
                  </button>

                  <Move className="w-3.5 h-3.5 text-slate-600 cursor-grab" />
                </div>
              </div>
            );
          }

          // Empty Slot -> Click to book or drop to reschedule
          return (
            <div
              key={slot}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot)}
              onClick={() => onOpenQuickBookWithTime(slot, selectedDoctorId === 'all' ? DOCTOR_OPTIONS[0].id : selectedDoctorId)}
              className="p-2 rounded-lg border border-dashed border-slate-800/80 hover:border-cyan-700/80 hover:bg-cyan-950/20 transition-colors flex items-center justify-between gap-3 text-xs text-slate-500 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="w-20 font-mono text-[11px] text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {slot}
                </span>
                <span className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors">
                  {isRtl ? '+ متوفر للحجز (اضغط للحجز الفوري أو أسقط موعداً هنا)' : '+ Open Slot (Click to Book or Drop to Reschedule)'}
                </span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentCalendarPane;
