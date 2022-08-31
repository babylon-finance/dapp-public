import { Animation, BaseModal, BaseLoader, Icon, TurquoiseButton } from 'components/shared';

import Transactor from 'helpers/Transactor';
import useGasPrice from 'hooks/GasPrice';
import { AnimationName } from '../Animation/Animation';
import { IconName, TxType, TxState } from 'models';
import { useW3Context } from 'context/W3Provider';
import { getLoadingText } from 'helpers/Content';
import { BREAKPOINTS } from 'config';

import { TransactionReceipt } from '@ethersproject/abstract-provider';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

interface TxLoaderProps {
  type?: TxType;
  txObject: any;
  txHash?: string | undefined;
  inModal?: boolean;
  children?: React.ReactNode;
  waitForConfirmation?: boolean;
  customConfirmationText?: string;
  onConfirm?: (success?: boolean) => void;
  onSuccess?: (receipt?: TransactionReceipt) => void;
  onFailure?: () => void;
}

interface TxFailure {
  code: number;
  message: string;
  stack: string;
}

/**
 * Check if the transaction was success based on the receipt.
 *
 * https://ethereum.stackexchange.com/a/45967/620
 *
 * @param receipt Transaction receipt
 */
export function isSuccessfulTransaction(receipt: any): boolean {
  return receipt.status === '0x1' || receipt.status === 1;
}

const TxLoader = ({
  type = TxType.default,
  txObject,
  onConfirm,
  onFailure,
  customConfirmationText,
  onSuccess,
  inModal,
  children,
  waitForConfirmation,
  txHash,
}: TxLoaderProps) => {
  const [txState, setTxState] = useState<string>(txHash ? TxState.mine : TxState.ready);
  const [modalOpen, setModalOpen] = useState(true);
  const [txDetails, setTxDetails] = useState<any>(undefined);
  const [txFailure, setTxFailure] = useState<TxFailure | undefined>(undefined);

  const { notify, userPrefs, txProvider } = useW3Context();
  const tx = Transactor(notify, txProvider, useGasPrice(userPrefs?.gasSpeed || 'fast'));

  const resetState = (onConfirm: ((success?: boolean) => void) | undefined) => {
    setModalOpen(false);
    setTxFailure(undefined);
    setTxDetails(undefined);
    if (onConfirm) {
      onConfirm(txState === 'success');
    }
    setTxState(TxState.ready);
  };

  const successCb = (receipt: TransactionReceipt) => {
    setTxState(TxState.success);

    if (onSuccess) {
      onSuccess(receipt);
    }
  };

  const waitForReceipt = async (txDetails: any, hash?: string) => {
    if (txProvider) {
      const waitingOnReceipt = txProvider.waitForTransaction(hash ? hash : txDetails.hash, 1);

      await waitingOnReceipt.then(async (receipt) => {
        // Status of 0 === failed, 1 === success
        // For more info about receipts, https://docs.ethers.io/v5/api/providers/types/#providers-TransactionReceipt
        if (receipt.status === 0) {
          setTxState(TxState.failed);
          setTxFailure({ code: -1, message: 'Transaction failed!', stack: '' });
        }

        if (receipt.status === 1) {
          setTxState(TxState.success);
          successCb(receipt);
        }
      });
    }
  };

  const callTx = async () => {
    if (tx) {
      setTxState(TxState.confirm);
      const txSubmitted = await tx(txObject);

      if (Object.keys(txSubmitted).includes('code')) {
        setTxState(TxState.failed);
        setTxFailure(txSubmitted);

        if (onFailure) {
          onFailure();
        }

        return;
      }

      if (txSubmitted) {
        setTxState(TxState.mine);
        setTxDetails(txSubmitted);

        await waitForReceipt(txSubmitted);
      }
    }
  };

  useEffect(() => {
    // Wait for the receipt only once
    if (txHash && txState === TxState.mine) {
      waitForReceipt(null, txHash);
    }

    // If txHash is passed we skip this effect since tx has been submitted
    // by a keeper or otherwise.
    if (txState === TxState.ready && !txHash) {
      callTx();
    }
  }, []);

  const renderContent = () => {
    const isDeposit = type === TxType.deposit;

    return (
      <ContentWrapper>
        {txState !== TxState.success && txState !== TxState.failed && (
          <BaseLoader size={100} text={getLoadingText(txState)} />
        )}
        {txState === TxState.success && (
          <ResultWrapper>
            {children}
            {!children && (
              <>
                <Animation
                  name={isDeposit ? AnimationName.deposit : AnimationName.generic}
                  size={isDeposit ? 300 : 100}
                />
                <ConfirmText>
                  {customConfirmationText ? customConfirmationText : getLoadingText(TxState.success)}
                </ConfirmText>
              </>
            )}
            <TurquoiseButton
              onClick={() => {
                resetState(onConfirm);
              }}
            >
              Close
            </TurquoiseButton>
          </ResultWrapper>
        )}
        {txState === TxState.failed && waitForConfirmation && (
          <ResultWrapper>
            <ExceptionIconWrapper>
              <Icon color="" name={IconName.error} size={90} />
            </ExceptionIconWrapper>
            <ConfirmText>Transaction failed</ConfirmText>
            <ConfirmBody>{txFailure?.message}</ConfirmBody>
            <TurquoiseButton
              onClick={() => {
                resetState(onConfirm);
              }}
            >
              Close
            </TurquoiseButton>
          </ResultWrapper>
        )}
        {(txHash || txDetails?.hash) && (
          <TransactionLink
            rel="noopener noreferrer"
            href={`https://etherscan.io/tx/${txHash ? txHash : txDetails.hash}/`}
            target="blank"
          >
            View transaction
            <Icon color="var(--turquoise-01)" name={IconName.external} size={20} />
          </TransactionLink>
        )}
      </ContentWrapper>
    );
  };

  return (
    <TxLoaderWrapper>
      {inModal && (
        <BaseModal width={isMobile ? '100%' : '500px'} isOpen={modalOpen} toggleModal={() => setModalOpen(!modalOpen)}>
          {renderContent()}
        </BaseModal>
      )}
      {!inModal && renderContent()}
    </TxLoaderWrapper>
  );
};

const ConfirmBody = styled.p`
  text-align: center;
  padding-bottom: 20px;
  width: 70% !important;
`;

const ExceptionIconWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px 0;
`;

const TxLoaderWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  color: white;
`;

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  min-height: 650px;
  min-width: 460px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-width: 0;
  }
`;

const ConfirmText = styled.p`
  margin: 10px 0 20px;
  font-size: 24px;
  font-family: cera-medium;
  color: white;
  text-align: center;
`;

const ResultWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;

  p {
    width: 100%;
  }

  overflow-x: hidden;
`;

const TransactionLink = styled.a`
  display: inline-flex;
  width: 100%;
  margin-top: 30px;
  justify-content: center;
  flex-flow: row nowrap;
  color: var(--turquoise-01);
  font-size: 16px;

  svg {
    margin-left: 3px;
  }
`;

export default React.memo(TxLoader);
