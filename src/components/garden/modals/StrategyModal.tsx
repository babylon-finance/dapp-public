import {
  StrategyDetails,
  FullGardenDetails,
  Identity,
  IconName,
  Token,
  ExistingVotes,
  KeeperError,
  KeeperCodes,
  StrategyOperation,
  GardenMetricResponse,
  getExecutionEndsBy,
} from 'models';
import { BaseModal, PurpleButton, BaseLoader, ProtocolIcon, Member, Icon, ReserveNumber } from 'components/shared';
import { StrategyAdmin } from '../strategies/admin/';
import { OperationDisplay } from '../strategies/creation/StrategyOperations/';
import StrategyStateWidget from '../strategies/StrategyStateWidget';
import { GardenDetailChart } from 'components/garden/detail/components/';
import { BREAKPOINTS } from 'config';
import { useW3Context } from 'context/W3Provider';
import { countVotes } from 'components/garden/strategies/CountVotes';
import { IdentityService, TokenListService } from 'services';
import { wrapAwait } from 'utils/AwaitWrapper';
import { commify, formatEther } from '@ethersproject/units';
import { formatGardenTokensDisplay } from 'helpers/Numbers';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { displayDurationString } from 'helpers/Date';

// import { Mixpanel } from 'Mixpanel';

interface StrategyModalProps {
  strategy: StrategyDetails;
  gardenDetails: FullGardenDetails;
  metricData?: GardenMetricResponse;
  votes?: ExistingVotes;
}

interface ContainerValueProps {
  label: string;
  children: React.ReactNode;
}

const ContainerElement = ({ label, children }: ContainerValueProps) => {
  return (
    <ContainerElementWrapper>
      <ContainerValue>{children}</ContainerValue>
      <ContainerLabel>{label}</ContainerLabel>
    </ContainerElementWrapper>
  );
};

