import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle, HelpCircle, Check } from 'lucide-react';
import { useLanguageSwitcher } from '../../i18n/useLanguageSwitcher';

export type EavDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN';

export interface CustomFieldOptionDto {
  id: string;
  optionLabel: string;
  optionValue: string;
  sortOrder: number;
}

export interface CustomFieldDefinitionDto {
  id: string;
  fieldCode: string;
  fieldName: string;
  dataType: EavDataType;
  specialty?: string;
  isRequired: boolean;
  minVal?: number;
  maxVal?: number;
  options?: CustomFieldOptionDto[];
  helpText?: string;
  unit?: string;
}

export interface DynamicFieldInputDto {
  fieldDefinitionId: string;
  fieldCode: string;
  fieldName: string;
  valueText?: string;
  valueNumeric?: number;
  valueDate?: string;
  valueBoolean?: boolean;
}

interface DynamicEavFormRendererProps {
  values: Record<string, any>;
  onChange: (fieldCode: string, value: any) => void;
  errors?: Record<string, string>;
  specialty?: string;
}

// Fallback schema matching the backend Relational Typed EAV migration
const DEFAULT_EAV_SCHEMA: CustomFieldDefinitionDto[] = [
  {
    id: 'fld-ped-1',
    fieldCode: 'head_circumference_cm',
    fieldName: 'Head Circumference',
    dataType: 'NUMBER',
    specialty: 'PEDIATRICS',
    isRequired: true,
    minVal: 20,
    maxVal: 75,
    unit: 'cm',
    helpText: 'Measured across broadest occipitofrontal circumference'
  },
  {
    id: 'fld-ped-2',
    fieldCode: 'growth_percentile',
    fieldName: 'Growth Percentile',
    dataType: 'NUMBER',
    specialty: 'PEDIATRICS',
    isRequired: false,
    minVal: 1,
    maxVal: 99,
    unit: '%',
    helpText: 'Calculated via WHO growth curve standard'
  },
  {
    id: 'fld-ped-3',
    fieldCode: 'milestones_met',
    fieldName: 'Developmental Milestones Met',
    dataType: 'BOOLEAN',
    specialty: 'PEDIATRICS',
    isRequired: true,
    helpText: 'Gross motor, fine motor, language, and social/cognitive screening'
  },
  {
    id: 'fld-ped-4',
    fieldCode: 'feeding_type',
    fieldName: 'Nutritional Intake / Feeding',
    dataType: 'SELECT',
    specialty: 'PEDIATRICS',
    isRequired: false,
    options: [
      { id: 'opt-1', optionLabel: 'Exclusive Breastfeeding', optionValue: 'BREASTFEEDING', sortOrder: 1 },
      { id: 'opt-2', optionLabel: 'Formula Feeding', optionValue: 'FORMULA', sortOrder: 2 },
      { id: 'opt-3', optionLabel: 'Solid Foods & Table Diet', optionValue: 'SOLID_FOODS', sortOrder: 3 },
      { id: 'opt-4', optionLabel: 'Mixed Diet', optionValue: 'MIXED', sortOrder: 4 }
    ],
    helpText: 'Primary nutrition mode for infant/toddler'
  },
  {
    id: 'fld-card-1',
    fieldCode: 'nyha_classification',
    fieldName: 'NYHA Heart Failure Class',
    dataType: 'SELECT',
    specialty: 'CARDIOLOGY',
    isRequired: false,
    options: [
      { id: 'ny-1', optionLabel: 'Class I (No limitation of physical activity)', optionValue: 'CLASS_I', sortOrder: 1 },
      { id: 'ny-2', optionLabel: 'Class II (Slight limitation of physical activity)', optionValue: 'CLASS_II', sortOrder: 2 },
      { id: 'ny-3', optionLabel: 'Class III (Marked limitation of physical activity)', optionValue: 'CLASS_III', sortOrder: 3 },
      { id: 'ny-4', optionLabel: 'Class IV (Unable to carry on any physical activity)', optionValue: 'CLASS_IV', sortOrder: 4 }
    ],
    helpText: 'Functional capacity assessment'
  },
  {
    id: 'fld-gen-1',
    fieldCode: 'immunization_date',
    fieldName: 'Last Vaccine Administered Date',
    dataType: 'DATE',
    specialty: 'GENERAL',
    isRequired: false,
    helpText: 'Date of most recent childhood or booster immunization'
  },
  {
    id: 'fld-gen-2',
    fieldCode: 'clinical_notes_specialty',
    fieldName: 'Specialty Observations',
    dataType: 'TEXT',
    specialty: 'GENERAL',
    isRequired: false,
    helpText: 'Additional specialty-specific observations'
  }
];

