import { GardenMetricRow, WalletMetricRow } from '../../../../src/models/MetricRow';

export interface GardenReserveMap {
  [key: string]: any;
}

export interface MetricsResult {
  gardenMetricRows: GardenMetricRow[];
  walletMetricRows: WalletMetricRow[];
  gardenReserveMap: GardenReserveMap;
}

export const METRICS_NAMESPACE = 'babylonGardenMetrics';
export const CACHE_NAMESPACE = 'babylonGardenMetricsCache';
