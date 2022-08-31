import AllocationBarItem from './AllocationBarItem';
import StrategyRow from './StrategyRow';
import Proposal from './Proposal';
import EmptyTable from 'components/garden/detail/components/EmptyTable';
import { TxLoader, GardenTable, GardenTokenIcon, ReserveNumber } from 'components/shared';
import { OperationDisplay } from './creation/StrategyOperations/';

import { StrategyDetails, GardenMetricResponse, FullGardenDetails, ExistingVotes, StrategyOperation } from 'models/';
import { Garden, IERC20 } from 'constants/contracts';
import { submitVotes } from 'services/VotingService';
import { ViewerService } from 'services';
import { formatTokenDisplay, formatReserveFloat } from 'helpers/Numbers';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';
import { BREAKPOINTS } from 'config';

import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import { joinSignature } from '@ethersproject/bytes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export enum RenderType {
  overview = 'overview',
  active = 'active',
  completed = 'completed',
  candidate = 'candidate',
}

interface StrategiesListProps {
  strategies: StrategyDetails[];
  renderType: RenderType;
  gardenDetails: FullGardenDetails;
  metricData?: GardenMetricResponse;
  votes?: ExistingVotes;
  voteAction?: boolean;
  isHeart?: boolean;
  refetch: () => void;
}

const ACTIVE_HEADERS = ['Name', 'NAV', 'Return', '% Return', '*BABL', 'Ends in', ''];
const ACTIVE_HEADERS_MOBILE = [ACTIVE_HEADERS[0], ACTIVE_HEADERS[1], ACTIVE_HEADERS[3]];
const COMPLETED_HEADERS = ['Name', 'Duration', 'Principal', 'Returns', 'Profit', 'Rewards', 'BABL Rewards', ''];

interface strategyExpandedMap {
  [key: string]: boolean;
}

interface IdleDetails {
  value: BigNumber;
  percent: number;
}