export const DynamicEavFormRenderer: React.FC<DynamicEavFormRendererProps> = ({
  values,
  onChange,
  errors = {},
  specialty = 'PEDIATRICS'
}) => {
  const { isRtl } = useLanguageSwitcher();

  // Fetch dynamic schema definitions with TanStack Query
  const { data: schemaDefinitions = DEFAULT_EAV_SCHEMA, isLoading } = useQuery({
    queryKey: ['custom-fields-schema', specialty],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/clinic/custom-fields/schema?specialty=${specialty}`);
        if (response.ok) {
          const json = await response.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            return json.data as CustomFieldDefinitionDto[];
          }
        }
      } catch {
        // Fallback to static schema
      }
      return DEFAULT_EAV_SCHEMA;
    },
    staleTime: 1000 * 60 * 10
  });

  // Filter definitions relevant to the specialty and general fields
  const activeFields = schemaDefinitions.filter(
    (field) => !field.specialty || field.specialty === specialty || field.specialty === 'GENERAL'
  );

  if (isLoading) {
    return (
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse text-xs text-slate-400">
        Loading specialty clinical fields...
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">
              {isRtl ? 'حقول التخصص السريرية (EAV الديناميكي)' : 'Specialty Clinical Fields (Relational Typed EAV)'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isRtl 
                ? 'مخطط علائقي مفهرس ومطابق لمعايير EAV الخالية من JSONB' 
                : 'Schema-governed typed relational EAV without unstructured JSONB.'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
          {specialty}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeFields.map((field) => {
          const value = values[field.fieldCode];
          const hasError = !!errors[field.fieldCode];

          return (
            <div key={field.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <span>{field.fieldName}</span>
                  {field.isRequired && <span className="text-rose-400 font-bold">*</span>}
                  {field.unit && (
                    <span className="text-[10px] font-mono text-slate-400">({field.unit})</span>
                  )}
                </label>
              </div>

              {/* RENDER DYNAMIC FIELD CONTROL */}
              {/* 1. TEXT */}
              {field.dataType === 'TEXT' && (
                <input
                  type="text"
                  value={value ?? ''}
                  onChange={(e) => onChange(field.fieldCode, e.target.value)}
                  placeholder={`Enter ${field.fieldName.toLowerCase()}`}
                  className={`w-full px-3 py-1.5 text-xs bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${
                    hasError ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
              )}

              {/* 2. NUMBER */}
              {field.dataType === 'NUMBER' && (
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={field.minVal}
                    max={field.maxVal}
                    value={value ?? ''}
                    onChange={(e) => onChange(field.fieldCode, e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder={`e.g. ${field.minVal ?? 0}`}
                    className={`w-full px-3 py-1.5 text-xs bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono ${
                      hasError ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {field.unit && (
                    <span className="absolute end-3 top-1.5 text-[10px] font-mono text-slate-400 pointer-events-none">
                      {field.unit}
                    </span>
                  )}
                </div>
              )}

              {/* 3. DATE */}
              {field.dataType === 'DATE' && (
                <input
                  type="date"
                  value={value ?? ''}
                  onChange={(e) => onChange(field.fieldCode, e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono ${
                    hasError ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
              )}

              {/* 4. SELECT */}
              {field.dataType === 'SELECT' && (
                <select
                  value={value ?? ''}
                  onChange={(e) => onChange(field.fieldCode, e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs bg-slate-950 border rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 ${
                    hasError ? 'border-rose-500' : 'border-slate-800'
                  }`}
                >
                  <option value="">-- Select {field.fieldName} --</option>
                  {field.options?.map((opt) => (
                    <option key={opt.id} value={opt.optionValue}>
                      {opt.optionLabel}
                    </option>
                  ))}
                </select>
              )}

              {/* 5. BOOLEAN TOGGLE */}
              {field.dataType === 'BOOLEAN' && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => onChange(field.fieldCode, !value)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      value
                        ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        value
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {value && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{value ? 'Yes / Confirmed' : 'No / Not Observed'}</span>
                  </button>
                </div>
              )}

              {/* Help Text / Validation Error */}
              {hasError ? (
                <div className="flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors[field.fieldCode]}</span>
                </div>
              ) : field.helpText ? (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{field.helpText}</span>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicEavFormRenderer;
