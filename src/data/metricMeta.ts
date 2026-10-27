// ============================================================
// METRIC METADATA
// Central registry of all performance metric definitions.
// ============================================================

import type { MetricMeta, MetricKey } from '../types';

export const METRIC_META: MetricMeta[] = [
  {
    key: 'cpu',
    label: 'CPU Utilization',
    unit: '%',
    color: '#ef4444',
    description: 'Percentage of CPU processing capacity in use.',
  },
  {
    key: 'memory',
    label: 'Memory Utilization',
    unit: '%',
    color: '#f97316',
    description: 'Percentage of RAM currently allocated.',
  },
  {
    key: 'disk',
    label: 'Disk I/O Utilization',
    unit: '%',
    color: '#eab308',
    description: 'Percentage of disk I/O capacity in use.',
  },
  {
    key: 'network',
    label: 'Network Utilization',
    unit: '%',
    color: '#22c55e',
    description: 'Percentage of network bandwidth in use.',
  },
  {
    key: 'responseTime',
    label: 'Avg Response Time',
    unit: 'ms',
    color: '#3b82f6',
    description: 'Average time for the system to respond to a request.',
  },
  {
    key: 'queueLength',
    label: 'Request Queue Length',
    unit: '',
    color: '#8b5cf6',
    description: 'Number of requests waiting to be processed.',
  },
  {
    key: 'throughput',
    label: 'Throughput',
    unit: 'req/s',
    color: '#06b6d4',
    description: 'Number of requests processed per second.',
  },
];

export const METRIC_MAP: Record<MetricKey, MetricMeta> = Object.fromEntries(
  METRIC_META.map((m) => [m.key, m])
) as Record<MetricKey, MetricMeta>;

/**
 * Metrics eligible for correlation analysis
 * (all except response time itself as the "dependent" variable).
 */
export const ELIGIBLE_X_METRICS: MetricKey[] = [
  'cpu',
  'memory',
  'disk',
  'network',
  'queueLength',
  'throughput',
];

export const ALL_NUMERIC_METRICS: MetricKey[] = [
  'cpu',
  'memory',
  'disk',
  'network',
  'responseTime',
  'queueLength',
  'throughput',
];
