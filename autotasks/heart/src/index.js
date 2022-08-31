import { ethers } from 'ethers';
import { from, eth, sortBN } from 'common/utils/helpers.js';
import {
  getRelayer,
  getGasPrice,
  getProvider,
  getContractAt,
  toAssetWithSymbol,
  toETH,
  formatNumber,
  getNow,
  getERC20,
} from 'common/utils/web3.js';
import { sendErrorToTelegram } from 'common/utils/telegram.js';
import { GAS_LIMIT_PERCENTAGE, DAI, BABL, WETH } from 'common/constants.js';
import { getHeartDistVoteAll } from 'common/utils/fauna.js';
import contractsJSON from '../../../src/1.json';
const contracts = contractsJSON.contracts;

const RUN = process.env.RUN;
const MAX_GAS_PRICE = 200000000000;

// HELPERS ============================================
async function consolidateFeesToWeth(signer, heartContract, index) {
  let consolidatedAmount = eth(0);
  // Buyback index === 1
  const percentage = await heartContract.feeDistributionWeights(index);
  const controller = await getContractAt(
    '0xD4a5b5fcB561dAF3aDF86F8477555B92FBa43b5F',
    contracts['BabController'].abi,
    signer,
  );
  const priceOracle = await getContractAt(
    '0xcb8B0e43D6792F590Adf6f192107B64D359C661a',
    contracts['PriceOracle'].abi,
    signer,
  );
  const reserveAssets = await controller.getReserveAssets();
  for (const reserveAsset of reserveAssets) {
    const reserveAssetContract = await getContractAt(
      reserveAsset,
      contracts['IERC20'].abi.concat(['function decimals() external view returns (uint8)']),
      signer,
    );
    const balance = await reserveAssetContract.balanceOf(heartContract.address);
    const decimals = await reserveAssetContract.decimals();
    // Trade if it's above a min amount (otherwise wait until next pump)
    if (reserveAsset !== BABL && reserveAsset !== WETH && balance.gt(await heartContract.minAmounts(reserveAsset))) {
      const pricePurchasingAsset = await priceOracle.getPrice(reserveAsset, WETH);
      const wethToGet = balance
        .mul(pricePurchasingAsset)
        .mul(eth())
        .mul((10 ** (18 - decimals)).toString())
        .div(eth())
        .div(eth());
      consolidatedAmount = consolidatedAmount.add(wethToGet);
    }
    if (reserveAsset === WETH) {
      consolidatedAmount = consolidatedAmount.add(balance);
    }
  }
  return consolidatedAmount.mul(percentage).div(eth());
}

async function getBablMinAmountOut(signer, heartContract) {
  const priceOracle = await getContractAt(
    '0xcb8B0e43D6792F590Adf6f192107B64D359C661a',
    contracts['PriceOracle'].abi,
    signer,
  );
  const bablPrice = await priceOracle.getPrice(BABL, WETH);
  const slippage = eth(0.02);
  const buybackIndex = 1;
  const wethConsolidatedFromFeesForBuyback = await consolidateFeesToWeth(signer, heartContract, buybackIndex);
  let bablMinAmountOut = wethConsolidatedFromFeesForBuyback.mul(eth()).div(bablPrice);
  // consider slippage
  bablMinAmountOut = bablMinAmountOut.sub(bablMinAmountOut.mul(slippage).div(eth()));
  return bablMinAmountOut;
}

// ============================================

