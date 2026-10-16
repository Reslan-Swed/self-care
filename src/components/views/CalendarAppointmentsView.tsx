import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User, Stethoscope } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface AppointmentSlot {
  id: string;
  time: string;
  patientName: string;
  doctorName: string;
  room: string;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'ARRIVED';
}

export const CalendarAppointmentsView: React.FC = () => {
  const { t, isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();
  const [selectedDate, setSelectedDate] = useState('2026-10-16');

  const slots: AppointmentSlot[] = [
    {
      id: 'apt-201',
      time: '08:30 AM',
      patientName: 'Eleanor Vance',
      doctorName: 'Dr. Sarah Jenkins, MD',
      room: 'Exam Room 1',
      type: 'Pediatric Checkup',
      status: 'CONFIRMED'
    },
    {
      id: 'apt-202',
      time: '09:00 AM',
      patientName: 'Jane Doe',
      doctorName: 'Dr. Sarah Jenkins, MD',
      room: 'Exam Room 3',
      type: 'Acute Consultation',
      status: 'ARRIVED'
    },
    {
      id: 'apt-203',
      time: '10:00 AM',
      patientName: 'Michael Chang',
      doctorName: 'Dr. Sarah Jenkins, MD',
      room: 'Exam Room 1',
      type: 'Blood Pressure Evaluation',
      status: 'SCHEDULED'
    },
    {
      id: 'apt-204',
      time: '11:15 AM',
      patientName: 'David Miller',
      doctorName: 'Dr. Sarah Jenkins, MD',
      room: 'Exam Room 2',
      type: 'Follow-up Lab Review',
      status: 'SCHEDULED'
    },
    {
      id: 'apt-205',
      time: '02:00 PM',
      patientName: 'Amina Mansour',
      doctorName: 'Dr. Sarah Jenkins, MD',
      room: 'Exam Room 3',
      type: 'Dermatological Biopsy Review',
      status: 'CONFIRMED'
    }
  ];

  const handleBookSlot = () => {
    addToast({
      type: 'info',
      title: 'Calendar Booking',
      message: 'New appointment scheduling dialog initialized.'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.calendar}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Doctor availability scheduling, room allocations, and patient visit slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button className="px-3 py-1 rounded bg-slate-800 text-slate-200 font-medium">Day</button>
            <button className="px-3 py-1 rounded text-slate-400 hover:text-slate-200">Week</button>
            <button className="px-3 py-1 rounded text-slate-400 hover:text-slate-200">Month</button>
          </div>
          <button
            onClick={handleBookSlot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-100">Friday, October 16, 2026</span>
          </div>
          <button className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
          <span>Showing Dr. Sarah Jenkins (Pediatrics)</span>
        </div>
      </div>

      {/* Slots Timeline Grid */}
      <div className="space-y-3">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-24 font-mono font-bold text-sm text-cyan-400 shrink-0">
                {slot.time}
              </div>
              <div className="border-s border-slate-800 ps-4">
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>{slot.patientName}</span>
                  <span className="text-xs font-normal text-slate-500">· {slot.type}</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                  <span>{slot.doctorName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400">{slot.room}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 sm:ms-auto">
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded border ${
                  slot.status === 'ARRIVED'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : slot.status === 'CONFIRMED'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {slot.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarAppointmentsView;
