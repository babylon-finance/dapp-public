export interface InnerVault {
  id: string;
  underlying: any; // type this out
  fToken: any; // type this out
}

export interface HarvestVault {
  timestamp: string;
  pricePerFullShare: string;
  balanceWithInvestment: string;
  vault: InnerVault;
}

export function getHarvestVaultById(vaults: HarvestVault[], vaultId: string) {
  return vaults.find((vault: HarvestVault) => vault.vault.id === vaultId);
}
