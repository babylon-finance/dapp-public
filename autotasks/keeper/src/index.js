import { ethers } from 'ethers';
import { performance } from 'perf_hooks';
import _ from 'lodash';
import faunadb from 'faunadb';

import { from, eth, sortBN, parseUnits } from 'common/utils/helpers.js';
import { getQuotes } from 'common/utils/quotes.js';
import { getStore } from 'common/utils/store.js';
import { sendErrorToTelegram } from 'common/utils/telegram.js';
import { getVotesForStrategy, getFirstNAVForStrategy, storeStrategyFirstNAV } from 'common/utils/fauna.js';
import {
  getProvider,
  getRelayer,
  getNow,
  toETH,
  toPercentage,
  getGasPrice,
  getPrice,
  getContractAt,
  toAsset,
  toAssetWithSymbol,
  getSymbol,
  checkQuotes,
  checkAndSwapAssets,
  weiToAsset,
  getDecimals,
} from 'common/utils/web3.js';
import { BigNumber } from 'common/utils/bn.js';
import {
  DAY_IN_SECONDS,
  KEEPER_PERCENTAGE,
  GAS_LIMIT_PERCENTAGE,
  MAX_CANDIDATE_PERIOD,
  DECIMALS_BY_RESERVE,
  MAX_FEE_MAP,
  PROTOCOL_MANAGEMENT_FEE,
  AUTOTASK_DURATION,
  WETH,
  DAI,
  CAPITAL_ALLOCATION_MAX_DURATION,
  MAX_GAS_PRICE,
  CAPITAL_ALLOCATION_GAS_FEE_RATIO,
  MIN_LIQ_PERCENTAGE,
} from 'common/constants.js';
import { insertOrUpdateRowForStrategy, insertKeeperStatsRow } from 'shared/strategy/queries.ts';
import { StrategyActions, StrategyErrorCodes, StrategyStates } from 'shared/strategy/models/StrategyState.ts';

import { default as contractsJSON } from '../../../src/1.json';
const contracts = contractsJSON.contracts;

const RUN = process.env.RUN;

const STUCK_STRATEGIES = [
  '0x64e257bf6ac9b390fe7452181ea233362a9c2995', // ATG
  '0x9303D3281B0D3956ebFF031f0b5910A188ef891b', // ETH + WBTC Arkad
  '0x5C0aFc3BFab3492baA1fC2F3C02355df7915398f', // Leverage long stETH Arkad
  '0xc38E5828c1c84F4687f2080c0C8d2e4a89695A11', // long eth, borrow dai, steth crv convex
  '0x8452baC761D9f78AA2aC450C1e7F3980Ca0C0785', // long BABL arkad
  '0x9991D647A35810023A1CDAdD8cE27C5F3a222e7d', // AAVE; long; arkad;
  '0x6F854a988577Ce994926a8979881E6a18E6a70dF', // red pill
];

const STUCK_EXECUTE = [];

// Used to count strategies for reporting purposes
// Be careful with these array if execute/finalization/vote begin using concurrency or run in parallel to each other
let ACTIVE_STRATEGIES = [];

function transformStrategy(obj) {
  const props = [
    'maxAllocationPercentage',
    'maxGasFeePercentage',
    'stake',
    'totalPositiveVotes',
    'totalNegativeVotes',
    'capitalAllocated',
    'capitalReturned',
    'expectedReturn',
    'maxCapitalRequested',
    'NAV',
  ];

  return Object.keys(obj).reduce((ret, key) => {
    ret[key] = props.includes(key) ? from(obj[key]) : obj[key];
    return ret;
  }, {});
}

async function updateStrategy(strategyContract, strategyNft, strategiesStore, store, strategyViewer) {
  let strategyObj = strategiesStore[strategyContract.address];
  console.log(
    'strategyObj',
    _.mapValues(strategyObj, (o) => o.toString()),
  );
  const old = _.cloneDeep(strategyObj);
  if (!strategyObj.name) {
    strategyObj.name = await strategyNft.getStrategyName(strategyContract.address);
  }

  // TODO: optimize to fetch only if data has changed
  if (true || !strategyObj.updatedAt) {
    let [, active, , finalized, executedAt, exitedAt, updatedAt] = await strategyContract.getStrategyState();

    executedAt = executedAt.toNumber();
    exitedAt = exitedAt.toNumber();
    updatedAt = updatedAt.toNumber();

    strategyObj = { ...strategyObj, active, finalized, executedAt, exitedAt, updatedAt };
  }

  // TODO: optimize to fetch only if data has changed
  if (true || !strategyObj.strategist) {
    // Fetch from StrategyViewer for optimization
    let [
      strategist,
      ,
      [
        ops,
        stake,
        totalPositiveVotes,
        totalNegativeVotes,
        capitalAllocated,
        capitalReturned,
        duration,
        expectedReturn,
        maxCapitalRequested,
        enteredAt,
        NAV,
        ,
        ,
        ,
        ,
      ],
      [, ,],
      [, , ,],
    ] = await strategyViewer.getCompleteStrategy(strategyContract.address);

    duration = duration.toNumber();
    enteredAt = enteredAt.toNumber();

    strategyObj = {
      ...strategyObj,
      strategist,
      ops,
      stake,
      totalPositiveVotes,
      totalNegativeVotes,
      capitalAllocated,
      capitalReturned,
      duration,
      expectedReturn,
      maxCapitalRequested,
      enteredAt,
      NAV,
      address: strategyContract.address,
    };
  }

  strategyObj.maxAllocationPercentage = await strategyContract.maxAllocationPercentage();
  strategyObj.maxGasFeePercentage = await strategyContract.maxGasFeePercentage();

  if (!_.isEqual(old, strategyObj)) {
    // do not update if nothing has changed
  }

  return strategyObj;
}

