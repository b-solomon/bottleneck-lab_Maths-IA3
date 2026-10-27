import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PearsonFormula, SpearmanFormula } from '../components/formula/MathFormula';

const SECTIONS = [
  {
    id: 'bottleneck',
    title: '1. What is a System Bottleneck?',
    content: `A system bottleneck is a component or resource whose capacity limits the overall throughput or response time of the system. When demand exceeds the capacity of one component, requests queue up, response times increase, and throughput falls — even if all other components have spare capacity.

Common bottleneck candidates in web applications include:
• CPU — when computation-intensive work exhausts processing capacity.
• Memory — when working sets exceed available RAM, causing paging or garbage collection overhead.
• Disk I/O — when read/write operations queue up behind a slow storage subsystem.
• Network — when data transfer saturates available bandwidth.
• Application logic — when inefficient algorithms, locks, or database queries create delays.

A bottleneck is confirmed only after detailed profiling, not from correlation analysis alone.`,
  },
  {
    id: 'correlation',
    title: '2. What is Correlation?',
    content: `Correlation measures the statistical relationship between two variables — whether changes in one variable tend to be associated with changes in the other.

A correlation coefficient is a number between −1 and +1:
• +1: Perfect positive relationship — as X increases, Y increases proportionally.
• 0: No linear (Pearson) or monotonic (Spearman) relationship.
• −1: Perfect negative relationship — as X increases, Y decreases proportionally.

Correlation does not prove causation. Two variables can be correlated because:
• One causes the other.
• Both are caused by a third variable (confounding).
• The correlation occurred by chance in a small sample.

We use correlation in bottleneck analysis to identify which metrics are most strongly associated with response time — as a starting point for investigation, not as a conclusion.`,
  },
  {
    id: 'pearson',
    title: '3. Pearson Correlation Coefficient',
    content: `Pearson's correlation coefficient (r) measures the strength and direction of the linear relationship between two continuous variables.

Key properties:
• −1 ≤ r ≤ +1
• Measures whether the variables change together in a linear way.
• Sensitive to outliers — a single unusual observation can substantially change r.
• Assumes that both variables are approximately continuous and the relationship is linear.
• Does not require normally distributed data, but normality of both variables strengthens interpretation.

The formula measures how much each pair of observations deviates from both means together, normalized by the total spread of each variable.`,
  },
  {
    id: 'pearson-formula',
    title: '4. Pearson Calculation Example',
    formula: `r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\cdot \\sum(y_i - \\bar{y})^2}}`,
    example: `Example with 3 observations (CPU %, Response Time ms):
Obs 1: CPU=30, RT=150
Obs 2: CPU=60, RT=250
Obs 3: CPU=90, RT=400

x̄ = (30+60+90)/3 = 60  ȳ = (150+250+400)/3 = 266.67

Deviations and products:
Obs 1: (30−60)(150−266.67) = (−30)(−116.67) = 3500.1
Obs 2: (60−60)(250−266.67) = 0 × (−16.67) = 0
Obs 3: (90−60)(400−266.67) = (30)(133.33) = 3999.9

Σ(xᵢ−x̄)(yᵢ−ȳ) = 7500
Σ(xᵢ−x̄)² = 900 + 0 + 900 = 1800
Σ(yᵢ−ȳ)² = 13611 + 277.8 + 17777 = 31666

r = 7500 / √(1800 × 31666) = 7500 / √57,000,000 ≈ 7500 / 7549.8 ≈ 0.993

A very strong positive linear association.`,
  },
  {
    id: 'spearman',
    title: '5. Spearman Rank Correlation Coefficient',
    content: `Spearman's rank correlation coefficient (ρ) measures the strength of the monotonic relationship between two variables — whether one variable tends to increase (or decrease) as the other increases, regardless of whether the relationship is linear.

Key properties:
• −1 ≤ ρ ≤ +1
• Works on ranks rather than original values — more robust to outliers than Pearson r.
• Suitable when the relationship may be monotonic but not linear.
• Appropriate for ordinal data or when Pearson assumptions are violated.
• For untied data, ρ equals the Pearson r applied to the ranks.`,
    formula: `\\rho = 1 - \\frac{6 \\sum d_i^2}{n(n^2 - 1)}`,
  },
  {
    id: 'ranking',
    title: '6. How Ranks are Assigned',
    content: `Ranks are assigned from the smallest value (rank 1) to the largest value (rank n).

Example: Values [85, 30, 60, 45] → sorted: [30, 45, 60, 85]
Ranks: 30→1, 45→2, 60→3, 85→4
Original order: [4, 1, 3, 2]

The process is the same for both X and Y variables independently. Then rank differences d = rank(xᵢ) − rank(yᵢ) are computed for each pair.`,
  },
  {
    id: 'tied',
    title: '7. Tied Ranks and Average Ranks',
    content: `When two or more observations have the same value for a variable, they receive the average of the ranks they would have occupied.

Example: Values [20, 45, 45, 70]
Positions: 1, 2, 3, 4
Tie at positions 2 and 3 → average rank = (2+3)/2 = 2.5
Ranks: [1, 2.5, 2.5, 4]

Three-way tie: Values [10, 30, 30, 30, 70]
Tie at positions 2, 3, 4 → average rank = (2+3+4)/3 = 3
Ranks: [1, 3, 3, 3, 5]

When fractional ranks exist, the formula ρ = 1 − 6Σd²/n(n²−1) is no longer exact.
The correct approach is to calculate Pearson r on the two rank arrays.`,
  },
  {
    id: 'spearman-example',
    title: '8. Worked Spearman Example (No Ties)',
    content: `3 observations — CPU %, Response Time ms:
Obs 1: CPU=30, RT=150 → Rank CPU=1, Rank RT=1 → d=0, d²=0
Obs 2: CPU=60, RT=250 → Rank CPU=2, Rank RT=2 → d=0, d²=0
Obs 3: CPU=90, RT=400 → Rank CPU=3, Rank RT=3 → d=0, d²=0

Σd² = 0
ρ = 1 − (6×0) / (3×(9−1)) = 1 − 0/24 = 1.000

Perfect monotonic association — as CPU rank increases, response time rank increases consistently.`,
    formula: `\\rho = 1 - \\frac{6 \\times 0}{3(3^2 - 1)} = 1 - 0 = 1.000`,
  },
  {
    id: 'comparison',
    title: '9. Pearson vs Spearman',
    content: `Pearson r and Spearman ρ answer slightly different questions:

Pearson r:
• Measures the strength of the linear relationship.
• Sensitive to outliers.
• Best when the relationship is linear and both variables are continuous.

Spearman ρ:
• Measures the strength of the monotonic relationship.
• More robust to outliers.
• Works for ordinal data and nonlinear monotonic relationships.
• For perfectly linear data with no ties, Pearson r ≈ Spearman ρ.

When to use which:
• Use Pearson when you specifically want to quantify linear association on the original values.
• Use Spearman when the data may contain outliers, when the relationship may be nonlinear monotonic, or when the data is ordinal.
• In practice, computing both and comparing is informative.

If Pearson ≫ Spearman: the relationship may be more linear than monotonic, or outliers are inflating Pearson.
If Spearman ≫ Pearson: the relationship may be monotonic but not linear.`,
  },
  {
    id: 'interpretation',
    title: '10. Interpreting Coefficients',
    content: `Educational guideline bands for |r| or |ρ|:
• 0.00–0.19: Very weak association
• 0.20–0.39: Weak association
• 0.40–0.59: Moderate association
• 0.60–0.79: Strong association
• 0.80–1.00: Very strong association

These are educational conventions, not universal statistical standards. The appropriate threshold depends on the field and context.

Direction:
• Positive coefficient: both variables tend to increase together.
• Negative coefficient: one tends to decrease as the other increases.
• Near zero: little systematic association in the data.

For performance analysis:
• A positive correlation between CPU and response time suggests that higher CPU load tends to accompany longer response times in this dataset.
• A negative correlation between throughput and response time may suggest that higher throughput periods have lower per-request latency — or may reflect a confounding variable.`,
  },
  {
    id: 'causation',
    title: '11. Why Correlation Does Not Prove Causation',
    content: `Three explanations are always possible for a high correlation:
1. X causes Y (CPU load causes longer response times).
2. Y causes X (long response times correlate with CPU due to retries or timeouts).
3. Z causes both X and Y (a workload spike increases CPU, memory, and response time simultaneously — but none of the three is directly causing the others).

In system performance analysis, confounding is extremely common. A sudden workload spike may increase CPU, disk, network, memory, and response time all at once. All six pairs would show high positive correlation, but none of the metrics is necessarily the causal root.

To confirm a bottleneck:
• Profile the application under controlled conditions.
• Saturate individual resources and measure the effect on response time.
• Use queuing theory and utilization analysis.
• Review application logs and trace data.
• Correlation analysis narrows the list of candidates; it does not confirm the winner.`,
  },
  {
    id: 'limitations',
    title: '12. Limitations of Correlation',
    content: `Limitations specific to performance analysis:

• Small datasets: with fewer than ~30 observations, high |r| can occur by chance. These results use only ${15} observations.
• Outliers: a single extreme observation can dominate the Pearson coefficient.
• Nonlinear relationships: a strong nonlinear relationship (e.g., exponential) may show a moderate Pearson r.
• Time-series dependence: consecutive performance measurements are often autocorrelated. Standard correlation assumes independent observations.
• Threshold effects: a resource may have no impact until it reaches saturation, then suddenly dominate. Correlation may miss this step change.
• Missing dimensions: correlation does not capture lock contention, thread pools, garbage collection pauses, or application-level queues unless these are explicitly measured.

Always treat correlation results as a starting hypothesis to be tested with further investigation.`,
  },
  {
    id: 'applications',
    title: '13. Real-World Applications',
    content: `Correlation analysis is widely used in performance engineering:

• APM (Application Performance Monitoring): tools like New Relic and Datadog correlate infrastructure metrics with response time to highlight candidates.
• Capacity planning: identifying which resource utilization correlates most strongly with latency helps predict when upgrades are needed.
• Root cause analysis: correlation matrices across dozens of metrics can narrow a search space from many candidates to a few.
• A/B testing: correlating feature flag state with latency changes detects performance regressions.
• SRE (Site Reliability Engineering): correlation between error rates and resource metrics helps triage incidents.

In all cases, correlation accelerates investigation — it does not replace it.`,
  },
];

