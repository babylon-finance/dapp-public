import { GardenReserveMap, MetricsResult } from './models/Metrics';
import { getContractAt, getSymbol } from 'common/utils/web3';
import { insertStrategyRows, insertGardenRows, insertWalletRows } from 'common/utils/fauna';
import { DECIMALS_BY_RESERVE } from 'common/constants.js';

import { tokens } from '../../../src/constants/addresses';
import { StrategyDetails } from '../../../src/models/Strategies';
import { FullGardenDetails } from '../../../src/models/GardenDetails';
import { QuoteResult, Quote } from '../../../src/models/QuoteResult';
import { GardenMetricRow, StrategyMetricRow, WalletMetricRow, WalletRewards } from '../../../src/models/MetricRow';
import { Token } from '../../../src/models/Token';
import contractsJSON from '../../../src/1.json';

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther, parseEther } from '@ethersproject/units';
import { JsonRpcProvider } from '@ethersproject/providers';
import { DefenderRelayProvider } from 'defender-relay-client/lib/ethers';

function notUndefined<T>(x: T | null): x is T {
  return x !== undefined;
}

const contracts = contractsJSON.contracts;

interface StrategyToGardenMap {
  [key: string]: any;
}

interface BablToReserves {
  [key: string]: any;
}

interface MetricsRun {
  gardenUpdateCount: number;
  strategyUpdateCount: number;
  walletUpdateCount: number;
}

interface GardenResult {
  address: string;
  details: any;
  contributors: string[];
  metrics: any;
}

interface FullGarden {
  record: FullGardenDetails;
  members: string[];
  metrics: any;
}

interface BablReserveResult {
  reserve: string;
  result: BigNumber[];
}

const formatReserveFloat = (reserveAmount: BigNumber, decimals: number): number => {
  if (decimals < 18) {
    reserveAmount = reserveAmount.mul(10 ** (18 - decimals));
  }

  return parseFloat(parseFloat(formatEther(reserveAmount)).toFixed(4));
};

export const submitMetrics = async (
  now: number,
  quotes: QuoteResult,
  provider: JsonRpcProvider | DefenderRelayProvider,
): Promise<MetricsRun> => {
  const controllerContract = await getContractAt(
    contracts['BabControllerProxy'].address,
    contracts['BabController'].abi,
    provider,
  );

  console.log('Controller contract: ', controllerContract.address);

  const gardenAddresses = await controllerContract.getGardens();

  const viewerContract = await getContractAt(contracts['Viewer'].address, contracts['IViewer'].abi, provider);

  console.log('Viewer contract: ', viewerContract.address);

  const bablToReserves: BablToReserves = {};

  const bablReservePromises = Object.keys(DECIMALS_BY_RESERVE).map(async (reserve): Promise<BablReserveResult> => {
    try {
      // @ts-ignore
      const decimals = DECIMALS_BY_RESERVE[reserve];
      return {
        reserve: reserve.toLowerCase(),
        result: await _getBablAsReserve(viewerContract, reserve, decimals),
      };
    } catch (err) {
      console.log(`Failed to fetch BABL -> Reserve for: ${reserve}`);
      return undefined;
    }
  });

  const reserveRecords = (await Promise.all(bablReservePromises)).filter((item: any | undefined) =>
    notUndefined(item),
  ) as any[];

  reserveRecords.forEach((record) => {
    bablToReserves[record.reserve.toLowerCase()] = record.result;
  });

  const gardenPromises = gardenAddresses.map(async (address: string): Promise<GardenResult> => {
    try {
      const details = await viewerContract.getGardenDetails(address);
      const contributors = await _getMembersForGarden(address, true);
      const metrics = await _getMetricsForGarden(address);

      return { address, details, contributors, metrics };
    } catch (error) {
      console.log(`Failed to fetch details for garden: ${address}`, error);
    }
  });

  const gardenResponses = (await _parallelResolve(gardenPromises, _delay, 1)).filter((item: GardenResult | undefined) =>
    notUndefined(item),
  ) as GardenResult[];

  const gardenRecords = gardenResponses.map((result: GardenResult) => {
    return mkGardenDetailsRecord(result);
  });

  const strategyToGardenMap: StrategyToGardenMap = {};

  gardenRecords.forEach((detail) => {
    detail.record.strategies.concat(detail.record.finalizedStrategies).forEach((strategy) => {
      strategyToGardenMap[strategy] = detail.record.address;
    });
  });

  const activeStrategies = gardenRecords
    .map((detail) => {
      return detail.record.strategies;
    })
    .flat();

  const finalizedStrategies = gardenRecords
    .map((detail) => {
      return detail.record.finalizedStrategies;
    })
    .flat();

  const activePromises = activeStrategies.map(async (strategy: string) => {
    return mkStrategyDetailsRecord(
      strategy,
      strategyToGardenMap[strategy] || '',
      await viewerContract.getCompleteStrategy(strategy),
    );
  });

  const finalizedPromises = finalizedStrategies.map(async (strategy: string) => {
    return mkStrategyDetailsRecord(
      strategy,
      strategyToGardenMap[strategy] || '',
      await viewerContract.getCompleteStrategy(strategy),
    );
  });

  const activeRecords = await Promise.all(activePromises);
  const finalizedRecords = await Promise.all(finalizedPromises);

  const { gardenMetricRows, gardenReserveMap, walletMetricRows } = await mkGardenRowsFromRecords(
    now,
    gardenRecords,
    activeRecords,
    finalizedRecords,
    quotes,
    provider,
    viewerContract,
    bablToReserves,
  );

  const strategyMetricRows = mkStrategyRowsFromRecords(now, activeRecords, gardenReserveMap);

  await insertGardenRows(gardenMetricRows);
  await insertStrategyRows(strategyMetricRows);
  await insertWalletRows(walletMetricRows);

  return {
    gardenUpdateCount: gardenMetricRows.length,
    strategyUpdateCount: strategyMetricRows.length,
    walletUpdateCount: walletMetricRows.length,
  };
};

