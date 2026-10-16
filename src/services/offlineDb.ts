import Dexie, { type Table } from 'dexie';

export interface EncounterDraft {
  appointmentId: string;
  patientId: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }>;
  customFields: Record<string, any>;
  savedAt: string;
}

export class ClinicOfflineDb extends Dexie {
  encounter_drafts!: Table<EncounterDraft, string>;

  constructor() {
    super('ClinicOfflineDb');
    this.version(1).stores({
      encounter_drafts: 'appointmentId, patientId, savedAt'
    });
  }
}

export const offlineDb = new ClinicOfflineDb();
export default offlineDb;
