import { ethers } from 'ethers';
import { getGasPrice, getProvider, getContractAt, getGardenMembers } from 'common/utils/web3.js';
import { getStore } from 'common/utils/store.js';
import { sendErrorToTelegram } from 'common/utils/telegram.js';
import { from, eth } from 'common/utils/helpers.js';

import contractsJSON from '../../../src/1.json';
const contracts = contractsJSON.contracts;

const RUN = process.env.RUN;

async function whipGarden(garden, signer, store) {
  const gardenContract = await getContractAt(garden, contracts['Garden'].abi, signer);
  const gateContract = await getContractAt(contracts['IshtarGate'].address, contracts['IshtarGate'].abi, signer);
  const gardenValuerContract = await getContractAt(
    contracts['GardenValuer'].address,
    contracts['GardenValuer'].abi,
    signer,
  );

  let totalVotes = from(0);
  const members = await getGardenMembers(garden);
  for (const member of members) {
    const canVote = await gateContract.canVoteInAGarden(garden, member);
    if (!!canVote) {
      totalVotes = totalVotes.add(await gardenContract.balanceOf(member));
    }
  }

  const totalSupply = await gardenContract.totalSupply();
  const gardenKey = `garden-whip-${garden}`;
  const obj = { totalSupply: totalSupply.toString(), totalVotes: totalVotes.toString() };
  await store.put(gardenKey, JSON.stringify(obj));
  console.log(`Updated ${garden} with totalSupply:${totalSupply.toString()} totalVotes:${totalVotes.toString()}`);
}

// Entrypoint for the Autotask
// https://api.defender.openzeppelin.com/autotasks/f5d949e3-69b4-4719-b917-452a72b3d81d/runs/webhook/6e30b068-78f1-4d1e-8956-31c4e0ba8423/FwvhYHzNejHyUk6UAw9sZy
export async function handler(event) {
  console.time('whip');

  try {
    const {
      body, // Object with JSON-parsed POST body
    } = event.request || {};

    const { transaction } = body || {};
    console.log('transaction', transaction);
    const { to: garden } = transaction || {};
    console.log('garden ', garden);

    let CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID;
    // set env vars
    if (!!event && !!event.secrets) {
      ({ CMC_API_KEY, FAUNADB_SERVER_SECRET, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = event.secrets);

      process.env.CMC_API_KEY = CMC_API_KEY;
      process.env.FAUNADB_SERVER_SECRET = FAUNADB_SERVER_SECRET;
      process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
      process.env.TELEGRAM_CHAT_ID = TELEGRAM_CHAT_ID;
    }

    const [, , readOnlyProvider] = getProvider(event);

    const store = getStore(event);

    if (garden) {
      await whipGarden(garden, readOnlyProvider, store);
    } else {
      const controllerContract = await getContractAt(
        contracts['BabControllerProxy'].address,
        contracts['BabController'].abi,
        readOnlyProvider,
      );
      const gardens = await controllerContract.getGardens();
      for (const grdn of gardens) {
        try {
          await whipGarden(grdn, readOnlyProvider, store);
        } catch (e) {
          console.log(`Failed to update quorum. Reason: ${e.message}`);
        }
      }
    }

    console.timeEnd('whip');
  } catch (e) {
    console.log(`Failed to update quorum. Reason: ${e}`);
    //sendErrorToTelegram(`Failed to update quorum. Reason: ${e}`);
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