const mkStrategyDetailsRecord = (address: string, gardenAddress: string, details: any): StrategyDetails => {
  return {
    address,
    strategist: details[0],
    name: details[1],
    garden: gardenAddress,
    opsCount: details[2][0],
    stake: details[2][1],
    absoluteTotalVotes: details[2][2].add(details[2][3]),
    totalVotes: details[2][2].add(BigNumber.from(details[2][3]).abs()),
    capitalAllocated: details[2][4],
    capitalReturned: details[2][5],
    duration: details[2][6],
    expectedReturn: details[2][7],
    maxCapitalRequested: details[2][8],
    maxPercentAllocation: details[2][12],
    enteredAt: details[2][9],
    netAssetValue: details[2][10],
    rewards: details[2][11],
    maxVoteWindowDays: 7,
    operations: undefined,
    active: details[3][0],
    dataSet: details[3][1],
    finalized: details[3][2],
    executedAt: details[4][0],
    exitedAt: details[4][1],
    inCooldown: false,
    enteredCooldownAt: details[4][3],
    executionCosts: BigNumber.from(0),
    waitingOnFinalize: false,
    isReadyWaiting: false,
    status: 'unknown',
    timePassed: 0,
    timeRemaining: 0,
    maxGasFeePercentage: details[2][13],
    maxSlippagePercentage: details[2][14],
    estimatedBABLRewards: details[2][15],
  };
};