async function updateGarden(gardenContract, gardensStore, store) {
  const gardenObj = gardensStore[gardenContract.address];
  console.log('gardenObj', gardenObj);
  const old = _.cloneDeep(gardenObj);
  if (!gardenObj.reserveAsset) {
    console.log('getting garden reserve asset');
    gardenObj.reserveAsset = await gardenContract.reserveAsset();
  }
  if (!gardenObj.minVoters) {
    gardenObj.minVoters = (await gardenContract.minVoters()).toString();
  }
  if (!gardenObj.minVotesQuorum) {
    gardenObj.minVotesQuorum = (await gardenContract.minVotesQuorum()).toString();
  }
  if (!gardenObj.name) {
    gardenObj.name = (await gardenContract.name()).toString();
  }
  if (!_.isEqual(old, gardenObj)) {
    await store.put('gardens', JSON.stringify(gardensStore));
  }

  return gardenObj;
}

async function calculateFee(gasCost, gasPrice, reserveAsset, quotes) {
  function toBigNumber(value) {
    return ethers.BigNumber.from(Math.round(value * 1e10));
  }
  let fee = gasCost.mul(gasPrice).mul(KEEPER_PERCENTAGE).div(100);
  return weiToAsset(fee, reserveAsset, quotes);
}

/**
 TODO:
   Whitelist all integrations and tokens. Do not execute strategies if not whitelisted
 TODO:
   Do not exectue new txs before all the pending txs are mined for the certain
   strategy
 TODO:
   Make tx fee check for stategy finalization
 TODO:
   Do not allocate capital to strategies which have 30% duration or less
 TODO:
   Charge keeper fees on actual gas costs not estimated
 TODO:
   Keeper should always leave enough capital in the garden to get paid itself
 TODO:
   Do not service garden if keeperDebt higher than MAX_KEEPER_DEBT
 TODO:
   Swap fees back to ETH once keeper balance is low
 TODO:
   Do not pay for tasks if Garden has no WETH to cover and feex10 > NAV
 TODO:
   White list all the assets, e.g. Yearn Vautls, Harvest Vaults, Uniswap Assets
 TODO:
   Cache all the web3 request which do not change (e.g. vars of the strategy
   which are never modified)
 TODO:
   Implement upper bound to the capital because tx might revert due to high
   slippage
 TODO:
   Use gasLimit for Defender relay and do not allow to bump gasPrice
 TODO:
   Use maxGasFee% for finalize
 TODO:
   Reserve capital for strategies in cooldown
 TODO:
   Prevent strategy capital front-running, e.g., first strategy getting all the
   capital
*/

export async function expire({
  currentStatus,
  strategy,
  strategyName,
  duration,
  garden,
  strategyContract,
  gasPrice,
  reserveAsset,
  quotes,
  fClient,
}) {
  console.log(`expiring strategy ${strategy}`);

  try {
    const gasCost = await strategyContract.estimateGas.expireStrategy(1);
    const fee = await calculateFee(gasCost, gasPrice, reserveAsset, quotes);
    console.log(
      `gas cost for expireStartegy: ${gasCost} gas * ${gasPrice} wei = ${toAssetWithSymbol(fee, reserveAsset)}`,
    );
    // call estimateGas to make sure the tx would not fail with certain parameters
    await strategyContract.estimateGas.expireStrategy(fee, {
      gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
    });
    await strategyContract.expireStrategy(fee, {
      gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
    });
    console.log(`Strategy expired 🪦!`);

    // Keep the row and set it to expired
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      0,
      fClient,
      StrategyActions.expire,
      StrategyStates.expired,
      undefined,
    );
    return true;
  } catch (e) {
    const unkownError = { code: StrategyErrorCodes.unknownError, data: e };
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      0,
      fClient,
      StrategyActions.expire,
      currentStatus,
      unkownError,
    );

    console.error(`Failed to expire the strategy`, e);
    sendErrorToTelegram(`Failed to expire the strategy ${strategy}:${strategyName}. Reason: ${e}`);
  }
}

// if strategy has reached 95% is considered full because of the gas costs
function hasReachedMaxCap(maxCapitalRequested, capitalAllocated) {
  return capitalAllocated.gte(maxCapitalRequested.mul(95).div(100));
}

function getMaxCapitalRequired({
  evenAllocationCapitalRequested,
  maxAllocationPercentage,
  gardenNAV,
  maxCapitalRequested,
  reserveAsset,
}) {
  let percentageCapitalRequested = from(0);
  if (maxAllocationPercentage.gt(0)) {
    percentageCapitalRequested = gardenNAV.mul(maxAllocationPercentage).div(eth());
  }

  // pick the min(capitalRequested, maxAllocationPercentage, evenAllocationCapitalRequested)
  return BigNumber.min(percentageCapitalRequested, maxCapitalRequested, evenAllocationCapitalRequested);
}

function checkStrategyDuration(executedAt, now, duration) {
  return executedAt === 0 || now <= executedAt + (duration * CAPITAL_ALLOCATION_MAX_DURATION) / 100;
}

