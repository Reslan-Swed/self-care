import { useState, useEffect, useRef, useCallback } from 'react';
import { offlineDb, EncounterDraft } from '../services/offlineDb';

export interface UseAutoSaveDraftOptions {
  appointmentId: string;
  patientId: string;
  currentData: Omit<EncounterDraft, 'appointmentId' | 'patientId' | 'savedAt'>;
  enabled?: boolean;
}

export function useAutoSaveDraft({
  appointmentId,
  patientId,
  currentData,
  enabled = true
}: UseAutoSaveDraftOptions) {
  const [saveStatus, setSaveStatus] = useState<string>('Ready');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasRestorableDraft, setHasRestorableDraft] = useState<boolean>(false);
  const [restoredDraft, setRestoredDraft] = useState<EncounterDraft | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  // Check if a saved draft exists on mount / when appointmentId changes
  useEffect(() => {
    let isMounted = true;

    async function checkExistingDraft() {
      if (!appointmentId) return;
      try {
        const draft = await offlineDb.encounter_drafts.get(appointmentId);
        if (draft && isMounted) {
          setHasRestorableDraft(true);
          setRestoredDraft(draft);
          setLastSavedAt(new Date(draft.savedAt));
          const timeStr = new Date(draft.savedAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          setSaveStatus(`Draft saved locally at ${timeStr}`);
        }
      } catch (err) {
        console.error('Failed to read draft from Dexie:', err);
      }
    }

    checkExistingDraft();

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  // Debounced auto-save every 2000ms
  useEffect(() => {
    if (!enabled || !appointmentId) return;

    const dataString = JSON.stringify(currentData);
    // Skip if unchanged
    if (dataString === previousDataRef.current) {
      return;
    }

    setSaveStatus('Saving changes to IndexedDB...');
    setIsSaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const now = new Date();
        const draftRecord: EncounterDraft = {
          appointmentId,
          patientId,
          chiefComplaint: currentData.chiefComplaint,
          subjective: currentData.subjective,
          objective: currentData.objective,
          assessment: currentData.assessment,
          plan: currentData.plan,
          prescriptions: currentData.prescriptions,
          customFields: currentData.customFields,
          savedAt: now.toISOString()
        };

        await offlineDb.encounter_drafts.put(draftRecord);
        previousDataRef.current = dataString;
        setLastSavedAt(now);
        setIsSaving(false);
        const timeStr = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setSaveStatus(`Draft saved locally at ${timeStr}`);
      } catch (error) {
        console.error('Dexie auto-save failed:', error);
        setIsSaving(false);
        setSaveStatus('Auto-save failed');
      }
    }, 2000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, appointmentId, patientId, currentData]);

  // Manual save trigger
  const saveNow = useCallback(async () => {
    if (!appointmentId) return;
    setIsSaving(true);
    setSaveStatus('Saving draft...');
    try {
      const now = new Date();
      const draftRecord: EncounterDraft = {
        appointmentId,
        patientId,
        chiefComplaint: currentData.chiefComplaint,
        subjective: currentData.subjective,
        objective: currentData.objective,
        assessment: currentData.assessment,
        plan: currentData.plan,
        prescriptions: currentData.prescriptions,
        customFields: currentData.customFields,
        savedAt: now.toISOString()
      };
      await offlineDb.encounter_drafts.put(draftRecord);
      setLastSavedAt(now);
      setIsSaving(false);
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setSaveStatus(`Draft saved locally at ${timeStr}`);
      return draftRecord;
    } catch (err) {
      console.error('Manual save failed:', err);
      setIsSaving(false);
      setSaveStatus('Draft save failed');
      return null;
    }
  }, [appointmentId, patientId, currentData]);

  // Restore draft callback
  const restoreDraft = useCallback(async (): Promise<EncounterDraft | null> => {
    try {
      const draft = await offlineDb.encounter_drafts.get(appointmentId);
      if (draft) {
        setRestoredDraft(draft);
        return draft;
      }
    } catch (err) {
      console.error('Failed to restore draft:', err);
    }
    return null;
  }, [appointmentId]);

  // Clear draft once encounter is committed
  const clearDraft = useCallback(async () => {
    try {
      await offlineDb.encounter_drafts.delete(appointmentId);
      setHasRestorableDraft(false);
      setRestoredDraft(null);
      setSaveStatus('Ready');
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  }, [appointmentId]);

  return {
    saveStatus,
    lastSavedAt,
    isSaving,
    hasRestorableDraft,
    restoredDraft,
    saveNow,
    restoreDraft,
    clearDraft
  };
}

export default useAutoSaveDraft;
