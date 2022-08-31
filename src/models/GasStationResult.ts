import { parseUnits } from '@ethersproject/units';

export interface FeeEstimationConfidence {
  confidence: number;
  price: number;
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
}

export interface BlockPrice {
  blockNumber: number;
  baseFeePerGas: number;
  estimatedTransactionCount: number;
  estimatedPrices: FeeEstimationConfidence[];
}

export interface GasStationResult {
  system: string;
  network: string;
  unit: string;
  maxPrice: number;
  currentBlockNumber: number;
  msSinceLastBlock: number;
  blockPrices: BlockPrice[];
}

enum ConfidenceInterval {
  'rapid' = 99,
  'fast' = 90,
  'standard' = 80,
}

export const EmptyGasStationResult: GasStationResult = {
  system: '',
  network: '',
  unit: '',
  maxPrice: 0,
  currentBlockNumber: 0,
  msSinceLastBlock: 0,
  blockPrices: [],
};

export interface GasPrices {
  rapid: number;
  fast: number;
  standard: number;
  timestamp: number;
}

export const EmptyGasPrices = {
  rapid: 0,
  fast: 0,
  standard: 0,
  timestamp: 0,
};

export const buildGasPriceFromResult = (result: GasStationResult): GasPrices => {
  if (result.blockPrices[0]) {
    return {
      rapid: parseUnits(
        String(
          result.blockPrices[0].estimatedPrices.find((ep) => ep.confidence === ConfidenceInterval.rapid)?.price || 0,
        ),
        'gwei',
      ).toNumber(),
      fast: parseUnits(
        String(
          result.blockPrices[0].estimatedPrices.find((ep) => ep.confidence === ConfidenceInterval.fast)?.price || 0,
        ),
        'gwei',
      ).toNumber(),
      standard: parseUnits(
        String(
          result.blockPrices[0].estimatedPrices.find((ep) => ep.confidence === ConfidenceInterval.standard)?.price || 0,
        ),
        'gwei',
      ).toNumber(),
      timestamp: Date.now(),
    };
  }

  // If the result payload does not include 0th item then return empty result
  return EmptyGasPrices;
};
