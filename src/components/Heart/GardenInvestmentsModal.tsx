import { BaseModal, BaseLoader, TurquoiseButton, GardenTable, GardenPill, PurpleButton } from 'components/shared';

import { BREAKPOINTS } from 'config';
import { CustomGardenDetails, CustomDetails } from 'constants/customDetails';
import { HeartDetails, GardenDetails } from 'models';
import { ViewerService } from 'services';
import { buildHeartDistVoteMessage } from 'utils/SignatureTransaction';
import { getAddressByName } from 'hooks/ContractLoader';
import { getPublicGardens } from 'components/MyGardens/utils/getPublicGardens';
import { getSortedGardens } from 'components/MyGardens/utils/getSortedGardens';
import { submitGardenInvestmentVote, getHeartGardenVotesByUser } from 'services/VotingService';
import { useW3Context } from 'context/W3Provider';

import { BigNumber } from '@ethersproject/bignumber';
import { Link } from 'react-router-dom';
import { Loader } from 'rimble-ui';
import { isMobile } from 'react-device-detect';
import { joinSignature } from '@ethersproject/bytes';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface GardenInvestmentsProps {
  heartDetails: HeartDetails;
  votingWeight: BigNumber;
}

const GardenInvestmentsModal = ({ heartDetails, votingWeight }: GardenInvestmentsProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingGardens, setLoadingGardens] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [gardens, setGardens] = useState<GardenDetails[] | undefined>(undefined);
  const [votedGarden, setVotedGarden] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);

  const { address, quotes, txProvider, notify } = useW3Context();
  const viewerService = ViewerService.getInstance();

  const notificationObject = {
    eventCode: 'submitHeartGardenVote',
    type: 'pending',
    message: 'Waiting for wallet confirmation...',
  };

  const fetchData = async (address: string) => {
    try {
      setLoadingGardens(true);
      let allGardens: GardenDetails[] = await viewerService.getUserGardens(address, false);
      // Gardens the user has not contributed to
      allGardens = getPublicGardens(allGardens, quotes);
      allGardens = getSortedGardens(allGardens, quotes, 'members');
      setGardens(allGardens);
      await getVoted();
      setLoadingGardens(false);
    } catch (err) {
      setGardens([]);
    } finally {
      setLoading(false);
    }
  };

  const getVoted = async () => {
    if (address) {
      try {
        const votes = await getHeartGardenVotesByUser(address);
        if (votes && votes.length > 0) {
          setVotedGarden(votes[0].garden);
          setSelected(votes[0].garden);
        }
      } catch (error) {
        console.log(error);
        return undefined;
      }
    }
  };

  const onFinish = () => {
    setShowModal(false);
    setConfirmSignatureWaiting(false);
  };

  const handleSubmitVote = async (gardenAddress: string) => {
    if (address && txProvider && selected) {
      const { update } = notify.notification(notificationObject);
      const signer = txProvider.getSigner();

      setConfirmSignatureWaiting(true);
      let payload = buildHeartDistVoteMessage(address, getAddressByName('HeartProxy'), gardenAddress, votingWeight);
      try {
        const signature = joinSignature(await signer.signMessage(payload.message));
        try {
          await submitGardenInvestmentVote({ payload, signature });
          update({
            eventCode: 'submitHeartGardenVoteSuccess',
            type: 'success',
            message: 'Your vote has been submitted!',
          });
          fetchData(address);
          setVotedGarden(gardenAddress);
        } catch (err) {
          update({
            eventCode: 'submitHeartGardenVoteFailure',
            type: 'error',
            message: 'Failed to submit your garden vote! Please try again later.',
          });
        }
      } catch (error) {
        console.error('Failed to submit heart vote', error);
        update({
          eventCode: 'submitHeartGardenVoteFailure',
          type: 'error',
          message: 'Failed to submit your garden vote! Please try again later.',
        });
      } finally {
        onFinish();
      }
    }
  };

  useEffect(() => {
    if (address && showModal) {
      fetchData(address);
    } else {
      if (address) {
        getVoted();
      }
      setLoading(false);
    }
  }, [address, showModal]);

  const getIconUrl = (gardenAddress: string): string => {
    const maybeCustom: CustomDetails | undefined = CustomGardenDetails[gardenAddress.toLowerCase()];

    if (maybeCustom?.hasIcon) {
      return `/gardens/${gardenAddress.toLowerCase()}/thumb.png`;
    } else {
      return 'community_logo_pink.svg';
    }
  };

  return (
    <GardenInvestmentsModalContainer>
      {loading && <Loader size={24} />}
      {!loading && (
        <>
          <VoteButton
            onClick={() => setShowModal(!showModal)}
            disabled={loading || !heartDetails.gardenDetails.contribution || !address}
          >
            {!heartDetails.gardenDetails.contribution || !address
              ? 'Stake to Vote'
              : votedGarden
              ? ' Change Vote'
              : 'Vote'}
          </VoteButton>
          <BaseModal width={isMobile ? '100%' : ''} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
            <ModalCard>
              <>
                <ModalHeadingRow>Choose a garden to allocate capital</ModalHeadingRow>
                <ModalContentWrapper>
                  <StyledLink
                    to={{
                      pathname: 'https://docs.babylon.finance/babl/heart#da0a',
                    }}
                    target="_blank"
                  >
                    Learn more about the heart garden allocations
                  </StyledLink>
                  {loadingGardens && <BaseLoader size={60} />}
                  {gardens && gardens?.length > 0 && (
                    <>
                      <TableWrapper>
                        <GardenTable headers={[]}>
                          {gardens.map((garden: GardenDetails) => (
                            <tr key={garden.address}>
                              <td>
                                <ProfileRowItem>
                                  <RowInnerWrapper>
                                    <GardenSmallImage src={getIconUrl(garden.address)} />
                                    <GardenName>{garden.name}</GardenName>
                                    {votedGarden === garden.address && (
                                      <GardenPillWrapper>
                                        <GardenPill text={'Current'} color={'var(--purple-aux)'} />
                                      </GardenPillWrapper>
                                    )}
                                  </RowInnerWrapper>
                                </ProfileRowItem>
                              </td>
                              <td>
                                {votedGarden !== garden.address && (
                                  <StyledRadio
                                    onChange={() => setSelected(garden.address)}
                                    type="radio"
                                    value={garden.address}
                                    checked={garden.address === selected}
                                    selected={garden.address === selected}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </GardenTable>
                      </TableWrapper>
                      <StyledButtonRowWrapper>
                        <TurquoiseButton
                          disabled={selected === undefined || confirmSignatureWaiting || selected === votedGarden}
                          onClick={() => handleSubmitVote(selected as string)}
                        >
                          {confirmSignatureWaiting ? 'Submitting vote...' : 'Vote for Garden'}
                        </TurquoiseButton>
                      </StyledButtonRowWrapper>
                    </>
                  )}
                </ModalContentWrapper>
              </>
            </ModalCard>
          </BaseModal>
        </>
      )}
    </GardenInvestmentsModalContainer>
  );
};

const GardenPillWrapper = styled.div`
  margin-left: 20px;
`;

const GardenInvestmentsModalContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-left: 25px;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
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
  display: flex;
  flex-flow: column nowrap;
  height: auto;
  width: 460px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const StyledLink = styled(Link)`
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;
  padding-bottom: 30px;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const ProfileRowItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  height: 100%;
`;

const StyledButtonRowWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-flow: row nowrap;
  height: 50px;
  justify-content: flex-end;
  width: 100%;

  > button {
    width: 100%;
  }
`;

const RowInnerWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  color: white;
`;

const StyledRadio = styled.input<{ selected: boolean }>`
  appearance: none;
  background-color: transparent;
  margin: 0;
  font: inherit;
  color: var(--purple-aux);
  width: 1.15em;
  height: 1.15em;
  border: 0.13em solid var(--purple-aux);
  border-radius: 50%;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;

  &:hover {
    cursor: ${(p) => (p.selected ? 'initial' : 'pointer')};
  }

  &:before {
    content: '';
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--purple-aux);
  }

  &:checked::before {
    transform: scale(1);
  }
`;

const VoteButton = styled(PurpleButton)`
  height: 24px;
  width: 68px;
  font-size: 13px;

  span {
    font-family: cera-regular !important;
  }
`;
const GardenSmallImage = styled.img`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 0;
  height: 50px;
  width: 50px;
`;

const GardenName = styled.div`
  font-size: 16px;
  color: white;
  margin-left: 10px;
`;
const TableWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 300px;
  overflow: scroll;
`;

export default React.memo(GardenInvestmentsModal);
