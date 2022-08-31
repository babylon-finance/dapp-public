const ETHERSCAN_BASE_CONTRACT_URL = 'https://etherscan.io/address/';

export const buildEtherscanContractUrl = (address: string) => {
  return `${ETHERSCAN_BASE_CONTRACT_URL}${address}`;
};
