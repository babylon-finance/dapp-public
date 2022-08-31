import { GardenDetails, QuoteResult } from 'models';
import { getPrincipalInUSD } from './getPrincipalInUSD';
import { IS_MAINNET } from 'config';
import { parseEther } from '@ethersproject/units';

const MIN_PRINCIPAL = IS_MAINNET ? 10000 : 100;

export const getPublicGardens = (
  allGardens: GardenDetails[],
  quotes: QuoteResult | undefined,
  admin: boolean = false,
): GardenDetails[] => {
  return allGardens.filter((g: GardenDetails) =>
    // Return ALL Gardens if Admin user
    !!g && admin
      ? true
      : g.publicLP &&
        g.totalContributors.toNumber() > 1 &&
        getPrincipalInUSD(quotes, g.netAssetValue, g.reserveAsset).div(parseEther('1')).gte(MIN_PRINCIPAL),
  );
};
