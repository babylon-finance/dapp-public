import { PurpleButton, Member, Icon, GardenTokenIcon, HoverTooltip } from 'components/shared';
import { OperationDisplay } from './creation/StrategyOperations/';
import { VoteButtons, DisplayVote } from 'components/garden/strategies/vote/';
import StrategyStateWidget from './StrategyStateWidget';
import {
  ExistingVotes,
  FullGardenDetails,
  IconName,
  Identity,
  KeeperCodes,
  KeeperError,
  StrategyDetails,
  StrategyOperation,
  Token,
  getCooldownEndsBy,
  getVoteEndsBy,
} from 'models';
import { StrategyAdmin } from './admin/';
import { displayDurationString } from 'helpers/Date';
import { formatEtherDecimal, formatReserveDisplay, formatTokenDisplay } from 'helpers/Numbers';
import { countVotes } from './CountVotes';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { TokenListService, ViewerService, IdentityService } from 'services';
import { wrapAwait } from 'utils/AwaitWrapper';

import { useW3Context } from 'context/W3Provider';
import { commify, formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Strategy } from 'constants/contracts';
import styled from 'styled-components';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

interface ProposalProps {
  className?: string;
  strategy: StrategyDetails;
  votes?: ExistingVotes;
  voteAction?: boolean;
  handleVoteSubmit?: any;
  gardenDetails: FullGardenDetails;
  isHeart?: boolean;
  setTxReady: (value: any) => void;
}

interface DetailElementProps {
  label: string;
  bigger?: boolean;
  children: React.ReactNode;
}

const DetailElement = ({ label, children, bigger }: DetailElementProps) => {
  return (
    <DetailElementWrapper>
      <DetailElementLabel bigger={bigger}>{label}</DetailElementLabel>
      <DetailElementValue bigger={bigger}>{children}</DetailElementValue>
    </DetailElementWrapper>
  );
};

