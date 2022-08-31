import { useState, useEffect } from 'react';
import { Contract } from '@ethersproject/contracts';
import { BaseProvider } from '@ethersproject/providers';

/*
  ~ What it does? ~
  Enables you to keep track of events
  ~ How can I use? ~
  const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);
  ~ Features ~
  - Provide readContracts by loading contracts (see more on ContractLoader.js)
  - Specify the name of the contract, in this case it is "YourContract"
  - Specify the name of the event in the contract, in this case we keep track of "SetPurpose" event
  - Pass additional filters to filter out indexed parameters
  - Specify the provider
*/

export default function useEventListener(
  contract: Contract | undefined,
  eventName: string,
  provider: BaseProvider,
  startBlock: number,
  filters: any[],
) {
  const [updates, setUpdates] = useState<any>([]);

  useEffect(() => {
    const checkLog = async () => {
      if (typeof provider !== 'undefined' && typeof startBlock !== 'undefined') {
        // if you want to read _all_ events from your contracts, set this to the block number it is deployed
        if (provider.resetEventsBlock) {
          provider.resetEventsBlock(startBlock);
        }
      }
      if (contract) {
        const listener = (...args) => {
          let newLog = args[args.length - 1];
          if (newLog.blockNumber >= startBlock) {
            setUpdates((updates: any) => [...updates, { ...newLog.args, blockNumber: newLog.blockNumber }]);
          }
        };
        try {
          contract.on(eventName, listener);
          return () => {
            contract.off(eventName, listener);
          };
        } catch (e) {
          console.log(e);
        }
      }
    };
    checkLog();
  }, [provider, startBlock, contract, eventName]);
  return updates;
}
