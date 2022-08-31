import { BaseLoader, Icon } from 'components/shared';
import { BaseModal, TxLoader, TurquoiseButton, GardenTable } from 'components/shared';

import { BREAKPOINTS, IS_MAINNET } from 'config';
import { BabController, BabControllerLocal } from 'constants/contracts';
import { TxType, IconName } from 'models/';
import { formatTokenDisplay } from 'helpers/Numbers';
import { loadContractFromNameAndAddress, getAddressByName } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';

import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Link } from 'react-router-dom';
import { Mixpanel } from 'Mixpanel';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface ReferralModalProps {}

function ReferralModal({}: ReferralModalProps) {
  const { address, txProvider } = useW3Context();

  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [clipboardCopied, setClipboardCopied] = useState(false);
  const [controller, setController] = useState<undefined | Contract>(undefined);
  const [unclaimedRewards, setUnclaimedRewards] = useState<undefined | BigNumber>(undefined);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);

  const toggleModal = (): void => {
    setShowModal(!showModal);
  };

  const fetchReferralData = async () => {
    setLoading(true);
    const controllerWeb3 = (await loadContractFromNameAndAddress(
      getAddressByName('BabControllerProxy'),
      IS_MAINNET ? BabController : BabControllerLocal,
      txProvider,
    )) as Contract;
    if (!controller) {
      setController(controllerWeb3);
    }
    setUnclaimedRewards(await controllerWeb3.affiliateRewards(address));
    setLoading(false);
  };

  const handleReferralClaim = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (txProvider && address && controller) {
      try {
        Mixpanel.track('referral-claim-start', {
          address,
          type: 'tx',
        });
        setTxReady(controller.claimRewards());
      } catch (err) {
        console.log('Error during referral claim submission', err);
      }
    }
  };

  const onFinish = () => {
    setShowModal(false);
    setTxReady(undefined);
  };

  useEffect(() => {
    if (address && txProvider) {
      fetchReferralData();
    }
  }, [showModal]);

  const hasUnclaimed = unclaimedRewards?.gt(0) || false;
  const unclaimedAmount = formatTokenDisplay(
    unclaimedRewards ? unclaimedRewards : BigNumber.from(0),
    2,
    true,
  ).toString();

  const referralLink = `https://babylon.finance${window.location.pathname}?ref=${address}`;
  const referralList = [];

  return (
    <ReferralWrapper>
      <StyledToggleWrapper>
        {hasUnclaimed && <UnclaimedAlert />}
        <StyledToggleButton inverted onClick={toggleModal} alert={hasUnclaimed}>
          Invite
        </StyledToggleButton>
      </StyledToggleWrapper>
      <BaseModal width={isMobile ? '100%' : ''} isOpen={showModal} toggleModal={toggleModal}>
        <ModalCard>
          {loading && (
            <LoaderWrapper>
              <BaseLoader size={60} text={'Loading referral rewards data...'} />
            </LoaderWrapper>
          )}
          {!loading && (
            <>
              {!txReady ? (
                <>
                  <ModalHeadingRow>Referral Program</ModalHeadingRow>
                  <ModalContentWrapper>
                    <Subtitle>Invite friends, get BABL. Split 1 BABL for every $5k deposited.</Subtitle>
                    <InviteSection>
                      <InviteHeader>
                        <IconBubble>
                          <Icon name={IconName.clipboard} color="black" size={16} />
                        </IconBubble>
                        <span>Invite link</span>
                      </InviteHeader>
                      <InviteLink>
                        <LinkSpan>{referralLink}</LinkSpan>
                        <ClipboardLink
                          onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            setClipboardCopied(true);
                          }}
                        >
                          <Icon name={IconName.link} size={16} />
                          <span>{clipboardCopied ? 'Copied!' : 'Copy link'}</span>
                        </ClipboardLink>
                      </InviteLink>
                    </InviteSection>
                    {referralList.length > 0 && (
                      <>
                        <TableWrapper>
                          <GardenTable headers={['Depositor', 'Amount', 'Your Reward']}>
                            <div />
                            <div />
                            <div />
                          </GardenTable>
                        </TableWrapper>
                      </>
                    )}
                    <StyledButtonRowWrapper>
                      <StyledButton disabled={!hasUnclaimed || loading || txReady} onClick={handleReferralClaim}>
                        {hasUnclaimed ? `Claim ${unclaimedAmount} BABL` : '0 BABL rewards. Invite friends to earn BABL'}
                      </StyledButton>
                    </StyledButtonRowWrapper>
                  </ModalContentWrapper>
                </>
              ) : (
                <TxLoader
                  type={TxType.claimRewards}
                  txObject={txReady}
                  onConfirm={() => {
                    onFinish();
                    Mixpanel.track('referral-claim-end', { address });
                  }}
                  waitForConfirmation
                />
              )}
            </>
          )}
        </ModalCard>
      </BaseModal>
    </ReferralWrapper>
  );
}

const LinkSpan = styled.div`
  width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 200px;
  }
`;

const ReferralWrapper = styled.div`
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const LoaderWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(TurquoiseButton)`
  width: 100%;
`;

const StyledToggleWrapper = styled.div`
  margin-right: 26px;
  margin-top: 5px;
`;

const Subtitle = styled.div`
  font-family: cera-regular;
  color: white;
  font-size: 16px;
`;

const UnclaimedAlert = styled.div`
  position: relative;
  z-index: 2;
  margin-left: auto;
  height: 8px;
  width: 8px;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--pink);
`;

const InviteSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin: 40px 0 28px;
`;

const InviteHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  font-size: 16px;
  color: white;
`;

const IconBubble = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  width: 24px;
  height: 24px;
  background: var(--blue-04);
  margin-right: 4px;
`;

const InviteLink = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-radius: 4px;
  height: 32px;
  background: var(--blue-06);
  margin-top: 12px;
  font-size: 13px;
  color: white;
  padding: 8px;
`;

const StyledToggleButton = styled(TurquoiseButton)<{ alert: boolean }>`
  ${(p) => (p.alert ? 'top: -5px; left: -3px;' : '')};
  margin-left: 3px;
  width: 49px;
  min-width: 49px;
  padding: 4px 8px;
  height: 24px;
  font-size: 13px;
`;

const ModalContentWrapper = styled.div``;

const TableWrapper = styled.div`
  margin: 10px 0;
`;

const StyledButtonRowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  height: 50px;
  width: 100%;
  margin-top: auto;
`;

const ModalHeadingRow = styled.div`
  font-size: 24px;
  font-family: cera-bold;
  color: var(--white);
  margin-bottom: 10px;
  width: 100%;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  width: 460px;
  min-height: 295px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const ClipboardLink = styled(Link)`
  width: 80px;
  display: flex;
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }

  span {
    margin-left: 4px;
  }
`;

export default React.memo(ReferralModal);
