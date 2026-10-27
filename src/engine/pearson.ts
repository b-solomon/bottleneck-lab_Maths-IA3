// ============================================================
// PEARSON CORRELATION ENGINE
// Implements Pearson's product-moment correlation coefficient.
// This module is completely independent of React, Supabase,
// and any UI code.
// ============================================================

import type { PearsonInput, PearsonResult, DeviationRow } from '../types';

/**
 * Calculate Pearson correlation coefficient r.
 *
 * r = Σ[(xi − x̄)(yi − ȳ)] / √[Σ(xi − x̄)² × Σ(yi − ȳ)²]
 *
 * @param input - paired x and y arrays (must be equal length, no NaN/null)
 * @returns full PearsonResult with all intermediate steps
 */
export function calculatePearson(input: PearsonInput): PearsonResult {
  const { xValues, yValues, xLabel, yLabel } = input;

  if (xValues.length !== yValues.length) {
    throw new Error('xValues and yValues must have the same length');
  }

  const n = xValues.length;

  // Need at least 2 valid pairs
  if (n < 2) {
    return {
      r: null,
      n,
      xMean: NaN,
      yMean: NaN,
      sumXDev: 0,
      sumYDev: 0,
      sumProduct: 0,
      sumXDevSq: 0,
      sumYDevSq: 0,
      deviationRows: [],
      sumX: 0,
      sumY: 0,
      sumXY: 0,
      sumXSq: 0,
      sumYSq: 0,
      undefined_reason: `Insufficient data: need at least 2 valid paired observations, got ${n}.`,
    };
  }

  // Compute sums for both forms of the formula
  let sumX = 0, sumY = 0, sumXY = 0, sumXSq = 0, sumYSq = 0;
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXSq += xValues[i] * xValues[i];
    sumYSq += yValues[i] * yValues[i];
  }

  const xMean = sumX / n;
  const yMean = sumY / n;

  // Build deviation table
  const deviationRows: DeviationRow[] = [];
  let sumProduct = 0;
  let sumXDevSq = 0;
  let sumYDevSq = 0;
  let sumXDev = 0;
  let sumYDev = 0;

  for (let i = 0; i < n; i++) {
    const xDev = xValues[i] - xMean;
    const yDev = yValues[i] - yMean;
    const product = xDev * yDev;
    const xDevSq = xDev * xDev;
    const yDevSq = yDev * yDev;

    sumProduct += product;
    sumXDevSq += xDevSq;
    sumYDevSq += yDevSq;
    sumXDev += xDev;
    sumYDev += yDev;

    deviationRows.push({
      obs: `${i + 1}`,
      x: xValues[i],
      y: yValues[i],
      xDev: round(xDev, 4),
      yDev: round(yDev, 4),
      xDevSq: round(xDevSq, 4),
      yDevSq: round(yDevSq, 4),
      product: round(product, 4),
    });
  }

  // Check for zero variance
  if (sumXDevSq === 0 || sumYDevSq === 0) {
    const zeroVar = sumXDevSq === 0 ? xLabel : yLabel;
    return {
      r: null,
      n,
      xMean,
      yMean,
      sumXDev: round(sumXDev, 6),
      sumYDev: round(sumYDev, 6),
      sumProduct: round(sumProduct, 6),
      sumXDevSq: round(sumXDevSq, 6),
      sumYDevSq: round(sumYDevSq, 6),
      deviationRows,
      sumX: round(sumX, 4),
      sumY: round(sumY, 4),
      sumXY: round(sumXY, 4),
      sumXSq: round(sumXSq, 4),
      sumYSq: round(sumYSq, 4),
      undefined_reason: `${zeroVar} has zero variance — all values are identical. Pearson r is mathematically undefined.`,
    };
  }

  const denominator = Math.sqrt(sumXDevSq * sumYDevSq);
  const r = sumProduct / denominator;

  // Clamp to [-1, 1] to absorb floating-point drift
  const rClamped = Math.max(-1, Math.min(1, r));

  return {
    r: round(rClamped, 6),
    n,
    xMean: round(xMean, 4),
    yMean: round(yMean, 4),
    sumXDev: round(sumXDev, 6),
    sumYDev: round(sumYDev, 6),
    sumProduct: round(sumProduct, 6),
    sumXDevSq: round(sumXDevSq, 6),
    sumYDevSq: round(sumYDevSq, 6),
    deviationRows,
    sumX: round(sumX, 4),
    sumY: round(sumY, 4),
    sumXY: round(sumXY, 4),
    sumXSq: round(sumXSq, 4),
    sumYSq: round(sumYSq, 4),
  };
}

/**
 * Extract valid (non-null, non-NaN, finite) paired observations
 * from two value arrays. Both values in a pair must be valid.
 */
export function extractValidPairs(
  xRaw: (number | null)[],
  yRaw: (number | null)[]
): { xValues: number[]; yValues: number[]; validIndices: number[] } {
  const xValues: number[] = [];
  const yValues: number[] = [];
  const validIndices: number[] = [];

  const len = Math.min(xRaw.length, yRaw.length);
  for (let i = 0; i < len; i++) {
    const x = xRaw[i];
    const y = yRaw[i];
    if (
      x !== null &&
      y !== null &&
      isFinite(x) &&
      isFinite(y) &&
      !isNaN(x) &&
      !isNaN(y)
    ) {
      xValues.push(x);
      yValues.push(y);
      validIndices.push(i);
    }
  }

  return { xValues, yValues, validIndices };
}

/**
 * Round to n decimal places, handling floating-point noise.
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
