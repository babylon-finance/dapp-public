import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';
import { USE_DEPOSIT_BY_SIG, IS_MAINNET, MIN_SAFE_ACCOUNTANT_BAL_ETH } from 'config';

export const canUseSignature = (accountantBalance: BigNumber, supportedWallet: boolean = false): boolean => {
  const lowAccountantBalance = accountantBalance <= parseEther(MIN_SAFE_ACCOUNTANT_BAL_ETH.toString());
  return USE_DEPOSIT_BY_SIG && IS_MAINNET && supportedWallet && !lowAccountantBalance;
};
