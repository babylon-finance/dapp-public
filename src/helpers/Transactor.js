import { hexlify } from '@ethersproject/bytes';
import { parseUnits } from '@ethersproject/units';
import { IS_PROD } from 'config';

export default function Transactor(notify, provider, gasPrice, onConfirm) {
  if (typeof provider !== 'undefined') {
    // eslint-disable-next-line consistent-return
    return async (tx) => {
      const signer = provider.getSigner();

      let etherscanTxUrl = 'https://etherscan.io/tx/';

      try {
        let result;
        if (tx instanceof Promise) {
          result = await tx;
        } else {
          if (!tx.gasPrice) {
            tx.gasPrice = gasPrice || parseUnits('4.1', 'gwei');
          }
          if (!tx.gasLimit) {
            tx.gasLimit = hexlify(120000);
          }

          result = await signer.sendTransaction(tx);
        }

        if (IS_PROD && notify) {
          const { emitter } = notify.hash(result.hash);
          if (emitter) {
            emitter.on('all', (transaction) => {
              return {
                onclick: () => window.open(etherscanTxUrl + transaction.hash),
              };
            });
          }
        } else {
          console.log(`Submitted local transaction ${result.hash}`);
        }

        return result;
      } catch (e) {
        console.log('Failed to submit transaction', e);

        return e;
      }
    };
  }
}
