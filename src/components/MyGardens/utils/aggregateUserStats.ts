import addresses from 'constants/addresses';
import { convertReserveFiat } from 'helpers/Numbers';
import { Contributor, Ticker, QuoteResult, UserPreferenceRecord, FullGardenDetails, Token, UserStatsObj } from 'models';
import { TokenListService } from 'services/';
import { BigNumber } from '@ethersproject/bignumber';

const tokenListService = TokenListService.getInstance();

export const aggregateUserStats = async (
  gardens: FullGardenDetails[],
  userStrategyData: any,
  quotes: QuoteResult,
  userPrefs: UserPreferenceRecord,
): Promise<UserStatsObj> => {
  const ungrouped: Contributor[] = gardens
    .map((garden) => garden && garden.contribution)
    .filter((x) => x !== undefined) as Contributor[];

  const babl = tokenListService.getTokenByAddress(addresses.tokens.BABL) as Token;
  const bablQuote = quotes['BABL'].quote;
  const currency = userPrefs?.currency || 'USD';

  let totalDeposits = BigNumber.from(0);
  let totalNAV = BigNumber.from(0);
  let totalBABL = BigNumber.from(0);
  let totalRewards = BigNumber.from(0);
  let strategistRewards = BigNumber.from(0);
  let stewardRewards = BigNumber.from(0);
  let firstDepositAtTs: number = Date.now();

  ungrouped.forEach((contribution: Contributor) => {
    const reserve = tokenListService.getTokenByAddress(contribution.reserveAddress) as Token;
    const ticker: any = quotes && quotes[reserve.symbol === 'WETH' ? 'ETH' : reserve.symbol];
    const quote = (ticker as Ticker).quote;
    totalDeposits = totalDeposits.add(
      convertReserveFiat(contribution.totalCurrentDeposits, reserve, quote[currency].price),
    );
    totalNAV = totalNAV.add(convertReserveFiat(contribution.expectedEquity, reserve, quote[currency].price));
    totalBABL = totalBABL.add(
      contribution.claimedBABL
        .add(contribution.rewards?.totalBabl || BigNumber.from(0))
        .add(contribution.pendingRewards?.totalBabl || BigNumber.from(0)),
    );
    totalRewards = totalRewards.add(
      convertReserveFiat(
        contribution.claimedProfits.add(contribution.rewards?.totalProfits || BigNumber.from(0)),
        reserve,
        quote[currency].price,
      ),
    );
    strategistRewards = strategistRewards.add(
      convertReserveFiat(contribution.rewards?.strategist.profits || BigNumber.from(0), reserve, quote[currency].price),
    );
    stewardRewards = stewardRewards.add(
      convertReserveFiat(contribution.rewards?.steward.profits || BigNumber.from(0), reserve, quote[currency].price),
    );
    if (contribution.initialDepositAt.getTime() < firstDepositAtTs) {
      firstDepositAtTs = contribution.initialDepositAt.getTime();
    }
  });

  const totalBABLFiat = convertReserveFiat(totalBABL, babl, bablQuote[currency].price);
  const totalReturn = totalNAV.sub(totalDeposits).add(totalRewards).add(totalBABLFiat);

  let annualizedReturn = 0;
  if (totalDeposits.gt(0)) {
    const diffTime = Math.abs(Date.now() - firstDepositAtTs);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    annualizedReturn = (parseFloat(totalReturn.mul(100).div(totalDeposits).toString()) / diffDays) * 365;
  }

  return {
    totalDeposits,
    totalNAV,
    totalReturn,
    totalBABL,
    annualizedReturn,
    totalRewards,
    strategistRewards,
    stewardRewards,
    activatedStrategies: userStrategyData.activatedStrategies,
    activatedVotes: userStrategyData.activatedVotes,
  };
};
