import { Fragment, useState, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Download, Upload, RotateCcw, Save, X
} from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert, { DemoBanner } from '../components/ui/Alert';
import type { Observation } from '../types';

const FIELDS: Array<{ key: keyof Observation; label: string; unit?: string; type: string; min?: number; max?: number }> = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'timestamp', label: 'Timestamp', type: 'text' },
  { key: 'cpu', label: 'CPU', unit: '%', type: 'number', min: 0, max: 100 },
  { key: 'memory', label: 'Memory', unit: '%', type: 'number', min: 0, max: 100 },
  { key: 'disk', label: 'Disk I/O', unit: '%', type: 'number', min: 0, max: 100 },
  { key: 'network', label: 'Network', unit: '%', type: 'number', min: 0, max: 100 },
  { key: 'responseTime', label: 'Resp. Time', unit: 'ms', type: 'number', min: 0 },
  { key: 'queueLength', label: 'Queue Len.', type: 'number', min: 0 },
  { key: 'throughput', label: 'Throughput', unit: 'req/s', type: 'number', min: 0 },
];

function emptyObs(): Partial<Observation> {
  return {
    label: '',
    cpu: undefined,
    memory: undefined,
    disk: undefined,
    network: undefined,
    responseTime: undefined,
    queueLength: undefined,
    throughput: undefined,
  };
}

function ObsForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Observation>;
  onSave: (obs: Partial<Observation>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Partial<Observation>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!String(values.label ?? '').trim()) e.label = 'Label required.';
    if (values.responseTime === undefined || values.responseTime === null || isNaN(values.responseTime as number)) {
      e.responseTime = 'Response time required.';
    }
    // Validate utilization ranges
    for (const key of ['cpu', 'memory', 'disk', 'network'] as const) {
      const v = values[key];
      if (v !== undefined && v !== null && (v < 0 || v > 100)) {
        e[key] = `Must be 0–100%.`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (validate()) onSave(values);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            {f.label} {f.unit && <span className="text-slate-600">({f.unit})</span>}
          </label>
          <input
            type={f.type}
            value={f.type === 'number' ? (values[f.key] ?? '') : (String(values[f.key] ?? ''))}
            onChange={(e) => {
              const raw = e.target.value;
              const val = f.type === 'number' ? (raw === '' ? null : parseFloat(raw)) : raw;
              setValues((v) => ({ ...v, [f.key]: val }));
            }}
            placeholder={f.unit ? `0–${f.max ?? '∞'}` : f.label}
            min={f.min}
            max={f.max}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
          />
          {errors[f.key] && <p className="text-xs text-red-400 mt-0.5">{errors[f.key]}</p>}
        </div>
      ))}
      <div className="flex items-end gap-2 col-span-2 sm:col-span-3 lg:col-span-5">
        <Button size="sm" variant="primary" onClick={handleSave}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export default function DatasetPage() {
  const { datasetState, isDemo, auth } = useAppContext();
  const {
    dataset, isDirty, isSaving, saveError, saveSuccess,
    csvErrors, csvWarnings,
    addObservation, updateObservation, deleteObservation,
    updateMeta, importCSV, exportToCSV, saveToDatabase, resetToSample,
  } = datasetState;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAdd(values: Partial<Observation>) {
    addObservation({
      id: `obs-${Date.now()}`,
      label: values.label ?? `Obs ${dataset.observations.length + 1}`,
      timestamp: values.timestamp,
      cpu: values.cpu ?? null,
      memory: values.memory ?? null,
      disk: values.disk ?? null,
      network: values.network ?? null,
      responseTime: values.responseTime ?? null,
      queueLength: values.queueLength ?? null,
      throughput: values.throughput ?? null,
    });
    setAddingNew(false);
  }

  function handleUpdate(id: string, values: Partial<Observation>) {
    updateObservation(id, values);
    setEditingId(null);
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      importCSV(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Dataset Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            {dataset.observations.length} observations · {dataset.meta.mode === 'simulated' ? 'Simulated data' : 'Measured data'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={resetToSample}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset to Demo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileImport} />
          <Button
            size="sm"
            variant="outline"
            onClick={exportToCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          {auth.isAuthenticated && !isDemo && (
            <Button
              size="sm"
              variant="primary"
              isLoading={isSaving}
              onClick={saveToDatabase}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isDirty ? 'Save Changes' : 'Saved'}
            </Button>
          )}
        </div>
      </div>

      {/* CSV template hint */}
      <Alert type="info" title="CSV Format">
        Required columns: <code className="text-blue-300">label, responseTime</code>.
        Optional: <code className="text-slate-300">timestamp, cpu, memory, disk, network, queueLength, throughput</code>.
        Missing numeric values are treated as missing data (not zero).
      </Alert>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {csvErrors.length > 0 && (
        <Alert type="error" title="CSV Import Errors">
          {csvErrors.map((e, i) => <p key={i}>{e}</p>)}
        </Alert>
      )}
      {csvWarnings.length > 0 && (
        <Alert type="warning" title={`CSV Warnings (${csvWarnings.length})`}>
          {csvWarnings.slice(0, 5).map((w, i) => <p key={i}>{w}</p>)}
          {csvWarnings.length > 5 && <p>…and {csvWarnings.length - 5} more.</p>}
        </Alert>
      )}
      {saveSuccess && <Alert type="success">Dataset saved successfully.</Alert>}
      {saveError && <Alert type="error">{saveError}</Alert>}

      {/* Dataset metadata */}
      <Card title="Dataset Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Name"
            value={dataset.meta.name}
            onChange={(e) => updateMeta({ name: e.target.value })}
          />
          <Input
            label="Description"
            value={dataset.meta.description}
            onChange={(e) => updateMeta({ description: e.target.value })}
          />
          <Input
            label="Source"
            value={dataset.meta.sourceDescription}
            onChange={(e) => updateMeta({ sourceDescription: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Data Mode</label>
            <select
              value={dataset.meta.mode}
              onChange={(e) => updateMeta({ mode: e.target.value as 'simulated' | 'measured' })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simulated">Simulated (Demo)</option>
              <option value="measured">Measured (Real data)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Observations table */}
      <Card title="Observations" noPadding
        titleRight={
          <Button
            size="sm"
            variant="primary"
            onClick={() => { setAddingNew(true); setEditingId(null); }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Observation
          </Button>
        }
      >
        {addingNew && (
          <div className="px-5 py-4 border-b border-slate-800 bg-blue-900/10">
            <p className="text-xs font-semibold text-blue-300 mb-3">New Observation</p>
            <ObsForm
              initial={emptyObs()}
              onSave={handleAdd}
              onCancel={() => setAddingNew(false)}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>CPU %</th>
                <th>Mem %</th>
                <th>Disk %</th>
                <th>Net %</th>
                <th>RT (ms)</th>
                <th>Queue</th>
                <th>Throughput</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataset.observations.map((obs) => (
                <Fragment key={obs.id}>
                  <tr>
                    <td className="font-medium text-slate-200">{obs.label}</td>
                    <td>{obs.cpu ?? <span className="text-slate-600">—</span>}</td>
                    <td>{obs.memory ?? <span className="text-slate-600">—</span>}</td>
                    <td>{obs.disk ?? <span className="text-slate-600">—</span>}</td>
                    <td>{obs.network ?? <span className="text-slate-600">—</span>}</td>
                    <td className="text-blue-300 font-mono">{obs.responseTime ?? <span className="text-slate-600">—</span>}</td>
                    <td>{obs.queueLength ?? <span className="text-slate-600">—</span>}</td>
                    <td>{obs.throughput ?? <span className="text-slate-600">—</span>}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingId(obs.id); setAddingNew(false); }}
                          aria-label={`Edit ${obs.label}`}
                          className="p-1.5 rounded text-slate-500 hover:text-blue-300 hover:bg-blue-900/20 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmId === obs.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { deleteObservation(obs.id); setDeleteConfirmId(null); }}
                              className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded border border-red-700/40 hover:bg-red-900/20"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-slate-500 hover:text-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(obs.id)}
                            aria-label={`Delete ${obs.label}`}
                            className="p-1.5 rounded text-slate-500 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {editingId === obs.id && (
                    <tr>
                      <td colSpan={9} className="bg-slate-800/60 p-4">
                        <p className="text-xs font-semibold text-amber-300 mb-3">Editing: {obs.label}</p>
                        <ObsForm
                          initial={obs}
                          onSave={(vals) => handleUpdate(obs.id, vals)}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {dataset.observations.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    No observations yet. Add one or import a CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data collection guide */}
      <Card title="How to Collect Real Performance Data">
        <div className="space-y-3 text-sm text-slate-400 mt-2">
          <p>
            <strong className="text-slate-300">Windows Task Manager:</strong> Shows live CPU, Memory, Disk, and Network utilization. It does not export historical data directly, but you can observe and record values manually.
          </p>
          <p>
            <strong className="text-slate-300">Windows Performance Monitor:</strong> Can record performance counters over time and export data as CSV through a Data Collector Set. Processing the export may require manual column renaming to match this application's expected headers.
          </p>
          <p>
            <strong className="text-slate-300">Application Response Time:</strong> Requires an instrumented application, load testing tool (e.g., Apache JMeter, k6, or wrk), or application performance monitoring (APM) agent. Task Manager does not provide per-request response times.
          </p>
          <p>
            <strong className="text-slate-300">Request Queue Length:</strong> Typically available from application server metrics (IIS, Nginx, Apache) or application monitoring agents.
          </p>
          <p className="text-amber-300/80 border border-amber-700/30 bg-amber-900/10 rounded-lg p-3 text-xs">
            ⚠ All observations in the same dataset should be recorded over the same time periods so that comparisons are meaningful. Misaligned timestamps reduce the validity of correlation results.
          </p>
        </div>
      </Card>
    </div>
  );
}
