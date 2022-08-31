import { DefenderRelaySigner, DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { Relayer } from 'defender-relay-client';
import { from, eth } from 'common/utils/helpers.js';

import axios from 'axios';
import { ethers } from 'ethers';
import {
  UNIV2_ROUTER,
  GARDEN_MEMBERS_URL,
  WETH,
  DAI,
  BABL,
  AAVE,
  WBTC,
  USDC,
  BLOCKNATIVE_API_URL,
} from 'common/constants.js';

const LOCAL = process.env.LOCAL;

export const GAS_SPEED = {
  fast: 'fast',
  rapid: 'rapid',
  standard: 'standard',
};

export function getSymbol(asset) {
  switch (asset) {
    case BABL:
      return 'BABL';
    case AAVE:
      return 'AAVE';
    case DAI:
      return 'DAI';
    case USDC:
      return 'USDC';
    case WETH:
      return 'WETH';
    case WBTC:
      return 'WBTC';
    default:
      throw new Error(`Unknown reserveAsset ${asset}`);
  }
}

export function toAsset(value, asset) {
  switch (asset) {
    case BABL: {
      // has 18 decimals
      return toBABL(value);
    }
    case AAVE:
    case DAI:
      // has 18 decimals
      return toDAI(value);
    case USDC:
      // has 6 decimals
      return toUSDC(value);
    case WETH:
      // has 18 decimals
      return toETH(value);
    case WBTC:
      // has 8 decimals
      return toWBTC(value);
    default:
      throw new Error(`Unknown reserveAsset ${asset}`);
  }
}

export function formatNumber(num) {
  // String with formatted number
  var totalStr = '';
  // Convert number to string
  var numStr = num + '';
  // Separate number on before point and after
  var parts = numStr.split('.');
  // Save length of rounded number
  var numLen = parts[0].length;
  // Start iterating numStr chars
  for (var i = 0; i < numLen; i++) {
    // Position of digit from end of string
    var y = numLen - i;

    // If y is divided without remainder on 3...
    if (i > 0 && y % 3 == 0) {
      // add aposrtoph when greater than 6 digit
      // or add point when smaller than 6 digit
      totalStr += y >= 6 ? "'" : ',';
    }

    // Append current position digit to total string
    totalStr += parts[0].charAt(i);
  }
  return `${totalStr}.${!!parts[1] ? parts[1].slice(0, 2) : '00'}`;
}

export function toAssetWithSymbol(value, asset) {
  return `${toAsset(value, asset)} ${getSymbol(asset)}`;
}

export function toUSDC(value) {
  return formatNumber(ethers.utils.formatUnits(value, 6));
}

export function toBABL(value) {
  return formatNumber(ethers.utils.formatUnits(value, 'ether'));
}

export function toDAI(value) {
  return formatNumber(ethers.utils.formatUnits(value, 'ether'));
}

export function toWBTC(value) {
  return formatNumber(ethers.utils.formatUnits(value, 8));
}

export function toPercentage(value) {
  return `${ethers.utils.formatUnits(value.mul(100), 'ether')}%`;
}

export function toETH(value) {
  return ethers.utils.formatUnits(value, 'ether');
}

export async function getGardenMembers(garden) {
  const response = await axios.get(`${GARDEN_MEMBERS_URL}${garden}`);
  if (response.status !== 200) throw new Error(`Failed to fetch garden members for ${garden}`);
  return response.data;
}

/**
 * Returns gas prices in wei
 */
export async function getPrices() {
  const config = {
    headers: {
      Authorization: process.env.BLOCKNATIVE_API_KEY,
    },
  };

  const { data } = await axios.get(`${BLOCKNATIVE_API_URL}/gasprices/blockprices`, config);

  const prices = data.blockPrices[0].estimatedPrices;
  // Grab prices and convert to wei for backwards compatibility
  const fast = prices.find((ep) => ep.confidence === 95).price * 10 ** 9;
  const rapid = prices.find((ep) => ep.confidence === 99).price * 10 ** 9;
  const standard = prices.find((ep) => ep.confidence === 70).price * 10 ** 9;

  if (!!fast && !!rapid && !!standard) {
    return {
      fast,
      rapid,
      standard,
    };
  } else {
    throw new Error('Gas prices missing from Blocknative payload');
  }
}

export async function getGasPrice(speed) {
  speed = speed || GAS_SPEED.fast;
  return (await getPrices())[speed];
}

export async function getContractAt(address, abi, signerOrProvider) {
  return new ethers.Contract(address, abi, signerOrProvider);
}

export async function getERC20(address) {
  return await ethers.getContractAt('@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20', address);
}

export async function getNow(provider) {
  return (await provider.getBlock('latest')).timestamp;
}

export function getProvider(event) {
  let provider;
  let signer;
  let readOnlyProvider = new ethers.providers.JsonRpcProvider(
    'https://nameless-polished-dawn.quiknode.pro/1c4b67dd2b4a57754e6b6dc0e5f81e5c457f399f/',
  );
  if (!LOCAL) {
    // Initialize defender relayer provider and signer
    provider = new DefenderRelayProvider(event);
    signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });
  } else {
    provider = readOnlyProvider;
    signer = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d').connect(provider);
    console.log(`Using local keeper ${signer.address}`);
  }
  return [provider, signer, readOnlyProvider];
}

