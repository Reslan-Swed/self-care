import React, { useState } from 'react';
import { Settings, Plus, Database, Shield, Layers, Check, Edit2 } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';
import { useToast } from '../../context/ToastContext';

interface CustomField {
  id: string;
  fieldKey: string;
  label: string;
  dataType: 'TEXT' | 'NUMERIC' | 'DATE' | 'BOOLEAN' | 'SELECT';
  targetEntity: 'ENCOUNTER' | 'PATIENT';
  isRequired: boolean;
  specialty: string;
  columnTarget: string;
}

export const ClinicSettingsEavView: React.FC = () => {
  const { t } = useLanguageSwitcher();
  const { addToast } = useToast();

  const [clinicName, setClinicName] = useState('Metro Health Medical Center');
  const [subdomain, setSubdomain] = useState('metro-health');
  const [specialty, setSpecialty] = useState('PEDIATRICS');
  const [planCode] = useState('GROWTH');

  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: 'f-1',
      fieldKey: 'head_circumference',
      label: 'Head Circumference (cm)',
      dataType: 'NUMERIC',
      targetEntity: 'ENCOUNTER',
      isRequired: true,
      specialty: 'PEDIATRICS',
      columnTarget: 'encounter_field_values.value_numeric'
    },
    {
      id: 'f-2',
      fieldKey: 'growth_percentile',
      label: 'Growth Percentile (%)',
      dataType: 'NUMERIC',
      targetEntity: 'ENCOUNTER',
      isRequired: true,
      specialty: 'PEDIATRICS',
      columnTarget: 'encounter_field_values.value_numeric'
    },
    {
      id: 'f-3',
      fieldKey: 'milestones_met',
      label: 'Developmental Milestones Met',
      dataType: 'BOOLEAN',
      targetEntity: 'ENCOUNTER',
      isRequired: false,
      specialty: 'PEDIATRICS',
      columnTarget: 'encounter_field_values.value_boolean'
    },
    {
      id: 'f-4',
      fieldKey: 'ped_immunization_status',
      label: 'Immunization Schedule Up-to-Date',
      dataType: 'BOOLEAN',
      targetEntity: 'ENCOUNTER',
      isRequired: true,
      specialty: 'PEDIATRICS',
      columnTarget: 'encounter_field_values.value_boolean'
    }
  ]);

  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDataType, setNewDataType] = useState<CustomField['dataType']>('NUMERIC');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) return;

    const columnTarget =
      newDataType === 'NUMERIC'
        ? 'encounter_field_values.value_numeric'
        : newDataType === 'BOOLEAN'
        ? 'encounter_field_values.value_boolean'
        : newDataType === 'DATE'
        ? 'encounter_field_values.value_date'
        : 'encounter_field_values.value_text';

    const newField: CustomField = {
      id: `f-${Date.now()}`,
      fieldKey: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newLabel.trim(),
      dataType: newDataType,
      targetEntity: 'ENCOUNTER',
      isRequired: false,
      specialty: specialty,
      columnTarget
    };

    setCustomFields((prev) => [...prev, newField]);
    setShowAddModal(false);
    setNewKey('');
    setNewLabel('');

    addToast({
      type: 'success',
      title: 'EAV Field Definition Added',
      message: `Registered ${newField.fieldKey} mapped to relational column ${columnTarget}.`
    });
  };

  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Practice profile and subdomain configurations updated.'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
            {t.nav.clinicSettings}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure practice identity, quota allocations, and manage the Relational Typed EAV dynamic clinical schema.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Field Definition</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Practice Identity Form */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>Practice Profile & Subdomain</span>
          </div>

          <form onSubmit={handleSaveClinicSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Subdomain Slug</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2">
                <input
                  type="text"
                  disabled
                  value={subdomain}
                  className="bg-transparent py-1.5 text-slate-400 font-mono text-xs w-full focus:outline-none"
                />
                <span className="text-slate-600 font-mono text-[11px]">.micropms.io</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Primary Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="PEDIATRICS">Pediatrics</option>
                <option value="CARDIOLOGY">Cardiology</option>
                <option value="DERMATOLOGY">Dermatology</option>
                <option value="GENERAL">General Practice</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Active Subscription:</span>
                <span className="text-cyan-400 font-bold">{planCode} TIER</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Doctor Quota Limit:</span>
                <span className="text-emerald-400 font-bold">10 Doctors</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Doctors:</span>
                <span className="text-slate-300">4 Enrolled</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Save Clinic Profile
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Relational Typed EAV Schema Definitions */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Relational Typed EAV Schema Registry (Strictly No JSONB)
              </h2>
            </div>
            <span className="text-xs text-cyan-400 font-mono">
              custom_field_definitions
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                  <th className="py-3 px-4 font-semibold text-start">Field Key</th>
                  <th className="py-3 px-4 font-semibold text-start">Display Label</th>
                  <th className="py-3 px-4 font-semibold text-start">Data Type</th>
                  <th className="py-3 px-4 font-semibold text-start">Physical Storage Column</th>
                  <th className="py-3 px-4 font-semibold text-center">Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {customFields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-cyan-400">{field.fieldKey}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{field.label}</td>
                    <td className="py-3 px-4 text-amber-300">{field.dataType}</td>
                    <td className="py-3 px-4 text-emerald-300 text-[11px]">{field.columnTarget}</td>
                    <td className="py-3 px-4 text-center">
                      {field.isRequired ? (
                        <span className="text-emerald-400">YES</span>
                      ) : (
                        <span className="text-slate-600">NO</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400">
            Relational Typed EAV guarantees database-level type checking, indexability on numbers/dates, and zero unstructured JSONB columns.
          </div>
        </div>
      </div>

      {/* Add Custom Field Definition Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100">Add Typed EAV Field Definition</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Field Key (snake_case identifier) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. oxygen_saturation_pct"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxygen Saturation (SpO2 %)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Physical Data Type
                </label>
                <select
                  value={newDataType}
                  onChange={(e) => setNewDataType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="NUMERIC">NUMERIC → encounter_field_values.value_numeric</option>
                  <option value="TEXT">TEXT → encounter_field_values.value_text</option>
                  <option value="DATE">DATE → encounter_field_values.value_date</option>
                  <option value="BOOLEAN">BOOLEAN → encounter_field_values.value_boolean</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  Create Field Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicSettingsEavView;
