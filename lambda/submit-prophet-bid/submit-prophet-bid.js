const { contracts } = require('../shared/1.json');
const { PROVIDER_URL, WETH, PORPHET_FLOOR } = require('../shared/constants.js');
const { verifyDomain } = require('../shared/Verify.js');
const { getProphetBidsForWallet, insertProphetBid } = require('../shared/queries');
const { buildProphetBidMessage } = require('../shared/web3');

const { BigNumber } = require('@ethersproject/bignumber');
const { Contract } = require('@ethersproject/contracts');
const { StaticJsonRpcProvider } = require('@ethersproject/providers');
const { verifyMessage } = require('@ethersproject/wallet');
const { splitSignature, arrayify } = require('@ethersproject/bytes');
const { formatEther } = require('@ethersproject/units');

const FUNCTION_NAME = 'submit-prophet-bid';

exports.handler = async function (event, context, callback) {
  console.log(`${FUNCTION_NAME} starting...`);
  const startTime = Date.now();
  const provider = new StaticJsonRpcProvider(PROVIDER_URL);
  const AUCTION_CLOSE = new Date(1637366400 * 1000).valueOf();

  try {
    const wethContract = new Contract(WETH, contracts['IERC20'].abi, provider);
    // hardcode unauthorized
    return { statusCode: 401, body: 'Unauthorized' };
    // if (!verifyDomain(event.headers.host)) {
    //   return { statusCode: 401, body: 'Unauthorized' };
    // }
    //
    // if (event.httpMethod !== 'POST') {
    //   return { statusCode: 405, body: `Unsupported Request Method: ${event.httpMethod}` };
    // }
    //
    // const data = JSON.parse(event.body);
    // const { signature, payload, wallet } = data;
    // const { myBid, nonce, contract } = payload;
    //
    // const nonceBN = BigNumber.from(nonce);
    // const myBidBN = BigNumber.from(myBid);
    //
    // const splitSig = splitSignature(signature);
    // const hash = buildProphetBidMessage(myBidBN, nonceBN, contract);
    // console.log(hash);
    //
    // // Verify signature.
    // const verifiedAddress = verifyMessage(arrayify(hash.message), splitSig);
    //
    // if (verifiedAddress.toLowerCase() !== wallet.toLowerCase()) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ error: 'Invalid signature' }),
    //   };
    // }
    //
    // // Get any existing bids by wallet address
    // const existingBids = await getProphetBidsForWallet(verifiedAddress.toLowerCase());
    // const usedNonceBN = existingBids
    //   ? BigNumber.from(Math.max(...existingBids.data.map((bid) => parseInt(bid.data.nonce))))
    //   : BigNumber.from(0);
    //
    // const sumBidsBN = existingBids
    //   ? existingBids.data
    //       .map((bid) => BigNumber.from(bid.data.amount))
    //       .reduceRight((a, b) => a.add(b), BigNumber.from(0))
    //   : BigNumber.from(0);
    //
    // // Check WETH balance of verifiedAddress
    // const balance = await wethContract.balanceOf(verifiedAddress);
    // const adjustedBalance = balance.sub(sumBidsBN);
    //
    // // Avoid invalid bids like replay attacks with the same nonce or invalid nonce
    // // if (usedNonceBN.gt(nonceBN)) {
    // //   return {
    // //     statusCode: 500,
    // //     body: JSON.stringify({ error: 'Bid nonce is invalid.' }),
    // //   };
    // // }
    //
    // // Avoid invalid bids below the auction floor
    // if (PORPHET_FLOOR.gt(myBidBN)) {
    //   return {
    //     statusCode: 500,
    //     body: JSON.stringify({ error: 'Bid does not meet minimum floor for auction.' }),
    //   };
    // }
    //
    // // Avoid bids that are greater than the current balance for the wallet
    // if (balance.lt(myBidBN)) {
    //   console.log(formatEther(balance));
    //   return {
    //     statusCode: 500,
    //     body: JSON.stringify({ error: 'Wallet balance does not meet amount necessary for bid.' }),
    //   };
    // }
    //
    // // Check adjusted balance after summing existing bids in chronological order
    // if (adjustedBalance.lt(myBidBN)) {
    //   return {
    //     statusCode: 500,
    //     body: JSON.stringify({ error: 'Bid would exceed wallet balance after executing existing bids.' }),
    //   };
    // }
    //
    // await insertProphetBid(verifiedAddress, myBid, nonce, signature, startTime);
    //
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ nonce, myBid }),
    // };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    console.log(`${FUNCTION_NAME} completed in ${Date.now() - startTime} ms`);
  }
};
