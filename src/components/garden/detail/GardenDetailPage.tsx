import GardenProperties from './components/GardenProperties';
import { GardenDetailHeader, GardenDetailChart, MembersTable, GardenStrategiesTab } from './components';
import { GlobalLoader, BaseLoader, TabbedNavigation, Markdown } from 'components/shared/';
import { CustomGardenDetails, CustomDetails } from 'constants/customDetails';
import { BREAKPOINTS } from 'config';
import { MetricsService, getVotesForStrategy, ViewerService } from 'services';
import { getStrategiesByType } from './utils/getStrategiesByType';
import { isGardenCreator } from 'helpers/Addresses';
import { GARDEN_ACTION_TABS, MOBILE_GARDEN_ACTION_TABS } from './tabs';
import { useW3Context } from 'context/W3Provider';
import {
  Contributor,
  ExistingVotes,
  FullGardenDetails,
  GardenMetricResponse,
  GardenPermission,
  GardenStrategies,
  StrategyDetails,
  Tab,
} from 'models';
import { Helmet } from 'react-helmet';

import { isMobile } from 'react-device-detect';
import { BigNumber } from '@ethersproject/bignumber';
import { Box, Flex } from 'rimble-ui';
import { formatEther } from '@ethersproject/units';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

enum Hashes {
  strategy = '#strategies',
  members = '#members',
  overview = '#overview',
}

