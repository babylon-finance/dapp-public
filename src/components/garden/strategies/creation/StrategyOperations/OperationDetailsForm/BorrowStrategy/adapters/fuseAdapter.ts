import { tokens } from 'constants/addresses';

export const getFuseMarkets = () => {
  return [
    {
      id: tokens.FEI,
      name: 'FEI',
      symbol: 'FEI',
      borrowRate: 2.0,
    },
    {
      id: tokens.FRAX,
      name: 'FRAX',
      symbol: 'FRAX',
      borrowRate: 3.5,
    },
    {
      id: tokens.DAI,
      name: 'DAI',
      symbol: 'DAI',
      borrowRate: 3.0,
    },
    {
      id: '0x',
      name: 'Ethereum',
      symbol: 'ETH',
      borrowRate: 3.0,
    },
  ];
};