const mkGardenDetailsRecord = (result: GardenResult): FullGarden => {
  try {
    const { address, contributors, details, metrics } = result;
    const reserveAsset = details[3] as string;
    // @ts-ignore
    const reserveDecimals = DECIMALS_BY_RESERVE[reserveAsset.toLowerCase()];
    const totalTokenSupply = details[8][7];
    const netAssetValue = details[8][6].div(10 ** (18 - reserveDecimals));
    let sharePrice = BigNumber.from(1);

    if (totalTokenSupply.gt(0)) {
      sharePrice = netAssetValue.mul(parseEther('1')).div(totalTokenSupply);
    }

    return {
      record: {
        address,
        sharePrice,
        reserveAsset,
        netAssetValue,
        totalTokenSupply,
        contributors: undefined,
        bablReturns: BigNumber.from(0),
        name: details[0],
        symbol: details[1],
        creator: details[2],
        reserveToken: {} as Token,
        active: details[4][0],
        publicLP: !details[4][1],
        publicVoter: details[4][2],
        publicStrategist: details[4][3],
        strategies: details[5],
        finalizedStrategies: details[6],
        depositHardlock: details[7][0],
        minVotesQuorum: details[7][1],
        maxDepositLimit: details[7][2],
        minVoters: details[7][3],
        minStrategyDuration: details[7][4],
        maxStrategyDuration: details[7][5],
        strategyCooldownPeriod: details[7][6],
        minContribution: details[7][7],
        minLiquidityAsset: details[7][8],
        gasFees: details[7][9],
        principal: details[8][0],
        reserveAssetRewardsSetAside: details[8][1],
        absoluteReturns: details[8][2],
        gardenInitializedAt: details[8][3].toNumber() * 1000,
        totalContributors: details[8][4],
        totalStake: details[8][5],
        seed: 0,
        contribution: undefined,
        fullStrategies: undefined,
        fees: undefined,
        hardlockStartsAt: BigNumber.from(0),
        profitSplit: BigNumber.from(0),
        performanceFees: BigNumber.from(0),
        grossReturns: BigNumber.from(0),
        strategyReturns: BigNumber.from(0),
        netReturns: BigNumber.from(0),
        profits: {
          strategist: 0,
          stewards: 0,
          lp: 0,
        },
        verified: details[7][12].toNumber(),
        mintNftAfter: 0,
        customIntegrationsEnabled: details[7][14]?.gt(0),
        availableLiquidReserve: details[8][9],
        sharePriceDelta: BigNumber.from(0),
        sharePriceDeltaDecay: BigNumber.from(0),
      },
      members: contributors,
      metrics: metrics,
    };
  } catch (error) {
    console.log(`${result.address}`, error);
    throw new Error(error);
  }
};

const mkStrategyRowsFromRecords = (
  timestamp: number,
  records: StrategyDetails[],
  gardenReserveMap: GardenReserveMap,
): StrategyMetricRow[] => {
  return records.map((strategy) => {
    return {
      garden: strategy.garden,
      strategy: strategy.address,
      principal: parseFloat(formatEther(strategy.capitalAllocated)),
      netAssetValue: parseFloat(formatEther(strategy.netAssetValue)),
      reserveToFiats: gardenReserveMap[strategy.garden.toLowerCase()] || {},
      insertedAt: timestamp,
    };
  });
};