export function getRelayer(event) {
  if (!LOCAL) {
    return new Relayer(event);
  } else {
    return { list: () => Promise.resolve([]) };
  }
}

function toBigNumber(value) {
  return ethers.BigNumber.from(Math.round(value * 1e10));
}

export function getPrice(asset0, asset1, quotes) {
  const asset0USD = getPriceInUSD(asset0, quotes);
  const asset1USD = getPriceInUSD(asset1, quotes);
  return asset0USD.mul(eth()).div(asset1USD);
}

export function getDecimals(asset) {
  switch (asset) {
    case BABL:
      return 18;
    case AAVE:
      return 18;
    case DAI:
      return 18;
    case USDC:
      return 6;
    case WETH:
      return 18;
    case WBTC:
      return 8;
    default:
      throw new Error(`Unknown reserveAsset ${asset}`);
  }
}

export function getPriceInUSD(asset0, quotes) {
  switch (asset0) {
    case AAVE: // has 18 decimals
      return toBigNumber(quotes['AAVE'].quote.USD.price).mul(eth()).div(1e10);
      break;
    case BABL: // has 18 decimals
      return toBigNumber(quotes['BABL'].quote.USD.price).mul(eth()).div(1e10);
      break;
    case DAI: // has 18 decimals
      return eth();
      break;
    case USDC:
      // has 6 decimals
      return eth();
      break;
    case WETH:
      // has 18 decimals
      return toBigNumber(quotes['WETH'].quote.USD.price).mul(eth()).div(1e10);
      break;
    case WBTC:
      // has 8 decimals
      return toBigNumber(quotes['WBTC'].quote.USD.price).mul(eth()).div(1e10);
      break;
    default:
      throw new Error(`Unknown asset ${asset}`);
  }
}

export function weiToAsset(value, asset, quotes) {
  switch (asset) {
    case DAI:
      return value.mul(toBigNumber(quotes['WETH'].quote.USD.price)).div(1e10);
      break;
    case USDC:
      return value.mul(toBigNumber(quotes['WETH'].quote.USD.price)).div(1e12).div(1e10);
      break;
    case WETH:
      return value;
      break;
    case BABL:
      return value.mul(toBigNumber(quotes['WETH'].quote.USD.price)).div(toBigNumber(quotes['BABL'].quote.USD.price));
      break;
    case AAVE:
      return value.mul(toBigNumber(quotes['WETH'].quote.USD.price)).div(toBigNumber(quotes['AAVE'].quote.USD.price));
      break;
    case WBTC:
      return value
        .mul(toBigNumber(quotes['WETH'].quote.USD.price))
        .div(toBigNumber(quotes['WBTC'].quote.USD.price))
        .div(1e10);
      break;
    default:
      throw new Error(`Unknown asset ${asset}`);
  }
}

export async function checkQuotes(quotes, store) {
  const MULTIPLIER = 10;
  const assets = ['WETH', 'WBTC', 'BABL'];
  const prevPrices = JSON.parse(await store.get(`prev-quotes`)) || {};
  for (const asset of assets) {
    const price = toBigNumber(quotes[asset].quote.USD.price);
    const prevPrice = !!prevPrices[asset] ? from(prevPrices[asset]) : undefined;
    if (!!prevPrice && (price.lt(prevPrice.div(MULTIPLIER)) || price.gt(prevPrice.mul(MULTIPLIER)))) {
      throw new Error(`${asset} price is likely wrong.`);
    }
  }

  await store.put(
    `prev-quotes`,
    JSON.stringify(
      assets.reduce((acc, asset) => {
        acc[asset] = toBigNumber(quotes[asset].quote.USD.price).toString();
        return acc;
      }, {}),
    ),
  );
}

