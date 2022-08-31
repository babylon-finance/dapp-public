/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from '@ethersproject/contracts';
import { IS_MAINNET } from 'config';
import { contracts } from '1.json';
let contractsNetwork = contracts;
if (!IS_MAINNET) {
  contractsNetwork = require('31337.json').contracts;
}

export function getAddressByName(name) {
  try {
    if (name === 'IViewer') {
      name = 'Viewer';
    }
    return contractsNetwork[name].address;
  } catch (error) {
    console.error('Could not load contract', name, error.toString());
  }
}

export async function loadContractFromNameAndAddress(address, contractName, providerOrSigner) {
  let newContract;
  try {
    // we need to check to see if this providerOrSigner has a signer or not
    let signer;
    let accounts;
    if (providerOrSigner && typeof providerOrSigner.listAccounts === 'function') {
      accounts = await providerOrSigner.listAccounts();
    }

    if (accounts && accounts.length > 0) {
      signer = providerOrSigner.getSigner();
    } else {
      signer = providerOrSigner;
    }
    const abi = getABIByName(contractName);
    newContract = new Contract(address, abi, signer);

    newContract.bytecode = contractsNetwork[contractName].bytecode;
  } catch (err) {
    console.log(`Failed to load contract ${contractName}`, err);
  }
  return newContract;
}

export function getABIByName(contractName) {
  return contractsNetwork[contractName].abi;
}
