// ============================================================
// DATASET MANAGEMENT HOOK
// Manages the active dataset, CSV import/export, and Supabase
// persistence for authenticated users.
// ============================================================

import { useState, useCallback } from 'react';
import type { Dataset, Observation, DatasetMeta } from '../types';
import { SAMPLE_DATASET } from '../data/sampleData';
import { parseCSV, exportCSV, downloadFile } from '../lib/csv';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface DatasetState {
  dataset: Dataset;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  csvErrors: string[];
  csvWarnings: string[];
}

export function useDataset(userId?: string) {
  const [state, setState] = useState<DatasetState>({
    dataset: JSON.parse(JSON.stringify(SAMPLE_DATASET)) as Dataset,
    isDirty: false,
    isSaving: false,
    saveError: null,
    saveSuccess: false,
    csvErrors: [],
    csvWarnings: [],
  });

  const setDataset = useCallback((ds: Dataset) => {
    setState((s) => ({ ...s, dataset: ds, isDirty: true, saveSuccess: false }));
  }, []);

  const resetToSample = useCallback(() => {
    setState((s) => ({
      ...s,
      dataset: JSON.parse(JSON.stringify(SAMPLE_DATASET)) as Dataset,
      isDirty: false,
      saveSuccess: false,
      csvErrors: [],
      csvWarnings: [],
    }));
  }, []);

  const addObservation = useCallback((obs: Observation) => {
    setState((s) => ({
      ...s,
      dataset: {
        ...s.dataset,
        observations: [...s.dataset.observations, obs],
        meta: { ...s.dataset.meta, updatedAt: new Date().toISOString() },
      },
      isDirty: true,
    }));
  }, []);

  const updateObservation = useCallback((id: string, updated: Partial<Observation>) => {
    setState((s) => ({
      ...s,
      dataset: {
        ...s.dataset,
        observations: s.dataset.observations.map((o) =>
          o.id === id ? { ...o, ...updated } : o
        ),
        meta: { ...s.dataset.meta, updatedAt: new Date().toISOString() },
      },
      isDirty: true,
    }));
  }, []);

  const deleteObservation = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      dataset: {
        ...s.dataset,
        observations: s.dataset.observations.filter((o) => o.id !== id),
        meta: { ...s.dataset.meta, updatedAt: new Date().toISOString() },
      },
      isDirty: true,
    }));
  }, []);

  const updateMeta = useCallback((meta: Partial<DatasetMeta>) => {
    setState((s) => ({
      ...s,
      dataset: {
        ...s.dataset,
        meta: { ...s.dataset.meta, ...meta, updatedAt: new Date().toISOString() },
      },
      isDirty: true,
    }));
  }, []);

  const importCSV = useCallback((csvText: string) => {
    const result = parseCSV(csvText);

    if (result.errors.length > 0) {
      setState((s) => ({
        ...s,
        csvErrors: result.errors,
        csvWarnings: result.warnings,
      }));
      return false;
    }

    setState((s) => ({
      ...s,
      dataset: {
        ...s.dataset,
        observations: result.observations,
        meta: {
          ...s.dataset.meta,
          mode: 'measured',
          updatedAt: new Date().toISOString(),
        },
      },
      isDirty: true,
      csvErrors: [],
      csvWarnings: result.warnings,
    }));

    return true;
  }, []);

  const exportToCSV = useCallback(() => {
    const csv = exportCSV(state.dataset.observations);
    downloadFile(
      csv,
      `${state.dataset.meta.name.replace(/\s+/g, '_')}_export.csv`
    );
  }, [state.dataset]);

  const saveToDatabase = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) {
      setState((s) => ({
        ...s,
        saveError: 'Authentication and Supabase configuration are required to save datasets.',
      }));
      return false;
    }

    setState((s) => ({ ...s, isSaving: true, saveError: null, saveSuccess: false }));

    try {
      // Upsert dataset metadata
      const { data: datasetRow, error: metaError } = await supabase
        .from('datasets')
        .upsert(
          {
            id: state.dataset.meta.id === 'sample-001' ? undefined : state.dataset.meta.id,
            user_id: userId,
            name: state.dataset.meta.name,
            description: state.dataset.meta.description,
            data_mode: state.dataset.meta.mode,
            source_description: state.dataset.meta.sourceDescription,
            units: state.dataset.meta.units,
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (metaError) throw metaError;

      const datasetId = datasetRow.id as string;

      // Delete existing observations for this dataset
      await supabase
        .from('dataset_observations')
        .delete()
        .eq('dataset_id', datasetId);

      // Insert new observations
      const obsRows = state.dataset.observations.map((o) => ({
        dataset_id: datasetId,
        user_id: userId,
        label: o.label,
        timestamp: o.timestamp,
        cpu: o.cpu,
        memory: o.memory,
        disk: o.disk,
        network: o.network,
        response_time: o.responseTime,
        queue_length: o.queueLength,
        throughput: o.throughput,
      }));

      const { error: obsError } = await supabase
        .from('dataset_observations')
        .insert(obsRows);

      if (obsError) throw obsError;

      setState((s) => ({
        ...s,
        isSaving: false,
        saveSuccess: true,
        isDirty: false,
        dataset: {
          ...s.dataset,
          meta: { ...s.dataset.meta, id: datasetId },
        },
      }));

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save dataset.';
      setState((s) => ({ ...s, isSaving: false, saveError: msg }));
      return false;
    }
  }, [state.dataset, userId]);

  return {
    ...state,
    setDataset,
    resetToSample,
    addObservation,
    updateObservation,
    deleteObservation,
    updateMeta,
    importCSV,
    exportToCSV,
    saveToDatabase,
  };
}
