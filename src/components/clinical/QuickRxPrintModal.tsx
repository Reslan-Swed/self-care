import React, { useRef } from 'react';
import { Printer, X, ShieldAlert, CheckCircle2, Download } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
  duration?: string;
}

export interface QuickRxPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    name: string;
    age: string;
    gender: string;
    mrn: string;
    bloodGroup: string;
    allergies: string;
  };
  doctor: {
    name: string;
    specialty: string;
    license: string;
  };
  encounterDate: string;
  diagnosis: string;
  prescriptions: PrescriptionItem[];
}

export const QuickRxPrintModal: React.FC<QuickRxPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctor,
  encounterDate,
  diagnosis,
  prescriptions
}) => {
  const { isRtl } = useLanguageSwitcher();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions Header (hidden in print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {isRtl ? 'معاينة وطباعة الوصفة الطبية (Rx Stationery)' : 'Prescription Print Preview (A5 / Thermal)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Standard medical prescription format ready for printer dispatch.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRtl ? 'طباعة الوصفة (Print)' : 'Print Prescription (Ctrl+P)'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRINTABLE PRESCRIPTION STATIONERY SHEET (A5 / Thermal Ready)   */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 print:p-0 print:bg-white print:text-black">
          <div 
            ref={printAreaRef}
            className="w-full max-w-xl mx-auto bg-white text-slate-900 rounded-lg p-6 sm:p-8 shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0"
          >
            {/* Clinic Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase font-sans">
                  Metro Health Medical Center
                </h1>
                <div className="text-[11px] text-slate-600 font-medium">
                  Multi-Specialty Ambulatory Clinic & Urgent Care
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Building 4, Medical Park Blvd · Tel: +1 (555) 019-2000 · License #MED-94021
                </div>
              </div>
              <div className="text-end">
                <div className="text-xs font-bold text-slate-900">{doctor.name}</div>
                <div className="text-[10px] text-slate-600 font-medium">{doctor.specialty}</div>
                <div className="text-[10px] font-mono text-slate-500">Reg: {doctor.license}</div>
              </div>
            </div>

            {/* Patient Demographic Bar */}
            <div className="py-3 border-b border-slate-300 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Patient Name</span>
                <span className="font-bold text-slate-900">{patient.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">MRN</span>
                <span className="font-mono font-semibold text-slate-900">{patient.mrn}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Age / Gender</span>
                <span className="font-medium text-slate-800">{patient.age} · {patient.gender}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Blood Group</span>
                <span className="font-mono font-bold text-rose-700">{patient.bloodGroup}</span>
              </div>
            </div>

            {/* Prominent Allergy Alert Banner */}
            {patient.allergies && (
              <div className="mt-3 p-2 bg-rose-50 border border-rose-300 rounded text-xs text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong className="uppercase">Known Medical Allergies:</strong> {patient.allergies}
                </span>
              </div>
            )}

            {/* Clinical Diagnosis Reference */}
            <div className="mt-4 pb-2 border-b border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Clinical Diagnosis</span>
                <span className="font-semibold text-slate-900">{diagnosis}</span>
              </div>
              <div className="text-end">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Prescribed Date</span>
                <span className="font-mono text-slate-800">{encounterDate}</span>
              </div>
            </div>

            {/* Rx Symbol & Medication Table */}
            <div className="mt-4">
              <div className="text-2xl font-serif font-black text-slate-900 mb-2">
                ℞
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-700 text-start">
                    <th className="py-2 text-start font-bold">#</th>
                    <th className="py-2 text-start font-bold">Medication & Strength</th>
                    <th className="py-2 text-start font-bold">Dosage & Frequency</th>
                    <th className="py-2 text-start font-bold">Duration & Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prescriptions.map((item, idx) => (
                    <tr key={item.id} className="py-2.5">
                      <td className="py-2.5 font-mono text-slate-400 font-bold align-top">
                        {idx + 1}.
                      </td>
                      <td className="py-2.5 align-top">
                        <div className="font-bold text-slate-950">{item.medication}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.dosage}</div>
                      </td>
                      <td className="py-2.5 align-top">
                        <div className="font-semibold text-slate-800">{item.frequency}</div>
                      </td>
                      <td className="py-2.5 align-top text-slate-700">
                        <div>{item.instructions}</div>
                        {item.duration && (
                          <div className="text-[10px] font-mono text-slate-500">Duration: {item.duration}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor Signature & Stamp Footer */}
            <div className="mt-12 pt-6 border-t border-slate-300 flex items-end justify-between">
              <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                <div>Prescription valid for 14 days from date of issue.</div>
                <div>Substitutions allowed unless noted: No Dispense as Written.</div>
                <div>Generated via Micro-PMS SaaS Platform.</div>
              </div>

              <div className="text-center w-48">
                <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xs text-slate-700">Dr. Sarah Jenkins</span>
                </div>
                <div className="text-[10px] font-bold text-slate-800 uppercase">Physician Signature & Stamp</div>
                <div className="text-[9px] font-mono text-slate-500">License: {doctor.license}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickRxPrintModal;
