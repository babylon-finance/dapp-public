import addresses from 'constants/addresses';
import { TokenListService, ViewerService } from 'services';
import { formatEtherDecimal } from 'helpers/Numbers';
import {
  LeaderboardResult,
  LeaderboardResponse,
  GardenLeader,
  QuoteResult,
  Token,
  BablToReserves,
  MetricsForGarden,
  ProtocolMetricsCache,
  Currency,
} from 'models';
import { IS_MAINNET } from 'config';

import { BigNumber } from '@ethersproject/bignumber';
import moment, { Moment } from 'moment';

class LeaderboardService {
  private static instance: LeaderboardService;
  private tokenListService: TokenListService;
  private viewerService: ViewerService;
  private leaderboardCache: LeaderboardResult | undefined;
  private protocolCache: ProtocolMetricsCache | undefined;
  public bablToReserves: BablToReserves | undefined;
  public leaderboardFetch: Moment | undefined;
  public protocolFetch: Moment | undefined;

  private constructor() {
    this.leaderboardCache = undefined;
    this.protocolCache = undefined;
    this.leaderboardFetch = undefined;
    this.protocolFetch = undefined;
    this.bablToReserves = undefined;
    this.tokenListService = TokenListService.getInstance();
    this.viewerService = ViewerService.getInstance();
  }

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }

    return LeaderboardService.instance;
  }

  public async fetchProtocolData(): Promise<ProtocolMetricsCache | undefined> {
    if (this.protocolCache) {
      const latestFetch = moment(this.protocolFetch);
      const diffSince = moment().diff(latestFetch);
      const sinceLatestSec = moment.duration(diffSince).seconds();

      if (sinceLatestSec < 1200 || this.protocolCache !== undefined) {
        return this.protocolCache;
      }
    }

    try {
      const metrics = await this.doFetchProtocolMetrics();
      this.protocolFetch = moment();
      this.protocolCache = metrics;

      if (!metrics) {
        console.log('Failed to fetch updated metrics');
        return this.protocolCache;
      }

      this.protocolFetch = moment();
      this.protocolCache = metrics;

      return this.protocolCache;
    } catch (err) {
      console.log('Failed to fetch protcol metrics', err);

      return undefined;
    }
  }

  public async fetchLeaderboardData(quotes: QuoteResult | undefined): Promise<LeaderboardResult | undefined> {
    if (this.leaderboardCache) {
      const latestFetch = moment(this.leaderboardFetch);
      const diffSince = moment().diff(latestFetch);
      const sinceLatestSec = moment.duration(diffSince).seconds();

      if (sinceLatestSec < 1200 || this.leaderboardCache !== undefined) {
        return this.leaderboardCache;
      }
    }

    try {
      const metrics = await this.doFetchLeaderboardMetrics();
      const qualified = metrics?.results.map((i) => i.garden) || [];

      if (!metrics?.results) {
        console.log('Failed to fetch updated metrics');
        return this.leaderboardCache;
      }

      const bablToReserves = await this.mkBablToReserves();

      // Update latest ts and localCache
      this.leaderboardFetch = moment();
      this.leaderboardCache = {
        metrics,
        qualified,
        bablToReserves,
      };

      if (quotes && metrics && IS_MAINNET) {
        // Update the global metrics cache for the homepage et al
        await this.updateMetricsCache({
          investmentReturnsUSD: metrics.totalNAV[Currency.USD.ticker] - metrics.totalPrincipal[Currency.USD.ticker],
          aggregateReturnsUSD: this.mkReturnsAfterBabl(
            bablToReserves,
            Currency.USD.ticker,
            quotes,
            metrics.totalNAV[Currency.USD.ticker],
            metrics.totalPrincipal[Currency.USD.ticker],
            metrics.results,
          ),
          totalBABL: metrics.totalBABL,
          totalContributors: metrics.totalContributors,
          totalGardens: metrics.totalGardens,
          usdTotalNAV: metrics.totalNAV[Currency.USD.ticker],
          usdTotalPrincipal: metrics.totalPrincipal[Currency.USD.ticker],
        });
      }

      return this.leaderboardCache;
    } catch (err) {
      console.log('Failed to fetch leaderboard data', err);
      return undefined;
    }
  }

  public mkReturnsAfterBabl(
    bablToReserves: BablToReserves,
    currency: string,
    quotes: QuoteResult,
    navFiat: number,
    principalFiat: number,
    gardens: GardenLeader[],
  ): number {
    const bablFiatTotal = gardens
      .map((row) => {
        const reserve = this.tokenListService.getTokenByAddress(row.reserveAsset) as Token;
        const { bablFiat } = this.mkMetricsForGarden(row, bablToReserves, currency, quotes, reserve);
        return bablFiat;
      })
      .reduce((a, b) => a + b, 0);

    return navFiat + bablFiatTotal - principalFiat;
  }

  public mkMetricsForGarden(
    row: GardenLeader,
    bablToReserves: BablToReserves,
    currency: string,
    quotes: QuoteResult,
    reserve: Token,
  ): MetricsForGarden {
    const { bablReturns, principalByTicker, navByTicker, returnRates, verified } = row;
    const principalFiat = principalByTicker[currency] || 0;
    const navFiat = navByTicker[currency] || 0;
    const bablFiat =
      bablReturns *
        // Keep in mind the view / oracle values are denominated in 10**18 regardless of reserve asset
        formatEtherDecimal(bablToReserves[reserve.symbol]) *
        quotes[reserve.symbol].quote[currency].price || 0;
    const wealthFiat = navFiat + bablFiat - principalFiat || 0;

    return { principalFiat, navFiat, bablFiat, wealthFiat, reserve, returnRates, verified };
  }

  /////////////////////// Private Methods

  private async updateMetricsCache(data: ProtocolMetricsCache): Promise<void> {
    await fetch('/api/v1/update-protocol-metrics', { method: 'POST', body: JSON.stringify(data) }).catch((err) =>
      console.log('Failed to update metrics cache, skipping...', err),
    );
  }

  private async doFetchLeaderboardMetrics(): Promise<LeaderboardResponse | undefined> {
    const result = await fetch('/api/v1/get-leaderboard-metrics', { method: 'GET' })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch leaderboard data', err);
        return undefined;
      });

    return result;
  }

  private async doFetchProtocolMetrics(): Promise<ProtocolMetricsCache | undefined> {
    const result = await fetch('/api/v1/get-protocol-metrics', { method: 'GET' })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch protocol metrics', err);
        return undefined;
      });

    return result;
  }

  private async mkBablToReserves(): Promise<BablToReserves> {
    if (this.bablToReserves) {
      const latestFetch = moment(this.leaderboardFetch);
      const diffSince = moment().diff(latestFetch);
      const sinceLatestSec = moment.duration(diffSince).seconds();

      if (sinceLatestSec < 1200 || this.leaderboardCache !== undefined) {
        return this.bablToReserves;
      }
    }

    const usdc = this.tokenListService.getTokenByAddress(addresses.tokens.USDC);
    const dai = this.tokenListService.getTokenByAddress(addresses.tokens.DAI);
    const weth = this.tokenListService.getTokenByAddress(addresses.tokens.WETH);
    const wbtc = this.tokenListService.getTokenByAddress(addresses.tokens.WBTC);
    const babl = this.tokenListService.getTokenByAddress(addresses.tokens.BABL);
    const aave = this.tokenListService.getTokenByAddress(addresses.tokens.AAVE);
    const reserves = [usdc, dai, weth, wbtc, babl, aave];

    const mapping = {
      USDC: BigNumber.from(0),
      DAI: BigNumber.from(0),
      WETH: BigNumber.from(0),
      WBTC: BigNumber.from(0),
      BABL: BigNumber.from(0),
      AAVE: BigNumber.from(0),
    };

    for await (const reserve of reserves) {
      try {
        if (reserve?.symbol) {
          mapping[reserve.symbol] = (await this.viewerService.getBablAsReserve(reserve.address))[0];
        }
      } catch (e) {
        console.log(`Error fetching reserve: ${reserve?.symbol} to BABL price`, e);
      }
    }

    this.bablToReserves = mapping;

    return mapping;
  }
}

export default LeaderboardService;