async function protectBabl({ heartContract, BABL_PRICE_LIMIT, signer }) {
  console.log('In protect BABL. Protecting below', BABL_PRICE_LIMIT);
  const priceOracle = await getContractAt(
    '0xcb8B0e43D6792F590Adf6f192107B64D359C661a',
    contracts['PriceOracle'].abi,
    signer,
  );
  const bablPrice = await priceOracle.getPrice(BABL, DAI);
  console.log('Current bablPrice', formatNumber(toETH(bablPrice)));
  const pricePurchasingAsset = await priceOracle.getPrice(await heartContract.assetForPurchases(), DAI);
  const slippage = eth(0.03);
  const hopToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC for FEI

  if (bablPrice.gt(eth(BABL_PRICE_LIMIT))) {
    console.log(
      `BABL price $${formatNumber(toETH(bablPrice))} is above the limit $${formatNumber(BABL_PRICE_LIMIT)}. Exit.`,
    );
    return;
  }

  const feiContract = await getContractAt(
    '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
    contracts['IERC20'].abi.concat(['function decimals() external view returns (uint8)']),
    signer,
  );
  const balance = await feiContract.balanceOf(heartContract.address);
  if (balance.lt(eth(2000))) {
    console.log(
      `Not enough funds in the heart to proect.`,
    );
    return;
  }

  console.log('BABL price needs to be protected', formatNumber(toETH(bablPrice)));

  // call estimateGas to make sure the tx would not fail
  const gasCost = await heartContract.estimateGas.protectBABL(
    eth(BABL_PRICE_LIMIT),
    bablPrice,
    pricePurchasingAsset,
    slippage,
    hopToken,
  );

  await heartContract.protectBABL(eth(BABL_PRICE_LIMIT), bablPrice, pricePurchasingAsset, slippage, hopToken, {
    gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
  });
}

async function resolveVotesAndPump({ heartContract, now, signer }) {
  const lastPumpAt = (await heartContract.lastPumpAt()).toNumber();
  console.log('lastPumpAt', lastPumpAt);
  if (now - lastPumpAt < 7 * 24 * 3600) {
    console.log(`Have to wait ${now - lastPumpAt - 7 * 24 * 3600} seconds until next pump. Exit.`);
    return;
  }
  const lastVotesAt = (await heartContract.lastVotesAt()).toNumber();
  console.log('lastVotesAt', lastVotesAt);
  if (now - lastVotesAt < 24 * 3600) {
    console.log('Votes has been resolved less than 1 day ago. Exit.');
    return;
  }

  //TODO: Verify signatures
  const votes = (await getHeartDistVoteAll()).map((obj) => obj.data);

  const votesPerGarden = votes.reduce((acc, val) => {
    const amount = from(val.amount);
    const sum = from(acc[val.garden] || 0);
    acc[val.garden] = sum.add(amount);
    return acc;
  }, {});

  for (const garden of Object.keys(votesPerGarden)) {
    console.log(`Votes for garden ${garden}: ${toAssetWithSymbol(votesPerGarden[garden], BABL)}`);
  }

  const sorted = Object.keys(votesPerGarden)
    .map((garden) => ({ garden, amount: votesPerGarden[garden] }))
    .sort(sortBN((val) => val.amount))
    .reverse();
  const top = sorted.slice(0, 3);
  const sum = top.reduce((acc, val) => {
    return acc.add(val.amount);
  }, from(0));

  const weighted = top.map((val) => ({ ...val, weight: val.amount.mul(eth()).div(sum) }));

  for (const obj of weighted) {
    console.log(`Garden ${obj.garden}/${toAssetWithSymbol(obj.amount, BABL)}/${ethers.utils.formatEther(obj.weight)}`);
  }

  console.log('Calculating bablMinAmountOut to prevent slippage');
  const bablMinAmountOut = await getBablMinAmountOut(signer, heartContract);
  console.log('bablMinAmountOut:', bablMinAmountOut.toString());
  // RESOLVE GARDEN VOTES AND PUMP AS PART OF THE SAME TX
  // call estimateGas to make sure the tx would not fail
  console.log('Estimating gas cost to pump...', weighted);
  const gasCost = await heartContract.estimateGas.resolveGardenVotesAndPump(
    weighted.map((val) => val.garden),
    weighted.map((val) => val.weight),
    bablMinAmountOut,
  );

  console.log('Estimated gas cost for resolving votes and pump:', gasCost);
  await heartContract.resolveGardenVotesAndPump(
    weighted.map((val) => val.garden),
    weighted.map((val) => val.weight),
    bablMinAmountOut,
    {
      gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
    },
  );
}

