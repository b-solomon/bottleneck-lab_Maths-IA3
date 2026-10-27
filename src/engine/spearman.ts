// ============================================================
// SPEARMAN RANK CORRELATION ENGINE
// Implements Spearman's rank correlation coefficient.
// Handles tied ranks using average ranks and falls back to
// Pearson-on-ranks when ties exist, per standard practice.
// ============================================================

import type { SpearmanResult, RankRow } from '../types';
import { calculatePearson, round } from './pearson';

/**
 * Assign ranks to an array of values.
 * Ties receive the average of the ranks they would have occupied.
 *
 * e.g., [10, 20, 20, 30] → ranks [1, 2.5, 2.5, 4]
 */
export function assignRanks(values: number[]): number[] {
  const n = values.length;

  // Create index array sorted by value
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);

  const ranks = new Array<number>(n);

  let i = 0;
  while (i < n) {
    // Find the extent of the current tie group
    let j = i;
    while (j < n - 1 && indexed[j + 1].v === indexed[j].v) j++;

    // Average rank for the tie group (1-indexed)
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) {
      ranks[indexed[k].i] = avgRank;
    }
    i = j + 1;
  }

  return ranks;
}

/**
 * Detect whether an array of ranks contains ties.
 */
export function hasTiedRanks(ranks: number[]): boolean {
  return ranks.some((r) => !Number.isInteger(r));
}

/**
 * Calculate Spearman rank correlation.
 *
 * For no ties: ρ = 1 − [6Σd² / n(n²−1)]
 * For ties: Pearson correlation applied to the rank arrays.
 *
 * @param xValues - paired x values (already filtered valid)
 * @param yValues - paired y values (already filtered valid)
 * @param xLabel  - label for x variable
 * @param yLabel  - label for y variable
 * @param obsLabels - optional labels for each observation row
 */
export function calculateSpearman(
  xValues: number[],
  yValues: number[],
  xLabel: string,
  yLabel: string,
  obsLabels?: string[]
): SpearmanResult {
  const n = xValues.length;

  if (n < 2) {
    return {
      rho: null,
      n,
      rankRows: [],
      sumDSq: 0,
      hasTies: false,
      usedPearsonOnRanks: false,
      undefined_reason: `Insufficient data: need at least 2 valid paired observations, got ${n}.`,
    };
  }

  const ranksX = assignRanks(xValues);
  const ranksY = assignRanks(yValues);

  const tiesX = hasTiedRanks(ranksX);
  const tiesY = hasTiedRanks(ranksY);
  const tiesExist = tiesX || tiesY;

  // Build rank table
  const rankRows: RankRow[] = [];
  let sumDSq = 0;

  for (let i = 0; i < n; i++) {
    const d = ranksX[i] - ranksY[i];
    const dSq = d * d;
    sumDSq += dSq;

    rankRows.push({
      obs: obsLabels ? obsLabels[i] : String(i + 1),
      x: xValues[i],
      y: yValues[i],
      rankX: ranksX[i],
      rankY: ranksY[i],
      d: round(d, 4),
      dSq: round(dSq, 4),
    });
  }

  sumDSq = round(sumDSq, 6);

  if (tiesExist) {
    // Use Pearson on ranks — the statistically correct method when ties exist
    const pearsonOnRanks = calculatePearson({
      xValues: ranksX,
      yValues: ranksY,
      xLabel: `rank(${xLabel})`,
      yLabel: `rank(${yLabel})`,
    });

    return {
      rho: pearsonOnRanks.r,
      n,
      rankRows,
      sumDSq,
      hasTies: true,
      usedPearsonOnRanks: true,
      pearsonOnRanks,
    };
  }

  // No ties — use the simplified formula
  // ρ = 1 − [6Σd² / n(n²−1)]
  const denominator = n * (n * n - 1);

  if (denominator === 0) {
    return {
      rho: null,
      n,
      rankRows,
      sumDSq,
      hasTies: false,
      usedPearsonOnRanks: false,
      undefined_reason: 'Denominator n(n²−1) is zero — dataset has fewer than 2 observations.',
    };
  }

  const rho = 1 - (6 * sumDSq) / denominator;
  const rhoClamped = Math.max(-1, Math.min(1, rho));

  return {
    rho: round(rhoClamped, 6),
    n,
    rankRows,
    sumDSq,
    hasTies: false,
    usedPearsonOnRanks: false,
  };
}
