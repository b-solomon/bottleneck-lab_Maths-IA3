// ============================================================
// SPEARMAN RANK CORRELATION ENGINE TESTS
// ============================================================

import { describe, it, expect } from 'vitest';
import { calculateSpearman, assignRanks, hasTiedRanks } from '../engine/spearman';

describe('assignRanks', () => {
  it('assigns sequential ranks for distinct values', () => {
    const ranks = assignRanks([30, 10, 20]);
    // 10→1, 20→2, 30→3 → original order: [3, 1, 2]
    expect(ranks).toEqual([3, 1, 2]);
  });

  it('assigns average ranks for ties', () => {
    const ranks = assignRanks([20, 10, 20]);
    // 10→1, 20→2.5, 20→2.5 → original: [2.5, 1, 2.5]
    expect(ranks[0]).toBe(2.5);
    expect(ranks[1]).toBe(1);
    expect(ranks[2]).toBe(2.5);
  });

  it('assigns average for three-way tie', () => {
    const ranks = assignRanks([5, 5, 5]);
    // positions 1,2,3 → average 2
    expect(ranks).toEqual([2, 2, 2]);
  });

  it('handles single element', () => {
    expect(assignRanks([42])).toEqual([1]);
  });

  it('handles already sorted values', () => {
    expect(assignRanks([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });
});

describe('hasTiedRanks', () => {
  it('returns false for integer ranks', () => {
    expect(hasTiedRanks([1, 2, 3, 4])).toBe(false);
  });

  it('returns true for fractional ranks', () => {
    expect(hasTiedRanks([1, 2.5, 2.5, 4])).toBe(true);
  });
});

describe('calculateSpearman', () => {
  it('returns rho=1 for perfectly increasing ranks', () => {
    const x = [10, 20, 30, 40];
    const y = [1, 2, 3, 4];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.rho).not.toBeNull();
    expect(result.rho!).toBeCloseTo(1.0, 4);
    expect(result.hasTies).toBe(false);
    expect(result.usedPearsonOnRanks).toBe(false);
  });

  it('returns rho=-1 for perfectly decreasing ranks', () => {
    const x = [10, 20, 30, 40];
    const y = [40, 30, 20, 10];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.rho).not.toBeNull();
    expect(result.rho!).toBeCloseTo(-1.0, 4);
  });

  it('correctly handles tied values using Pearson-on-ranks', () => {
    const x = [10, 10, 20, 30]; // tie at first two
    const y = [1, 2, 3, 4];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.hasTies).toBe(true);
    expect(result.usedPearsonOnRanks).toBe(true);
    expect(result.rho).not.toBeNull();
    // Result should be a number between -1 and 1
    expect(result.rho!).toBeGreaterThanOrEqual(-1);
    expect(result.rho!).toBeLessThanOrEqual(1);
  });

  it('returns rho=null for n < 2', () => {
    const result = calculateSpearman([5], [10], 'X', 'Y');
    expect(result.rho).toBeNull();
    expect(result.undefined_reason).toContain('Insufficient data');
  });

  it('returns rho=null for n=0', () => {
    const result = calculateSpearman([], [], 'X', 'Y');
    expect(result.rho).toBeNull();
  });

  it('provides correct rank rows', () => {
    const x = [30, 10, 20];
    const y = [3, 1, 2];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.rankRows.length).toBe(3);
    // All d should be 0 because ranking is identical
    result.rankRows.forEach((row) => expect(row.d).toBe(0));
    expect(result.sumDSq).toBe(0);
  });

  it('computes sumDSq correctly', () => {
    const x = [1, 2, 3];
    const y = [3, 1, 2];
    // Rank X: [1,2,3], Rank Y: order of [3,1,2] → sorted [1,2,3] → 1→1, 2→2, 3→3 → y values: [3,1,2] → rank(3)=3, rank(1)=1, rank(2)=2
    // d: [1-3, 2-1, 3-2] = [-2, 1, 1] → d² = [4, 1, 1] → Σd²=6
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.sumDSq).toBe(6);
  });

  it('rho is clamped to [-1, 1]', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.rho).not.toBeNull();
    expect(result.rho!).toBeGreaterThanOrEqual(-1);
    expect(result.rho!).toBeLessThanOrEqual(1);
  });

  it('pearsonOnRanks is defined when ties exist', () => {
    const x = [10, 10, 20, 30];
    const y = [1, 2, 3, 4];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.pearsonOnRanks).toBeDefined();
  });

  it('constant ranks — simplified formula still runs (ranks are integer 2, not fractional)', () => {
    // x=[5,5,5] -> all tie -> average rank = 2 (integer, not fractional)
    // hasTies = false (no fractional ranks), so simplified formula used
    // rho = 1 - 6*2/(3*8) = 0.5
    const x = [5, 5, 5];
    const y = [1, 2, 3];
    const result = calculateSpearman(x, y, 'X', 'Y');
    expect(result.rho).not.toBeNull();
    expect(result.rho!).toBeCloseTo(0.5, 4);
  });
});
