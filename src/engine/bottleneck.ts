// ============================================================
// BOTTLENECK IDENTIFICATION ENGINE
// Ranks potential bottleneck candidates by correlation with
// response time. Transparent, evidence-based, avoids causal
// overclaims.
// ============================================================

import type {
  Observation,
  MetricKey,
  BottleneckCandidate,
  AssociationStrength,
} from '../types';
import { calculatePearson, extractValidPairs } from './pearson';
import { calculateSpearman } from './spearman';
import { METRIC_META } from '../data/metricMeta';

// Metrics analyzed as potential bottleneck candidates
// (correlated with response time)
export const CANDIDATE_METRICS: MetricKey[] = [
  'cpu',
  'memory',
  'disk',
  'network',
  'queueLength',
];

// Throughput is analyzed separately (can be negatively correlated)
export const THROUGHPUT_METRIC: MetricKey = 'throughput';
export const RESPONSE_TIME_METRIC: MetricKey = 'responseTime';

/**
 * Map an absolute correlation coefficient to a descriptive
 * strength label following educational guideline bands.
 */
export function getStrength(absR: number | null): AssociationStrength {
  if (absR === null || isNaN(absR)) return 'Undefined';
  if (absR >= 0.8) return 'Very Strong';
  if (absR >= 0.6) return 'Strong';
  if (absR >= 0.4) return 'Moderate';
  if (absR >= 0.2) return 'Weak';
  return 'Very Weak';
}

/**
 * Map a coefficient to a direction label.
 */
export function getDirection(r: number | null): 'Positive' | 'Negative' | 'Near Zero' | 'Undefined' {
  if (r === null || isNaN(r)) return 'Undefined';
  if (r > 0.05) return 'Positive';
  if (r < -0.05) return 'Negative';
  return 'Near Zero';
}

/**
 * Generate a concise, evidence-based investigation recommendation.
 * This never claims causation.
 */
function generateRecommendation(
  metricLabel: string,
  strength: AssociationStrength,
  direction: 'Positive' | 'Negative' | 'Near Zero' | 'Undefined',
  saturationPct: number,
  threshold: number
): string {
  if (strength === 'Undefined') {
    return `Insufficient valid data to calculate the ${metricLabel}–response time association. Collect more observations.`;
  }

  const satNote =
    saturationPct > 0
      ? ` Additionally, ${saturationPct.toFixed(0)}% of observations exceeded the ${threshold}% utilization threshold.`
      : '';

  if (strength === 'Very Strong' || strength === 'Strong') {
    if (direction === 'Positive') {
      return (
        `Strong positive association detected between ${metricLabel} and response time. ` +
        `This metric is a high-priority candidate for further investigation — examine saturation events, ` +
        `profiling data, and workload patterns before drawing causal conclusions.${satNote}`
      );
    }
    if (direction === 'Negative') {
      return (
        `Strong negative association detected between ${metricLabel} and response time. ` +
        `Higher ${metricLabel} values tend to correspond to lower response times — ` +
        `investigate whether this reflects efficient resource use or a confounding variable.${satNote}`
      );
    }
  }

  if (strength === 'Moderate') {
    return (
      `Moderate association between ${metricLabel} and response time. ` +
      `Collect additional observations and review workload patterns before prioritizing.${satNote}`
    );
  }

  return (
    `Weak or very weak association between ${metricLabel} and response time in this dataset. ` +
    `This metric is not a strong statistical candidate based on the current observations, ` +
    `but investigate if domain knowledge suggests otherwise.${satNote}`
  );
}

/**
 * Run the bottleneck analysis engine.
 *
 * @param observations - active dataset observations
 * @param saturationThreshold - resource utilization threshold (default 80%)
 * @param rankBy - which coefficient to sort by
 * @returns ranked list of bottleneck candidates
 */
export function runBottleneckAnalysis(
  observations: Observation[],
  saturationThreshold = 80,
  rankBy: 'pearson' | 'spearman' = 'pearson'
): BottleneckCandidate[] {
  const responseTimes = observations.map((o) => o.responseTime);

  const candidates: BottleneckCandidate[] = [];

  for (const metricKey of CANDIDATE_METRICS) {
    const metricValues = observations.map((o) => o[metricKey] as number | null);

    const { xValues, yValues, validIndices } = extractValidPairs(
      metricValues,
      responseTimes
    );

    const n = xValues.length;
    const metaMeta = METRIC_META.find((m) => m.key === metricKey);
    const metricLabel = metaMeta?.label ?? metricKey;

    const pearsonResult = calculatePearson({
      xValues,
      yValues,
      xLabel: metricLabel,
      yLabel: 'Response Time',
    });

    const spearmanResult = calculateSpearman(
      xValues,
      yValues,
      metricLabel,
      'Response Time'
    );

    const r = pearsonResult.r;
    const rho = spearmanResult.rho;

    const absR = r !== null ? Math.abs(r) : null;
    const absRho = rho !== null ? Math.abs(rho) : null;
    const absMax =
      absR !== null && absRho !== null
        ? Math.max(absR, absRho)
        : absR ?? absRho ?? -1;

    // Choose primary coefficient for display/sorting
    const primary = rankBy === 'pearson' ? r : rho;
    const strength = getStrength(primary !== null ? Math.abs(primary) : null);
    const direction = getDirection(primary);

    // Saturation: count observations where this metric exceeds threshold
    const applicableValues = validIndices.map((vi) =>
      metricValues[vi] as number
    );
    const saturationCount = applicableValues.filter(
      (v) => v >= saturationThreshold
    ).length;
    const saturationPct = n > 0 ? (saturationCount / n) * 100 : 0;

    candidates.push({
      rank: 0, // assigned after sorting
      metricKey,
      metricLabel,
      pearsonR: r,
      spearmanRho: rho,
      absMax: absMax < 0 ? 0 : absMax,
      strength,
      direction,
      saturationPct: Math.round(saturationPct),
      saturationThreshold,
      supportingObs: n,
      recommendation: generateRecommendation(
        metricLabel,
        strength,
        direction,
        saturationPct,
        saturationThreshold
      ),
    });
  }

  // Sort by absolute correlation descending
  candidates.sort((a, b) => b.absMax - a.absMax);

  // Assign ranks
  candidates.forEach((c, i) => {
    c.rank = i + 1;
  });

  return candidates;
}