const Proposal = ({
  className,
  strategy,
  votes,
  voteAction,
  handleVoteSubmit,
  gardenDetails,
  setTxReady,
  isHeart,
}: ProposalProps) => {
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [txContract, setTxContract] = useState<Contract | undefined>(undefined);
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [strategistTokens, setStrategistTokens] = useState<BigNumber | undefined>(undefined);

  const { address, txProvider, blockTimestamp } = useW3Context();
  const currentMoment = moment(blockTimestamp ? blockTimestamp * 1000 : Date.now());
  const tokenListService = TokenListService.getInstance();
  const identityService = IdentityService.getInstance();
  const viewerService = ViewerService.getInstance();
  const reserveAsset = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;

  useEffect(() => {
    const fetchIdentity = async () => {
      const identityResponse = await wrapAwait(
        identityService.getIdentities([strategy.strategist]),
        undefined,
        'Error fetching identities',
      );

      const maybeIdentity = identityResponse.usersByAddress[strategy.strategist.toLowerCase()];
      setIdentity(maybeIdentity);
    };

    const setContract = async () => {
      const txContract = (await loadContractFromNameAndAddress(strategy.address, Strategy, txProvider)) as Contract;
      setStrategistTokens(await viewerService.getTokenBalance(gardenDetails.address, strategy.strategist));
      setTxContract(txContract);
    };

    if (initialLoad) {
      setContract();
      fetchIdentity();

      setInitialLoad(false);
    }
  }, [initialLoad]);

  const handleDeleteCandidate = async () => {
    if (txProvider || txContract) {
      setTxReady(txContract?.deleteCandidateStrategy());
    }
  };

  const isStrategist = !!address && address.toLowerCase() === strategy.strategist.toLowerCase();
  const quorum =
    parseFloat(formatEther(gardenDetails.minVotesQuorum)) * parseFloat(formatEther(gardenDetails.totalTokenSupply));
  const { existingDownvotes, existingDownvotesUser, existingUpvotes, existingUpvotesUser, hitQuorum, uniqueVoters } =
    countVotes(strategy, votes as ExistingVotes, address, gardenDetails.minVoters.toNumber(), quorum, strategistTokens);
  const quorumValue = hitQuorum ? (
    <QuorumMet>{commify(existingUpvotes.toFixed(2))}</QuorumMet>
  ) : (
    `${commify(existingUpvotes.toFixed(2))}`
  );
  const cooldownEndsBy = getCooldownEndsBy(currentMoment, strategy, gardenDetails.strategyCooldownPeriod.toNumber());

  const voteEndsBuy = getVoteEndsBy(
    currentMoment,
    strategy,
    gardenDetails.strategyCooldownPeriod.div(60 * 60).toNumber(),
    hitQuorum,
  );

  let errorDetails: KeeperError | undefined = undefined;
  const maybeError = strategy.keeperStatus?.error;

  if (maybeError && maybeError.code) {
    errorDetails = KeeperCodes[maybeError.code] || KeeperCodes.unknown_error;
  }

  return (
    <ProposalContainer className={className} isHeart={isHeart}>
      <ProposalHeader>
        <HeaderNameRow>
          <ProposalDetails>
            <DetailsRow>
              <ProposalName>{strategy.name}</ProposalName>
              {strategy.status && (
                <StrategyStateWidget
                  status={hitQuorum && strategy.status !== 'ready' ? 'cooldown' : strategy.status}
                  keeperError={errorDetails}
                />
              )}
            </DetailsRow>
          </ProposalDetails>
          {!strategy.isReadyWaiting && (
            <ProposalVotes>
              <div>
                <DetailElement
                  bigger
                  label={
                    strategy.enteredCooldownAt > 0
                      ? 'Time to finish cooldown:'
                      : hitQuorum
                      ? 'Quorum met, cooldown in:'
                      : 'Time left to vote:'
                  }
                >
                  {strategy.enteredCooldownAt > 0
                    ? displayDurationString(cooldownEndsBy, 'A few mins')
                    : displayDurationString(voteEndsBuy, 'A few mins')}
                </DetailElement>
              </div>
              {gardenDetails.contribution && voteAction && strategy.enteredCooldownAt === 0 && (
                <StyledVoteButtons
                  existingEndorseUser={existingUpvotesUser}
                  existingOpposeUser={existingDownvotesUser}
                  existingEndorse={existingUpvotes}
                  existingOppose={existingDownvotes}
                  userTokenBalance={formatEtherDecimal(gardenDetails.contribution?.tokens || BigNumber.from(0))}
                  strategy={strategy.address}
                  enteredCooldownAt={strategy.enteredCooldownAt}
                  handleVoteSubmit={handleVoteSubmit}
                />
              )}
              {gardenDetails.contribution && voteAction && strategy.enteredCooldownAt > 0 && (
                <DisplayVote
                  existingEndorseUser={existingUpvotesUser}
                  existingOpposeUser={existingDownvotesUser}
                  userTokenBalance={formatEtherDecimal(gardenDetails.contribution?.tokens || BigNumber.from(0))}
                  strategy={strategy.address}
                />
              )}
            </ProposalVotes>
          )}
          {strategy.isReadyWaiting && maybeError && errorDetails && (
            <ExecutionErrors>
              <ExecutionErrorTitle>
                <Icon name={IconName.stop} size={26} />
                Blocking Execution
              </ExecutionErrorTitle>
              <ExecutionError>
                <Icon name={errorDetails.icon} size={22} />
                <div>
                  <HoverTooltip placement="top" content={errorDetails.text} textOverride={errorDetails.name} />
                  {maybeError.code === 'gas_fee_too_high' && maybeError.data && (
                    <GasBreakdown>
                      <span>Limit: {formatReserveDisplay(BigNumber.from(maybeError.data.feeLimit), reserveAsset)}</span>
                      <span>Required: ~{formatReserveDisplay(BigNumber.from(maybeError.data.fee), reserveAsset)}</span>
                    </GasBreakdown>
                  )}
                </div>
              </ExecutionError>
              <StrategyAdmin strategy={strategy} refetch={() => {}} gardenDetails={gardenDetails} />
            </ExecutionErrors>
          )}
        </HeaderNameRow>
        <ProposalProps>
          <DetailElement label="Created by">
            <Member
              size={7}
              address={strategy.strategist}
              you={isStrategist}
              displayName={identity?.displayName}
              avatarUrl={identity?.avatarUrl}
              link
              showText
            />
          </DetailElement>
          <DetailElement label="Duration">{Math.floor(strategy.duration / 86400)} days</DetailElement>
          <DetailElement label="Target ROI">
            {(parseFloat(formatEther(strategy.expectedReturn)) * 100).toFixed(2)} {'%'}{' '}
          </DetailElement>
          <DetailElement label="Strategist Stake">
            <GardenTokenIcon size={20} />
            {formatTokenDisplay(strategy.stake, 2, true)}
          </DetailElement>
          <DetailElement label="Max Capital">
            {formatReserveDisplay(strategy.maxCapitalRequested, reserveAsset)}
          </DetailElement>
          <DetailElement label="Max Allocation">
            {formatEther(strategy.maxPercentAllocation.mul(BigNumber.from(100)))}%
          </DetailElement>
          <DetailElement label="Max Gas Fee">
            {strategy.maxGasFeePercentage.gt(0)
              ? formatEther(strategy.maxGasFeePercentage.mul(BigNumber.from(100)))
              : '1'}
            %
          </DetailElement>
          <DetailElement label="Max Slippage">
            {strategy.maxSlippagePercentage.gt(0)
              ? formatEther(strategy.maxSlippagePercentage.mul(BigNumber.from(100)))
              : '1'}
            %
          </DetailElement>
        </ProposalProps>
      </ProposalHeader>
      <ProposalBody>
        <OperationsWrapper>
          {strategy.operations?.map((op: StrategyOperation, index: number) => (
            <OperationDisplay key={index + 'op' + strategy.address} operation={op} index={index} />
          ))}
        </OperationsWrapper>
        <VoteDetails>
          <VoteSection>
            <VoteDetailsSubtitle>Votes</VoteDetailsSubtitle>
            <VoteSectionBody>
              <VoteElementWrapper>
                <VoteElementLabel>Current</VoteElementLabel>
                <VoteElementValue>{quorumValue}</VoteElementValue>
              </VoteElementWrapper>
              <VoteElementWrapper>
                <VoteElementLabel>Quorum</VoteElementLabel>
                <VoteElementValue>{commify(quorum.toFixed(2))}</VoteElementValue>
              </VoteElementWrapper>
            </VoteSectionBody>
          </VoteSection>
          <VoteSection>
            <VoteDetailsSubtitle>Voters</VoteDetailsSubtitle>
            <VoteSectionBody>
              <Icon name={IconName.steward} size={28} />
              <div style={{ marginLeft: '8px' }}>
                {uniqueVoters} / {gardenDetails.minVoters.toNumber()}
              </div>
            </VoteSectionBody>
          </VoteSection>
          {isStrategist && <PurpleButton onClick={() => handleDeleteCandidate()}>Delete</PurpleButton>}
        </VoteDetails>
      </ProposalBody>
    </ProposalContainer>
  );
};

