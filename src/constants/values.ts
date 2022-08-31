import { BigNumber } from '@ethersproject/bignumber';

export const ONE_DAY_IN_SECONDS = BigNumber.from(60 * 60 * 24);

export const OPERATION_TYPES = {
  BUY: 0,
  LP: 1,
  VAULT_DEPOSIT: 2,
  LEND: 3,
};

export const MAX_OPERATIONS = 10;
export const MIN_OPERATIONS = 1;
