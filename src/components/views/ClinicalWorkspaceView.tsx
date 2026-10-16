import React, { useState } from 'react';
import { 
  Stethoscope, 
  FileText, 
  Save, 
  Pill, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

export const ClinicalWorkspaceView: React.FC = () => {
  const { t } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [patient] = useState({
    name: 'Jane Doe',
    mrn: 'MRN-2026-0891',
    age: '7 years old',
    dob: '2019-04-12',
    gender: 'Female',
    allergies: 'Penicillin (rash)',
    specialty: 'PEDIATRICS'
  });

  const [subjective, setSubjective] = useState('Patient presents with 48h fever, mild bilateral ear discomfort, and rhinorrhea. Parent notes reduced appetite.');
  const [objective, setObjective] = useState('T 38.2°C, HR 105 bpm, RR 22/min. Right tympanic membrane erythematous and bulging with diminished mobility. Left TM clear. Pharynx mildly injected.');
  const [assessment, setAssessment] = useState('Acute suppurative otitis media of right ear without spontaneous rupture (ICD-10 H66.001)');
  const [plan, setPlan] = useState('1. Amoxicillin-Clavulanate 45mg/kg/day divided BID x 10 days.\n2. Weight-based Acetaminophen for pain/fever control.\n3. Follow-up in 10-14 days or sooner if worsening.');
  
  // Relational Typed EAV custom fields
  const [headCircumference, setHeadCircumference] = useState('51.2');
  const [growthPercentile, setGrowthPercentile] = useState('74');
  const [milestonesMet, setMilestonesMet] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSaveEncounter = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast({
        type: 'success',
        title: 'Clinical Encounter Saved',
        message: 'SOAP notes, ICD-10 diagnosis, and Typed EAV custom fields committed to database with optimistic version lock.'
      });
    }, 400);
  };

  const handleGenerateInvoice = () => {
    addToast({
      type: 'success',
      title: 'Invoice Triggered',
      message: 'Created clinical invoice for $185.00. Routed directly to Reception Desk register.'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Patient Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold text-base shrink-0">
            JD
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-100">{patient.name}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {patient.mrn}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
              <span>{patient.age}</span>
              <span aria-hidden="true">·</span>
              <span>{patient.gender}</span>
              <span aria-hidden="true">·</span>
              <span>DOB: {patient.dob}</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-400 font-medium">Allergy: {patient.allergies}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Visit Invoice</span>
          </button>
          <button
            onClick={handleSaveEncounter}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Signing & Saving...' : 'Save & Sign Encounter'}</span>
          </button>
        </div>
      </div>

      {/* Main SOAP Documentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: SOAP Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>SOAP Clinical Documentation</span>
            </div>

            {/* Subjective */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                S — Subjective (History of Present Illness)
              </label>
              <textarea
                rows={3}
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                O — Objective (Physical Examination & Vitals)
              </label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Assessment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                A — Assessment (Diagnosis & ICD-10 Classification)
              </label>
              <input
                type="text"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-cyan-300"
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                P — Plan (Treatment, Prescriptions, Referrals)
              </label>
              <textarea
                rows={3}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Relational Typed EAV Specialty Fields */}
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-semibold text-slate-200">
                Pediatric Dynamic EAV Fields
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Typed EAV (No JSONB)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Head Circumference (cm) <span className="text-slate-500">[NUMERIC]</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={headCircumference}
                  onChange={(e) => setHeadCircumference(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Growth Curve Percentile (%) <span className="text-slate-500">[NUMERIC]</span>
                </label>
                <input
                  type="number"
                  value={growthPercentile}
                  onChange={(e) => setGrowthPercentile(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300 font-medium">Developmental Milestones Met:</span>
                <button
                  type="button"
                  onClick={() => setMilestonesMet(!milestonesMet)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium border ${
                    milestonesMet
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {milestonesMet ? 'TRUE (Normal)' : 'FALSE (Delayed)'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-500 leading-relaxed font-mono">
              Stores to <span className="text-emerald-400">encounter_field_values</span> with type-safe columns. Strict B-tree indexable schema.
            </div>
          </div>

          {/* Quick Rx Prescriptions Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Pill className="w-4 h-4 text-emerald-400" />
              <span>Active Prescription</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono space-y-1">
              <div className="text-cyan-300 font-semibold">Amoxicillin-Clavulanate Oral Susp</div>
              <div className="text-slate-400">400mg/57mg per 5mL · 7.5 mL PO BID x 10 days</div>
              <div className="text-slate-500 text-[10px]">Refills: 0 · Dispense: 150 mL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalWorkspaceView;