function StrategyModal({ strategy, gardenDetails, metricData, votes }: StrategyModalProps) {
  const { address, blockTimestamp } = useW3Context();

  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);

  const identityService = IdentityService.getInstance();
  const tokenListService = TokenListService.getInstance();

  const toggleModal = (): void => {
    setShowModal(!showModal);
  };

  const fetchIdentity = async () => {
    const identityResponse = await wrapAwait(
      identityService.getIdentities([strategy.strategist]),
      undefined,
      'Error fetching identities',
    );
    const maybeIdentity = identityResponse.usersByAddress[strategy.strategist.toLowerCase()];
    setIdentity(maybeIdentity);
  };

  const fetchStrategyData = async () => {
    setLoading(true);
    await fetchIdentity();
    setLoading(false);
  };

  useEffect(() => {
    if (showModal && loading) {
      fetchStrategyData();
    }
  }, [showModal]);

  const isStrategist = !!address && address.toLowerCase() === strategy.strategist.toLowerCase();

  const quorum =
    parseFloat(formatEther(gardenDetails.minVotesQuorum)) * parseFloat(formatEther(gardenDetails.totalTokenSupply));
  const { existingDownvotes, existingUpvotes, uniqueVoters } = countVotes(
    strategy,
    votes as ExistingVotes,
    address,
    gardenDetails.minVoters.toNumber(),
    quorum,
    undefined,
  );
  const netVotes = Math.floor(existingUpvotes - existingDownvotes);
  let votesValue = BigNumber.from(0);
  try {
    votesValue = BigNumber.from(netVotes)
      .mul(10 ** 9)
      .mul(10 ** 9);
  } catch {}

  const reserveAsset = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
  let errorDetails: KeeperError | undefined = undefined;
  const maybeError = strategy.keeperStatus?.error;
  if (maybeError && maybeError.code) {
    errorDetails = KeeperCodes[maybeError.code] || KeeperCodes.unknown_error;
  }
  const now = blockTimestamp ? blockTimestamp * 1000 : Date.now();
  const currentMoment = moment(now);
  const endsBy = getExecutionEndsBy(currentMoment, strategy);

  return (
    <StrategyModalWrapper>
      <StyledButton className={'verified-hover-button'} onClick={toggleModal}>
        View Details
      </StyledButton>
      <BaseModal width={'1240px'} isOpen={showModal} toggleModal={toggleModal}>
        <ModalCard>
          {loading && (
            <LoaderWrapper>
              <BaseLoader size={60} text={'Loading strategy data...'} />
            </LoaderWrapper>
          )}
          {!loading && (
            <>
              <StrategyHeader>
                <StrategyHeaderBlock>
                  <StrategyHeaderRow>
                    <StrategyName>{strategy.name}</StrategyName>
                    <StrategyLinks>
                      <a
                        rel="noopener noreferrer"
                        href={`https://etherscan.io/address/${strategy.address}`}
                        target="blank"
                      >
                        <ProtocolIcon size={24} name={'etherscan'} />
                      </a>
                      <a
                        rel="noopener noreferrer"
                        href={`https://zapper.fi/account/${strategy.address}`}
                        target="blank"
                      >
                        <ProtocolIcon size={24} name={'zapper'} />
                      </a>
                      <a rel="noopener noreferrer" href={`https://app.zerion.io/${strategy.address}`} target="blank">
                        <ProtocolIcon size={24} name={'zerion'} />
                      </a>
                    </StrategyLinks>
                  </StrategyHeaderRow>
                  <StrategyHeaderRow>
                    <Member
                      size={7}
                      address={strategy.strategist}
                      you={isStrategist}
                      displayName={identity?.displayName}
                      avatarUrl={identity?.avatarUrl}
                      link
                      showText
                    />
                    <Duration>
                      {strategy.exitedAt > 0 && (
                        <span>Total Duration: {(strategy.duration / 86400).toFixed(0)} days.</span>
                      )}
                      {strategy.exitedAt === 0 && (
                        <span>
                          Ends in{' '}
                          {displayDurationString(endsBy, strategy.exitedAt > 0 ? 'Finalized' : 'Finalizing soon')}
                        </span>
                      )}
                    </Duration>
                  </StrategyHeaderRow>
                </StrategyHeaderBlock>
                <StrategyHeaderBlock>
                  <TargetValue>
                    {(parseFloat(formatEther(strategy.expectedReturn)) * 100).toFixed(2)} {'%'}{' '}
                  </TargetValue>
                  <TargetLabel>Target ROI</TargetLabel>
                </StrategyHeaderBlock>
                <StrategyHeaderBlock>
                  <StyledStrategyState status={strategy.status} keeperError={errorDetails} includeFinalize />
                </StrategyHeaderBlock>
                <StyledStrategyAdmin strategy={strategy} gardenDetails={gardenDetails} refetch={() => {}} />
              </StrategyHeader>
              <ChartWrapper>
                <GardenDetailChart
                  gardenDetails={gardenDetails}
                  reserveAddress={gardenDetails.reserveAsset}
                  height={300}
                  strategy={strategy}
                  metricData={metricData}
                />
              </ChartWrapper>
              <StatsRow>
                <CapitalAllocationContainer>
                  <ContainerTitle>
                    <Icon name={IconName.coinStack} size={24} />
                    Capital Allocation
                  </ContainerTitle>
                  <ContainerValues>
                    <ContainerElement label="Capital Allocated">
                      <ReserveNumber
                        value={strategy.exitedAt > 0 ? strategy.capitalReturned : strategy.capitalAllocated}
                        address={reserveAsset.address}
                      />
                    </ContainerElement>
                    <ContainerElement label="Max Allocation">
                      <ReserveNumber value={strategy.maxCapitalRequested} address={reserveAsset.address} />
                    </ContainerElement>
                    <ContainerElement label="Max % Allocation">
                      {formatEther(strategy.maxPercentAllocation.mul(BigNumber.from(100)))}%
                    </ContainerElement>
                  </ContainerValues>
                </CapitalAllocationContainer>
                <GasContainer>
                  <ContainerTitle>
                    <Icon name={IconName.flame} size={24} />
                    Gas Settings
                  </ContainerTitle>
                  <ContainerValues>
                    <ContainerElement label="Max Fee %">
                      {strategy.maxGasFeePercentage.gt(0)
                        ? formatEther(strategy.maxGasFeePercentage.mul(BigNumber.from(100)))
                        : '1'}
                    </ContainerElement>
                    <ContainerElement label="Slippage %">
                      {strategy.maxSlippagePercentage.gt(0)
                        ? formatEther(strategy.maxSlippagePercentage.mul(BigNumber.from(100)))
                        : '1'}
                    </ContainerElement>
                  </ContainerValues>
                </GasContainer>
                <VotesContainer>
                  <ContainerTitle>
                    <Icon name={IconName.steward} size={24} />
                    Votes
                  </ContainerTitle>
                  <ContainerValues>
                    <ContainerElement label="Votes">
                      {formatGardenTokensDisplay(BigNumber.from(votesValue), gardenDetails.symbol, 0, true, false)}
                    </ContainerElement>
                    <ContainerElement label="Voters">{uniqueVoters}</ContainerElement>
                  </ContainerValues>
                </VotesContainer>
              </StatsRow>
              <OperationsWrapper>
                <h3>Operations</h3>
                {strategy.operations?.map((op: StrategyOperation, index: number) => (
                  <OperationDisplay key={index + 'op' + strategy.address} operation={op} index={index} />
                ))}
              </OperationsWrapper>
            </>
          )}
        </ModalCard>
      </BaseModal>
    </StrategyModalWrapper>
  );
}

