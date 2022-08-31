import { ethers } from 'ethers';
import { from, parseUnits, eth } from 'common/utils/helpers.js';
import {
  getRelayer,
  getGasPrice,
  getProvider,
  getContractAt,
  weiToAsset,
  toAssetWithSymbol,
  getPrice,
  getDepositSigHash,
  getWithdrawSigHash,
  getRewardsSigHash,
  getStakeRewardsSigHash,
  checkQuotes,
  getDecimals,
} from 'common/utils/web3.js';
import { sendErrorToTelegram } from 'common/utils/telegram.js';
import { getQuotes } from 'common/utils/quotes.js';
import {
  GAS_LIMIT_PERCENTAGE,
  DECIMALS_BY_RESERVE,
  HEART_LOCKING_PERIODS,
  KEEPER_PERCENTAGE,
  HEART_GARDEN,
  HEART,
  DAI,
  BABL,
  WETH,
  ADDRESS_ZERO,
} from 'common/constants.js';
import { getStore } from 'common/utils/store.js';

import contractsJSON from '../../../src/1.json';
const contracts = contractsJSON.contracts;

const RUN = process.env.RUN;
const LAST_SIGNER = 'last-signer';
const MAX_GAS_PRICE = 500000000000;

const BLACKLIST_STRATEGIES = ['0x2e07f9738c536a6f91e7020c39e4ebcee7194407'];

/**
 TODO: specify exact gasPrice and time to live for Defender Relay
*/

async function checkRewards(garden, distributorContract, recoveredAddress, gardenContract, babl, profits) {
  // verify that babl and profits values are correct
  const finalizedStrategies = await gardenContract.getFinalizedStrategies();
  const rewards = await distributorContract.getRewards(garden, recoveredAddress, [
    ...new Set(finalizedStrategies.map((s) => s.toLowerCase())),
  ]);

  const diff = rewards[5].sub(from(babl)).abs();
  console.log(`babl diff ${toAssetWithSymbol(diff, BABL)}`);
  if (diff.gt(eth(0.01)) || !rewards[6].eq(from(profits))) {
    console.log(
      `Rewards from dapp ${from(babl).toString()} ${from(
        profits,
      ).toString()}; rewards from Accountant ${rewards[5].toString()} ${rewards[6].toString()}`,
    );
    return {
      code: 'rewards_values_wrong',
      error: `Rewards values do not match between Accountant and Dapp`,
    };
  }
}

async function getValidPricePerShare(garden, gardenValuerContract, secondGardenValuerContract, store, reserveAsset) {
  const pricePerShare = await gardenValuerContract.calculateGardenValuation(garden, reserveAsset);
  console.log('pricePerShare', pricePerShare.toString());
  const secondPricePerShare = await secondGardenValuerContract.calculateGardenValuation(garden, reserveAsset);
  console.log('secondPricePerShare', secondPricePerShare.toString());

  if (pricePerShare.sub(secondPricePerShare).abs().gt(eth(0.01))) {
    console.log(`Price per share quorum failed`);
    return {
      code: 'price_per_share_quorum_failed',
      error: `Price per share quorum faield`,
    };
  }

  const prevPricePerShare = from((await store.get(`prev-price-share-${garden}`)) || 0);
  console.log('prevPricePerShare ', prevPricePerShare.toString());
  if (
    prevPricePerShare.gt(0) &&
    (pricePerShare.gt(prevPricePerShare.mul(10)) || pricePerShare.lt(prevPricePerShare.div(10)))
  ) {
    console.log(`Price per share change is too big`);
    return {
      code: 'price_per_share_change_too_big',
      error: `Price per share change is too big`,
    };
  }
  await store.put(`prev-price-share-${garden}`, pricePerShare.toString());
  return pricePerShare;
}

