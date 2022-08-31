import { formatEtherDecimal, formatReserveFloat } from 'helpers/Numbers';
import { TokenListService, ViewerService } from 'services';
import { GardenLeader, QuoteResult, Token } from 'models';
import addresses from 'constants/addresses';

import { BigNumber } from '@ethersproject/bignumber';

const tokenListService = TokenListService.getInstance();
const viewerService = ViewerService.getInstance();

export interface BablToReserves {
  DAI: BigNumber;
  USDC: BigNumber;
  WETH: BigNumber;
  WBTC: BigNumber;
}

export interface MetricsForGarden {
  principalFiat: number;
  navFiat: number;
  bablFiat: number;
  wealthFiat: number;
  reserve: Token;
}

export const mkBablToReserves = async (): Promise<BablToReserves> => {
  const usdc = tokenListService.getTokenByAddress(addresses.tokens.USDC);
  const dai = tokenListService.getTokenByAddress(addresses.tokens.DAI);
  const weth = tokenListService.getTokenByAddress(addresses.tokens.WETH);
  const wbtc = tokenListService.getTokenByAddress(addresses.tokens.WBTC);
  const babl = tokenListService.getTokenByAddress(addresses.tokens.BABL);
  const reserves = [usdc, dai, weth, wbtc, babl];

  const mapping = {
    USDC: BigNumber.from(0),
    DAI: BigNumber.from(0),
    WETH: BigNumber.from(0),
    WBTC: BigNumber.from(0),
    BABL: BigNumber.from(0),
  };

  for await (const reserve of reserves) {
    if (reserve?.symbol) {
      mapping[reserve.symbol] = (await viewerService.getBablAsReserve(reserve.address))[0];
    }
  }

  return mapping;
};

export const mkMetricsForGarden = (
  row: GardenLeader,
  bablToReserves: BablToReserves,
  currency: string,
  quotes: QuoteResult,
): MetricsForGarden => {
  const reserve = tokenListService.getTokenByAddress(row.reserveAsset) as Token;
  const principalFiat = row.principalByTicker[currency] || 0;
  const navFiat = row.navByTicker[currency] || 0;
  const bablFiat =
    row.bablReturns *
      // Keep in mind the view / oracle values are denominated in 10**18 regardless of reserve asset
      formatEtherDecimal(bablToReserves[reserve.symbol]) *
      quotes[reserve.symbol].quote[currency].price || 0;
  const wealthFiat = navFiat + bablFiat - principalFiat || 0;

  return { principalFiat, navFiat, bablFiat, wealthFiat, reserve };
};
