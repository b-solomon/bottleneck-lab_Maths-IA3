// ============================================================
// CORRELATION INTERPRETATION UTILITIES
// ============================================================

import type { AssociationStrength } from '../types';
import { getStrength, getDirection } from '../engine/bottleneck';

/**
 * Interpret a correlation coefficient in plain language.
 * Returns structured pieces that can be assembled into text or JSX.
 */
export interface InterpretationResult {
  strength: AssociationStrength;
  direction: 'Positive' | 'Negative' | 'Near Zero' | 'Undefined';
  strengthLabel: string;
  directionLabel: string;
  summary: string;
  engineeringNote: string;
  limitationNote: string;
}

export function interpretCorrelation(
  r: number | null,
  xLabel: string,
  yLabel: string,
  method: 'Pearson' | 'Spearman'
): InterpretationResult {
  const strength = getStrength(r !== null ? Math.abs(r) : null);
  const direction = getDirection(r);

  const methodNote =
    method === 'Pearson'
      ? 'linear association on the original values'
      : 'monotonic association through ranks';

  const strengthLabel = strength === 'Undefined' ? 'Undefined' : strength;
  const directionLabel =
    direction === 'Positive'
      ? 'positive'
      : direction === 'Negative'
      ? 'negative'
      : direction === 'Near Zero'
      ? 'near-zero'
      : 'undefined';

  let summary = '';
  let engineeringNote = '';

  if (r === null || strength === 'Undefined') {
    summary = `The ${method} correlation between ${xLabel} and ${yLabel} is undefined. This may be due to insufficient data, a constant variable, or missing values.`;
    engineeringNote = `Unable to rank ${xLabel} as a bottleneck candidate from this dataset. Collect more observations.`;
  } else {
    const rStr = r.toFixed(4);
    summary = `The ${method} coefficient is ${rStr}, indicating a ${directionLabel} ${strengthLabel.toLowerCase()} ${methodNote} between ${xLabel} and ${yLabel}.`;

    if (direction === 'Positive') {
      if (strength === 'Very Strong' || strength === 'Strong') {
        engineeringNote =
          `Higher ${xLabel} values tend to coincide with higher ${yLabel} values in this dataset. ` +
          `${xLabel} is a high-priority candidate for further investigation. ` +
          `Profile the system under load, review saturation events, and examine queue metrics ` +
          `before concluding that ${xLabel} is the root cause.`;
      } else if (strength === 'Moderate') {
        engineeringNote =
          `There is a moderate positive tendency: higher ${xLabel} corresponds to somewhat higher ${yLabel}. ` +
          `Investigate further with additional observations and profiling data.`;
      } else {
        engineeringNote =
          `The weak positive association suggests ${xLabel} is not strongly linked to ${yLabel} in this dataset. ` +
          `Other factors may be more influential.`;
      }
    } else if (direction === 'Negative') {
      engineeringNote =
        `Higher ${xLabel} values tend to coincide with lower ${yLabel} values. ` +
        `For utilization metrics, a negative correlation with response time is atypical — ` +
        `consider whether confounding variables, measurement timing, or data anomalies explain this pattern.`;
    } else {
      engineeringNote =
        `Little to no linear/monotonic association is observed between ${xLabel} and ${yLabel}. ` +
        `${xLabel} is not a strong statistical candidate based on the current observations.`;
    }
  }

  const limitationNote =
    'Correlation measures statistical association, not causation. ' +
    'A high coefficient does not confirm that one variable causes changes in the other. ' +
    'Outliers, confounding variables, nonlinear relationships, and small sample sizes ' +
    'can all affect the coefficient. These guidelines (Very Weak through Very Strong) ' +
    'are educational conventions, not universal statistical standards.';

  return {
    strength,
    direction,
    strengthLabel,
    directionLabel,
    summary,
    engineeringNote,
    limitationNote,
  };
}
