import { BaseModal, BaseLoader, Icon, ReserveNumber, PurpleButton, TurquoiseButton } from 'components/shared';

import addresses from 'constants/addresses';
import { getAddressByName } from 'hooks/ContractLoader';
import { buildGovernanceVoteMessage } from 'utils/SignatureTransaction';
import { submitGovernanceVote, getGovernanceVotesForProposal } from 'services/VotingService';
import { HeartDetails, GovernanceProposal, IconName } from 'models';
import { useW3Context } from 'context/W3Provider';

import { BREAKPOINTS } from 'config';
import { joinSignature } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const TALLY_BABYLON_LINK = 'https://www.withtally.com/governance/eip155:1:0xBEC3de5b14902C660Bd2C7EfD2F259998424cc24/';

interface GovernanceProposalsProps {
  heartDetails: HeartDetails;
  votingWeight: BigNumber;
}

const GovernanceProposals = ({ heartDetails, votingWeight }: GovernanceProposalsProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [proposal, setProposal] = useState<BigNumber | undefined>(undefined);
  const [proposalVotes, setProposalVotes] = useState<undefined | any>(undefined);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);
  const minVotesQuorum = 40000;

  const notificationObject = {
    eventCode: 'submitGovernanceVote',
    type: 'pending',
    message: 'Waiting for wallet confirmation...',
  };

  const { address, txProvider, notify } = useW3Context();

  const fetchData = async () => {
    try {
      setLoading(true);
      const votes = {};
      // Then we grab all the details
      const promises = heartDetails.proposals
        .filter((p: GovernanceProposal) => p.state.toNumber() === 1)
        .map(async (proposal: GovernanceProposal) => {
          votes[proposal.id.toString()] = await getGovernanceVotesForProposal(proposal.id.toString(), undefined);
        });
      await Promise.all(promises);
      setProposalVotes(votes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasUserVoted = (proposalId: string) => {
    if (!proposalVotes) {
      return false;
    }
    const proposalVotesB = proposalVotes[proposalId];
    return (
      proposalVotesB && address && proposalVotesB.find((v: any) => v.address.toLowerCase() === address.toLowerCase())
    );
  };

  const totalVotes = (proposal: GovernanceProposal) => {
    if (!proposalVotes) {
      return BigNumber.from(0);
    }
    const proposalVotesB = proposalVotes[proposal.id.toString()];
    if (proposal.state.toNumber() !== 1) {
      return proposal.netVotes;
    }
    let total: BigNumber = BigNumber.from(0);
    if (proposalVotesB) {
      proposalVotesB.forEach((v: any) => {
        total = total.add(BigNumber.from(v.amount));
      });
    }
    return proposal.netVotes.add(total);
  };

  const onFinish = () => {
    setShowModal(false);
    setConfirmSignatureWaiting(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, [address, showModal]);

  const getColorAndNameByState = (state: BigNumber) => {
    switch (state.toNumber()) {
      case 0:
        return { icon: IconName.pending, color: 'var(--purple-02)', name: 'Pending' };
      case 1:
        return { icon: IconName.pending, color: 'var(--purple-02)', name: 'Active' };
      case 2:
        return { icon: IconName.failure, color: 'var(--red)', name: 'Canceled' };
      case 3:
        return { icon: IconName.failure, color: 'var(--red)', name: 'Rejected' };
      case 4:
        return { icon: IconName.check, color: 'var(--positive)', name: 'Succeeded' };
      case 5:
        return { icon: IconName.schedule, color: 'var(--yellow)', name: 'Queued' };
      case 6:
        return { icon: IconName.failure, color: 'var(--red)', name: 'Expired' };
      case 7:
        return { icon: IconName.check, color: 'var(--positive)', name: 'Executed' };
      default:
        return { icon: IconName.pending, color: 'var(--purple-02)', name: 'Unknown' };
    }
  };

  const handleSubmitVote = async (voteFor: boolean) => {
    if (address && txProvider && voteFor !== undefined && proposal) {
      const { update } = notify.notification(notificationObject);
      const signer = txProvider.getSigner();

      setConfirmSignatureWaiting(true);
      let payload = buildGovernanceVoteMessage(
        address,
        getAddressByName('HeartProxy'),
        proposal,
        votingWeight,
        voteFor,
      );
      try {
        const signature = joinSignature(await signer.signMessage(payload.message));
        try {
          await submitGovernanceVote({ payload, signature });
          update({
            eventCode: 'submitGovernanceVoteSuccess',
            type: 'success',
            message: 'Your vote has been submitted!',
          });
          fetchData();
        } catch (err) {
          update({
            eventCode: 'submitGovernanceVoteFailure',
            type: 'error',
            message: 'Failed to submit your garden vote! Please try again later.',
          });
        }
      } catch (error) {
        console.error('Failed to submit governance vote', error);
      } finally {
        onFinish();
      }
    }
  };

  return (
    <GovernanceProposalsContainer>
      {heartDetails.proposals.map((proposal: GovernanceProposal) => (
        <ProposalContainer key={proposal.name}>
          <ProposalType color={getColorAndNameByState(proposal.state).color} />
          {!isMobile && <ProposalId>{proposal.displayId}</ProposalId>}
          <ProposalName>{isMobile ? `BIP-${proposal.displayId}` : proposal.name}</ProposalName>
          {!isMobile && (
            <>
              <ProposalDate>
                <ReserveNumber value={totalVotes(proposal)} address={addresses.tokens.BABL} hideSymbol precision={0} />
              </ProposalDate>
              <ProposalVotes>
                <ProposalFill
                  fill={Math.min(100, totalVotes(proposal).div(1e9).div(1e9).mul(100).div(minVotesQuorum).toNumber())}
                  color={getColorAndNameByState(proposal.state).color}
                />
              </ProposalVotes>
            </>
          )}
          <ProposalStatus color={getColorAndNameByState(proposal.state).color}>
            <Icon
              color={getColorAndNameByState(proposal.state).color}
              name={getColorAndNameByState(proposal.state).icon}
              size={16}
            />
            {getColorAndNameByState(proposal.state).name}
          </ProposalStatus>
          <ProposalActions>
            {loading && <BaseLoader size={20} />}
            {!loading && proposalVotes && hasUserVoted(proposal.id.toString()) && (
              <VotedDiv>
                <Icon name={IconName.check} size={16} color={'#white'} /> Voted
              </VotedDiv>
            )}
            {!loading && proposalVotes && !hasUserVoted(proposal.id.toString()) && (
              <div>
                {proposal.state.toNumber() === 1 && (
                  <VoteButton
                    onClick={() => {
                      setShowModal(true);
                      setProposal(proposal.id);
                    }}
                    disabled={!heartDetails.gardenDetails.contribution}
                  >
                    {!heartDetails.gardenDetails.contribution ? 'Stake to Vote' : 'Vote'}
                  </VoteButton>
                )}
              </div>
            )}
            <a rel="noopener noreferrer" href={`${TALLY_BABYLON_LINK}proposal/${proposal.id}`} target="blank">
              <Icon color="white" name={IconName.external} size={isMobile ? 18 : 24} />
            </a>
          </ProposalActions>
        </ProposalContainer>
      ))}
      <BaseModal width={isMobile ? '100%' : ''} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
        <ModalCard>
          <ModalHeadingRow>Do you vote for or against?</ModalHeadingRow>
          <ModalContentWrapper>
            <StyledLink
              to={{
                pathname: 'https://docs.babylon.finance/babl/governance',
              }}
              target="_blank"
            >
              Learn more about governance
            </StyledLink>
            <StyledButtonRowWrapper>
              <StyledTurquoiseButton disabled={confirmSignatureWaiting} onClick={() => handleSubmitVote(true)}>
                {confirmSignatureWaiting && 'Submitting vote...'}
                {!confirmSignatureWaiting && (
                  <>
                    <Icon name={IconName.check} size={20} color={'#0f0a45'} />
                    <div>For</div>
                  </>
                )}
              </StyledTurquoiseButton>
            </StyledButtonRowWrapper>
            <StyledButtonRowWrapper>
              <StyledTurquoiseButton
                inverted
                disabled={confirmSignatureWaiting}
                onClick={() => handleSubmitVote(false)}
              >
                {confirmSignatureWaiting && 'Submitting vote...'}
                {!confirmSignatureWaiting && (
                  <>
                    <Icon name={IconName.cancel} size={20} color={'#00c7ba'} />
                    <div>Against</div>
                  </>
                )}
              </StyledTurquoiseButton>
            </StyledButtonRowWrapper>
          </ModalContentWrapper>
        </ModalCard>
      </BaseModal>
    </GovernanceProposalsContainer>
  );
};

const GovernanceProposalsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1224px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    max-width: 330px;
  }
`;

const ProposalContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: 64px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: var(--blue-07);
`;

const ProposalType = styled.div<{ color: string }>`
  width: 8px;
  background-color: ${(p) => p.color};
  height: 100%;
`;

const ProposalId = styled.div`
  font-weight: 700;
  font-size: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
  width: 30px;
`;

const ProposalName = styled.div`
  font-weight: 400;
  font-size: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 500px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 70px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipses;
    padding-left: 6px;
  }
`;

const ProposalDate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  font-size: 13px;
  color: var(--blue-03);
  margin: 0 8px;
`;

const ProposalVotes = styled.div`
  width: 212px;
  height: 6px;
  background-color: var(--blue-06);
`;

const ProposalFill = styled.div<{ fill: number; color: string }>`
  width: ${(p) => p.fill}%;
  background-color: ${(p) => p.color};
  height: 6px;
`;

const ProposalStatus = styled.div<{ color: string }>`
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  align-items: center;
  justify-content: flex-start;
  color: ${(p) => p.color};
  font-weight: 700;
  font-size: 14px;
  width: 80px;
  margin-left: 8px;

  > div:first-child {
    margin-right: 4px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 90px;
  }
`;

const ProposalActions = styled.div`
  margin-left: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;

  a:hover {
    svg path {
      fill: var(--purple);
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100px;
  }
`;

const VoteButton = styled(PurpleButton)`
  height: 24px;
  width: 70px;
  font-size: 13px;
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

const VotedDiv = styled.div`
  display: flex;
  color: white;
  width: 100px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--purple-02);
  > div:first-child {
    margin-right: 3px;
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

const StyledTurquoiseButton = styled(TurquoiseButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  div:first-child {
    margin-right: 5px;
  }

  div:last-child {
    width: 80px;
    text-align: left;
  }
`;

export default React.memo(GovernanceProposals);