export function getDepositSigHash(garden, amountIn, minAmountOut, nonce, maxFee, to, referrer) {
  const DEPOSIT_BY_SIG_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      'DepositBySig(uint256 _amountIn,uint256 _minAmountOut,uint256 _nonce,uint256 _maxFee,address _to,address _referrer)',
    ),
  );

  let payload = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'address'],
    [DEPOSIT_BY_SIG_TYPEHASH, garden, amountIn, minAmountOut, nonce, maxFee, to, referrer],
  );

  return ethers.utils.keccak256(payload);
}

export function getWithdrawSigHash(garden, amountIn, minAmountOut, nonce, maxFee, withPenalty) {
  const WITHDRAW_BY_SIG_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      'WithdrawBySig(uint256 _amountIn,uint256 _minAmountOut,uint256,_nonce,uint256 _maxFee,uint256 _withPenalty)',
    ),
  );

  let payload = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'],
    [WITHDRAW_BY_SIG_TYPEHASH, garden, amountIn, minAmountOut, nonce, maxFee, withPenalty],
  );

  return ethers.utils.keccak256(payload);
}

export function getRewardsSigHash(garden, babl, profits, nonce, maxFee) {
  const REWARDS_BY_SIG_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('RewardsBySig(uint256 _babl,uint256 _profits,uint256 _nonce,uint256 _maxFee)'),
  );

  let payload = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
    [REWARDS_BY_SIG_TYPEHASH, garden, babl, profits, nonce, maxFee],
  );

  return ethers.utils.keccak256(payload);
}

export function getStakeRewardsSigHash(garden, babl, profits, minAmountOut, nonce, nonceHeart, maxFee, to) {
  const REWARDS_BY_SIG_TYPEHASH = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      'StakeRewardsBySig(uint256 _babl,uint256 _profits,uint256 _minAmountOut,uint256 _nonce,uint256 _nonceHeart,uint256 _maxFee,address _to)',
    ),
  );

  let payload = ethers.utils.defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
    [REWARDS_BY_SIG_TYPEHASH, garden, babl, profits, minAmountOut, nonce, nonceHeart, maxFee, to],
  );

  return ethers.utils.keccak256(payload);
}

export async function checkAndSwapAssets(provider, signer, store, relayer, contracts) {
  const info = await relayer.getRelayer();
  const relayerAddress = info.address;

  // swap assets back to ETH if balance is low
  const balance = await provider.getBalance(relayerAddress);
  if (balance.lt(eth())) {
    console.log('Balance is low');
    // Unwrap WETH if balance is > 1 ETH
    const wethContract = await getContractAt(WETH, contracts['IWETH'].abi, signer);
    const wethBalance = await wethContract.balanceOf(relayerAddress);
    console.log(`WETH balance ${toAssetWithSymbol(wethBalance, WETH)}`);
    if (wethBalance.gt(eth())) {
      console.log('Unwraping WETH');
      await wethContract.withdraw(wethBalance);
      return;
    }

    const assets = [
      { address: DAI, name: 'DAI', limit: eth(5000) },
      { address: USDC, name: 'USDC', limit: from(5000 * 1e6) },
      { address: WBTC, name: 'WBTC', limit: from(0.1 * 1e8) },
    ];
    for (const { address, name, limit } of assets) {
      const contract = await getContractAt(address, contracts['IWETH'].abi, signer);
      const balance = await contract.balanceOf(relayerAddress);
      console.log(`Balance: ${toAssetWithSymbol(balance, address)}`);
      if (balance.gt(limit)) {
        console.log(`Trading ${name} to ETH`);
        const allowance = await contract.allowance(relayerAddress, UNIV2_ROUTER);
        console.log(`${name} allowance: ${toAssetWithSymbol(allowance, address)}`);
        if (allowance.lt(balance)) {
          console.log(`Approve ${name} allowance to Uni router`);
          await contract.approve(UNIV2_ROUTER, ethers.constants.MaxUint256);
          // exit so approve txs gets mined before trade heppens
          return;
        }
        const routerContract = new ethers.Contract(
          UNIV2_ROUTER,
          [
            `function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)`,
            `function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)`,
          ],
          signer,
        );
        const amountOut = await routerContract.callStatic.getAmountsOut(balance, [address, WETH]);
        const deadline = Math.floor(Date.now() / 1000) + 1000 * 60;
        console.log(`Trade on UniV2 ${name}->ETH`);
        await routerContract.swapExactTokensForETH(
          balance,
          amountOut[1].sub(amountOut[1].mul(5).div(100)),
          [address, WETH],
          relayerAddress,
          deadline,
        );
        return;
      }
    }
  } else {
    console.log('Balance is higher than 1 ETH');
  }
}