function GardenDetailPage({ subgraphClients, match }: any) {
  const location = useLocation();
  const getDeepLink = (hash: string, isMobile: boolean) => {
    switch (hash) {
      case Hashes.strategy:
        return Tab.STRATEGIES;
      case Hashes.members:
        return Tab.MEMBERS;
      case Hashes.overview:
        return Tab.PERFORMANCE;
      default:
        if (isMobile) {
          return Tab.GARDEN_PROPERTIES;
        }
        return Tab.PERFORMANCE;
    }
  };

  const [initial, setInitial] = useState<boolean>(true);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingContributors, setLoadingContributors] = useState<boolean>(false);
  const [gardenExists, setGardenExists] = useState<boolean>(true);
  const [existingVotes, setExistingVotes] = useState<ExistingVotes | undefined>(undefined);
  const [gardenDetails, setGardenDetails] = useState<FullGardenDetails | undefined>(undefined);
  const [gardenTab, setGardenTab] = useState<string | undefined>(undefined);
  const [metricData, setMetricData] = useState<GardenMetricResponse | undefined>(undefined);
  const [strategies, setStrategies] = useState<GardenStrategies | undefined>(undefined);
  const [userPermissions, setUserPermissions] = useState<GardenPermission | undefined>(undefined);

  const { address, admin, blockTimestamp, wallet, network } = useW3Context();
  const gardenAddress = match.params.gardenAddress;
  const viewerService = ViewerService.getInstance();
  const defaultTab = getDeepLink(location.hash, isMobile);

  const refreshMetrics = async () => {
    const metricsService = MetricsService.getInstance();
    setMetricData(await metricsService.getMetricsForGarden(gardenAddress));
  };

  const fetchContributors = async (gardenDetails: FullGardenDetails) => {
    setLoadingContributors(true);
    const contributors: Contributor[] = await viewerService.getContributorsForGarden(gardenDetails);
    setContributors(
      contributors.sort((a, b) => {
        // formatEther is fine here since we know BABL decimals will always be 10**18
        return (
          parseFloat(
            formatEther(
              b.claimedBABL
                .add(b.rewards?.totalBabl || BigNumber.from(0))
                .add(b.pendingRewards?.totalBabl || BigNumber.from(0)),
            ),
          ) -
          parseFloat(
            formatEther(
              a.claimedBABL
                .add(a.rewards?.totalBabl || BigNumber.from(0))
                .add(a.pendingRewards?.totalBabl || BigNumber.from(0)),
            ),
          )
        );
      }),
    );
    setLoadingContributors(false);
  };

  const fetchData = async (force?: boolean) => {
    let currentPermissions: GardenPermission | undefined = undefined;

    // Already loading
    if (isLoading && !force) {
      return false;
    }

    setIsLoading(true);

    // Handle garden that does not exist at the given :gardenAddress
    const gardenExists = await viewerService.gardenExists(gardenAddress, address, admin);
    if (!gardenExists) {
      setGardenExists(false);
      setIsLoading(false);
      return;
    }

    // Sets garden details & supply
    const gardenDetails = await viewerService.getGardenDetails(gardenAddress, address, force, true);

    if (address) {
      const isCreator = isGardenCreator(address, gardenDetails.creator);

      currentPermissions = await viewerService.getGardenPermissions(gardenAddress, address, isCreator);
      setUserPermissions(currentPermissions);
    }

    // Set Strategies
    gardenDetails.fullStrategies = await viewerService.getStrategiesForGarden(gardenDetails, force, true);
    setGardenDetails(gardenDetails);

    const strategies = getStrategiesByType(gardenDetails, blockTimestamp || 0, address);
    setStrategies(strategies);

    // Set reserve to usd
    refreshMetrics();
    if (strategies && gardenDetails.fullStrategies?.length > 0) {
      const existingVotes = await getExistingVotes(gardenDetails.fullStrategies);
      setExistingVotes(existingVotes);
    }
    fetchContributors(gardenDetails);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData(true);
  }, [address, wallet, network]);

  useEffect(() => {
    if (blockTimestamp) {
      refreshMetrics();
    }
  }, [blockTimestamp]);

  useEffect(() => {
    if (initial && !isLoading) {
      setGardenTab(getDeepLink(location.hash, isMobile));
      setInitial(false);
    }
  }, [isLoading]);

  const getExistingVotes = async (rows: StrategyDetails[]): Promise<ExistingVotes | undefined> => {
    let votes = {};
    await Promise.all(
      rows.map(async (row) => {
        const results = await getVotesForStrategy(row.address);
        if (results) {
          votes[row.address.toLowerCase()] = results;
        }
      }),
    );

    return votes;
  };

  const customDetails: CustomDetails | undefined = gardenDetails
    ? CustomGardenDetails[gardenDetails?.address.toLowerCase()]
    : undefined;

  return (
    <PageContainer style={{ width: '100%' }}>
      <Helmet>
        <meta property="og:url" content={`https://babylon.finance/${customDetails?.vanityUrl || gardenAddress}`} />
        <meta
          property="og:title"
          content={`Babylon Finance - ${customDetails?.name || gardenDetails?.name || 'DeFi Investment Club'}`}
        />
        <meta
          property="og:description"
          content={customDetails?.shortDescription || 'Share fees, split the profits and earn BABL rewards.'}
        />
        <meta
          property="og:image"
          content={
            customDetails?.customImg
              ? `/gardens/${gardenAddress.toLowerCase()}/img.png`
              : 'http://babylon.finance/garden.png'
          }
        />
        <title>Babylon Finance - {gardenDetails?.name || 'DeFi Investment Club'}</title>
      </Helmet>
      {gardenDetails && !isLoading && metricData && (
        <HeaderWrapper>
          <GardenDetailHeader
            metricData={metricData}
            userPermissions={userPermissions}
            gardenDetails={gardenDetails}
            refetch={() => fetchData(true)}
          />
        </HeaderWrapper>
      )}
      <ContainerLarge>
        {isLoading && <GlobalLoader size={isMobile ? 300 : 400} />}
        {!gardenExists && (
          <NoGardenWrapper>
            <h3>Sorry, we cant' find that Garden!</h3>
          </NoGardenWrapper>
        )}
        {gardenExists && gardenDetails && !isLoading && (
          <>
            <ContentWrapper>
              <GardenStrategiesTab
                metricData={metricData}
                strategies={strategies}
                gardenDetails={gardenDetails}
                existingVotes={existingVotes}
                userPermissions={userPermissions}
                subgraphClients={subgraphClients}
                fetchData={() => fetchData(true)}
              />
            </ContentWrapper>
            <ContentWrapper>
              <TabbedNavigation
                altStyle
                currentTab={defaultTab}
                tabs={Object.entries(isMobile ? MOBILE_GARDEN_ACTION_TABS : GARDEN_ACTION_TABS).map((entry) => {
                  if (entry[1].value === Tab.STRATEGIES) {
                    return { ...entry[1], metric: strategies?.candidate?.length.toString() || '0' };
                  }
                  return entry[1];
                })}
                setActiveTab={setGardenTab}
              />
              {gardenTab === Tab.PERFORMANCE && (
                <BlockContentWrapper>
                  <GardenDetailChart
                    gardenDetails={gardenDetails}
                    reserveAddress={gardenDetails.reserveAsset}
                    height={400}
                    metricData={metricData}
                  />
                </BlockContentWrapper>
              )}
              {gardenTab === Tab.GARDEN_THESIS && gardenDetails.nft && (
                <BlockContentWrapper>
                  <DescriptionWrapper>
                    <Markdown content={gardenDetails.nft?.description || '**No description provided.**'} />
                  </DescriptionWrapper>
                </BlockContentWrapper>
              )}
              {gardenTab === Tab.GARDEN_PROPERTIES && gardenDetails && (
                <BlockContentWrapper>
                  <DescriptionWrapper>
                    <GardenProperties details={gardenDetails} />
                  </DescriptionWrapper>
                </BlockContentWrapper>
              )}
              {!isMobile && gardenTab === Tab.MEMBERS && gardenDetails && (
                <BlockContentWrapper>
                  <BlockContentHeaderLabel>Babylonians in this garden</BlockContentHeaderLabel>
                  {loadingContributors && <BaseLoader size={60} />}
                  {!loadingContributors && <MembersTable gardenDetails={gardenDetails} contributors={contributors} />}
                </BlockContentWrapper>
              )}
            </ContentWrapper>
          </>
        )}
      </ContainerLarge>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-height: 100vh;
  }
`;

const DescriptionWrapper = styled.div``;

const BlockContentWrapper = styled(Flex)`
  background-color: var(--blue-alt);
  flex-flow: column nowrap;
  margin-bottom: 60px;
  padding: 40px;
  min-height: 450px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px;
  }
`;

const NoGardenWrapper = styled(Flex)`
  display: flex;
  height: 80vh;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const ContainerLarge = styled(Box)`
  position: relative;
  margin: 0 auto;
  width: var(--screen-lg-min);
  padding: 0 30px;

  @media only screen and (max-width: 1440px) {
    width: 100%;
    padding: 0 100px;
  }

  @media only screen and (max-width: 1280px) {
    padding: 0 30px;
  }
`;

const ContentWrapper = styled.div`
  animation: fadeInAnimation ease 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;

  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const BlockContentHeaderLabel = styled.span`
  font-family: cera-regular;
  font-size: 18px;
  text-align: left;
  margin-bottom: 40px;
`;

const HeaderWrapper = styled.div`
  margin-bottom: 60px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: 0;
  }
`;

export default GardenDetailPage;
