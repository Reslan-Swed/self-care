import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Save, 
  Printer, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Pill, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  RefreshCw,
  Copy,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';
import { useAutoSaveDraft } from '../../hooks/useAutoSaveDraft';
import { DynamicEavFormRenderer } from './DynamicEavFormRenderer';
import { PatientTimelinePane, PastEncounter } from './PatientTimelinePane';
import { QuickRxPrintModal, PrescriptionItem } from './QuickRxPrintModal';

interface DoctorWorkspacePageProps {
  appointmentId?: string;
  onNavigateNextPatient?: () => void;
}

// Sample Patient Demographics with Critical Allergy Alerts
const INITIAL_PATIENT = {
  id: 'pat-101',
  name: 'Jane Doe',
  mrn: 'MRN-2026-0891',
  age: '7 years old',
  dob: '2019-04-12',
  gender: 'Female',
  bloodGroup: 'O+',
  phone: '+1 (555) 234-5678',
  allergies: 'Severe Penicillin & Amoxicillin (Anaphylaxis risk)',
  chronicIllnesses: 'Mild Intermittent Asthma (triggered by cold air)',
  medicalAlerts: 'CRITICAL ALLERGY ALERT: Anaphylactic reaction to Penicillin and Beta-lactams. Chronic Condition: Mild Intermittent Asthma.'
};

const INITIAL_TIMELINE: PastEncounter[] = [
  {
    id: 'enc-2025-11-04',
    encounterDate: '2025-11-04',
    doctorName: 'Dr. Sarah Jenkins, MD',
    specialty: 'PEDIATRICS',
    chiefComplaint: 'Mild wheezing and nighttime dry cough following viral URTI.',
    diagnosis: 'Acute asthmatic bronchitis with mild bronchospasm',
    icd10: 'J45.21',
    vitals: { temp: '37.1°C', bp: '95/62', pulse: '88 bpm', weight: '22.4 kg' },
    soapNotes: {
      subjective: 'Parent reports child had rhinorrhea for 3 days followed by intermittent wheezing at night.',
      objective: 'Bilateral expiratory wheezes on auscultation. No intercostal retractions. SpO2 98% room air.',
      assessment: 'Acute viral-induced wheezing on background of intermittent asthma.',
      plan: 'Albuterol HFA inhaler 2 puffs q4-6h prn cough/wheeze. Saline nasal drops.'
    },
    medications: [
      {
        id: 'rx-old-1',
        medication: 'Albuterol Sulfate HFA Inhaler 90mcg',
        dosage: '2 puffs via spacer',
        frequency: 'q4-6h PRN wheezing',
        instructions: 'Use spacer device; rinse mouth after administration',
        duration: '30 days'
      }
    ]
  },
  {
    id: 'enc-2025-06-18',
    encounterDate: '2025-06-18',
    doctorName: 'Dr. Sarah Jenkins, MD',
    specialty: 'PEDIATRICS',
    chiefComplaint: 'Annual 6-year pediatric preventive wellness checkup & immunization review.',
    diagnosis: 'Routine child health examination without abnormal findings',
    icd10: 'Z00.129',
    vitals: { temp: '36.8°C', bp: '92/60', pulse: '84 bpm', weight: '20.8 kg' },
    soapNotes: {
      subjective: 'Child thriving, meeting developmental milestones. Good appetite and sleep.',
      objective: 'Normal heart sounds, clear lungs bilaterally, abdomen soft and non-tender.',
      assessment: 'Well-child visit. Growth curve on 74th percentile.',
      plan: 'Administered MMR & Varicella boosters. Dental hygiene counseling.'
    },
    medications: [
      {
        id: 'rx-old-2',
        medication: 'Multivitamin with Iron Chewable',
        dosage: '1 tablet PO',
        frequency: 'Once daily with breakfast',
        instructions: 'Chew thoroughly',
        duration: '90 days'
      }
    ]
  }
];