const StrategyModalWrapper = styled.div`
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  width: 100%;
  min-height: 500px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const LoaderWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StrategyHeader = styled.div`
  display: flex;
  width: 100%;
  margin-top: 30px;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  height: 80px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--blue-03-alpha);
`;
const StrategyHeaderBlock = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: center;
  width: auto;
  height: 100%;
  padding: 22px 15px;
  border-right: 1px solid var(--blue-03-alpha);

  &:nth-child(3) {
    border-right: none;
  }
`;

const StrategyHeaderRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const StrategyName = styled.div`
  font-size: 28px;
  margin-right: 8px;
  white-space: nowrap;
  width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StrategyLinks = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  a {
    margin-right: 8px;
  }
`;

const TargetValue = styled.div`
  font-size: 28px;
  diplay: flex;
  align-items: center;
  justify-content: center;
  color: var(--yellow);
  font-weight: 700;
`;
const TargetLabel = styled.div`
  font-size: 15px;
  diplay: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-03);
  margin-top: 4px;
`;

const Duration = styled.div`
  margin-left: 10px;
  border-left: 1px solid var(--blue-03-alpha);
  padding-left: 10px;
`;

const StyledStrategyAdmin = styled(StrategyAdmin)`
  align-self: flex-end;
`;
const StyledStrategyState = styled(StrategyStateWidget)`
  background: transparent;
`;

const StatsRow = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-flow: row nowrap;
`;

const CapitalAllocationContainer = styled.div`
  width: 670px;
  height: 156px;
  background: var(--purple-07);
  padding: 24px 32px 32px 32px;
  margin-right: 24px;
`;
const GasContainer = styled.div`
  width: 280px;
  height: 156px;
  background: var(--blue-09);
  padding: 24px 32px 32px 32px;
  margin-right: 24px;
`;
const VotesContainer = styled.div`
  width: 204px;
  height: 156px;
  background: var(--blue-09);
  padding: 24px 32px 32px 32px;
`;

const ContainerTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;

  > div {
    margin-right: 8px;
  }
`;
const ContainerValues = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;
const ContainerElementWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--blue-03-alpha);
  padding: 0 16px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: none;
  }
`;
const ContainerValue = styled.div`
  font-size: 28px;
  font-weight: 700;
`;
const ContainerLabel = styled.div`
  font-size: 15px;
  color: var(--blue-03);
  margin-top: 4px;
`;

const OperationsWrapper = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-flow: column nowrap;

  h3 {
    font-size: 18px;
    font-weight: 700;
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 340px;
  margin-top: 20px;
`;

const StyledButton = styled(PurpleButton)`
  display: block;
  height: 32px;
  cursor: pointer;
  margin-right: 15px;
`;

export default React.memo(StrategyModal);
