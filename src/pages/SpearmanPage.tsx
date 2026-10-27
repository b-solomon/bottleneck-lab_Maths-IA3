import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import Alert, { DemoBanner } from '../components/ui/Alert';
import { StrengthBadge } from '../components/ui/Badge';
import { SpearmanFormula } from '../components/formula/MathFormula';
import { extractValidPairs } from '../engine/pearson';
import { calculateSpearman } from '../engine/spearman';
import { interpretCorrelation } from '../lib/interpretation';
import { METRIC_META, ELIGIBLE_X_METRICS } from '../data/metricMeta';

export default function SpearmanPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const analyses = useMemo(() => {
    return ELIGIBLE_X_METRICS.map((xKey) => {
      const xMeta = METRIC_META.find((m) => m.key === xKey)!;
      const yMeta = METRIC_META.find((m) => m.key === 'responseTime')!;
      const { xValues, yValues, validIndices } = extractValidPairs(
        obs.map((o) => o[xKey] as number | null),
        obs.map((o) => o.responseTime)
      );
      const obsLabels = validIndices.map((i: number) => obs[i].label || `Obs ${i + 1}`);
      const result = calculateSpearman(xValues, yValues, xMeta.label, yMeta.label, obsLabels);
      const interp = interpretCorrelation(result.rho, xMeta.label, yMeta.label, 'Spearman');
      return { xKey, xMeta, result, interp };
    });
  }, [obs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Spearman Rank Correlation Analysis</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monotonic association through rank assignment. Handles tied values correctly.
          </p>
        </div>
        <Link to="/app/formula?method=Spearman" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
          Step-by-step walkthrough <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Formula */}
      <Card>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Formula (no ties)</p>
        <SpearmanFormula />
        <p className="text-xs text-slate-500 mt-2">
          When tied values exist, average ranks are assigned and Pearson r is calculated on the rank arrays.
          The rank difference method is then not directly applicable.
        </p>
      </Card>

      {/* Results table */}
      <Card title="Spearman Coefficients — All Metrics vs Response Time" noPadding>
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Metric (X)</th>
                <th>ρ</th>
                <th>|ρ|</th>
                <th>n</th>
                <th>Ties?</th>
                <th>Method Used</th>
                <th>Strength</th>
                <th>Direction</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {analyses
                .sort((a, b) => (b.result.rho !== null ? Math.abs(b.result.rho) : 0) - (a.result.rho !== null ? Math.abs(a.result.rho) : 0))
                .map(({ xKey, xMeta, result, interp }) => (
                  <tr key={xKey}>
                    <td className="font-medium text-slate-200">{xMeta.label}</td>
                    <td className={`font-mono font-semibold ${result.rho !== null && result.rho >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {result.rho !== null ? result.rho.toFixed(4) : 'N/A'}
                    </td>
                    <td className="font-mono text-slate-300">
                      {result.rho !== null ? Math.abs(result.rho).toFixed(4) : '—'}
                    </td>
                    <td className="text-slate-400">{result.n}</td>
                    <td>
                      {result.hasTies
                        ? <span className="text-amber-400 text-xs">Yes</span>
                        : <span className="text-slate-500 text-xs">No</span>
                      }
                    </td>
                    <td className="text-xs text-slate-400">
                      {result.usedPearsonOnRanks ? 'Pearson on ranks' : 'Rank diff formula'}
                    </td>
                    <td><StrengthBadge strength={interp.strength} /></td>
                    <td className="text-xs text-slate-400">{interp.direction}</td>
                    <td>
                      <Link
                        to={`/app/formula?x=${xKey}&y=responseTime&method=Spearman`}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rank tables for first two analyses */}
      {analyses.slice(0, 2).map(({ xKey, xMeta, result }) => (
        result.rankRows.length > 0 && (
          <Card key={xKey} title={`Rank Table — ${xMeta.label} vs Response Time`} noPadding>
            <div className="overflow-x-auto">
              <table className="data-table mt-2">
                <thead>
                  <tr>
                    <th>Obs</th>
                    <th>{xMeta.label}</th>
                    <th>Response Time</th>
                    <th>Rank X</th>
                    <th>Rank Y</th>
                    <th>d</th>
                    <th>d²</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rankRows.map((row, i) => (
                    <tr key={i}>
                      <td className="text-slate-200 font-medium">{row.obs}</td>
                      <td className="font-mono">{row.x}</td>
                      <td className="font-mono text-blue-300">{row.y}</td>
                      <td className={`font-mono text-violet-300 ${!Number.isInteger(row.rankX) ? 'italic' : ''}`}>{row.rankX}</td>
                      <td className={`font-mono text-violet-300 ${!Number.isInteger(row.rankY) ? 'italic' : ''}`}>{row.rankY}</td>
                      <td className={`font-mono text-xs ${row.d >= 0 ? 'text-green-400' : 'text-red-400'}`}>{row.d.toFixed(2)}</td>
                      <td className="font-mono text-xs text-amber-300">{row.dSq.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-600">
                    <td colSpan={5} className="font-semibold text-slate-300">Sum</td>
                    <td></td>
                    <td className="font-mono font-bold text-amber-300">Σd² = {result.sumDSq.toFixed(4)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {result.hasTies && (
              <div className="px-4 py-2">
                <Alert type="info">
                  Tied ranks present. Pearson-on-ranks method applied. ρ = {result.rho?.toFixed(4) ?? 'N/A'}
                </Alert>
              </div>
            )}
          </Card>
        )
      ))}

      {/* Educational note on ties */}
      <Card title="Tie Handling — How It Works">
        <div className="space-y-2 text-sm text-slate-400 mt-2">
          <p>
            <strong className="text-slate-300">What are tied ranks?</strong>{' '}
            When two or more observations have the same value for a variable, they occupy the same rank position.
          </p>
          <p>
            <strong className="text-slate-300">Average rank method:</strong>{' '}
            If two values tie for positions 3 and 4, both receive rank 3.5 (the average).
            If three values tie for positions 2, 3, and 4, all receive rank 3.0.
          </p>
          <p>
            <strong className="text-slate-300">Why Pearson-on-ranks?</strong>{' '}
            The simplified formula ρ = 1 − 6Σd²/n(n²−1) assumes no ties. When fractional ranks
            exist from averaging, the formula no longer gives an exact result.
            Calculating Pearson r on the two rank vectors is mathematically equivalent for untied data
            and remains valid for tied data.
          </p>
        </div>
      </Card>
    </div>
  );
}