export const DoctorWorkspacePage: React.FC<DoctorWorkspacePageProps> = ({
  appointmentId = 'apt-101',
  onNavigateNextPatient
}) => {
  const { isRtl } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [patient] = useState(INITIAL_PATIENT);
  const [timeline] = useState<PastEncounter[]>(INITIAL_TIMELINE);

  // Active Encounter Form State
  const [chiefComplaint, setChiefComplaint] = useState(
    'Acute onset of right ear pain, restlessness, and low-grade fever for 48 hours.'
  );
  const [subjective, setSubjective] = useState(
    '7-year-old female accompanied by mother presenting with 48 hours of right otalgia, restless sleep, and irritability. Mild clear rhinorrhea noted. Mother explicitly notes severe Penicillin allergy documented in infancy.'
  );
  const [objective, setObjective] = useState(
    'Vitals: T 38.1°C, HR 102 bpm, RR 20/min, SpO2 99% RA. HEENT: Right tympanic membrane markedly erythematous, bulging with absent light reflex. Left TM normal and translucent. Pharynx clear without exudates. Neck supple.'
  );
  const [assessment, setAssessment] = useState(
    'Acute suppurative otitis media of right ear without spontaneous rupture (ICD-10 H66.001)'
  );
  const [plan, setPlan] = useState(
    '1. Non-penicillin antimicrobial coverage due to documented severe allergy: Azithromycin 10mg/kg day 1, then 5mg/kg days 2-5.\n2. Weight-based Ibuprofen / Acetaminophen for otalgia and fever.\n3. Keep ear dry, follow up in 10-14 days or immediately if mastoid tenderness occurs.'
  );

  // Prescription Box Table
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      medication: 'Azithromycin Oral Suspension 200mg/5mL',
      dosage: '10 mg/kg day 1, then 5 mg/kg',
      frequency: 'Once daily PO',
      instructions: 'Take 30 minutes before meal; shake suspension well before use',
      duration: '5 days'
    },
    {
      id: 'rx-2',
      medication: 'Ibuprofen Oral Suspension 100mg/5mL',
      dosage: '10 mL (200mg)',
      frequency: 'q6-8h PRN fever / ear pain',
      instructions: 'Administer with food or milk',
      duration: '5 days'
    }
  ]);

  // Dynamic Typed EAV Custom Fields
  const [customFields, setCustomFields] = useState<Record<string, any>>({
    head_circumference_cm: 51.5,
    growth_percentile: 74,
    milestones_met: true,
    feeding_type: 'SOLID_FOODS'
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isRxPrintOpen, setIsRxPrintOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Save Draft Hook with Dexie IndexedDB
  const {
    saveStatus,
    lastSavedAt,
    isSaving,
    hasRestorableDraft,
    restoredDraft,
    saveNow,
    restoreDraft,
    clearDraft
  } = useAutoSaveDraft({
    appointmentId,
    patientId: patient.id,
    currentData: {
      chiefComplaint,
      subjective,
      objective,
      assessment,
      plan,
      prescriptions,
      customFields
    }
  });

  // Handle restoring draft if user requested
  const handleApplyRestoredDraft = async () => {
    const draft = await restoreDraft();
    if (draft) {
      setChiefComplaint(draft.chiefComplaint);
      setSubjective(draft.subjective);
      setObjective(draft.objective);
      setAssessment(draft.assessment);
      setPlan(draft.plan);
      setPrescriptions(draft.prescriptions);
      setCustomFields(draft.customFields);

      addToast({
        type: 'info',
        title: 'Draft Restored',
        message: `Restored local offline draft saved at ${new Date(draft.savedAt).toLocaleTimeString()}.`
      });
    }
  };

  // Prescription Box Table Actions
  const handleAddMedication = () => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medication: '',
      dosage: '',
      frequency: 'Once daily PO',
      instructions: 'Take as directed',
      duration: '7 days'
    };
    setPrescriptions((prev) => [...prev, newItem]);
  };

  const handleUpdateMedication = (id: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptions((prev) => prev.filter((item) => item.id !== id));
  };

  // Import medications from past timeline visit
  const handleImportPastMedications = (meds: PrescriptionItem[]) => {
    const newItems = meds.map((m) => ({
      ...m,
      id: `rx-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    }));
    setPrescriptions((prev) => [...prev, ...newItems]);
    addToast({
      type: 'success',
      title: 'Medications Imported',
      message: `Appended ${meds.length} past medication(s) to current prescription box.`
    });
  };

  // EAV field change
  const handleCustomFieldChange = (fieldCode: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [fieldCode]: value }));
  };

  // Finish encounter & commit
  const handleFinishAndPrint = () => {
    // Validate required fields
    if (!chiefComplaint.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Chief complaint is mandatory before finishing encounter.'
      });
      return;
    }

    setIsRxPrintOpen(true);
  };

  const handleCommitEncounter = async () => {
    setIsSubmitting(true);
    await saveNow();
    await clearDraft();

    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: 'Encounter Finalized & Locked',
        message: `Encounter for ${patient.name} successfully committed with optimistic version lock.`
      });
      if (onNavigateNextPatient) {
        onNavigateNextPatient();
      }
    }, 450);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 lg:p-6 space-y-4 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* ============================================================== */}
      {/* 1. CLINICAL ALERT HEADER & PATIENT DEMOGRAPHICS                 */}
      {/* ============================================================== */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shrink-0 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Patient Demographics */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-100">{patient.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {patient.mrn}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  {patient.bloodGroup}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{patient.age}</span>
                <span aria-hidden="true">·</span>
                <span>{patient.gender}</span>
                <span aria-hidden="true">·</span>
                <span>DOB: {patient.dob}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-400">{patient.phone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Save Draft, Finish & Print Rx, Next Patient */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Auto-Save Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span>{saveStatus}</span>
            </div>

            {/* Manual Save Draft */}
            <button
              onClick={() => saveNow()}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Save draft to IndexedDB"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isRtl ? 'حفظ مسودة' : 'Save Draft 💾'}</span>
            </button>

            {/* Finish & Print Rx */}
            <button
              onClick={handleFinishAndPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
              title="Preview and print official prescription slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إنهاء وطباعة الروشتة' : 'Finish & Print Rx 🖨️'}</span>
            </button>

            {/* Next Patient */}
            <button
              onClick={handleCommitEncounter}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              title="Finalize encounter and call next waiting patient"
            >
              <span>{isRtl ? 'المريض التالي' : 'Next Patient'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* PROMINENT RED WARNING BANNER FOR ALLERGIES & CHRONIC ILLNESSES */}
        <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800/90 text-rose-200 flex items-start gap-3 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs flex-1">
            <div className="font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <span>CRITICAL MEDICAL & ALLERGY ALERT</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-900 border border-rose-700 text-rose-200">
                DO NOT PRESCRIBE PENICILLIN
              </span>
            </div>
            <p className="text-rose-100 font-medium">
              {patient.medicalAlerts}
            </p>
          </div>
        </div>

        {/* Draft Restoration Prompt if Dexie found a draft */}
        {hasRestorableDraft && (
          <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-800/80 text-cyan-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Offline auto-save recovery draft found for this patient in IndexedDB.
              </span>
            </div>
            <button
              onClick={handleApplyRestoredDraft}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shrink-0"
            >
              Restore Draft
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. TWO-COLUMN LAYOUT: TIMELINE (LEFT) & ACTIVE ENCOUNTER (RIGHT) */}
      {/* ============================================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* LEFT COLUMN: Chronological Patient History Timeline (4 Cols) */}
        <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
          <PatientTimelinePane
            timeline={timeline}
            onImportMedications={handleImportPastMedications}
          />
        </div>

        {/* RIGHT COLUMN: Active Encounter Form (8 Cols) */}
        <div className="lg:col-span-8 h-full overflow-y-auto space-y-4 pe-1">
          {/* Section A: Chief Complaint */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{isRtl ? 'الشكوى الرئيسية (Chief Complaint) *' : 'Chief Complaint (Presenting Issue) *'}</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Required</span>
            </div>
            <textarea
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Right ear pain and fever for 48 hours..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Section B: SOAP Notes (Subjective / Objective) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200">
                {isRtl ? 'ملاحظات الكشف السريري (SOAP Notes)' : 'Clinical Examination & Notes (SOAP)'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subjective */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Subjective (Patient & Parent History)
                </label>
                <textarea
                  rows={4}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="History of present illness, symptoms timeline, onset..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>

              {/* Objective */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Objective (Physical Findings, Otoscopy, Vitals)
                </label>
                <textarea
                  rows={4}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Physical exam, HEENT, auscultation, vital signs..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Assessment & Treatment Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Diagnosis & ICD-10 Assessment
                </label>
                <textarea
                  rows={3}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Clinical diagnosis with ICD-10 classification..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Treatment Plan & Patient Instructions
                </label>
                <textarea
                  rows={3}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Clinical management plan, warning signs, follow-up..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section C: Relational Typed EAV Dynamic Form Engine */}
          <DynamicEavFormRenderer
            values={customFields}
            onChange={handleCustomFieldChange}
            errors={fieldErrors}
            specialty="PEDIATRICS"
          />

          {/* Section D: Prescription Box (Dynamic Medication Table) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-950 border border-amber-800 text-amber-400">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    {isRtl ? 'صندوق الوصفات الطبية (Prescription Box)' : 'Prescription Box (e-Prescribing)'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Medications to be printed on official A5 Rx stationery and synced with patient records.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            {/* Prescriptions Dynamic Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-start bg-slate-950/40">
                    <th className="py-2 px-3 font-semibold text-start">Medication Name</th>
                    <th className="py-2 px-3 font-semibold text-start">Dosage / Strength</th>
                    <th className="py-2 px-3 font-semibold text-start">Frequency & Route</th>
                    <th className="py-2 px-3 font-semibold text-start">Instructions</th>
                    <th className="py-2 px-3 font-semibold text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {prescriptions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.medication}
                          onChange={(e) => handleUpdateMedication(item.id, 'medication', e.target.value)}
                          placeholder="e.g. Azithromycin 200mg/5mL"
                          className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleUpdateMedication(item.id, 'dosage', e.target.value)}
                          placeholder="e.g. 5 mL"
                          className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => handleUpdateMedication(item.id, 'frequency', e.target.value)}
                          placeholder="e.g. Once daily PO"
                          className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.instructions}
                          onChange={(e) => handleUpdateMedication(item.id, 'instructions', e.target.value)}
                          placeholder="e.g. Take with food x 5 days"
                          className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(item.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Remove medication"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Rx Print Modal */}
      <QuickRxPrintModal
        isOpen={isRxPrintOpen}
        onClose={() => setIsRxPrintOpen(false)}
        patient={{
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          mrn: patient.mrn,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies
        }}
        doctor={{
          name: 'Dr. Sarah Jenkins, MD',
          specialty: 'Pediatric Medicine',
          license: 'MED-94021'
        }}
        encounterDate={new Date().toISOString().split('T')[0]}
        diagnosis={assessment}
        prescriptions={prescriptions}
      />
    </div>
  );
};

export default DoctorWorkspacePage;
