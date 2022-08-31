const BASE_GATEWAY_URL = 'https://babylon.mypinata.cloud/ipfs/';
// TODO(undfined): pin all of these NFT's manually and grab the URI from pinata
const STRATEGY_LEVELS = {
  ONE: {
    image: `${BASE_GATEWAY_URL}/QmdA8iL3cvmW9mf6SYVwuon3uvpwUkdwAtmK5g2rXNau5b`,
    description: 'Babylon Gate',
  },
  TWO: {
    image: `${BASE_GATEWAY_URL}/QmdA8iL3cvmW9mf6SYVwuon3uvpwUkdwAtmK5g2rXNau5b`,
    description: 'Babylon Gate',
  },
  THREE: {
    image: `${BASE_GATEWAY_URL}/QmdA8iL3cvmW9mf6SYVwuon3uvpwUkdwAtmK5g2rXNau5b`,
    description: 'Babylon Gate',
  },
};

export function determineLevel(metrics) {
  const { principal, returns, profit, rewards, duration } = metrics;
  // TODO(undfined): come up with a useful model for determining which nft
  // a strategy earns.

  return STRATEGY_LEVELS.ONE;
}