const mkGardenRowsFromRecords = async (
  timestamp: number,
  gardens: FullGarden[],
  activeStrategies: StrategyDetails[],
  finalizedStrategies: StrategyDetails[],
  fiatQuotes: QuoteResult,
  provider: JsonRpcProvider,
  viewerContract: any,
  bablToReserves: any,
): Promise<MetricsResult> => {
  const promises = gardens.map(async (garden) => {
    try {
      const gardenContract = await getContractAt(garden.record.address, contracts['IGarden'].abi, provider);
      const reserveContract = await getContractAt(garden.record.reserveAsset, contracts['IERC20'].abi, provider);
      // @ts-ignore
      const reserveDecimals = DECIMALS_BY_RESERVE[garden.record.reserveAsset.toLowerCase()];
      const activeGardenStrategies = activeStrategies.filter((r) => r.garden === garden.record.address);
      const finalizedGardenStrategies = finalizedStrategies.filter((r) => r.garden === garden.record.address);
      const finalizedCapitalAllocated = finalizedGardenStrategies
        .map((r: any) => r.capitalAllocated)
        .reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));
      const totalCapitalAllocated = activeGardenStrategies
        .map((r: any) => r.capitalAllocated)
        .reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));
      const allCapitalAllocated = formatReserveFloat(
        finalizedCapitalAllocated.add(totalCapitalAllocated),
        reserveDecimals,
      );
      const totalCapitalReturned = activeGardenStrategies
        .map((r: any) => r.capitalReturned)
        .reduceRight((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));
      const profitsBN = totalCapitalReturned.sub(totalCapitalAllocated, reserveDecimals);
      const allocatedFloat = formatReserveFloat(totalCapitalAllocated, reserveDecimals);
      const profitsFloat = formatReserveFloat(profitsBN, reserveDecimals);
      const relativeFloat = (profitsFloat / allocatedFloat) * 100;
      const estimatedBablFloat = activeGardenStrategies
        .map((r) => parseFloat(formatEther(r.estimatedBABLRewards)))
        .reduceRight((a, b) => a + b, 0);
      const allocatedBablFloat = finalizedGardenStrategies
        .map((r) => parseFloat(formatEther(r.rewards)))
        .reduceRight((a, b) => a + b, 0);
      const keeperDebtBN = await gardenContract.keeperDebt();
      const reservePositionBN = await reserveContract.balanceOf(garden.record.address);
      const keeperDebtFloat = formatReserveFloat(keeperDebtBN, reserveDecimals);
      const rewardsSetAsideFloat = formatReserveFloat(garden.record.reserveAssetRewardsSetAside, reserveDecimals);
      const reservePositionFloat = formatReserveFloat(reservePositionBN, reserveDecimals);
      const idleCapitalFloat = reservePositionFloat - (keeperDebtFloat + rewardsSetAsideFloat);
      const { annual, last30, last90 } = _mkReturnRates(
        garden.metrics.garden || [],
        bablToReserves[garden.record.reserveAsset.toLowerCase()][0],
      );

      let strategyReturn = { absolute: 0, relativePercent: 0 };

      if (profitsFloat > 0) {
        strategyReturn = {
          absolute: profitsFloat,
          relativePercent: relativeFloat,
        };
      }

      const reserveSymbol = getSymbol(garden.record.reserveAsset);
      const quotesForReserve = (fiatQuotes[reserveSymbol].quote || {}) as Quote;

      let returnRates;
      const navInUSD = formatReserveFloat(garden.record.netAssetValue, reserveDecimals) * quotesForReserve['USD'].price;

      // Small numbers make this calculation fussy, so we just leave out tiny Gardens to avoid
      // misleading results.
      if (navInUSD > 10000) {
        returnRates = {
          last30,
          last90,
          annual,
        };
      }

      return {
        garden: garden.record.address,
        name: garden.record.name,
        bablReturns: estimatedBablFloat + allocatedBablFloat,
        private: garden.record.publicLP === false,
        createdAt: garden.record.gardenInitializedAt,
        idleReserve: idleCapitalFloat,
        reserveAsset: garden.record.reserveAsset,
        totalCapitalAllocated: allocatedFloat,
        allCapitalAllocated,
        totalContributors: garden.record.totalContributors.toNumber(),
        totalSupply: parseFloat(formatEther(garden.record.totalTokenSupply)),
        absoluteReturns: formatReserveFloat(garden.record.absoluteReturns, reserveDecimals),
        principal: formatReserveFloat(garden.record.principal, reserveDecimals),
        netAssetValue: formatReserveFloat(garden.record.netAssetValue, reserveDecimals),
        reserveToFiats: quotesForReserve,
        verified: garden.record.verified,
        strategyReturn,
        returnRates,
        insertedAt: timestamp,
      };
    } catch (err) {
      console.log(`Failed to build metric row for garden: ${garden.record.address}, skipping...`, err);
    }
  });

  const walletPromises = gardens.map((garden) => {
    return mkWalletRowsFromRecords(garden, fiatQuotes, provider, viewerContract);
  });
  const walletMetricRows = (await Promise.all(walletPromises)).flat();
  const gardenMetricRows = (await Promise.all(promises)).filter((r) => notUndefined(r)) as GardenMetricRow[];
  const gardenReserveMap: GardenReserveMap = {};

  gardenMetricRows.forEach((row: GardenMetricRow) => {
    gardenReserveMap[row.garden.toLowerCase()] = row.reserveToFiats;
  });

  return { gardenMetricRows, gardenReserveMap, walletMetricRows };
};

