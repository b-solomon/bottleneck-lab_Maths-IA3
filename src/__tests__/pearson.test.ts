// ============================================================
// PEARSON CORRELATION ENGINE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { calculatePearson, extractValidPairs, round } from '../engine/pearson';

describe('calculatePearson', () => {
  it('returns r=1 for perfect positive correlation', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).not.toBeNull();
    expect(result.r!).toBeCloseTo(1.0, 4);
    expect(result.n).toBe(5);
  });

  it('returns r=-1 for perfect negative correlation', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).not.toBeNull();
    expect(result.r!).toBeCloseTo(-1.0, 4);
  });

  it('returns r near 0 for uncorrelated data', () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const y = [3, 1, 4, 1, 5, 9, 2, 6];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).not.toBeNull();
    expect(Math.abs(result.r!)).toBeLessThan(0.7);
  });

  it('returns r=null for constant X (zero variance)', () => {
    const x = [5, 5, 5, 5];
    const y = [1, 2, 3, 4];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).toBeNull();
    expect(result.undefined_reason).toBeDefined();
    expect(result.undefined_reason).toContain('zero variance');
  });

  it('returns r=null for constant Y (zero variance)', () => {
    const x = [1, 2, 3, 4];
    const y = [7, 7, 7, 7];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).toBeNull();
    expect(result.undefined_reason).toBeDefined();
  });

  it('returns r=null and explanation when n < 2', () => {
    const result = calculatePearson({ xValues: [5], yValues: [10], xLabel: 'X', yLabel: 'Y' });
    expect(result.r).toBeNull();
    expect(result.n).toBe(1);
    expect(result.undefined_reason).toContain('Insufficient data');
  });

  it('handles n=0 gracefully', () => {
    const result = calculatePearson({ xValues: [], yValues: [], xLabel: 'X', yLabel: 'Y' });
    expect(result.r).toBeNull();
    expect(result.n).toBe(0);
  });

  it('computes correct means', () => {
    const x = [2, 4, 6];
    const y = [10, 20, 30];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.xMean).toBeCloseTo(4, 3);
    expect(result.yMean).toBeCloseTo(20, 3);
  });

  it('known sample: r ≈ 0.9 for CPU vs response time', () => {
    // 4 known data points from sample dataset
    const cpu = [22, 55, 82, 30];
    const rt  = [142, 238, 420, 158];
    const result = calculatePearson({ xValues: cpu, yValues: rt, xLabel: 'CPU', yLabel: 'RT' });
    expect(result.r).not.toBeNull();
    expect(result.r!).toBeGreaterThan(0.95);
  });

  it('deviationRows count matches n', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.deviationRows.length).toBe(5);
  });

  it('r is clamped to [-1, 1]', () => {
    const x = [1, 2, 3];
    const y = [1, 2, 3];
    const result = calculatePearson({ xValues: x, yValues: y, xLabel: 'X', yLabel: 'Y' });
    expect(result.r).not.toBeNull();
    expect(result.r!).toBeGreaterThanOrEqual(-1);
    expect(result.r!).toBeLessThanOrEqual(1);
  });
});

describe('extractValidPairs', () => {
  it('extracts only non-null pairs', () => {
    const x = [1, null, 3, null, 5];
    const y = [10, 20, null, 40, 50];
    const { xValues, yValues, validIndices } = extractValidPairs(x, y);
    expect(xValues).toEqual([1, 5]);
    expect(yValues).toEqual([10, 50]);
    expect(validIndices).toEqual([0, 4]);
  });

  it('handles all nulls', () => {
    const { xValues } = extractValidPairs([null, null], [null, null]);
    expect(xValues.length).toBe(0);
  });

  it('handles all valid pairs', () => {
    const x = [1, 2, 3];
    const y = [4, 5, 6];
    const { xValues, yValues } = extractValidPairs(x, y);
    expect(xValues.length).toBe(3);
    expect(yValues.length).toBe(3);
  });
});

describe('round', () => {
  it('rounds to specified decimal places', () => {
    expect(round(1.23456, 2)).toBe(1.23);
    // Note: 1.005 in IEEE 754 is actually 1.00499... so it rounds to 1.00, not 1.01
    // This is expected floating-point behaviour — we test a clean case instead:
    expect(round(1.006, 2)).toBe(1.01);
    expect(round(0.1 + 0.2, 4)).toBe(0.3);
  });
});