const GasBreakdown = styled.div`
  color: var(--purple-aux);
  font-size: 14px;
  display: flex;
  flex-flow: column nowrap;
`;

const ProposalProps = styled.div`
  padding-top: 30px;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const ProposalContainer = styled.div<{ isHeart?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;
  background: ${(p) => (!p.isHeart ? 'var(--blue)' : 'transparent')};
  padding: 20px 0;
  margin-bottom: 32px;
`;

const ProposalHeader = styled.div`
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-blue);
  width: 100%;
`;

const HeaderNameRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
`;

const ProposalDetails = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ProposalVotes = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ProposalName = styled.div`
  font-size: 24px;
  line-height: 32px;
  font-weight: normal;
  color: white;
  max-width: 300px;
`;

const ExecutionErrors = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const ExecutionErrorTitle = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 18px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  font-weight: bold;
  border-bottom: 1px solid var(--border-blue);

  > div:first-child {
    margin-right: 5px;
  }
`;

const ExecutionError = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  padding: 2px 0;

  > div:first-child {
    margin-right: 5px;
    margin-top: 4px;
  }
`;

const DetailsRow = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
`;

const DetailElementWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0 12px;
  border-right: 1px solid var(--blue-03);
  font-size: 15px;
  line-height: 20px;
  height: auto;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: none;
  }
`;

const DetailElementLabel = styled.div<{ bigger?: boolean }>`
  color: var(--purple-02);
  max-width: ${(p) => (p.bigger ? '120px' : 'auto')};
`;

const DetailElementValue = styled.div<{ bigger?: boolean }>`
  color: white;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: ${(p) => (p.bigger ? '30px' : '15px')};
  margin-top: ${(p) => (p.bigger ? '8px' : '2px')};
`;

const QuorumMet = styled.span`
  font-family: cera-bold;
  color: var(--positive);
`;

const ProposalBody = styled.div`
  display: flex;
  width: 100%;
  padding-top: 33px;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: space-between;
`;

const OperationsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 720px;
`;

const VoteDetails = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: calc(100% - 780px);
  margin-top: 20px;
`;

const VoteSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 30px;
`;

const VoteSectionBody = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  font-weight: 700;
  color: white;
  font-size: 18px;
`;

const VoteDetailsSubtitle = styled.div`
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: var(--purple-06);
  margin-bottom: 12px;
`;

const VoteElementWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 0 30px;
  border-right: 1px solid var(--blue-03);

  &:first-child {
    padding-left: 0;
  }
  &:last-child {
    border-right: none;
  }
`;

const VoteElementLabel = styled.div`
  font-size: 15px;
  color: var(--blue-03);
`;

const VoteElementValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: white;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const StyledVoteButtons = styled(VoteButtons)`
  margin-top: 10px;
  margin-left: 20px;
`;

export default React.memo(Proposal);