export async function handler(event) {
  console.time('heart');

  try {
    let CMC_API_KEY,
      FAUNADB_SERVER_SECRET,
      TELEGRAM_TOKEN,
      TELEGRAM_CHAT_ID,
      BLOCKNATIVE_API_KEY,
      BABL_PRICE_LIMIT,
      ACTIVE_PROPOSALS;
    // set env vars
    if (!!event && !!event.secrets) {
      ({
        CMC_API_KEY,
        FAUNADB_SERVER_SECRET,
        TELEGRAM_TOKEN,
        TELEGRAM_CHAT_ID,
        BLOCKNATIVE_API_KEY,
        BABL_PRICE_LIMIT,
        ACTIVE_PROPOSALS,
      } = event.secrets);

      process.env.BLOCKNATIVE_API_KEY = BLOCKNATIVE_API_KEY;
      process.env.CMC_API_KEY = CMC_API_KEY;
      process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
      process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
      process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
    }

    const [provider, signer, readOnlyProvider] = getProvider(event);
    const relayer = getRelayer(event);

    const txs = await relayer.list({
      status: 'pending', // can be 'pending', 'mined', or 'failed'
    });

    if (txs.length > 0) {
      console.log('There are pending txs');
      return;
    }

    const gasPrice = await getGasPrice();

    console.log('gasPrice', gasPrice);
    if (gasPrice > MAX_GAS_PRICE) {
      // if gas price higher than 200 gwei then abort
      console.log('Gas price is higher than 200 gwei. Exiting.');
      return;
    }

    const now = await getNow(provider);
    console.log('now', now);

    const heartContract = await getContractAt(
      '0x51e6775b7bE2eA1d20cA02cFEeB04453366e72C8',
      [
        'function resolveGardenVotesAndPump(address[] memory _gardens, uint256[] memory _weights, uint256 _bablMinAmountOut)',
        'function resolveGardenVotes(address[] memory _gardens, uint256[] memory _weights)',
        'function lastVotesAt() view returns (uint256)',
        'function lastPumpAt() external view returns (uint256) ',
        'function voteProposal(uint256 _proposalId, bool _isApprove)',
        'function protectBABL(uint256 _bablPriceProtectionAt, uint256 _bablPrice, uint256 _pricePurchasingAsset, uint256 _slippage, address _hopToken)',
        'function lendFusePool(address _assetToLend, uint256 _lendAmount)',
        'function borrowFusePool(address _assetToBorrow, uint256 _borrowAmount)',
        'function assetForPurchases() view returns (address)',
        'function minAmounts(address _reserve) external view returns (uint256)',
        'function feeDistributionWeights(uint256 _index) external view returns (uint256)',
      ],
      signer,
    );

    await resolveVotesAndPump({ heartContract, now, signer });

    await protectBabl({ heartContract, BABL_PRICE_LIMIT, signer });

    // Vote on governance
    const heartViewer = await getContractAt(contracts['HeartViewer'].address, contracts['HeartViewer'].abi, signer);
    const proposalIds = ACTIVE_PROPOSALS.split(',');
    const proposalArrays = await heartViewer.getGovernanceProposals(proposalIds);
    for (let i = 0; i < proposalArrays[0].length; i++) {
      // Active && close to expiring
      const currentBlock = await provider.getBlockNumber();
      if (proposalArrays[3][i].toNumber() === 1 && currentBlock >= proposalArrays[1][i].toNumber() - 300) {
        const gasCost = await heartContract.estimateGas.voteProposal(proposalIds[i], true);
        await heartContract.voteProposal(proposalIds[i], true, {
          gasLimit: gasCost.mul(GAS_LIMIT_PERCENTAGE).div(100),
        });
      }
    }

    console.timeEnd('heart');
  } catch (e) {
    console.log(`Failed to run Heart. Event: ${e}. `);
    sendErrorToTelegram(`Failed to pump heart. Event: ${e}`);
    return;
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
