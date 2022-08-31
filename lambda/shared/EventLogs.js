const { contracts } = require('../shared/1.json');
const contractsDev = require('../shared/31337.json');
let contractsNetwork = contracts;
if (process.env.REACT_APP_CHAIN_ID === '31337') {
  contractsNetwork = contractsDev.contracts;
}
const { ALCHEMY_URL, START_BLOCK } = require('../shared/constants.js');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Contract } = require('@ethersproject/contracts');

const provider = new JsonRpcProvider(process.env.REACT_APP_CHAIN_ID === '1' ? ALCHEMY_URL : '');

module.exports = {
  getContractEvents: async function (contractAddress, contractName, eventName, currentBlock) {
    const abi = contractsNetwork[contractName].abi;
    if (abi) {
      provider.resetEventsBlock(START_BLOCK);
      const contract = new Contract(contractAddress, abi, provider);
      let events = [];
      if (contract) {
        const filter = contract.filters.GardenDeposit(null);
        if (process.env.REACT_APP_CHAIN_ID === '31337') {
          events = await contract.queryFilter(filter, -2000);
          return events.map((event) => {
            return { ...event.args, blockNumber: event.blockNumber };
          });
        }
        let iteratorBlock = START_BLOCK;
        const promises = [];
        while (iteratorBlock < currentBlock) {
          promises.push(contract.queryFilter(filter, iteratorBlock, iteratorBlock + 2000));
          iteratorBlock += 2000;
        }
        events = await Promise.all(promises);
        return events.flat().map((event) => {
          return { ...event.args, blockNumber: event.blockNumber };
        });
      } else {
        console.log(`Contract not found for: [ Name: ${contractName}, Address: ${contractAddress} ]`);
      }
    } else {
      console.log(`Abi not found for contract name: ${contractName}`);
    }
    return [];
  },
};