export async function execute({
  currentStatus,
  executedAt,
  duration,
  now,
  gardenNAV,
  strategy,
  strategyName,
  garden,
  strategies,
  capitalAllocated,
  maxCapitalRequested,
  maxAllocationPercentage,
  maxGasFeePercentage,
  reserveAsset,
  enteredCooldownCheck,
  active,
  liquidReserve,
  strategyContract,
  gasPrice,
  quotes,
  strategiesStore,
  fClient,
}) {
  if (!checkStrategyDuration(executedAt, now, duration)) {
    console.log('Strategy is too old to receive capital');
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      currentStatus,
      {
        code: StrategyErrorCodes.remainingDuration,
        data: {
          message: `Strategy has passed ${CAPITAL_ALLOCATION_MAX_DURATION}% duration and can no longer receive capital`,
        },
      },
    );
    return false;
  }

  if (!enteredCooldownCheck) {
    console.log('Strategy is in cooldown');
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      StrategyStates.cooldown,
      undefined,
    );
    return true;
  }

  if (!active) {
    console.log('Strategy has to be active');

    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      currentStatus,
      {
        code: StrategyErrorCodes.inactive,
      },
    );
    return false;
  }

  if (STUCK_EXECUTE.includes(strategy)) {
    console.log('Strategy execution is blacklisted');
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      currentStatus,
      {
        code: StrategyErrorCodes.blacklisted,
      },
    );
    return false;
  }

  // Set asside MIN_LIQ_PERCENTAGE * gardenNAV to allow a buffer for withdrawals
  const minLiquidReserve = gardenNAV.mul(MIN_LIQ_PERCENTAGE).div(eth());
  console.log(`minLiquidReserve ${toAssetWithSymbol(minLiquidReserve, reserveAsset)}`);
  liquidReserve = liquidReserve.sub(minLiquidReserve);

  if (liquidReserve.lte(0)) {
    console.log('No free capital to allocate');
    return false;
  }

  console.log(`capitalAllocated ${toAssetWithSymbol(capitalAllocated, reserveAsset)}`);
  console.log(`maxCapitalRequested ${toAssetWithSymbol(maxCapitalRequested, reserveAsset)}`);

  const oldStrategies = strategies.filter(
    (s) => !checkStrategyDuration(+strategiesStore[s].executedAt, now, +strategiesStore[s].duration),
  );
  console.log('oldStrategies', oldStrategies);

  const youngStrategies = strategies.filter((s) => !oldStrategies.includes(s));
  console.log('youngStrategies', youngStrategies);

  const fullStrategies = strategies.filter((s) =>
    hasReachedMaxCap(
      strategiesStore[s].maxAllocationPercentage.gt(0)
        ? BigNumber.min(
            gardenNAV.mul(strategiesStore[s].maxAllocationPercentage).div(eth()),
            strategiesStore[s].maxCapitalRequested,
          )
        : strategiesStore[s].maxCapitalRequested,
      strategiesStore[s].capitalAllocated,
    ),
  );
  console.log('fullStrategies ', fullStrategies);

  const hungryStrategies = strategies.filter(
    (s) => !STUCK_EXECUTE.includes(s) && youngStrategies.includes(s) && !fullStrategies.includes(s),
  );
  console.log('hungryStrategies', hungryStrategies);

  if (!hungryStrategies.length) {
    console.log('No strategy to allocate capital to due to them either being old, full or blacklisted');
    return false;
  }

  const evenAllocationPercentage = from(Math.round((1 / strategies.length) * 1e10)).mul(1e8);
  console.log('evenAllocationPercentage', toPercentage(evenAllocationPercentage));
  let evenAllocationCapitalRequested = gardenNAV.mul(evenAllocationPercentage).div(eth());
  console.log('evenAllocationCapitalRequested', toAssetWithSymbol(evenAllocationCapitalRequested, reserveAsset));
  // grab extra capital for allocation from old and capped strategies
  const extraCapital = strategies
    .filter((s) => fullStrategies.includes(s) || oldStrategies.includes(s))
    .reduce((acc, strat) => {
      return acc.add(
        BigNumber.max(evenAllocationCapitalRequested.sub(strategiesStore[strat].capitalAllocated), from(0)),
      );
    }, from(0));

  console.log('extraCapital', toAssetWithSymbol(extraCapital, reserveAsset));
  // add extra capital to be available for the hungry strategies
  evenAllocationCapitalRequested =
    hungryStrategies.length > 0
      ? evenAllocationCapitalRequested.add(extraCapital.div(hungryStrategies.length))
      : evenAllocationCapitalRequested;
  console.log('evenAllocationCapitalRequested', toAssetWithSymbol(evenAllocationCapitalRequested, reserveAsset));

  // get the strategy with the least capital allocated
  const strategyInNeed = _(hungryStrategies)
    .map((s) => strategiesStore[s])
    .value()
    .filter(
      (s) =>
        !hasReachedMaxCap(
          getMaxCapitalRequired({
            evenAllocationCapitalRequested,
            maxAllocationPercentage: s.maxAllocationPercentage,
            gardenNAV,
            maxCapitalRequested: s.maxCapitalRequested,
            reserveAsset,
          }),
          s.capitalAllocated,
        ),
    )
    .sort(sortBN((val) => val.capitalAllocated))[0];

  if (!strategyInNeed) {
    console.log('No strategy to allocate capital to due to them either being old, full or blacklisted');
    return false;
  }

  // Only allocate capital if the strategy has the least capital among all
  // garden's strategies.
  if (strategyInNeed.address !== strategy) {
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      currentStatus,
      {
        code: StrategyErrorCodes.allocationBalance,
        data: { receiver: strategyInNeed.address },
      },
    );
    console.log(`The strategy in need of capital is ${strategyInNeed.address}`);
    return false;
  }

  // execute
  try {
    const finalMaxCapitalRequired = getMaxCapitalRequired({
      evenAllocationCapitalRequested,
      maxAllocationPercentage,
      gardenNAV,
      maxCapitalRequested,
      reserveAsset,
    });
    console.log('maxCapitalRequested', toAssetWithSymbol(maxCapitalRequested, reserveAsset));
    console.log('evenAllocationCapitalRequested', toAssetWithSymbol(evenAllocationCapitalRequested, reserveAsset));
    console.log('finalMaxCapitalRequired', toAssetWithSymbol(finalMaxCapitalRequired, reserveAsset));
    const capitalNeeded = finalMaxCapitalRequired.sub(capitalAllocated);
    console.log('capitalNeeded', toAssetWithSymbol(capitalNeeded, reserveAsset));
    if (capitalNeeded.gt(0)) {
      let capital = capitalNeeded.gt(liquidReserve) ? liquidReserve : capitalNeeded;
      // substract protocol management fee
      const protocolFee = capital.mul(PROTOCOL_MANAGEMENT_FEE).div(eth());
      console.log('protocolFee', toAssetWithSymbol(protocolFee, reserveAsset));
      capital = capital.add(protocolFee).gt(liquidReserve) ? capital.sub(protocolFee) : capital;

      let gasCost;
      // reduce capital by two in hope to find a better slippage
      // should be eventually replaced by off-chain queries to trade integrations
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`capital for gas estimate: ${toAssetWithSymbol(capital, reserveAsset)}`);
          gasCost = await strategyContract.estimateGas.executeStrategy(capital, from(1));
          break;
        } catch (e) {
          console.log(
            `Failed to estimate gas cost with a capital ${toAssetWithSymbol(capital, reserveAsset)}. Reason: ${
              e.message
            }`,
          );
          capital = capital.div(2);
        }
      }

      if (!gasCost) {
        await insertOrUpdateRowForStrategy(
          strategy,
          garden,
          duration,
          executedAt,
          fClient,
          StrategyActions.execute,
          currentStatus,
          {
            code: StrategyErrorCodes.executionError,
            data: { message: 'Failed to calculate gas costs, retrying during next keeper run.' },
          },
        );
        console.log('Failed to estimate execution gas cost');
        return false;
      }

      console.log(`estimated strategy gas cost ${gasCost}`);
      const gasFee = await calculateFee(gasCost, gasPrice, reserveAsset, quotes);
      console.log(
        `gas cost for executeStrategy: ${gasCost} gas * ${gasPrice} wei = ${toAssetWithSymbol(gasFee, reserveAsset)}`,
      );
      const gasFeeLimit = capital
        .mul(maxGasFeePercentage.gt(0) ? maxGasFeePercentage : CAPITAL_ALLOCATION_GAS_FEE_RATIO)
        .div(eth());
      console.log(`feeLimit ${toAssetWithSymbol(gasFeeLimit, reserveAsset)}`);

      if (gasFee.gt(gasFeeLimit)) {
        await insertOrUpdateRowForStrategy(
          strategy,
          garden,
          duration,
          executedAt,
          fClient,
          StrategyActions.execute,
          currentStatus,
          {
            code: StrategyErrorCodes.gasFeeTooHigh,
            data: { feeLimit: gasFeeLimit.toString(), fee: gasFee.toString() },
          },
        );
        console.log(
          `The fee ${toAssetWithSymbol(gasFee, reserveAsset)} is greater than fee limit ${toAssetWithSymbol(
            gasFeeLimit,
            reserveAsset,
          )}`,
        );
        return false;
      }

      // substract keeper fee
      if (capital.gt(gasFee)) {
        capital = capital.add(gasFee).add(protocolFee).gt(liquidReserve) ? capital.sub(gasFee) : capital;
        if (capital.gt(0) && capitalAllocated.add(capital).lte(maxCapitalRequested)) {
          console.log(`capital ${toAssetWithSymbol(capital, reserveAsset)}`);

          // execute capital have to be greater than $10k
          const capitalInDAI = getPrice(reserveAsset, DAI, quotes)
            .mul(capital)
            .mul(10 ** (18 - getDecimals(reserveAsset)))
            .div(eth());
          console.log(`capital in DAI ${toAssetWithSymbol(capitalInDAI, reserveAsset)}`);
          if (capitalInDAI.lt(eth(1e5))) {
            await insertOrUpdateRowForStrategy(
              strategy,
              garden,
              duration,
              executedAt,
              fClient,
              StrategyActions.execute,
              currentStatus,
              {
                code: StrategyErrorCodes.insufficientCapital,
                data: { capital: capital.toString() },
              },
            );
            console.log('Execution capital has to be great than $10k');
          }

          console.log(`execting strategy ${strategy}`);

          // call estimateGas to make sure the tx would not fail with certain parameters
          await strategyContract.estimateGas.executeStrategy(capital, gasFee, {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          });
          await strategyContract.executeStrategy(capital, gasFee, {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          });
          await insertOrUpdateRowForStrategy(
            strategy,
            garden,
            duration,
            executedAt,
            fClient,
            StrategyActions.execute,
            StrategyStates.executed,
            undefined,
          );
          console.log(`Strategy executed 🏭!`);
          return true;
        }
      } else {
        await insertOrUpdateRowForStrategy(
          strategy,
          garden,
          duration,
          executedAt,
          fClient,
          StrategyActions.execute,
          currentStatus,
          {
            code: StrategyErrorCodes.insufficientCapital,
            data: { capital: capital.toString(), gasFee: gasFee.toString() },
          },
        );
        console.log('The execution fee is greater than capital.');
      }
    } else {
      await insertOrUpdateRowForStrategy(
        strategy,
        garden,
        duration,
        executedAt,
        fClient,
        StrategyActions.execute,
        currentStatus,
        {
          code: StrategyErrorCodes.maxCapitalReached,
        },
      );
      console.log('MaxCapitalRequested is reached.');
    }
  } catch (e) {
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.execute,
      currentStatus,
      {
        code: StrategyErrorCodes.unknownError,
        data: e.message,
      },
    );
    console.error(`Failed to execute the strategy: ${strategy}:${strategyName}`, e);
  }
}

