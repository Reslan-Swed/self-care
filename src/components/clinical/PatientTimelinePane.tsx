import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Pill, 
  FileText, 
  Stethoscope, 
  Copy, 
  Sparkles,
  Clock
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { PrescriptionItem } from './QuickRxPrintModal';

export interface PastEncounter {
  id: string;
  encounterDate: string;
  doctorName: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  icd10: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  soapNotes?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  medications: PrescriptionItem[];
}

interface PatientTimelinePaneProps {
  timeline: PastEncounter[];
  onImportMedications?: (meds: PrescriptionItem[]) => void;
}

export const PatientTimelinePane: React.FC<PatientTimelinePaneProps> = ({
  timeline,
  onImportMedications
}) => {
  const { isRtl } = useLanguageSwitcher();
  const [expandedId, setExpandedId] = useState<string | null>(timeline[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold text-slate-200">
            {isRtl ? 'السجل الزمني للزيارات السابقة' : 'Patient Clinical History Timeline'}
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {timeline.length} {isRtl ? 'زيارات سابقة' : 'Past Visits'}
        </span>
      </div>

      {/* Chronological Accordion List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {timeline.map((enc, index) => {
          const isExpanded = expandedId === enc.id;

          return (
            <div
              key={enc.id}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? 'bg-slate-900/90 border-cyan-800/80 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Summary Header */}
              <button
                type="button"
                onClick={() => toggleExpand(enc.id)}
                className="w-full p-3 text-start flex items-start justify-between gap-2 focus:outline-none"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {enc.encounterDate}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{timeline.length - index}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {enc.diagnosis}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="truncate">{enc.chiefComplaint}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {enc.icd10}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-3 text-xs">
                  {/* Doctor & Vitals Strip */}
                  <div className="p-2 bg-slate-950/80 rounded border border-slate-800/80 flex items-center justify-between text-[11px] flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{enc.doctorName}</span>
                    </div>
                    {enc.vitals && (
                      <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                        {enc.vitals.temp && <span>T: {enc.vitals.temp}</span>}
                        {enc.vitals.bp && <span>BP: {enc.vitals.bp}</span>}
                        {enc.vitals.pulse && <span>HR: {enc.vitals.pulse}</span>}
                        {enc.vitals.weight && <span>Wt: {enc.vitals.weight}</span>}
                      </div>
                    )}
                  </div>

                  {/* SOAP Summary */}
                  {enc.soapNotes && (
                    <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded border border-slate-800/50">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                          Subjective
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {enc.soapNotes.subjective}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                          Objective Findings
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {enc.soapNotes.objective}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                          Treatment Plan
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {enc.soapNotes.plan}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Past Medications Prescribed */}
                  {enc.medications && enc.medications.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                          <Pill className="w-3 h-3 text-amber-400" />
                          <span>Prescribed Medications ({enc.medications.length})</span>
                        </span>
                        {onImportMedications && (
                          <button
                            type="button"
                            onClick={() => onImportMedications(enc.medications)}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-800/60 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy to Current Rx</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        {enc.medications.map((m) => (
                          <div
                            key={m.id}
                            className="p-1.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-200">{m.medication}</span>{' '}
                              <span className="text-slate-400 font-mono">({m.dosage})</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {m.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientTimelinePane;