const mkWalletRowsFromRecords = async (
  garden: FullGarden,
  fiatQuotes: QuoteResult,
  provider: JsonRpcProvider,
  viewerContract: any,
): Promise<WalletMetricRow[]> => {
  const { address, totalTokenSupply, netAssetValue, reserveAsset } = garden.record;
  // @ts-ignore
  const reserveDecimals = DECIMALS_BY_RESERVE[reserveAsset.toLowerCase()];
  const promises = garden.members.map(async (cAddress) => {
    try {
      const contribution = await viewerContract.getContributionAndRewards(address, cAddress);
      const claimedRewards = {
        babl: formatReserveFloat(contribution[0][3], 18),
        profits: formatReserveFloat(contribution[0][4], reserveDecimals),
      };
      const unclaimedRewards = _buildRewardsObject(contribution[1], reserveDecimals);
      const pendingRewards = _buildRewardsObject(contribution[2], reserveDecimals);
      const balance = formatReserveFloat(contribution[0][6], 18);
      const tokenSupplyFloat = formatReserveFloat(totalTokenSupply, 18);
      const principal = formatReserveFloat(contribution[0][6], reserveDecimals);
      const ownership = balance / tokenSupplyFloat;
      const gardenNAV = formatReserveFloat(netAssetValue, reserveDecimals);
      const walletNAV = gardenNAV * ownership;
      const reserveToFiats = (fiatQuotes[getSymbol(reserveAsset)].quote || {}) as Quote;

      return {
        address: cAddress,
        garden: address,
        walletNAV,
        balance,
        principal,
        ownership,
        unclaimedRewards,
        pendingRewards,
        claimedRewards,
        reserveAsset,
        reserveToFiats,
        insertedAt: Date.now(),
      };
    } catch (error) {
      console.log(`Failed to build wallet metrics for address: ${cAddress}`, error);
      return undefined;
    }
  });

  const walletRows = (await Promise.all(promises)).filter((item: WalletMetricRow | undefined) =>
    notUndefined(item),
  ) as WalletMetricRow[];

  return walletRows;
};

const _getMembersForGarden = async (gardenAddress: string, force: boolean = false): Promise<string[]> => {
  return await fetch(`https://www.babylon.finance/api/v1/get-members/${gardenAddress}?force=${force}`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.log(`Failed to get members for ${gardenAddress}`, error);
      return [];
    });
};

const _getMetricsForGarden = async (garden: string): Promise<any> => {
  const results = await fetch(`https://www.babylon.finance/api/v1/get-garden-metrics/${garden}`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => {
      console.log('Failed to fetch garden metrics', err.toString());
      return { garden: [], strategy: [] };
    });

  return results;
};

const _buildRewardsObject = (contribution: any, reserveDecimals: number): WalletRewards => {
  const [strategistBabl, strategistProfit, stewardBabl, stewardProfit, lpBabl, totalBabl] = contribution;
  return {
    strategist: {
      babl: formatReserveFloat(strategistBabl, 18),
      profits: formatReserveFloat(strategistProfit, reserveDecimals),
    },
    steward: {
      babl: formatReserveFloat(stewardBabl, 18),
      profits: formatReserveFloat(stewardProfit, reserveDecimals),
    },
    lp: {
      babl: formatReserveFloat(lpBabl, 18),
      profits: 0,
    },
    totalProfits: formatReserveFloat(strategistProfit.add(stewardProfit), reserveDecimals),
    totalBabl: formatReserveFloat(totalBabl, 18),
  };
};

const _parallelResolve = async (arr, f, n = Infinity): Promise<any> => {
  const results = arr.map(() => undefined);
  let i = 0;

  const worker = async () => {
    for (; i < arr.length; i++) {
      results[i] = await f(arr[i], i);
    }
  };

  await Promise.all(Array.from({ length: Math.min(arr.length, n) }, worker));
  return results;
};