export async function finalize({
  currentStatus,
  strategy,
  strategyName,
  duration,
  executedAt,
  controllerContract,
  contracts,
  signer,
  garden,
  strategyContract,
  gasPrice,
  reserveAsset,
  quotes,
  capitalAllocated,
  maxGasFeePercentage,
  fClient,
}) {
  console.log(`finalizing strategy ${strategy}`);

  try {
    const gardenNftContract = await getContractAt(
      await controllerContract.gardenNFT(),
      contracts['GardenNFT'].abi,
      signer,
    );
    const tokenURI = await gardenNftContract.gardenTokenURIs(garden);
    console.log(`strategy NFT URI ${tokenURI}`);

    const gasCost = await strategyContract.estimateGas.finalizeStrategy(1, tokenURI, 0);
    const gasFee = await calculateFee(gasCost, gasPrice, reserveAsset, quotes);
    console.log(
      `gas cost for finalizeStrategy: ${gasCost} gas * ${gasPrice} wei = ${toAssetWithSymbol(gasFee, reserveAsset)}`,
    );

    const gasFeeLimit = capitalAllocated
      .mul(maxGasFeePercentage.gt(0) ? maxGasFeePercentage : CAPITAL_ALLOCATION_GAS_FEE_RATIO)
      .div(eth());

    if (gasFee.gt(gasFeeLimit)) {
      console.log(
        `The fee ${toAssetWithSymbol(gasFee, reserveAsset)} is greater than fee limit ${toAssetWithSymbol(
          gasFeeLimit,
          reserveAsset,
        )}`,
      );

      const feeError = {
        code: StrategyErrorCodes.gasFeeTooHigh,
        data: { feeLimit: gasFeeLimit.toString(), fee: gasFee.toString() },
      };

      await insertOrUpdateRowForStrategy(
        strategy,
        garden,
        duration,
        executedAt,
        fClient,
        StrategyActions.finalize,
        currentStatus,
        feeError,
      );
      return false;
    }

    // call estimateGas to make sure the tx would not fail with certain parameters
    await strategyContract.estimateGas.finalizeStrategy(gasFee, tokenURI, 0, {
      gasLimit: gasCost.mul(225).div(100),
    });
    await strategyContract.finalizeStrategy(gasFee, tokenURI, 0, {
      gasLimit: gasCost.mul(225).div(100), // TODO: Cap at block gas limit
    });
    console.log(`Strategy finalized 💰!`);

    // Make sure to remove the strategy from the active list if it is finalized this run
    ACTIVE_STRATEGIES = ACTIVE_STRATEGIES.filter((item) => item !== strategy);

    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.finalize,
      StrategyStates.finalized,
      undefined,
    );
    return true;
  } catch (e) {
    await insertOrUpdateRowForStrategy(
      strategy,
      garden,
      duration,
      executedAt,
      fClient,
      StrategyActions.finalize,
      currentStatus,
      { code: StrategyErrorCodes.unknownError, data: e.message },
    );
    console.error(`Failed to finalize the strategy ${strategy}:${strategyName}`, e);
  }
}

