export interface ActiveStrategyRow {
  strategy: string;
  name: string;
  exitDate: string;
  proposer: string;
  maxCapital: string;
  allocatedPercent: string;
  changePercent: string;
  netAssetValue: string;
}

export interface CandidateStrategyRow {
  strategy: string;
  name: string;
  stake: string;
  proposer: string;
  actionType: string;
  integrations: string[];
  duration: string;
  expectedReturn: string;
}
