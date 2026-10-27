// ============================================================
// CSV IMPORT / EXPORT TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { parseCSV, exportCSV } from '../lib/csv';
import type { Observation } from '../types';

const VALID_CSV = `label,timestamp,cpu,memory,disk,network,responseTime,queueLength,throughput
Obs1,2024-01-01T00:00:00Z,50,60,30,20,200,5,80
Obs2,2024-01-01T00:05:00Z,70,65,40,25,280,8,72
Obs3,,80,70,50,30,350,12,65`;

describe('parseCSV', () => {
  it('parses valid CSV correctly', () => {
    const result = parseCSV(VALID_CSV);
    expect(result.errors.length).toBe(0);
    expect(result.observations.length).toBe(3);
    expect(result.observations[0].label).toBe('Obs1');
    expect(result.observations[0].cpu).toBe(50);
    expect(result.observations[0].responseTime).toBe(200);
  });

  it('handles missing optional columns', () => {
    const csv = `label,responseTime
Test1,150
Test2,200`;
    const result = parseCSV(csv);
    expect(result.errors.length).toBe(0);
    expect(result.observations.length).toBe(2);
    expect(result.observations[0].cpu).toBeNull();
    expect(result.observations[0].responseTime).toBe(150);
  });

  it('returns error when responseTime column is missing', () => {
    const csv = `label,cpu\nObs1,50`;
    const result = parseCSV(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('responseTime');
  });

  it('skips rows with missing responseTime and adds warning', () => {
    const csv = `label,responseTime\nObs1,\nObs2,200`;
    const result = parseCSV(csv);
    expect(result.skippedRows).toBe(1);
    expect(result.observations.length).toBe(1);
    expect(result.observations[0].responseTime).toBe(200);
  });

  it('returns error for fewer than 2 rows', () => {
    const result = parseCSV('label,responseTime');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('warns about out-of-range utilization values', () => {
    const csv = `label,cpu,responseTime\nObs1,150,200`;
    const result = parseCSV(csv);
    expect(result.warnings.some((w) => w.includes('outside the expected 0–100%'))).toBe(true);
    expect(result.observations[0].cpu).toBe(150); // included but with warning
  });

  it('handles N/A and dash as missing', () => {
    const csv = `label,cpu,responseTime\nObs1,N/A,200\nObs2,-,300`;
    const result = parseCSV(csv);
    expect(result.observations[0].cpu).toBeNull();
    expect(result.observations[1].cpu).toBeNull();
  });

  it('treats non-numeric values as missing with warning', () => {
    const csv = `label,cpu,responseTime\nObs1,bad,200`;
    const result = parseCSV(csv);
    expect(result.warnings.some((w) => w.includes('invalid value'))).toBe(true);
    expect(result.observations[0].cpu).toBeNull();
  });
});

describe('exportCSV', () => {
  const obs: Observation[] = [
    { id: '1', label: 'Obs1', cpu: 50, memory: 60, disk: 30, network: 20, responseTime: 200, queueLength: 5, throughput: 80 },
    { id: '2', label: 'Obs2', cpu: null, memory: 70, disk: null, network: 25, responseTime: 280, queueLength: 8, throughput: null },
  ];

  it('produces valid CSV with correct headers', () => {
    const csv = exportCSV(obs);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('label');
    expect(lines[0]).toContain('responseTime');
    expect(lines[0]).toContain('cpu');
  });

  it('includes all observations', () => {
    const csv = exportCSV(obs);
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(3); // header + 2 rows
  });

  it('handles null values as empty strings', () => {
    const csv = exportCSV(obs);
    const lines = csv.split('\n');
    // Row for Obs2 should have empty cpu and throughput fields
    expect(lines[2]).toContain('Obs2');
    expect(lines[2]).not.toContain('null');
  });

  it('round-trips through export and parse', () => {
    const exported = exportCSV(obs);
    const reimported = parseCSV(exported);
    expect(reimported.errors.length).toBe(0);
    expect(reimported.observations.length).toBe(2);
    expect(reimported.observations[0].responseTime).toBe(200);
    expect(reimported.observations[1].cpu).toBeNull();
  });
});