export default function MathGuidePage() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bottleneck: true,
    correlation: true,
    pearson: true,
    'pearson-formula': true,
    spearman: true,
  });

  function toggle(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function expandAll() {
    const all: Record<string, boolean> = {};
    SECTIONS.forEach((s) => { all[s.id] = true; });
    setOpenSections(all);
  }

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Mathematical Guide</h1>
          <p className="text-slate-400 text-sm mt-1">
            Undergraduate-friendly explanations of Pearson and Spearman correlation,
            rank assignment, tied ranks, and bottleneck analysis.
          </p>
        </div>
        <button
          onClick={expandAll}
          className="text-sm text-blue-400 hover:text-blue-300 border border-blue-700/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Expand All
        </button>
      </div>

      {SECTIONS.map((section) => (
        <div
          key={section.id}
          className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggle(section.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/50 transition-colors"
            aria-expanded={!!openSections[section.id]}
          >
            <span className="text-sm font-semibold text-white">{section.title}</span>
            {openSections[section.id]
              ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
              : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            }
          </button>

          {openSections[section.id] && (
            <div className="px-5 pb-5 border-t border-slate-700/30">
              {/* Render formula based on which section it is */}
              {section.formula && section.id === 'pearson' && <PearsonFormula />}
              {section.formula && section.id === 'pearson-formula' && <PearsonFormula />}
              {section.formula && (section.id === 'spearman' || section.id === 'spearman-example') && <SpearmanFormula />}
              <div className="mt-3 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
              {section.example && (
                <div className="mt-3 bg-slate-900/50 border border-slate-700/40 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-300 mb-2">Worked Example</p>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {section.example}
                  </pre>
                </div>
              )}
              {section.id === 'pearson' && (
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/app/formula?method=Pearson"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    → See Pearson Formula in Action with your data
                  </Link>
                </div>
              )}
              {section.id === 'spearman' && (
                <div className="mt-3">
                  <Link
                    to="/app/formula?method=Spearman"
                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    → See Spearman Formula in Action with your data
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