export async function vote({
  currentStatus,
  strategy,
  strategyName,
  duration,
  strategyContract,
  strategist,
  strategistStake,
  garden,
  gardenContract,
  totalSupply,
  now,
  enteredAt,
  store,
  quotes,
  reserveAsset,
  gasPrice,
  active,
  minVoters,
  minVotesQuorum,
  strategyCooldownPeriod,
  fClient,
}) {
  const votesForStrategy = (await getVotesForStrategy(strategy)) || { votes: [] };
  console.log('votesForStartegy', votesForStrategy);
  const votesPerVoter = votesForStrategy.votes.reduce((acc, val) => {
    const amount = ethers.BigNumber.from(val.amount);
    const sum = ethers.BigNumber.from(acc[val.voter] || 0);
    acc[val.voter] = val.isOpposed ? sum.sub(amount) : sum.add(amount);
    return acc;
  }, {});
  const strategistBalance = await gardenContract.balanceOf(strategist);
  votesPerVoter[strategist] = strategistBalance;

  // Caculate votes
  const voters = Object.keys(votesPerVoter);
  const votes = Object.values(votesPerVoter);
  for (const voter of voters) {
    console.log(`${voter} votes with ${votesPerVoter[voter]}`);
    //check that voter has enough balance to vote
    const voterBalance = await gardenContract.balanceOf(voter);
    console.log('voterBalance ', voterBalance.toString());
    // TODO: Account for the tokens already locked in the smart-contracts and FaundDB
    if (voterBalance.lt(votesPerVoter[voter])) {
      console.log(`${voter} does not have votes he/she claims to have in the faunaDb. Use balance instead.`);
      votesPerVoter[voter] = voterBalance;
    }
  }

  const totalVotes = Object.values(votesPerVoter).reduce((acc, val) => acc.add(val), ethers.BigNumber.from(0));
  console.log('totalVotes ', toETH(totalVotes));

  const minVotersCheck = voters.length >= minVoters;
  console.log('minVotersCheck ', minVotersCheck);

  const votingWindowCheck = now - enteredAt <= DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD;
  console.log('votingWindowCheck ', votingWindowCheck);

  const whipKey = `garden-whip-${garden}`;
  let { totalSupply: whipTotalSupply, totalVotes: whipTotalVotes } = JSON.parse((await store.get(whipKey)) || '{}');

  console.log('whipTotalSupply', toETH(whipTotalSupply || 0));
  console.log('whipTotalVotes', toETH(whipTotalVotes || 0));
  whipTotalSupply = from(whipTotalSupply || 0);
  whipTotalVotes = from(whipTotalVotes || 0);

  let dynamicTotalSupply;
  if (whipTotalSupply.gt(0)) {
    // means total votes are updated and we can proceed to voting
    dynamicTotalSupply = whipTotalVotes;
  } else {
    // total votes are not updated yet after deposit/withraw
    dynamicTotalSupply = totalSupply;
  }
  console.log('dynamicTotalSupply', dynamicTotalSupply.toString());

  const quorumCheck = totalVotes.gte(dynamicTotalSupply.mul(from(minVotesQuorum)).div(eth()));
  console.log('quorumCheck ', quorumCheck);

  const timestampKey = `${strategy}-quorum-timestamp`;
  const quorumTimestamp = await store.get(timestampKey);
  console.log('quorumTimestamp', quorumTimestamp);
  // if timestamp is set, it means quorum was already reached once
  if (!!quorumTimestamp) {
    // we are going to check quorum again only after strategyCooldownPeriod
    if (now > +quorumTimestamp + +strategyCooldownPeriod) {
      try {
        if (!active && quorumCheck && minVotersCheck && votingWindowCheck) {
          // quorum is reached second time so we are going to resolve it
          console.log(`resolving strategy ${strategy}`);
          const gasCost = await strategyContract.estimateGas.resolveVoting(
            voters,
            votes,
            1, // don't know the fee yet 😢
          );
          const fee = await calculateFee(gasCost, gasPrice, reserveAsset, quotes);
          console.log(
            `gas cost for resolveVoting: ${gasCost} gas * ${gasPrice} wei = ${toAssetWithSymbol(fee, reserveAsset)}`,
          );
          // call estimateGas to make sure the tx would not fail with certain parameters
          await strategyContract.estimateGas.resolveVoting(voters, votes, fee, {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          });
          await strategyContract.resolveVoting(voters, votes, fee, {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          });
          console.log(`resolved votes✋!`);
          // delete quorumTimestamp for the strategy
          await store.del(timestampKey);

          // Set state in DB to resolved
          await insertOrUpdateRowForStrategy(
            strategy,
            garden,
            duration,
            0,
            fClient,
            StrategyActions.vote,
            StrategyStates.resolved,
          );
          return true;
        } else {
          // if quorum does not hold after the cooldown period, remove quorum
          // timestamp so quorum has to go through cooldown period again
          console.log(`Quorum did not hold. Reseting quorum.`);
          await store.del(timestampKey);

          // Set state in DB to created with an error state that quorum was lost
          const quorumError = { code: StrategyErrorCodes.quorumLost };
          await insertOrUpdateRowForStrategy(
            strategy,
            garden,
            duration,
            0,
            fClient,
            StrategyActions.vote,
            StrategyStates.created,
            quorumError,
          );
        }
      } catch (e) {
        // We had an unknown error during vote resolution, set the details in the DB row
        const unkownError = { code: StrategyErrorCodes.unknownError, data: e };
        await insertOrUpdateRowForStrategy(
          strategy,
          garden,
          duration,
          0,
          fClient,
          StrategyActions.vote,
          currentStatus,
          unkownError,
        );

        console.error(`Failed to resolve votes for the strategy`, e);
        sendErrorToTelegram(`Failed to resolve votes for the strategy ${strategy}:${strategyName}. Reason: ${e}`);
      }
    }
  } else {
    // if timestamp is not set, it means we haven't reached quorum yet.
    if (!active && quorumCheck && minVotersCheck && votingWindowCheck) {
      // write down quorum timestamp if all checks green
      console.log(`Quorum is reached for the first time.`);
      await store.put(timestampKey, now.toString());

      // Set state in DB to cooldown
      await insertOrUpdateRowForStrategy(
        strategy,
        garden,
        duration,
        0,
        fClient,
        StrategyActions.vote,
        StrategyStates.cooldown,
      );
    }
  }
}