async function checkFee(gasCost, gasPrice, reserveAsset, quotes, maxFee) {
  let fee = weiToAsset(gasCost.mul(gasPrice), reserveAsset, quotes).mul(KEEPER_PERCENTAGE).div(100);
  console.log(`fee ${toAssetWithSymbol(fee, reserveAsset)}`);

  if (fee.gt(maxFee)) {
    console.log(
      `Fee ${toAssetWithSymbol(fee, reserveAsset)} is greater than maxFee ${toAssetWithSymbol(maxFee, reserveAsset)}`,
    );
    return {
      code: 'fee_gt_maxFee',
      error: `Fee ${toAssetWithSymbol(fee, reserveAsset)} is greater than maxFee ${toAssetWithSymbol(
        maxFee,
        reserveAsset,
      )}`,
    };
  }
  return fee;
}

// https://api.defender.openzeppelin.com/autotasks/69535bac-dfb4-486e-bc1b-21d9fb13a09e/runs/webhook/6e30b068-78f1-4d1e-8956-31c4e0ba8423/nvVSr2ZDtjd3eKjH2M7Gs
// Entrypoint for the Autotask
export async function handler(event) {
  console.time('accountant');

  const {
    body, // Object with JSON-parsed POST body
  } = event.request;
  try {
    const {
      assetToBond,
      amountToBond,
      garden,
      signature,
      amountIn,
      minAmountOut,
      nonce,
      nonceHeart,
      withPenalty,
      action,
      maxFee,
      userLock,
      babl,
      profits,
      contributor,
      referrer,
    } = body;

    console.log('body', body);

    const filter = [];
    if (filter.includes(garden)) {
      console.log(`Garden ${garden} is on hold.`);
      return {
        code: 'garden_is_on_hold',
        error: 'Garden is on hold',
      };
    }

    let CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY;
    // set env vars
    if (!!event && !!event.secrets) {
      ({ CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, BLOCKNATIVE_API_KEY } = event.secrets);

      process.env.BLOCKNATIVE_API_KEY = BLOCKNATIVE_API_KEY;
      process.env.CMC_API_KEY = CMC_API_KEY;
      process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
      process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
      process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
    }

    const quotes = await getQuotes('WBTC,WETH,BABL,AAVE', 'USD');

    for (const key of Object.keys(quotes)) {
      console.log(`${key}: $${quotes[key].quote.USD.price}`);
    }

    const store = getStore(event);

    await checkQuotes(quotes, store);

    const gasPrice = await getGasPrice();
    console.log('gasPrice', gasPrice);

    if (gasPrice === 0) {
      console.log(`Failed to get fetch gas price. Exiting.`);
      return {
        code: 'failed_to_fetch_gas_price',
        error: `Failed to get fetch gas price`,
      };
    }

    if (gasPrice > MAX_GAS_PRICE) {
      console.log(`Gas price is higher than ${MAX_GAS_PRICE} gwei. Exiting.`);
      return {
        code: 'gas_price_too_high',
        error: `Gas price is higher than ${MAX_GAS_PRICE} gwei`,
      };
    }

    const [, signer, readOnlyProvider] = getProvider(event);
    const relayer = getRelayer(event);

    const txs = await relayer.list({
      status: 'pending', // can be 'pending', 'mined', or 'failed'
    });

    const sig = ethers.utils.splitSignature(signature);
    let recoveredAddress;

    // If there are pending txs make sure the same user is not spamming us
    let isPendingTxs = false;
    if (txs.length > 0) {
      console.log('There are pending txs');
      isPendingTxs = true;
    } else {
      console.log('No pending txs');
    }

    const lastSigner = await store.get(LAST_SIGNER);
    let hash;
    switch (action) {
      case 'deposit':
        hash = getDepositSigHash(
          garden,
          from(amountIn).toString(),
          from(minAmountOut).toString(),
          nonce,
          from(maxFee).toString(),
          contributor,
          referrer,
        );
        break;
      case 'withdraw':
        hash = getWithdrawSigHash(
          garden,
          from(amountIn).toString(),
          from(minAmountOut).toString(),
          nonce,
          from(maxFee).toString(),
          withPenalty,
        );
        break;
      case 'claim':
        hash = getRewardsSigHash(
          garden,
          from(babl).toString(),
          from(profits).toString(),
          nonce,
          from(maxFee).toString(),
        );
        break;
      case 'claimStake':
        hash = getStakeRewardsSigHash(
          HEART_GARDEN,
          from(babl).toString(),
          from(profits).toString(),
          from(minAmountOut).toString(),
          nonce,
          nonceHeart,
          from(maxFee).toString(),
          contributor,
        );
        break;
      case 'bond':
        hash = getDepositSigHash(
          HEART_GARDEN,
          from(amountIn).toString(),
          from(minAmountOut).toString(),
          nonce,
          from(maxFee).toString(),
          contributor,
          referrer,
        );
        break;
      default:
        return {
          code: 'unsupported_transaction_type',
          error: `Transaction type ${action} is not supported`,
        };
    }

    recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(hash), sig);
    console.log('recoveredAddress', recoveredAddress);
    console.log('lastSigner', lastSigner);
    if (lastSigner === recoveredAddress && isPendingTxs) {
      console.log(`There is already a pending tx from ${lastSigner}. Exiting.`);
      return {
        code: 'too_many_requests_by_user',
        error: `There is already a pending tx from ${lastSigner}`,
      };
    }
    const gardenContract = await getContractAt(garden, contracts['Garden'].abi, signer);
    const distributorContract = await getContractAt(
      '0x40154ad8014Df019a53440A60eD351dfbA47574e',
      contracts['RewardsDistributor'].abi,
      signer,
    );
    const gardenValuerContract = await getContractAt(
      contracts['GardenValuer'].address,
      contracts['GardenValuer'].abi,
      readOnlyProvider,
    );

    const secondGardenValuerContract = await getContractAt(
      contracts['GardenValuer'].address,
      contracts['GardenValuer'].abi,
      signer,
    );

    const priceOracle = await getContractAt(
      '0xcb8B0e43D6792F590Adf6f192107B64D359C661a',
      contracts['PriceOracle'].abi,
      signer,
    );

    const reserveAsset = await gardenContract.reserveAsset();
    console.log('reserveAsset', reserveAsset);

    const pricePerShare = await getValidPricePerShare(
      garden,
      gardenValuerContract,
      secondGardenValuerContract,
      store,
      reserveAsset,
    );

    if (!!pricePerShare.error) {
      return pricePerShare;
    }

    let res;
    if (action === 'deposit') {
      const amountInDAI = getPrice(reserveAsset, DAI, quotes)
        .mul(amountIn)
        .mul(10 ** (18 - getDecimals(reserveAsset)))
        .div(eth());
      console.log(`amountInDAI ${toAssetWithSymbol(amountInDAI, DAI)}`);
      if (amountInDAI.lt(eth(600))) {
        console.log(`Deposit amount is too low ${from(amountIn).toString()}. Exiting.`);
        return {
          code: 'amount_too_low',
          error: `Deposit amount is too low`,
        };
      }

      let subsidyPercentage = 0;
      if (gasPrice < 125000000000) {
        subsidyPercentage = 100;
        console.log('Subsidy 100%');
      } else if (gasPrice < 250000000000) {
        console.log('Subsidy 50%');
        subsidyPercentage = 50;
      } else if (gasPrice < 500000000000) {
        console.log('Subsidy 25%');
        subsidyPercentage = 25;
      }

      const gasCost = await gardenContract
        .connect(signer)
        .estimateGas.depositBySig(
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          contributor,
          pricePerShare,
          from(maxFee).sub(from(maxFee).mul(subsidyPercentage).div(100)),
          contributor,
          referrer,
          signature,
        );

      console.log('gasCost', gasCost.toString());

      const fee = await checkFee(
        gasCost.sub(gasCost.mul(subsidyPercentage).div(100)),
        gasPrice,
        reserveAsset,
        quotes,
        maxFee,
      );

      res = await gardenContract
        .connect(signer)
        .depositBySig(
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          contributor,
          pricePerShare,
          fee,
          contributor,
          referrer,
          signature,
          {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          },
        );
    }

    if (action === 'withdraw') {
      let unwindStrategy = ADDRESS_ZERO;
      let strategyNAV = from(0);
      if (withPenalty) {
        const strategies = await gardenContract.getStrategies();
        for (const strategy of strategies) {
          if (BLACKLIST_STRATEGIES.includes(strategy.toLowerCase())) {
            continue;
          }
          const strategyContract = await getContractAt(strategy, contracts['Strategy'].abi, signer);
          const NAV = await strategyContract.getNAV();
          if (NAV.gt(strategyNAV)) {
            unwindStrategy = strategy;
            strategyNAV = NAV;
          }
        }
      }

      console.log('unwindStrategy', unwindStrategy);
      console.log('strategyNAV', strategyNAV.toString());

      const gasCost = await gardenContract
        .connect(signer)
        .estimateGas.withdrawBySig(
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          withPenalty,
          unwindStrategy,
          pricePerShare,
          strategyNAV,
          maxFee,
          contributor,
          signature,
        );

      console.log('gasCost', gasCost.toString());

      const fee = await checkFee(gasCost, gasPrice, reserveAsset, quotes, maxFee);

      res = await gardenContract
        .connect(signer)
        .withdrawBySig(
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          withPenalty,
          unwindStrategy,
          pricePerShare,
          strategyNAV,
          fee,
          contributor,
          signature,
          {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          },
        );
    }

    if (action === 'claim') {
      const error = await checkRewards(garden, distributorContract, recoveredAddress, gardenContract, babl, profits);
      if (!!error) {
        return error;
      }

      const gasCost = await gardenContract
        .connect(signer)
        .estimateGas.claimRewardsBySig(babl, profits, nonce, maxFee, maxFee, contributor, signature);

      console.log('gasCost', gasCost.toString());

      const fee = await checkFee(gasCost, gasPrice, reserveAsset, quotes, maxFee);

      res = await gardenContract
        .connect(signer)
        .claimRewardsBySig(babl, profits, nonce, maxFee, fee, contributor, signature, {
          gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
        });
    }

    if (action === 'claimStake') {
      const error = await checkRewards(garden, distributorContract, recoveredAddress, gardenContract, babl, profits);
      if (!!error) {
        return error;
      }

      const heartGardenContract = await getContractAt(HEART_GARDEN, contracts['Garden'].abi, signer);
      const heartGardenPricePerShare = await getValidPricePerShare(
        HEART_GARDEN,
        gardenValuerContract,
        secondGardenValuerContract,
        store,
        BABL,
      );

      if (!!heartGardenPricePerShare.error) {
        return heartGardenPricePerShare;
      }

      const gasCost = await gardenContract
        .connect(signer)
        .estimateGas.claimAndStakeRewardsBySig(
          babl,
          profits,
          minAmountOut,
          nonce,
          nonceHeart,
          maxFee,
          heartGardenPricePerShare,
          maxFee,
          contributor,
          signature,
        );

      const fee = await checkFee(gasCost, gasPrice, reserveAsset, quotes, maxFee);

      res = await gardenContract
        .connect(signer)
        .claimAndStakeRewardsBySig(
          babl,
          profits,
          minAmountOut,
          nonce,
          nonceHeart,
          maxFee,
          heartGardenPricePerShare,
          fee,
          contributor,
          signature,
          {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          },
        );
    }

    if (action === 'bond') {
      const heartContract = await getContractAt(
        HEART,
        [
          'function bondAssetBySig(address _assetToBond, uint256 _amountToBond, uint256 _amountIn, uint256 _minAmountOut, uint256 _nonce, uint256 _maxFee, uint256 _priceInBABL, uint256 _pricePerShare, uint256[2] calldata _feeAndLock, address _contributor, address _referrer, bytes memory _signature)',
          'function bondAssets(address _asset) external view returns (uint256)',
        ],
        signer,
      );

      const bablPrice = await priceOracle.getPrice(WETH, BABL);

      const assetPrice = await priceOracle.getPrice(WETH, assetToBond);
      const priceInBABL = bablPrice.mul(eth()).div(assetPrice);

      console.log('priceInBABL', priceInBABL.toString());

      let bonus = await heartContract.bondAssets(assetToBond);
      console.log('bonus', bonus.toString());
      // Add time bonus
      let timeDiscount = 0;
      for (let i = 0; i < HEART_LOCKING_PERIODS.length; i++) {
        const heartLockingPeriod = HEART_LOCKING_PERIODS[i];
        if (userLock < heartLockingPeriod.seconds) {
          break;
        }
        timeDiscount = eth(heartLockingPeriod.discount / 100);
      }
      bonus = bonus.add(timeDiscount);
      console.log('bonus', bonus.toString());
      const amount = from(amountToBond).mul(eth().add(bonus)).div(eth()).mul(priceInBABL).div(eth());

      const diff = amount.sub(amountIn).abs();
      console.log('diff', diff.toString());
      if (diff.gt(from(amountIn).div(1000))) {
        console.log(`amountIn from dapp ${from(amountIn).toString()}; amount from Accountant ${amount.toString()}`);
        return {
          code: 'amount_value_wrong',
          error: `AmountIn values do not match between Accountant and Dapp`,
        };
      }

      const amountInDAI = getPrice(reserveAsset, DAI, quotes)
        .mul(amountIn)
        .mul(10 ** (18 - getDecimals(reserveAsset)))
        .div(eth());
      console.log(`amountInDAI ${toAssetWithSymbol(amountInDAI, DAI)}`);
      if (amountInDAI.lt(eth(800))) {
        console.log(`Deposit amount is too low ${from(amountIn).toString()}. Exiting.`);
        return {
          code: 'amount_too_low',
          error: `Deposit amount is too low`,
        };
      }

      let subsidyPercentage = 0;
      if (gasPrice < 125000000000) {
        subsidyPercentage = 100;
        console.log('Subsidy 100%');
      } else if (gasPrice < 250000000000) {
        console.log('Subsidy 50%');
        subsidyPercentage = 50;
      } else if (gasPrice < 500000000000) {
        console.log('Subsidy 25%');
        subsidyPercentage = 25;
      }

      console.log('Estimating gas cost bond...', from(userLock).toString());
      const gasCost = await heartContract
        .connect(signer)
        .estimateGas.bondAssetBySig(
          assetToBond,
          amountToBond,
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          priceInBABL,
          pricePerShare,
          [from(maxFee).sub(from(maxFee).mul(subsidyPercentage).div(100)), userLock],
          contributor,
          referrer,
          signature,
        );

      console.log('gasCost', gasCost.toString());

      const fee = await checkFee(
        gasCost.sub(gasCost.mul(subsidyPercentage).div(100)),
        gasPrice,
        reserveAsset,
        quotes,
        maxFee,
      );

      res = await heartContract
        .connect(signer)
        .bondAssetBySig(
          assetToBond,
          amountToBond,
          amountIn,
          minAmountOut,
          nonce,
          maxFee,
          priceInBABL,
          pricePerShare,
          [fee, userLock],
          contributor,
          referrer,
          signature,
          {
            gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
          },
        );
    }

    await store.put(LAST_SIGNER, recoveredAddress);
    console.timeEnd('accountant');
    return res;
  } catch (e) {
    console.log(`Failed to deposit/withdraw by sig. Reason: ${e}. ${JSON.stringify(body)}`);
    sendErrorToTelegram(`Failed to deposit/withdraw by sig. Body: ${JSON.stringify(body)}. Reason: ${e}`);
    return {
      code: 'unknown',
      error: `Failed to deposit/withdraw by sig. Reason: ${e}`,
    };
  }
}

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
