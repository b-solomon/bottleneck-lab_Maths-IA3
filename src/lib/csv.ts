// ============================================================
// CSV IMPORT / EXPORT UTILITIES
// ============================================================

import type { Observation } from '../types';

const EXPECTED_HEADERS = [
  'label',
  'timestamp',
  'cpu',
  'memory',
  'disk',
  'network',
  'responseTime',
  'queueLength',
  'throughput',
] as const;

export interface CsvParseResult {
  observations: Observation[];
  errors: string[];
  warnings: string[];
  skippedRows: number;
}

/**
 * Parse a CSV string into an array of Observations.
 * Gracefully handles missing optional columns and invalid values.
 */
export function parseCSV(csvText: string): CsvParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const observations: Observation[] = [];
  let skippedRows = 0;

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      observations: [],
      errors: ['CSV must contain a header row and at least one data row.'],
      warnings: [],
      skippedRows: 0,
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  // Check for required column: at least responseTime
  if (!headers.includes('responsetime')) {
    errors.push(
      'CSV must contain a "responseTime" column. Got: ' + headers.join(', ')
    );
    return { observations: [], errors, warnings, skippedRows };
  }

  const getIdx = (name: string) => headers.indexOf(name.toLowerCase());

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const parts = lines[rowIdx].split(',').map((p) => p.trim());
    const lineNum = rowIdx + 1;

    const parseNum = (colName: string): number | null => {
      const idx = getIdx(colName);
      if (idx < 0 || idx >= parts.length) return null;
      const val = parts[idx];
      if (!val || val === '' || val === 'N/A' || val === '-') return null;
      const num = parseFloat(val);
      if (isNaN(num)) {
        warnings.push(
          `Row ${lineNum}: invalid value "${val}" for column "${colName}" — treated as missing.`
        );
        return null;
      }
      return num;
    };

    // Validate utilization ranges (0-100) with warnings
    const validateUtilization = (
      val: number | null,
      col: string
    ): number | null => {
      if (val === null) return null;
      if (val < 0 || val > 100) {
        warnings.push(
          `Row ${lineNum}: ${col} value ${val}% is outside the expected 0–100% range.`
        );
      }
      return val;
    };

    const responseTime = parseNum('responseTime');
    if (responseTime === null) {
      warnings.push(
        `Row ${lineNum}: missing or invalid "responseTime" — row skipped.`
      );
      skippedRows++;
      continue;
    }

    const labelIdx = getIdx('label');
    const label =
      labelIdx >= 0 && parts[labelIdx]
        ? parts[labelIdx]
        : `Obs ${rowIdx}`;

    const tsIdx = getIdx('timestamp');
    const timestamp =
      tsIdx >= 0 && parts[tsIdx] ? parts[tsIdx] : undefined;

    observations.push({
      id: `csv-${rowIdx}-${Date.now()}`,
      label,
      timestamp,
      cpu: validateUtilization(parseNum('cpu'), 'CPU'),
      memory: validateUtilization(parseNum('memory'), 'Memory'),
      disk: validateUtilization(parseNum('disk'), 'Disk'),
      network: validateUtilization(parseNum('network'), 'Network'),
      responseTime,
      queueLength: parseNum('queueLength'),
      throughput: parseNum('throughput'),
    });
  }

  if (observations.length === 0) {
    errors.push('No valid observations could be parsed from the CSV.');
  }

  return { observations, errors, warnings, skippedRows };
}

/**
 * Export observations to a CSV string.
 */
export function exportCSV(observations: Observation[]): string {
  const headers = EXPECTED_HEADERS.join(',');

  const rows = observations.map((o) => {
    return [
      o.label,
      o.timestamp ?? '',
      o.cpu ?? '',
      o.memory ?? '',
      o.disk ?? '',
      o.network ?? '',
      o.responseTime ?? '',
      o.queueLength ?? '',
      o.throughput ?? '',
    ]
      .map((v) => String(v))
      .join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download a string as a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
