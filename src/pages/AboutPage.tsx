import { useState, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import { useAppContext } from '../App';
import Card from '../components/ui/Card';
import { DemoBanner } from '../components/ui/Alert';
import { runBottleneckAnalysis } from '../engine/bottleneck';
import { StrengthBadge } from '../components/ui/Badge';

export default function AboutPage() {
  const { datasetState } = useAppContext();
  const { dataset } = datasetState;
  const obs = dataset.observations;

  const [info, setInfo] = useState({
    studentName: 'Student Name',
    registrationNumber: 'REG/XXXX/YYYY',
    department: 'Computer Science and Engineering',
    facultyGuide: 'Faculty Guide Name',
    academicYear: '2024–2025',
  });

  const candidates = useMemo(() => runBottleneckAnalysis(obs).slice(0, 3), [obs]);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900/60 to-violet-900/60 border border-blue-700/30 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-blue-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">About / Case Study</h1>
          <p className="text-slate-400 text-sm">Mathematics Microproject — Karunya Institute of Technology and Sciences</p>
        </div>
      </div>

      {dataset.meta.mode === 'simulated' && <DemoBanner />}

      {/* Project Info */}
      <Card title="Project Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {(Object.entries(info) as [keyof typeof info, string][]).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-400 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setInfo((s) => ({ ...s, [key]: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-900/40 rounded-lg p-4 text-sm text-slate-400">
          <p><strong className="text-slate-300">Project Title:</strong> System Bottleneck Identification Using Correlation and Rank Correlation</p>
          <p className="mt-1"><strong className="text-slate-300">Project Type:</strong> Mathematics Microproject</p>
          <p className="mt-1"><strong className="text-slate-300">Institution:</strong> Karunya Institute of Technology and Sciences</p>
          <p className="mt-1"><strong className="text-slate-300">Student:</strong> {info.studentName} ({info.registrationNumber})</p>
          <p className="mt-1"><strong className="text-slate-300">Department:</strong> {info.department}</p>
          <p className="mt-1"><strong className="text-slate-300">Faculty Guide:</strong> {info.facultyGuide}</p>
          <p className="mt-1"><strong className="text-slate-300">Academic Year:</strong> {info.academicYear}</p>
        </div>
      </Card>

      {/* Abstract */}
      <Card title="Abstract">
        <p className="text-sm text-slate-300 leading-relaxed mt-2">
          This project develops an interactive web application, Bottleneck Lab, that applies
          Pearson's product-moment correlation coefficient and Spearman's rank correlation coefficient
          to system performance data. The application enables students and engineers to investigate
          statistical associations between system resource utilization metrics — CPU, memory, disk I/O,
          network bandwidth, and request queue length — and application response time. By computing
          and ranking these coefficients, the application identifies candidate components for bottleneck
          investigation. The project demonstrates the practical application of correlation analysis to
          a real engineering problem while maintaining rigorous academic honesty about the distinction
          between statistical association and causal proof.
        </p>
      </Card>

      {/* Problem Statement */}
      <Card title="Problem Statement">
        <p className="text-sm text-slate-300 leading-relaxed mt-2">
          A web application is experiencing increasing response times and reduced throughput during
          periods of high traffic. The engineering team suspects that CPU, memory, disk I/O, or
          network utilization may be associated with performance degradation. The objective is to
          analyze collected system measurements using Pearson's correlation coefficient and Spearman's
          rank correlation coefficient to identify the strongest statistical relationships and
          prioritize components for further bottleneck investigation.
        </p>
      </Card>

      {/* Objectives */}
      <Card title="Objectives">
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-300 mt-2 ml-1">
          <li>Collect or simulate system performance observations across multiple resource metrics.</li>
          <li>Apply Pearson correlation to measure linear associations with response time.</li>
          <li>Apply Spearman rank correlation to measure monotonic associations with response time.</li>
          <li>Compare Pearson and Spearman results to identify consistent patterns.</li>
          <li>Rank candidate bottleneck metrics by correlation strength.</li>
          <li>Demonstrate step-by-step formula derivation and substitution for academic presentation.</li>
          <li>Communicate the limitations of correlation analysis honestly and clearly.</li>
        </ol>
      </Card>

      {/* Methodology */}
      <Card title="Proposed Methodology">
        <div className="space-y-3 text-sm text-slate-300 mt-2">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div><strong>Data Collection:</strong> System performance metrics are recorded during representative workloads using monitoring tools or imported from CSV files.</div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div><strong>Pearson Analysis:</strong> r = Σ[(xᵢ−x̄)(yᵢ−ȳ)] / √[Σ(xᵢ−x̄)² × Σ(yᵢ−ȳ)²] is calculated for each candidate metric paired with response time.</div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div><strong>Spearman Analysis:</strong> ρ = 1 − [6Σd²/n(n²−1)] is calculated after assigning ranks. Average ranks are used for ties; Pearson on ranks is applied when ties exist.</div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">4</div>
            <div><strong>Candidate Ranking:</strong> Metrics are ranked by |r| or |ρ|, and saturation evidence is presented alongside the coefficient.</div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-700/30 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">5</div>
            <div><strong>Interpretation:</strong> Results are interpreted using standard educational strength bands, with explicit caveats about correlation vs. causation.</div>
          </div>
        </div>
      </Card>

      {/* Results from active dataset */}
      <Card title={`Results — ${dataset.meta.name}`}>
        {dataset.meta.mode === 'simulated' && (
          <p className="text-xs text-amber-400 mb-3">⚠ Results below are based on SIMULATED DATA for demonstration only.</p>
        )}
        <div className="space-y-2 mt-2">
          <p className="text-xs text-slate-500">Top bottleneck candidates by correlation with response time:</p>
          {candidates.map((c) => (
            <div key={c.metricKey} className="flex items-center justify-between gap-3 bg-slate-900/40 rounded-lg px-4 py-2.5">
              <div>
                <span className="text-sm font-medium text-slate-200">{c.metricLabel}</span>
                <span className="text-xs text-slate-500 ml-2">n={c.supportingObs}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-blue-300">r={c.pearsonR?.toFixed(4) ?? 'N/A'}</span>
                <span className="text-xs font-mono text-violet-300">ρ={c.spearmanRho?.toFixed(4) ?? 'N/A'}</span>
                <StrengthBadge strength={c.strength} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Limitations */}
      <Card title="Limitations">
        <div className="space-y-2 text-sm text-slate-400 mt-2">
          <p>• <strong className="text-slate-300">Sample size:</strong> This analysis uses {obs.length} observations. Larger datasets provide more reliable estimates.</p>
          <p>• <strong className="text-slate-300">Causation:</strong> Correlation shows association. It does not prove that a metric causes response time changes.</p>
          <p>• <strong className="text-slate-300">Linearity:</strong> Pearson r measures linear association. Nonlinear relationships may show lower r despite strong patterns.</p>
          <p>• <strong className="text-slate-300">Confounding:</strong> A third variable (e.g., workload spike) may drive multiple metrics simultaneously.</p>
          <p>• <strong className="text-slate-300">Temporal dependence:</strong> Consecutive performance measurements are often correlated over time, which may violate independence assumptions.</p>
          {dataset.meta.mode === 'simulated' && (
            <p>• <strong className="text-amber-300">Simulated data:</strong> All results in this demonstration are computed from synthetically generated observations, not from a real system.</p>
          )}
        </div>
      </Card>

      {/* Conclusion */}
      <Card title="Conclusion">
        <p className="text-sm text-slate-300 leading-relaxed mt-2">
          Bottleneck Lab demonstrates that Pearson correlation and Spearman rank correlation are
          practical tools for prioritizing bottleneck investigation in system performance analysis.
          By computing correlation coefficients between resource utilization metrics and response time,
          engineers can identify which components show the strongest statistical associations with
          performance degradation. This narrows the investigation to the most statistically supported
          candidates. However, correlation analysis is the beginning of the investigation, not the
          conclusion — confirming a root cause requires controlled profiling, saturation testing,
          and application-level tracing.
        </p>
      </Card>
    </div>
  );
}
