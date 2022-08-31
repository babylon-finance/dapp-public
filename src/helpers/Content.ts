import { TxState } from 'models';

export const getLoadingText = (status: string): string => {
  switch (status) {
    case TxState.confirm:
      return 'Please confirm the transaction in your wallet...';
    case TxState.mine:
      return 'Transaction sent. Waiting for confirmation...';
    case TxState.success:
      return 'Transaction confirmed!';
    case TxState.failed:
      return 'Transaction failed!';
    default:
      return 'Loading...';
  }
};
