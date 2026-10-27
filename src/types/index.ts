// ============================================================
// BOTTLENECK LAB — Core Type Definitions
// ============================================================

// ---- Observation / Dataset --------------------------------

export interface Observation {
  id: string;
  label: string;
  timestamp?: string;
  cpu: number | null;         // CPU utilization (%)
  memory: number | null;      // Memory utilization (%)
  disk: number | null;        // Disk I/O utilization (%)
  network: number | null;     // Network utilization (%)
  responseTime: number | null; // Average response time (ms)
  queueLength: number | null;  // Request queue length
  throughput: number | null;   // Throughput (req/s)
}

export type MetricKey = keyof Omit<Observation, 'id' | 'label' | 'timestamp'>;

export interface MetricMeta {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  description: string;
}

export type DataMode = 'simulated' | 'measured';

export interface DatasetMeta {
  id: string;
  name: string;
  description: string;
  mode: DataMode;
  sourceDescription: string;
  collectionStart?: string;
  collectionEnd?: string;
  units: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface Dataset {
  meta: DatasetMeta;
  observations: Observation[];
}

// ---- Calculation Engine -----------------------------------

export interface PearsonInput {
  xValues: number[];
  yValues: number[];
  xLabel: string;
  yLabel: string;
}

export interface DeviationRow {
  obs: string;
  x: number;
  y: number;
  xDev: number;    // xi - x̄
  yDev: number;    // yi - ȳ
  xDevSq: number;  // (xi - x̄)²
  yDevSq: number;  // (yi - ȳ)²
  product: number; // (xi - x̄)(yi - ȳ)
}

export interface PearsonResult {
  r: number | null;
  n: number;
  xMean: number;
  yMean: number;
  sumXDev: number;
  sumYDev: number;
  sumProduct: number;
  sumXDevSq: number;
  sumYDevSq: number;
  deviationRows: DeviationRow[];
  // Computational form sums
  sumX: number;
  sumY: number;
  sumXY: number;
  sumXSq: number;
  sumYSq: number;
  undefined_reason?: string;
}

export interface RankRow {
  obs: string;
  x: number;
  y: number;
  rankX: number;
  rankY: number;
  d: number;      // rankX - rankY
  dSq: number;    // d²
}

export interface SpearmanResult {
  rho: number | null;
  n: number;
  rankRows: RankRow[];
  sumDSq: number;
  hasTies: boolean;
  usedPearsonOnRanks: boolean;
  pearsonOnRanks?: PearsonResult;
  undefined_reason?: string;
}

export interface AnalysisPair {
  xKey: MetricKey;
  yKey: MetricKey;
  xLabel: string;
  yLabel: string;
  pearson: PearsonResult;
  spearman: SpearmanResult;
  n: number;
}

// ---- Bottleneck Engine ------------------------------------

export type AssociationStrength =
  | 'Very Strong'
  | 'Strong'
  | 'Moderate'
  | 'Weak'
  | 'Very Weak'
  | 'Undefined';

export interface BottleneckCandidate {
  rank: number;
  metricKey: MetricKey;
  metricLabel: string;
  pearsonR: number | null;
  spearmanRho: number | null;
  absMax: number; // max(|r|, |rho|)
  strength: AssociationStrength;
  direction: 'Positive' | 'Negative' | 'Near Zero' | 'Undefined';
  saturationPct: number; // % of observations exceeding threshold
  saturationThreshold: number;
  supportingObs: number;
  recommendation: string;
}

// ---- Correlation Matrix -----------------------------------

export interface CorrelationCell {
  rowKey: MetricKey;
  colKey: MetricKey;
  value: number | null;
  n: number;
}

export type CorrelationMatrix = CorrelationCell[][];

// ---- Auth / User ------------------------------------------

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

// ---- App State --------------------------------------------

export interface AppConfig {
  isDemo: boolean;
  hasSuperbaseConfig: boolean;
  hasCaptchaConfig: boolean;
}

export interface ProjectInfo {
  studentName: string;
  registrationNumber: string;
  department: string;
  facultyGuide: string;
  academicYear: string;
}
