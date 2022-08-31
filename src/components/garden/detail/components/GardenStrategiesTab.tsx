import { TabbedNavigation } from 'components/shared/';
import { StrategiesList, RenderType } from 'components/garden/strategies';
import { SubmitStrategyTab } from 'components/garden/strategies/creation/SubmitStrategyTab';

import { BREAKPOINTS } from 'config';
import { STRATEGY_TABS } from '../tabs';
import {
  GardenStrategies,
  Tab,
  FullGardenDetails,
  ExistingVotes,
  GardenMetricResponse,
  GardenPermission,
} from 'models';
import { formatEtherDecimal } from 'helpers/Numbers';

import { BigNumber } from '@ethersproject/bignumber';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React, { useState } from 'react';

interface GardenStrategiesTabProps {
  strategies: GardenStrategies | undefined;
  gardenDetails: FullGardenDetails;
  existingVotes: ExistingVotes | undefined;
  subgraphClients: any;
  userPermissions: GardenPermission | undefined;
  metricData?: GardenMetricResponse;
  isHeart?: boolean;
  hideTitle?: boolean;
  fetchData: () => void;
}

const GardenStrategiesTab = ({
  strategies,
  gardenDetails,
  existingVotes,
  userPermissions,
  metricData,
  hideTitle,
  isHeart,
  subgraphClients,
  fetchData,
}: GardenStrategiesTabProps) => {
  const STRATEGY_TABS_WITH_COUNTS = Object.entries(STRATEGY_TABS)
    .map((entry) => entry[1])
    .map((tab) => {
      const maybeResults = strategies && strategies[tab.value];
      return { ...tab, metric: maybeResults?.length || undefined };
    })
    .filter((tab) => tab.value === Tab.SUBMIT_STRATEGY || tab.metric > 0 || tab.value === Tab.ACTIVE);

  const hasProposals = STRATEGY_TABS_WITH_COUNTS.find((tab) => tab.value === Tab.CANDIDATE)?.metric || 0;
  const [strategyTab, setStrategyTab] = useState<string>(hasProposals && !isMobile ? Tab.CANDIDATE : Tab.ACTIVE);

  const userTokenBalance = gardenDetails?.contribution?.tokens || BigNumber.from(0);
  // Garden Tokens will always be 10**18 decimals, so formatEtherDecimal is fine here
  const availableTokens = Math.max(
    0,
    formatEtherDecimal(gardenDetails?.contribution?.availableTokens || BigNumber.from(0)),
  );

  const strategyTabs = (() => {
    if (!userPermissions?.strategist && !isMobile) {
      return STRATEGY_TABS_WITH_COUNTS.filter((tab) => tab.value !== Tab.SUBMIT_STRATEGY);
    }

    if (isMobile) {
      return STRATEGY_TABS_WITH_COUNTS.filter((tab) => tab.value === Tab.ACTIVE);
    }

    return STRATEGY_TABS_WITH_COUNTS;
  })();

  return (
    <GardenStrategiesTabContainer>
      {!hideTitle && <BlockContentHeaderLabel>Positions</BlockContentHeaderLabel>}
      {strategies && gardenDetails && userTokenBalance && (
        <>
          <TabbedNavigation
            width={isMobile ? '25%' : undefined}
            currentTab={strategyTab}
            tabs={strategyTabs}
            setActiveTab={(tab) => setStrategyTab(tab)}
          />
          {strategyTab === Tab.SUBMIT_STRATEGY && userPermissions?.strategist && (
            <SubmitStrategyTab
              refetch={() => {
                fetchData();
                setStrategyTab(Tab.SUBMIT_STRATEGY);
              }}
              subgraphClients={subgraphClients}
              gardenDetails={gardenDetails}
              userTokenBalanceAvailable={availableTokens}
            />
          )}
          {strategies && strategyTab !== Tab.SUBMIT_STRATEGY && (
            <StrategiesListWrapper>
              <StrategiesList
                metricData={metricData}
                isHeart
                gardenDetails={gardenDetails}
                renderType={RenderType[strategyTab]}
                strategies={strategies[strategyTab]}
                votes={existingVotes}
                refetch={() => fetchData()}
                voteAction={userPermissions?.steward || userPermissions?.strategist || false}
              />
            </StrategiesListWrapper>
          )}
        </>
      )}
    </GardenStrategiesTabContainer>
  );
};

const GardenStrategiesTabContainer = styled.div`
  display: flex;
  background-color: var(--blue-alt);
  flex-flow: column nowrap;
  margin-bottom: 60px;
  padding: 40px;
  min-height: 300px;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: 30px;
    padding: 20px;
    min-height: auto;
  }
`;

const BlockContentHeaderLabel = styled.span`
  font-family: cera-bold;
  font-size: 18px;
  text-align: left;
  margin-bottom: 40px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: 20px;
  }
`;

const StrategiesListWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-top: 10px;
  width: 100%;
`;

export default React.memo(GardenStrategiesTab);
