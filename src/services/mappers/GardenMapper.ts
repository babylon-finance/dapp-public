import addresses from 'constants/addresses';
import {
  MinimalGardenDetails,
  FullGardenDetails,
  GardenFees,
  Contributor,
  ContributorRewards,
  StrategyDetails,
  GardenPermission,
  Token,
  FiatQuote,
  Currency,
} from 'models';
import { getOldContribution } from 'services/oldContributions';
import { formatEtherDecimal, parseReserve } from 'helpers/Numbers';
import {
  calculateGardenStrategiesTotal,
  calculateGardenStrategiesTotalBabl,
} from 'components/garden/detail/utils/calculateGardenStrategiesTotal';
import { RESERVES_CREATION_CONFIG } from 'config';
import { NftService, TokenListService, UserPreferenceService, QuoteService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';

const userPreferenceService = UserPreferenceService.getInstance();
const tokenListService = TokenListService.getInstance();
const quoteService = QuoteService.getInstance();
const nftService = NftService.getInstance();

export const retrievePartialGardenDetails = async (params: any): Promise<MinimalGardenDetails> => {
  const reserveToken = tokenListService.getTokenByAddress(params[5]) as Token;
  return {
    address: params[0],
    name: params[1],
    publicLP: params[2],
    verified: params[3].toNumber(),
    totalContributors: params[4],
    reserveAsset: params[5],
    netAssetValue: params[6].div(10 ** (18 - reserveToken.decimals)),
    customIntegrationsEnabled: params[7],
    reserveToken,
  };
};

export const retrieveFullGardenDetails = async (
  userAddress: string | undefined,
  address: string,
  details: any,
  contribution: any,
  nft: boolean = false,
): Promise<FullGardenDetails> => {
  const reserve = tokenListService.getTokenByAddress(details[3]) as Token;
  const maybeQuotes = await userPreferenceService.getOrUpdateFiatPrices();
  let defaultMinDeposit = BigNumber.from(
    parseReserve(RESERVES_CREATION_CONFIG[reserve.symbol.toLowerCase()].minDeposit.toString(), reserve),
  );

  let reserveUSDQuote: FiatQuote | undefined;

  if (maybeQuotes) {
    reserveUSDQuote = quoteService.getQuoteForReserveAndCurrency(reserve.symbol, Currency.USD.ticker, maybeQuotes);
  }

  const minDeposit = defaultMinDeposit.gt(details[7][7]) ? defaultMinDeposit : details[7][7];

  const detailsObj: FullGardenDetails = {
    address,
    name: details[0],
    symbol: details[1],
    creator: details[2].filter((c: string) => c !== addresses.zero),
    reserveAsset: details[3],
    reserveToken: tokenListService.getTokenByAddress(details[3]) as Token,
    active: details[4][0],
    fees: undefined,
    profitSplit: BigNumber.from(0),
    performanceFees: BigNumber.from(0),
    grossReturns: BigNumber.from(0),
    strategyReturns: BigNumber.from(0),
    bablReturns: BigNumber.from(0),
    netReturns: BigNumber.from(0),
    publicLP: !details[4][1],
    publicStrategist: details[4][2],
    publicVoter: details[4][3],
    strategies: details[5],
    finalizedStrategies: details[6],
    depositHardlock: details[7][0],
    minVotesQuorum: details[7][1],
    maxDepositLimit: details[7][2],
    minVoters: details[7][3],
    minStrategyDuration: details[7][4],
    maxStrategyDuration: details[7][5],
    strategyCooldownPeriod: details[7][6],
    minContribution: minDeposit,
    minLiquidityAsset: details[7][8],
    gasFees: details[7][9],
    verified: details[7][12].toNumber(),
    principal: details[8][0],
    reserveAssetRewardsSetAside: details[8][1],
    absoluteReturns: details[8][2],
    gardenInitializedAt: details[8][3].toNumber() * 1000,
    totalContributors: details[8][4],
    totalStake: details[8][5],
    netAssetValue: details[8][6].div(10 ** (18 - reserve.decimals)),
    totalTokenSupply: details[8][7],
    seed: details[8][8].toNumber(),
    contribution: undefined,
    contributors: undefined,
    fullStrategies: undefined,
    sharePrice: BigNumber.from(1),
    profits: {
      strategist: formatEtherDecimal(details[9][0].mul(100)),
      stewards: formatEtherDecimal(details[9][1].mul(100)),
      lp: formatEtherDecimal(details[9][2].mul(100)),
    },
    availableLiquidReserve: details[8][9],
    sharePriceDeltaDecay: details[7][10],
    sharePriceDelta: details[7][11],
    mintNftAfter: details[7][13].lt(1000000000) ? details[7][13].toNumber() : 1000000000,
    customIntegrationsEnabled: details[7][14]?.toNumber() > 0,
    hardlockStartsAt: details[7][15],
  };

  if (nft) {
    // In a few unfortunate cases we created gardens without the correct seed, in those cases we generate one
    // from the address + init timestamp which will be stable
    if (detailsObj.seed === 0) {
      detailsObj.seed = nftService.buildNftSeed(address, detailsObj.gardenInitializedAt);
    }

    const maybeNft = await nftService.getGardenNft(address, detailsObj.seed);

    if (maybeNft) {
      detailsObj.nft = maybeNft;
    }
  }

  if (detailsObj.totalTokenSupply.gt(0)) {
    detailsObj.sharePrice = detailsObj.netAssetValue.mul(parseEther('1')).div(detailsObj.totalTokenSupply);
  }

  // Get contribution data for the wallet / Garden if it exists.
  const maybeContribution = getContributionObject(userAddress, address, detailsObj, contribution, reserve);
  detailsObj.contribution = maybeContribution;
  if (maybeContribution) {
    const depositReserve =
      reserve.decimals < 18
        ? maybeContribution.tokens
            .mul(detailsObj.sharePrice)
            .div(parseEther('1'))
            .mul(10 ** (18 - reserve.decimals))
        : maybeContribution.tokens.mul(detailsObj.sharePrice).div(parseEther('1'));
    const depositUsdBN = reserveUSDQuote
      ? depositReserve.mul(BigNumber.from(reserveUSDQuote.price.toFixed(0)))
      : BigNumber.from(0);

    // If the contribution amount is less than 1 USD we treat it as dust and ignore the contribution.
    const isDust = depositUsdBN.lt(parseEther('1'));

    if (isDust && detailsObj.contribution) {
      detailsObj.contribution.isDust = true;
    }
  }

  return detailsObj;
};

export const getContributionObject = (
  userAddress: string | undefined,
  gardenAddress: string,
  details: FullGardenDetails,
  contribution: any,
  reserve: Token,
  permissions?: GardenPermission,
): Contributor | undefined => {
  let contributionObject: Contributor | undefined = undefined;
  if (contribution && userAddress) {
    const userNetValue = contribution[0][6].mul(details.netAssetValue).div(details.totalTokenSupply);
    const userOwnershipFloat =
      parseFloat(contribution[0][6].toString()) / parseFloat(details.totalTokenSupply.toString());
    const initialDepositAt = new Date(contribution[0][1].toNumber() * 1000);
    // If it is a weth garden we check user has 1 / 10,000 tokens else check if they have at least 1
    // This needs to be improved to handle WBTC and really any variance here.
    let MIN_MEANINGFUL_AMOUNT =
      details.reserveAsset === addresses.tokens.WETH || details.reserveAsset === addresses.tokens.WBTC
        ? parseEther('1').div(10000)
        : parseEther('1');
    const oldBugFixedAt = new Date('06-15-2021'); // Contribution bug fix
    contributionObject = {
      lastDeposit: contribution[0][0] ? new Date(contribution[0][0].toNumber() * 1000) : undefined,
      initialDepositAt,
      claimedAt: contribution[0][2] ? new Date(contribution[0][2].toNumber() * 1000) : undefined,
      claimedBABL: contribution[0][3],
      claimedProfits: contribution[0][4],
      totalCurrentDeposits: contribution[0][6].lt(MIN_MEANINGFUL_AMOUNT)
        ? BigNumber.from(0)
        : contribution[0][5].add(
            initialDepositAt <= oldBugFixedAt ? getOldContribution(gardenAddress, userAddress) : BigNumber.from(0),
          ),
      tokens: contribution[0][6],
      lockedBalance: contribution[0][7],
      availableTokens: contribution[0][6].sub(contribution[0][7]),
      contributorPower: contribution[0][8],
      avgSharePrice: contribution[0][9],
      userLock: contribution[0][10],
      votingPower: contribution[0][11],
      reserveAddress: details.reserveAsset,
      rewards: getRewardsObject(contribution[1]),
      pendingRewards: getRewardsObject(contribution[2]),
      expectedEquity: userNetValue,
      percentOwnershipDisplay: (userOwnershipFloat * 100).toFixed(2),
      unclaimedStrategies: details.finalizedStrategies,
      createdStrategies:
        details.fullStrategies?.filter(
          (strategy: StrategyDetails) => strategy.strategist.toLowerCase() === userAddress.toLowerCase(),
        ).length || 0,
      address: userAddress,
      isDust: false,
    };
    const hardlockStartsAt = details.hardlockStartsAt
      ? new Date(details.hardlockStartsAt.toNumber() * 1000)
      : undefined;
    // Override hardlock if needed
    const lastDeposit = contributionObject?.lastDeposit || 0;
    if (hardlockStartsAt && contribution) {
      if (hardlockStartsAt > lastDeposit) {
        contributionObject.lastDeposit = hardlockStartsAt;
      }
    }
    if (permissions) {
      contributionObject = { ...contributionObject, permissions };
    }
    return contributionObject;
  }
};

export const updatesFeesAndReturnsGarden = (
  gardenDetails: FullGardenDetails,
  bablToReserve: BigNumber,
): FullGardenDetails => {
  if (gardenDetails.reserveToken.decimals < 18) {
    bablToReserve = bablToReserve.div(10 ** (18 - gardenDetails.reserveToken.decimals));
  }
  gardenDetails.fees = getGardenFees(gardenDetails);
  gardenDetails.profitSplit = gardenDetails.fees.performance.actualized.stewards
    .add(gardenDetails.fees.performance.anticipated.stewards)
    .add(gardenDetails.fees.performance.actualized.strategist)
    .add(gardenDetails.fees.performance.anticipated.strategist);
  gardenDetails.performanceFees = gardenDetails.fees.performance.actualized.protocol.add(
    gardenDetails.fees.performance.anticipated.protocol,
  );
  gardenDetails.strategyReturns = calculateGardenStrategiesTotal(gardenDetails.fullStrategies);
  gardenDetails.bablReturns = calculateGardenStrategiesTotalBabl(gardenDetails.fullStrategies)
    .mul(bablToReserve)
    .div(parseEther('1'));
  gardenDetails.netReturns = gardenDetails.netAssetValue
    .sub(gardenDetails.principal)
    .add(gardenDetails.profitSplit)
    .add(gardenDetails.bablReturns);
  gardenDetails.grossReturns = gardenDetails.netReturns
    .add(gardenDetails.fees.gas)
    .add(gardenDetails.fees.management)
    .add(gardenDetails.performanceFees);

  return gardenDetails;
};

function getRewardsObject(contribution: any): ContributorRewards | undefined {
  let rewards: ContributorRewards | undefined = undefined;
  if (contribution) {
    const [strategistBabl, strategistProfit, stewardBabl, stewardProfit, lpBabl, totalBabl] = contribution;
    rewards = {
      strategist: {
        babl: strategistBabl,
        profits: strategistProfit,
      },
      steward: {
        babl: stewardBabl,
        profits: stewardProfit,
      },
      lp: {
        babl: lpBabl,
        profits: BigNumber.from(0),
      },
      totalProfits: strategistProfit.add(stewardProfit),
      totalBabl: totalBabl,
    };
  }
  return rewards;
}

// 5% Protocol fee, maybe we grab from the Controller sometime soon since governance could change it
const PROTOCOL_PERF_FEE = 5;

function getGardenFees(details: FullGardenDetails): GardenFees {
  const finalizedStrategies = details.fullStrategies?.filter((s) => s.finalized === true) || [];
  const activeStrategies = details.fullStrategies?.filter((s) => s.active === true) || [];

  const totalAllocated = finalizedStrategies
    .concat(activeStrategies)
    .map((s) => s.capitalAllocated)
    .reduceRight((a, b) => a.add(b), BigNumber.from(0));

  // take 0.5% from total allocated across all strategies
  const managementFees = totalAllocated.mul(BigNumber.from(5)).div(BigNumber.from(1000));

  const actualizedProfits = finalizedStrategies
    .filter((s) => s.capitalReturned > s.capitalAllocated)
    .map((s) => s.capitalReturned.sub(s.capitalAllocated))
    .reduceRight((a, b) => a.add(b), BigNumber.from(0));

  const anticipatedProfits = activeStrategies
    .map((s) => s.netAssetValue.sub(s.capitalAllocated))
    .filter((item) => item.gt(BigNumber.from(0)))
    .reduceRight((a, b) => a.add(b), BigNumber.from(0));

  const totalPerfFee = BigNumber.from(details.profits.stewards + details.profits.strategist + PROTOCOL_PERF_FEE);

  // Take 5% protocol fee + strategist split + steward split
  const actualizedTotal = actualizedProfits.mul(totalPerfFee).div(BigNumber.from(100));
  const actualizedStrategist = actualizedProfits.mul(details.profits.strategist).div(BigNumber.from(100));
  const actualizedStewards = actualizedProfits.mul(details.profits.stewards).div(BigNumber.from(100));
  const actualizedProtocol = actualizedProfits.mul(PROTOCOL_PERF_FEE).div(BigNumber.from(100));

  const anticipatedTotal = anticipatedProfits.mul(totalPerfFee).div(BigNumber.from(100));
  const anticipatedStrategist = anticipatedProfits.mul(details.profits.strategist).div(BigNumber.from(100));
  const anticipatedStewards = anticipatedProfits.mul(details.profits.stewards).div(BigNumber.from(100));
  const anticipatedProtocol = anticipatedProfits.mul(PROTOCOL_PERF_FEE).div(BigNumber.from(100));

  return {
    management: managementFees,
    performance: {
      actualized: {
        strategist: actualizedStrategist,
        stewards: actualizedStewards,
        protocol: actualizedProtocol,
        total: actualizedTotal,
      },
      anticipated: {
        strategist: anticipatedStrategist,
        stewards: anticipatedStewards,
        protocol: anticipatedProtocol,
        total: anticipatedTotal,
      },
    },
    gas: details.gasFees,
    total: managementFees.add(actualizedTotal).add(anticipatedTotal).add(details.gasFees),
  };
}