// Entrypoint for the Autotask
export async function handler(event) {
  try {
    console.time('keeper');
    const startTimestamp = performance.now();

    let CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY;
    // set env vars
    if (!!event && !!event.secrets) {
      ({ CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY } = event.secrets);

      process.env.BLOCKNATIVE_API_KEY = BLOCKNATIVE_API_KEY;
      process.env.CMC_API_KEY = CMC_API_KEY;
      process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
      process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
      process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
    }

    const fClient = new faunadb.Client({
      secret: process.env.FAUNADB_SERVER_SECRET,
    });

    const quotes = await getQuotes('WBTC,WETH,BABL,AAVE', 'USD');
    for (const key of Object.keys(quotes)) {
      console.log(`${key}: $${quotes[key].quote.USD.price}`);
    }

    const store = getStore(event);
    await checkQuotes(quotes, store);

    const gasPrice = await getGasPrice();
    console.log('gasPrice', gasPrice);
    if (gasPrice > MAX_GAS_PRICE) {
      // if gas price higher than 200 gwei then abort
      console.log('Gas price is higher than 200 gwei. Exiting.');
      return;
    }

    const [provider, signer, readOnlyProvider] = getProvider(event);
    const relayer = getRelayer(event);

    const txs = await relayer.list({
      status: 'pending', // can be 'pending', 'mined', or 'failed'
    });

    // TODO: Should be done per strategy so many strategies can be processed in parallel
    if (txs.length > 0) {
      console.log("Keeper transactions are in-flight; let's wait until they are mined");
      return;
    } else {
      console.log('No pending txs');
    }

    await checkAndSwapAssets(provider, signer, store, relayer, contracts);

    const wethContract = await getContractAt(WETH, contracts['IWETH'].abi, signer);
    console.log('WETH', wethContract.address);

    const controllerContract = await getContractAt(
      contracts['BabControllerProxy'].address,
      contracts['BabController'].abi,
      signer,
    );
    console.log('controller', controllerContract.address);

    const gardenValuer = await getContractAt(
      contracts['GardenValuer'].address,
      contracts['GardenValuer'].abi,
      readOnlyProvider,
    );
    console.log('GardenValuer', gardenValuer.address);

    const strategyNft = await getContractAt(contracts['StrategyNFT'].address, contracts['StrategyNFT'].abi, signer);
    const strategyViewer = await getContractAt(
      contracts['StrategyViewer'].address,
      contracts['StrategyViewer'].abi,
      signer,
    );
    const gardens = await controllerContract.getGardens();
    console.log('Gardens', gardens);

    const now = await getNow(provider);
    console.log('now', now);

    const gardensStore = JSON.parse((await store.get('gardens')) || '{}');
    // console.log('gardensStore', gardensStore);
    // if there is new gardens add them to the store
    const newGardens = _.difference(gardens, Object.keys(gardensStore));
    if (newGardens.length > 0) {
      for (const garden of newGardens) {
        gardensStore[garden] = { updatedAt: 0 };
      }

      await store.put('gardens', JSON.stringify(gardensStore));
    }

    const sortedGardens = _(gardensStore)
      .toPairs()
      .map((pair) => ({ address: pair[0], updatedAt: 0, ...pair[1] }))
      .orderBy(['updatedAt'], ['asc'])
      .map((obj) => obj.address)
      .value();

    let loopStartTimestamp;
    let averageLoopTime;
    function checkTimeLeft() {
      // check if there is enough time for another loop
      if (!!averageLoopTime && AUTOTASK_DURATION - (performance.now() - startTimestamp) < 2 * averageLoopTime) {
        // exit the loop if there are not enough time
        console.log('exiting to avoid timeout error');
        return false;
      }
      return true;
    }
    for (const garden of sortedGardens) {
      try {
        console.log('                                           ');
        console.log('###########################################');
        console.log('###########################################');
        console.log('###########################################');
        if (!checkTimeLeft()) return;
        // update average loop time
        if (!!loopStartTimestamp) {
          // calc loop duration
          const dur = performance.now() - loopStartTimestamp;
          if (!averageLoopTime) {
            averageLoopTime = dur;
          } else {
            averageLoopTime = (averageLoopTime + dur) / 2;
          }
        }
        loopStartTimestamp = performance.now();

        const gardenContract = await getContractAt(garden, contracts['Garden'].abi, signer);
        const {
          minVotesQuorum,
          reserveAsset,
          minVoters,
          name: gardenName,
        } = await updateGarden(gardenContract, gardensStore, store);

        console.log('garden', garden);
        console.log('Garden', gardenName);

        console.log('garden', gardenContract.address);

        const reserveAssetContract = await getContractAt(reserveAsset, contracts['IERC20'].abi, signer);
        console.log('reserveAsset', reserveAsset);

        const symbol = getSymbol(reserveAsset);
        console.log(`This is ${symbol} garden`);

        console.log('minVoters', minVoters);

        console.log('minVotesQuorum', toETH(from(minVotesQuorum)));

        const totalSupply = await gardenContract.totalSupply();
        console.log('totalSupply', toETH(totalSupply));

        const totalContributors = (await gardenContract.totalContributors()).toNumber();
        console.log('totalContributors', totalContributors);

        const strategyCooldownPeriod = (await gardenContract.strategyCooldownPeriod()).toNumber();
        console.log('strategyCooldownPeriod', strategyCooldownPeriod);

        const reserveAssetRewardsSetAside = await gardenContract.reserveAssetRewardsSetAside();
        console.log(`reserveAssetRewardsSetAside ${toAssetWithSymbol(reserveAssetRewardsSetAside, reserveAsset)}`);

        const keeperDebt = await gardenContract.keeperDebt();
        console.log(`keeperDebt ${toAssetWithSymbol(keeperDebt, reserveAsset)}`);

        const liquidReserve = (await reserveAssetContract.balanceOf(garden))
          .sub(reserveAssetRewardsSetAside)
          .sub(keeperDebt);
        console.log(`liquidReserve ${toAssetWithSymbol(liquidReserve, reserveAsset)}`);

        const pricePerShare = await gardenValuer.calculateGardenValuation(garden, reserveAsset);
        console.log('pricePerShare', pricePerShare.toString());

        const gardenNAV = pricePerShare
          .mul(totalSupply)
          .div(eth())
          .mul(parseUnits('1', DECIMALS_BY_RESERVE[reserveAsset.toLowerCase()]))
          .div(eth());
        console.log('gardenNAV', toAssetWithSymbol(gardenNAV, reserveAsset));

        let strategies = await gardenContract.getStrategies();
        console.log('strategies', strategies);

        let strategiesStore = JSON.parse((await store.get('strategies')) || '{}');
        // if there is new strategies add them to the store
        const newStrategies = _.difference(strategies, Object.keys(strategiesStore));
        if (newStrategies.length > 0) {
          for (const strategy of newStrategies) {
            strategiesStore[strategy] = { autotaskUpdatedAt: 0 };
          }

          await store.put('strategies', JSON.stringify(strategiesStore));
        }

        // transform strategies in the store
        strategiesStore = Object.keys(strategiesStore).reduce((ret, strat) => {
          ret[strat] = transformStrategy(strategiesStore[strat]);
          return ret;
        }, {});

        // update all strategies data
        for (const strategy of strategies) {
          const strategyContract = await getContractAt(strategy, contracts['Strategy'].abi, signer);
          strategiesStore[strategy] = transformStrategy(
            await updateStrategy(strategyContract, strategyNft, strategiesStore, store, strategyViewer),
          );
        }
        // save updated strategies data
        const toSave = Object.keys(strategiesStore).reduce((ret, strat) => {
          ret[strat] = _.mapValues(strategiesStore[strat], (o) => o.toString());
          return ret;
        }, {});
        await store.put('strategies', JSON.stringify(toSave));

        for (const strategy of strategies) {
          const isBlacklisted = STUCK_STRATEGIES.some((strat) => strat.toLowerCase() === strategy.toLowerCase());
          if (isBlacklisted) {
            console.log(`Strategy ${strategy} is blacklisted.`);
            continue;
          }

          try {
            if (!checkTimeLeft()) return;
            const strategyContract = await getContractAt(strategy, contracts['Strategy'].abi, signer);

            const {
              name: strategyName,
              active,
              finalized,
              executedAt,
              exitedAt,
              updatedAt,
              strategist,
              ops,
              stake,
              totalPositiveVotes,
              totalNegativeVotes,
              capitalAllocated,
              capitalReturned,
              duration,
              expectedReturn,
              maxCapitalRequested,
              maxGasFeePercentage,
              enteredAt,
              NAV: strategyNAV,
              maxAllocationPercentage,
            } = strategiesStore[strategy];

            console.log('');
            console.log(`Processing strategy: ${strategyName} at ${strategyContract.address}`);
            console.log('###########################################');

            console.log('finalized', finalized);
            if (finalized) {
              console.log('Strategy is finalized. Skipping');
              continue;
            }

            if (capitalAllocated.gt(0)) {
              const firstNavWindowCheck = now - executedAt <= DAY_IN_SECONDS;
              // Store first NAV
              const navStored = await getFirstNAVForStrategy(strategy);
              if (!navStored && firstNavWindowCheck) {
                storeStrategyFirstNAV(garden, strategy, strategyNAV.toString()).catch((e) => {
                  console.error('Failed to store first strategy strategyNAV', e);
                });
              }
            }

            console.log('capitalAllocated', capitalAllocated.toString());
            console.log('active', active);
            const isExecuting = await strategyContract.isStrategyActive();
            console.log('isExecuting', isExecuting);
            console.log('enteredAt ', enteredAt.toString());
            const enteredCooldownAt = (await strategyContract.enteredCooldownAt()).toNumber();
            console.log('enteredCooldownAt', enteredCooldownAt);
            console.log('executedAt', executedAt.toString());
            console.log('duration ', duration.toString());
            console.log('strategist', strategist);
            console.log(`strategistStake ${toETH(stake)}`);

            /////////////////////// Strategy Actions ///////////////////////
            const finalizeTimeCheck = now > executedAt + duration && executedAt > 0;
            console.log('finalizeTimeCheck ', finalizeTimeCheck);

            const enteredCooldownCheck = now - enteredCooldownAt >= strategyCooldownPeriod;
            console.log('enteredCooldownCheck ', enteredCooldownCheck);

            const currentStatus = getStatusForStrategy(active, enteredCooldownCheck, executedAt, finalized);

            // We want to know how many active strategies exist at any one keeper run. finalize() updates the state of ACTIVE_STRATEGIES
            // if finalization occurs.
            if (active && executedAt > 0 && !finalized) {
              ACTIVE_STRATEGIES.push(strategy);
            }

            // Resolve Voting
            // if not active then try to resolve voting
            if (!active) {
              if (
                await vote({
                  currentStatus,
                  strategy,
                  strategyName,
                  duration,
                  strategyContract,
                  strategist,
                  strategistStake: stake,
                  totalSupply,
                  garden,
                  gardenContract,
                  now,
                  enteredAt,
                  store,
                  quotes,
                  reserveAsset,
                  gasPrice,
                  active,
                  minVoters,
                  minVotesQuorum,
                  strategyCooldownPeriod,
                  fClient,
                })
              )
                continue;
            }

            // Execute a strategy, this includes further allocation of funds after initial execution
            // Only attempt to execute if the strategy is not past finalizationTimeCheck
            if (active && !finalizeTimeCheck) {
              if (
                await execute({
                  currentStatus,
                  executedAt,
                  duration,
                  now,
                  gardenNAV,
                  strategy,
                  strategyName,
                  garden,
                  capitalAllocated,
                  maxCapitalRequested,
                  maxAllocationPercentage,
                  maxGasFeePercentage,
                  reserveAsset,
                  enteredCooldownCheck,
                  active,
                  liquidReserve,
                  strategyContract,
                  gasPrice,
                  quotes,
                  pricePerShare,
                  totalSupply,
                  strategiesStore,
                  strategies,
                  fClient,
                })
              )
                continue;
            }

            // Finalize strategy
            if (active && finalizeTimeCheck) {
              if (
                await finalize({
                  currentStatus,
                  strategy,
                  strategyName,
                  duration,
                  executedAt,
                  controllerContract,
                  contracts,
                  signer,
                  garden,
                  strategyContract,
                  gasPrice,
                  reserveAsset,
                  quotes,
                  capitalAllocated,
                  maxGasFeePercentage,
                  fClient,
                })
              )
                continue;
            }

            // Expire a strategy that did not reach quorum within voting window
            if (!active && now - enteredAt > DAY_IN_SECONDS * MAX_CANDIDATE_PERIOD) {
              if (
                await expire({
                  currentStatus,
                  strategy,
                  strategyName,
                  duration,
                  garden,
                  strategyContract,
                  gasPrice,
                  reserveAsset,
                  quotes,
                  fClient,
                })
              )
                continue;
            }

            // If reached here that means there is no pending action on the
            // strategy or it can't be taken
            // States:
            // Voting
            // --> Expired 💀
            // --> Voting cooldown period
            // --> --> Executed
            // --> --> --> Finalized
            console.log(`No action taken for strategy ${strategy} status: ${currentStatus}`);
          } catch (e) {
            // Don't update the strategy status row here since we really failed to process it,
            // hopefully the issue will resolve itself...
            console.error(`Failed to update strategy ${strategy}`, e);
            sendErrorToTelegram(`Failed to update strategy ${strategy}. Reason: ${e}`);
          }
        }
        // update and save timestamp on the garden
        gardensStore[garden].updatedAt = now;
        await store.put('gardens', JSON.stringify(gardensStore));
      } catch (e) {
        console.error(`Failed to update garden ${garden}`, e);
        sendErrorToTelegram(`Failed to update garden ${garden}. Reason: ${e}`);
      }
    }
    // Keep in mind this will not be called if maxTimeOut check fails and lambda exits early...
    await insertKeeperStatsRow({ insertedAt: Date.now(), active: ACTIVE_STRATEGIES.length || 0 }, fClient);
    console.timeEnd('keeper');
  } catch (e) {
    console.error(`Failed to run keeper`, e);
    sendErrorToTelegram(`Failed to run keeper. Reason: ${e}`);
  }
}

const getStatusForStrategy = (active, enteredCooldownCheck, executedAt, finalized) => {
  if (!active) {
    return StrategyStates.created;
  } else if (!enteredCooldownCheck) {
    return StrategyStates.cooldown;
  } else if (executedAt === 0) {
    return StrategyStates.resolved;
  } else if (!finalized) {
    return StrategyStates.executed;
  } else {
    return StrategyStates.unknown;
  }
};

// To run locally (this code will not be executed in Autotasks)
if (RUN) {
  const { API_KEY: apiKey, API_SECRET: apiSecret } = process.env;
  handler({ apiKey, apiSecret })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