const StrategiesList = ({
  strategies,
  renderType,
  gardenDetails,
  isHeart,
  votes,
  voteAction,
  refetch,
  metricData,
}: StrategiesListProps) => {
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [idleCapital, setIdleCapital] = useState<IdleDetails | undefined>(undefined);
  const [expandedMap, setExpandedMap] = useState<strategyExpandedMap>({});

  const { address, provider, txProvider, notify } = useW3Context();
  const viewerService = ViewerService.getInstance();

  useEffect(() => {
    const fetchIdle = async () => {
      const reserveContract = await loadContractFromNameAndAddress(gardenDetails.reserveAsset, IERC20, provider);
      const gardenContract = await loadContractFromNameAndAddress(gardenDetails.address, Garden, provider);
      if (reserveContract && gardenContract) {
        const reserveBalance = await reserveContract.balanceOf(gardenDetails.address);
        const keeperDebtBN = await gardenContract.keeperDebt();
        const idleBN = reserveBalance.sub(gardenDetails.reserveAssetRewardsSetAside.add(keeperDebtBN));
        const idleFloat = formatReserveFloat(idleBN, gardenDetails.reserveToken);
        const navFloat = formatReserveFloat(gardenDetails.netAssetValue, gardenDetails.reserveToken);
        const percIdle = (idleFloat / navFloat) * 100;
        setIdleCapital({ value: idleBN, percent: percIdle });
      }
    };
    fetchIdle();
  }, []);

  const hasUserRow =
    !!address &&
    strategies.map((r) => r.strategist.toLowerCase()).filter((s) => s === address.toLowerCase()).length > 0;

  const getHeaders = () => {
    switch (renderType) {
      case RenderType.active:
        if (isMobile) {
          return ACTIVE_HEADERS_MOBILE;
        }
        return ACTIVE_HEADERS;
      case RenderType.completed:
        return COMPLETED_HEADERS;
      default:
        return ACTIVE_HEADERS;
    }
  };

  const onSubmit = async (address: string, isOpposed: boolean) => {
    const notificationObject = {
      eventCode: 'submitStake',
      type: 'pending',
      message: 'Waiting for wallet confirmation...',
    };

    // @ts-ignore
    const { update } = notify.notification(notificationObject);
    const voteResult = [
      {
        address: address,
        votes: gardenDetails.contribution?.tokens.toString() || '0',
        isOpposed,
      },
    ];

    const value = {
      strategies: voteResult,
      garden: gardenDetails.address,
    };

    if (txProvider && provider) {
      const signer = txProvider.getSigner();
      const strategyName = (await viewerService.getStrategyDetails(address, gardenDetails, undefined)).name;
      const message = `${isOpposed ? 'Opposing' : 'Endorsing'} the following Strategy with ${formatTokenDisplay(
        gardenDetails.contribution?.tokens || BigNumber.from(0),
      )} votes...\n\n Strategy: \n ${strategyName}\n${address}`;

      const signature = joinSignature(await signer.signMessage(message));

      try {
        await submitVotes({ value, message, signature });
        update({
          eventCode: 'submitStakeSuccess',
          type: 'success',
          message: 'Your vote has been submitted!',
        });
        refetch();
      } catch (err) {
        update({
          eventCode: 'submitStakeFailure',
          type: 'error',
          message: 'Failed to submit your vote! Please try again later.',
        });
      }
    }
  };

  const headers = getHeaders();
  strategies.map((strategy) => (expandedMap[strategy.address] = renderType === RenderType.candidate));

  const userTokenBalance = gardenDetails.contribution?.tokens;
  return (
    <TableWrapper>
      {txReady && provider && (
        <TxLoader
          inModal
          txObject={txReady}
          waitForConfirmation
          onConfirm={() => {
            setTxReady(undefined);
            refetch();
          }}
          onFailure={() => setTxReady(undefined)}
        />
      )}
      {renderType === RenderType.candidate && (
        <Proposals>
          {strategies.length > 0 && !isHeart && (
            <VotingPower>
              <GardenTokenIcon size={78} />
              <VotingPowerDetail>
                <VotingPowerLabel>Voting Power</VotingPowerLabel>
                <VotingPowerValue>
                  {userTokenBalance ? formatTokenDisplay(userTokenBalance, 2, true) : 0}
                </VotingPowerValue>
              </VotingPowerDetail>
            </VotingPower>
          )}
          {strategies.map((strategy, index) => (
            <Proposal
              isHeart
              key={strategy.address + index}
              strategy={strategy}
              setTxReady={setTxReady}
              votes={votes}
              handleVoteSubmit={onSubmit}
              voteAction={voteAction}
              gardenDetails={gardenDetails}
            />
          ))}
          {strategies.length === 0 && (
            <EmptyTable emptyImageKey={'strategies'}>
              <EmptyTableLabel>{'No Strategies to vote on at the moment'}</EmptyTableLabel>
            </EmptyTable>
          )}
        </Proposals>
      )}
      {renderType !== RenderType.candidate && (
        <StyledGardenTable
          emptyLabel={`No ${renderType} strategies to display.`}
          key={`strategies-table-${renderType}`}
          emptyImageKey={`strategies`}
          headers={headers}
        >
          {strategies.map((strategy, index) => (
            <React.Fragment key={'fragment' + index}>
              <StyledStrategyRow
                index={index}
                indexRow={index}
                key={strategy.address + index}
                gardenDetails={gardenDetails}
                renderType={renderType}
                setTxReady={setTxReady}
                votes={votes}
                hasUserRow={hasUserRow}
                strategiesCount={strategies.length}
                expanded={expandedMap[strategy.address]}
                toggleExpanded={() => {
                  expandedMap[strategy.address] = !expandedMap[strategy.address];
                  setExpandedMap({ ...expandedMap });
                }}
                metricData={metricData}
                strategy={strategy}
              />
              {expandedMap[strategy.address] && (
                <ExpandedExtraRow key={strategy.address + 'expanded'} indexRow={index}>
                  <td colSpan={headers.length}>
                    <OperationsWrapper>
                      {strategy.operations?.map((op: StrategyOperation, index: number) => (
                        <OperationDisplay key={index + 'op' + strategy.address} operation={op} index={index} />
                      ))}
                    </OperationsWrapper>
                  </td>
                </ExpandedExtraRow>
              )}
            </React.Fragment>
          ))}
          {idleCapital && renderType === RenderType.active && (
            <IdleRow>
              <td>
                <AllocationBarItem
                  name="idle capital"
                  percent={idleCapital.percent}
                  targetPercent={-1}
                  fillIndex={0}
                  token={gardenDetails.reserveToken}
                />
              </td>
              <td>
                <ReserveNumber value={idleCapital.value} address={gardenDetails.reserveAsset} />
              </td>
              {!isMobile && headers.slice(2).map((i, index) => <td key={`idle-${index}`}> </td>)}
            </IdleRow>
          )}
        </StyledGardenTable>
      )}
    </TableWrapper>
  );
};

const StyledGardenTable = styled(GardenTable)``;

const IdleRow = styled.tr`
  & > td:first-child {
    padding-left: 10px;
  }

  & > td {
    min-width: 135px;

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      background-color: var(--blue-alt);
      font-size: 14px;
    }
  }
  width: 100%;
`;

const Proposals = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 16px 0;
  width: 100%;
`;

const TableWrapper = styled.div`
  padding-top: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 10px;
  }
  overflow: hidden;
`;

const OperationsWrapper = styled.div`
  width: 100%;
  padding: 14px;
`;

const StyledStrategyRow = styled(StrategyRow)<{ indexRow: number }>`
  background-color: ${(p) => (p.indexRow % 2 === 0 ? 'var(--odd-table-row)' : 'transparent')} !important;
`;

const ExpandedExtraRow = styled.tr<{ indexRow: number }>`
  height: auto !important;
  width: 100%;
  border-top: none !important;
  background-color: ${(p) => (p.indexRow % 2 === 0 ? 'var(--odd-table-row)' : 'transparent')} !important;
`;

const EmptyTableLabel = styled.div`
  text-align: center;
  display: inline;
`;

const VotingPower = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  margin: 36px 0;
`;

const VotingPowerDetail = styled.div`
  display: flex;
  flex-flow: column nowrap;
  color: white;
  margin-left: 16px;
`;

const VotingPowerLabel = styled.div`
  font-size: 15px;
  line-height: 20px;
`;

const VotingPowerValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
`;

export default React.memo(StrategiesList);