const _delay = (t) => new Promise((r) => setTimeout(r, t, t));

const _mkReturnRates = (metrics: any[], bablToReserve: BigNumber): any => {
  const last30 = metrics.length >= 30 ? _buildReturnRate(metrics.slice(-30), bablToReserve) : undefined;
  const last90 = metrics.length >= 90 ? _buildReturnRate(metrics.slice(-90), bablToReserve) : undefined;
  const annual = metrics.length >= 90 ? _buildReturnRate(metrics.slice(-90), bablToReserve, true) : undefined;
  return {
    last30,
    last90,
    annual,
  };
};

const _buildReturnRate = (metrics: any[], bablToReserve: BigNumber, annualized: boolean = false): any => {
  const filteredRows = metrics.filter((item) => item.data.bablReturns !== undefined);
  const bablExchangeFloat = parseFloat(formatEther(bablToReserve));
  const openWindow = filteredRows.slice(0, 14);
  const avgNavA = openWindow.map((i) => i.data.netAssetValue).reduce((a, b) => a + b, 0) / openWindow.length;
  const avgSupplyA = openWindow.map((i) => i.data.totalSupply).reduce((a, b) => a + b, 0) / openWindow.length;
  const { bablReturns: bablReturnsA } = filteredRows.slice(-90)[0].data;
  const {
    netAssetValue: navB,
    totalSupply: supplyB,
    bablReturns: bablReturnsB,
    totalCapitalAllocated: allocatedB,
  } = filteredRows[filteredRows.length - 1].data;
  // We use an average of the opening window to smooth volitility
  const sharePriceA = avgNavA / avgSupplyA;
  const sharePriceB = navB / supplyB;
  // Change in BABL earned from start to current during the period
  const bablChangeAsReserve = (bablReturnsB - bablReturnsA) * bablExchangeFloat;
  // If BABL change is < 0 it means there is no return from BABL but it should never be a loss
  const bablReturnRate = bablChangeAsReserve > 0 && allocatedB > 0 ? (bablChangeAsReserve / supplyB) * 100 : 0;
  const investmentReturnRate = ((sharePriceB - sharePriceA) / sharePriceA) * 100;
  // Sum the return of investments and BABL earned from allocated capital as the aggregate return over the period.
  const aggregateReturnRate = investmentReturnRate + bablReturnRate;
  return {
    raw: parseFloat((annualized ? Math.max(investmentReturnRate * 4, -100) : investmentReturnRate).toFixed(4)),
    babl: parseFloat((annualized ? Math.max(bablReturnRate * 4, -100) : bablReturnRate).toFixed(4)),
    aggregate: parseFloat((annualized ? Math.max(aggregateReturnRate * 4, -100) : aggregateReturnRate).toFixed(4)),
  };
};

const _getBablAsReserve = async (viewer: any, reserve: string, decimals: number): Promise<BigNumber[]> => {
  let bablPrice;
  let reserveBablPrice;

  if (decimals !== 18) {
    try {
      bablPrice = await viewer.getPriceAndLiquidity(tokens.WETH, tokens.BABL);
      const reservePrice = await viewer.getPriceAndLiquidity(tokens.WETH, reserve);
      reserveBablPrice = reservePrice[0]
        .div(bablPrice[0])
        .mul(10 ** 9)
        .mul(10 ** 9);
    } catch (e) {
      console.log(`Failed to fetch price and liquidity for pair WETH / ${reserve}`);
      throw Error(e);
    }
  } else {
    try {
      bablPrice = await viewer.getPriceAndLiquidity(tokens.BABL, tokens.WETH);
      const wethPrice = await viewer.getPriceAndLiquidity(tokens.WETH, reserve);
      reserveBablPrice = bablPrice[0]
        .mul(wethPrice[0])
        .div(10 ** 9)
        .div(10 ** 9);
    } catch (e) {
      console.log(`Failed to fetch price and liquidity for pair WETH / ${reserve}`);
      throw Error(e);
    }
  }

  return Promise.resolve([reserveBablPrice, bablPrice[1]]);
};
