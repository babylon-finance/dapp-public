import { GardenDetails, QuoteResult } from 'models';
import { getPrincipalInUSD } from './getPrincipalInUSD';
import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';

const getSortAttribute = (sort: string, details: GardenDetails, quotes: QuoteResult | undefined): BigNumber => {
  if (sort === 'principal') {
    return getPrincipalInUSD(quotes, details.netAssetValue, details.reserveAsset);
  }
  if (sort === 'members') {
    return BigNumber.from(details.totalContributors);
  }
  if (sort === 'vapr') {
    // This is to force gardens without a vapr to the bottom of the sort
    const maybeVal = details.latestMetric?.returnRates?.annual?.aggregate || -101;
    return parseEther((maybeVal * 10 ** 10).toString());
  }
  if (sort === '30d') {
    // This is to force gardens without a vapr to the bottom of the sort
    const maybeVal = details.latestMetric?.returnRates?.last30?.aggregate || -101;
    return parseEther((maybeVal * 10 ** 10).toString());
  }

  return BigNumber.from(0);
};

export const getSortedGardens = (
  gardens: GardenDetails[],
  quotes: QuoteResult | undefined,
  sort: string,
): GardenDetails[] => {
  return gardens.sort((a: GardenDetails, b: GardenDetails) => {
    const aAttribute = getSortAttribute(sort, a, quotes);
    const bAttribute = getSortAttribute(sort, b, quotes);
    if (aAttribute.lt(bAttribute)) {
      return 1;
    }
    if (aAttribute.gt(bAttribute)) {
      return -1;
    }
    return 0;
  });
};
