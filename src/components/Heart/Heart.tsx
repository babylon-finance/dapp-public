import {
  GlobalLoader,
  Icon,
  FiatNumber,
  ReserveNumber,
  DiscordButton,
  TokenDisplay,
  ProtocolIcon,
  TurquoiseButton,
} from 'components/shared';
import { Animation, AnimationName } from 'components/shared';
import { GardenReturn } from 'components/garden/detail/components';
import { HeartStrategies, GardenInvestment } from './';
import BondImage from './svgs/bond.svg';
import addresses from 'constants/addresses';
import { getLockPeriodLabel } from './utils/';
import { BREAKPOINTS, HEART_LOCKING_PERIODS } from 'config';
import { Garden, IERC20, BABLToken } from 'constants/contracts';
import { HeartDetails, Token, GardenWeight, GardenMetricResponse, GardenPermission, IconName, HeartBond } from 'models';
import { ViewerService, TokenListService, MetricsService } from 'services';
import { formatEtherDecimal, calculateUserReturnForDisplay } from 'helpers/Numbers';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';

import { Helmet } from 'react-helmet';
import { isMobile } from 'react-device-detect';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import AnimatedNumber from 'animated-number-react';
import styled from 'styled-components';
import React, { lazy, useState, useEffect } from 'react';

// Code Splitting
const WithdrawModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ WithdrawModal }) => ({
    default: WithdrawModal,
  })),
);
const StakeProphetModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ StakeProphetModal }) => ({
    default: StakeProphetModal,
  })),
);
const Bonds = lazy(() => import(/* webpackChunkName: 'heart' */ './').then(({ Bonds }) => ({ default: Bonds })));
const GovernanceProposals = lazy(() =>
  import(/* webpackChunkName: 'heart' */ './').then(({ GovernanceProposals }) => ({ default: GovernanceProposals })),
);
const GardenInvestmentsModal = lazy(() =>
  import(/* webpackChunkName: 'heart' */ './').then(({ GardenInvestmentsModal }) => ({
    default: GardenInvestmentsModal,
  })),
);

interface WidgetItemProps {
  valueIcon?: boolean;
  labelIcon?: boolean;
  valueHeartIconFull?: boolean;
  valueHeartIconHalf?: boolean;
  value?: BigNumber;
  label: string;
  fiat?: boolean;
  buyLink?: boolean;
  percentage?: boolean;
  convertFrom?: Token;
  reserve?: boolean;
  animatedNumber?: boolean;
  precision?: number;
  alternateValue?: BigNumber;
  sharePrice?: BigNumber;
  type: number;
}
interface WidgetFeeProps {
  feeWeight: BigNumber;
}

const WidgetItem = ({
  valueIcon,
  valueHeartIconFull,
  valueHeartIconHalf,
  labelIcon,
  buyLink,
  convertFrom,
  value,
  label,
  fiat,
  reserve,
  percentage,
  alternateValue,
  sharePrice,
  animatedNumber,
  type,
  precision = 1,
}: WidgetItemProps) => {
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  if (toggleValue) {
    valueHeartIconFull = false;
    valueHeartIconHalf = false;
    valueIcon = true;
    value = alternateValue;
  }
  const renderValue = () => {
    return (
      <>
        {valueIcon && <BablRewardContainer name={IconName.babToken} size={30} />}
        {valueHeartIconFull && <BablRewardContainer name={IconName.heartFull} size={30} />}
        {valueHeartIconHalf && <BablRewardContainer name={IconName.heartHalf} size={30} />}
        {!value && '--'}
        {fiat && value && <StyledFiatNumber value={value} convertFrom={convertFrom} precision={precision} />}
        {reserve && value && (
          <StyledReserveNumber
            value={value}
            address={addresses.tokens.BABL}
            hideSymbol
            precision={precision}
            sharePrice={sharePrice}
          />
        )}
        {animatedNumber && percentage && value && (
          <AnimatedNumber
            value={value.toNumber()}
            duration={1500}
            formatValue={(value: number) => value.toFixed(0) + '%'}
          />
        )}
        {!animatedNumber && percentage && value && formatEtherDecimal(value, 2) + '%'}
        {!fiat && !reserve && !percentage && value && <div>{value.toString()}</div>}
      </>
    );
  };

  return (
    <WidgetThird onClick={() => alternateValue && setToggleValue(!toggleValue)} clickable={!!alternateValue}>
      {type === 0 && <APRItemValue>{renderValue()}</APRItemValue>}
      {type === 1 && <NavValue>{renderValue()}</NavValue>}
      {type === 2 && <FeeWidgetValue>{renderValue()}</FeeWidgetValue>}
      {type > 2 && <WidgetThirdValue>{renderValue()}</WidgetThirdValue>}
      <WidgetThirdLabel stack={isMobile}>
        {labelIcon && <BablRewardContainer name={IconName.babToken} size={20} />}
        {label}
        {buyLink && (
          <WidgetLink
            href="https://app.uniswap.org/#/swap?inputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&outputCurrency=0xf4dc48d260c93ad6a96c5ce563e70ca578987c74"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy
            <Icon name={IconName.link} size={16} />
          </WidgetLink>
        )}
      </WidgetThirdLabel>
    </WidgetThird>
  );
};

const WidgetFeePercentage = ({ feeWeight }: WidgetFeeProps) => {
  return <WidgetFeeWeight>{formatEtherDecimal(feeWeight.mul(100), 0)}%</WidgetFeeWeight>;
};

const Heart = () => {
  const { address, txProvider, quotes, userPrefs, connect } = useW3Context();

  const [loading, setLoading] = useState(true);
  const [bablBalance, setBablBalance] = useState<BigNumber | undefined>(undefined);
  const [hbablBalance, setHBablBalance] = useState<BigNumber | undefined>(undefined);
  const [heartDetails, setHeartDetails] = useState<HeartDetails | undefined>(undefined);
  const [reserveContract, setReserveContract] = useState<Contract | undefined>(undefined);
  const [metricData, setMetricData] = useState<GardenMetricResponse | undefined>(undefined);
  const [gardenContract, setGardenContract] = useState<Contract | undefined>(undefined);

  const defaultPermissions: GardenPermission = { steward: false, member: false, strategist: false };
  const [userPermissions, setUserPermissions] = useState<GardenPermission>(defaultPermissions);

  const viewerService = ViewerService.getInstance();
  const tokenListService = TokenListService.getInstance();

  const babl = tokenListService.getTokenByAddress(addresses.tokens.BABL) as Token;
  const weth = tokenListService.getTokenByAddress(addresses.tokens.WETH) as Token;
  const dai = tokenListService.getTokenByAddress(addresses.tokens.DAI) as Token;
  const bablQuote = quotes ? quotes['BABL'].quote : undefined;

  const currency = userPrefs?.currency || 'USD';

  const refreshMetrics = async (heartDetails: HeartDetails) => {
    const metricsService = MetricsService.getInstance();
    if (heartDetails) {
      setMetricData(await metricsService.getMetricsForGarden(heartDetails.gardenDetails.address));
    }
  };

  const loadHeartDetailsAndBalances = async (force: boolean) => {
    const heartDetails = await viewerService.getHeartDetails(address, force);
    const gardenContract = await loadContractFromNameAndAddress(heartDetails.gardenDetails.address, Garden, txProvider);
    setHeartDetails(heartDetails);
    if (address) {
      let bablBalance = await viewerService.getTokenBalance(addresses.tokens.BABL, address);
      const hbablBalance = await viewerService.getTokenBalance(heartDetails.gardenDetails.address, address);
      const bablContract = (await loadContractFromNameAndAddress(
        addresses.tokens.BABL,
        BABLToken,
        txProvider,
      )) as Contract;
      bablBalance = bablBalance.sub(await bablContract.viewLockedBalance(address));
      setBablBalance(bablBalance);
      setHBablBalance(hbablBalance);
      const currentPermissions = await viewerService.getGardenPermissions(
        heartDetails.gardenDetails.address,
        address,
        false,
      );
      setUserPermissions(currentPermissions);
    }
    refreshMetrics(heartDetails);
    setReserveContract(await loadContractFromNameAndAddress(addresses.tokens.BABL, IERC20, txProvider));
    setGardenContract(gardenContract);
    setLoading(false);
  };

  useEffect(() => {
    loadHeartDetailsAndBalances(false);
  }, [address]);

  const hgDetails = heartDetails && heartDetails.gardenDetails;
  const percentageReturn =
    hgDetails && hgDetails.contribution
      ? calculateUserReturnForDisplay(
          hgDetails.contribution.totalCurrentDeposits || BigNumber.from(0),
          hgDetails.contribution.expectedEquity || BigNumber.from(0),
          hgDetails.contribution.rewards,
          hgDetails.contribution.pendingRewards,
          BigNumber.from(1),
        )
      : '--';

  const anyBondsActive = heartDetails?.bonds.find((hb: HeartBond) => hb.discount > 0);

  return (
    <HeartContainer style={{ width: '100%' }}>
      <Helmet>
        <meta property="og:url" content="https://babylon.finance/heart" />
        <meta property="og:title" content="Babylon Finance -🫀 The Heart of Babylon" />
        <meta property="og:description" content="Stake your BABL, vote on governance & generate APR." />
        <meta property="og:image" content="http://babylon.finance/heart_logo.png" />
        <title>Babylon Finance - 🫀 The Heart of Babylon</title>
      </Helmet>
      {loading && (
        <ContentWrapper loaded={false}>
          <GlobalLoader size={isMobile ? 300 : 400} />
        </ContentWrapper>
      )}
      {!loading && heartDetails && gardenContract && reserveContract && userPermissions && (
        <>
          {anyBondsActive && (
            <BondWrapper>
              <BondsBanner>
                <BondExplanation>
                  <Icon name={IconName.newBadge} size={isMobile ? 45 : 60} />
                  <BondCopy>Bond DAI and get a 10% bonus!</BondCopy>
                  {!isMobile && <img src={BondImage} width={72} />}
                </BondExplanation>
                <Bonds
                  refetch={() => loadHeartDetailsAndBalances(true)}
                  heartDetails={heartDetails}
                  gardenContract={gardenContract}
                  reserveContract={reserveContract}
                />
              </BondsBanner>
            </BondWrapper>
          )}
          <ContentWrapper loaded>
            {!isMobile && (
              <HeartImageContainer>
                <Animation name={AnimationName.heart} loop size={'100%'} />
              </HeartImageContainer>
            )}
            <OverlayingContainer>
              {!isMobile && (
                <UVPContainer>
                  Stake your BABL to earn APR, <br /> direct protocol fees and vote gas-free on governance.
                </UVPContainer>
              )}
              <APRSection>
                <WidgetItem type={0} value={BigNumber.from(30)} label={'Staking APR'} animatedNumber percentage />
                <WidgetItem
                  type={0}
                  value={heartDetails.totalStats.buybacks.mul(10).div(4)}
                  label={'BABL yield'}
                  reserve
                  valueIcon
                />
                <WidgetItem
                  type={0}
                  value={bablQuote && BigNumber.from(Math.floor(parseFloat(bablQuote[currency].price) * 1e9)).mul(1e9)}
                  fiat
                  label={'BABL Price'}
                  buyLink
                />
              </APRSection>
              <MyStakeSection>
                <WidgetTitlePaddedContainerHorizontal>
                  <LeftTitle>
                    <WidgetTitle>
                      <span>Your BABL & hBABL position</span>
                    </WidgetTitle>
                    <WidgetSubTitle>
                      Lock Period:{' '}
                      {getLockPeriodLabel(
                        heartDetails.gardenDetails.contribution?.userLock.toNumber() ||
                          HEART_LOCKING_PERIODS[0].seconds,
                      )}
                    </WidgetSubTitle>
                  </LeftTitle>
                  {!!heartDetails.gardenDetails.contribution && (
                    <RightTitle>
                      <APRLabel>Return</APRLabel>
                      <APRValue>↑{percentageReturn}</APRValue>
                    </RightTitle>
                  )}
                </WidgetTitlePaddedContainerHorizontal>
                <WidgetBody>
                  <Vertical>
                    <WidgetBalancePadded>
                      <WidgetItem type={1} value={bablBalance} label={'Available'} valueIcon reserve precision={0} />
                      <WidgetItem
                        type={1}
                        value={hbablBalance}
                        label={'Staked'}
                        valueHeartIconFull
                        alternateValue={heartDetails.gardenDetails.contribution?.expectedEquity}
                        sharePrice={heartDetails.gardenDetails.sharePrice}
                        reserve
                        precision={0}
                      />
                      <WidgetItem
                        type={1}
                        value={BigNumber.from(0)}
                        alternateValue={BigNumber.from(0)}
                        label={'Unlocked'}
                        valueHeartIconHalf
                        reserve
                        precision={0}
                      />
                    </WidgetBalancePadded>
                    <WidgetMainCTAs>
                      {address && heartDetails.gardenDetails.contribution && (
                        <StakeProphetModal garden={heartDetails.gardenDetails.address} linkButton />
                      )}
                      {!address && (
                        <TurquoiseButton disabled={true} onClick={connect}>
                          Connect Wallet to Stake
                        </TurquoiseButton>
                      )}
                      {address && (
                        <GroupButtons>
                          {heartDetails.gardenDetails.contribution && (
                            <WithdrawModal
                              refetch={() => loadHeartDetailsAndBalances(true)}
                              gardenContract={gardenContract}
                              reserveContract={reserveContract}
                              gardenDetails={heartDetails.gardenDetails}
                            />
                          )}
                        </GroupButtons>
                      )}
                    </WidgetMainCTAs>
                  </Vertical>
                </WidgetBody>
              </MyStakeSection>
              <HeartWidgetsSection>
                <HeartWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle>
                      <span>Heart Garden NAV</span>
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <WidgetItem
                      type={1}
                      value={heartDetails.gardenDetails.netAssetValue}
                      label={'BABL'}
                      labelIcon
                      reserve
                    />
                    <WidgetItem
                      type={1}
                      value={heartDetails.gardenDetails.netAssetValue}
                      convertFrom={babl}
                      label={currency}
                      precision={1}
                      fiat
                    />
                    <WidgetThird>
                      <WidgetThirdValue>
                        <StyledGardenReturn
                          gardenDetails={heartDetails.gardenDetails}
                          hideLabel
                          size={20}
                          sinceInception
                        />
                      </WidgetThirdValue>
                      <WidgetThirdLabel>Since inception</WidgetThirdLabel>
                    </WidgetThird>
                  </WidgetBody>
                </HeartWidgetContainer>
                <HeartWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle>
                      <span>Heart Capacity</span>
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <Vertical>
                      <HeartCapacityStats>
                        <HeartCapacityIcon>
                          <BablRewardContainer name={IconName.babToken} size={28} />
                          <ReserveNumber
                            value={heartDetails.gardenDetails.principal}
                            address={addresses.tokens.BABL}
                            hideSymbol
                            precision={0}
                          />
                        </HeartCapacityIcon>
                        <ReserveNumber
                          value={heartDetails.gardenDetails.maxDepositLimit}
                          address={addresses.tokens.BABL}
                          hideSymbol
                          precision={0}
                        />
                      </HeartCapacityStats>
                      <HeartBar>
                        <HeartBarFilled
                          filled={Math.min(
                            100,
                            heartDetails.gardenDetails.principal
                              .mul(100)
                              .div(heartDetails.gardenDetails.maxDepositLimit)
                              .toNumber(),
                          )}
                        />
                      </HeartBar>
                      <HeartBarNumber>
                        {Math.min(
                          100,
                          heartDetails.gardenDetails.principal
                            .mul(100)
                            .div(heartDetails.gardenDetails.maxDepositLimit)
                            .toNumber(),
                        )}
                        %
                      </HeartBarNumber>
                    </Vertical>
                  </WidgetBody>
                </HeartWidgetContainer>
              </HeartWidgetsSection>
              <HeartFeeTitle>
                <Icon name={IconName.rocket} size={24} />
                Heart fee distribution
              </HeartFeeTitle>
              <HeartWidgetsSection>
                <HeartBlueWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <span>Buybacks</span> <WidgetFeePercentage feeWeight={heartDetails.feeWeights.buybacks} />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBuybackBody>
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.buybacks}
                      convertFrom={babl}
                      fiat
                      label={'Invested'}
                    />
                    <BuybackBar />
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.buybacks}
                      reserve
                      label={'Purchased'}
                      valueIcon
                    />
                  </WidgetBuybackBody>
                </HeartBlueWidgetContainer>
                <HeartBlueWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <span>BABL-ETH</span> <WidgetFeePercentage feeWeight={heartDetails.feeWeights.liquidity} />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <WidgetItem
                      type={2}
                      value={heartDetails.currentLiquidityBabl.mul(2)}
                      convertFrom={babl}
                      fiat
                      label={'Liquidity'}
                    />
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.liquidity}
                      convertFrom={weth}
                      fiat
                      label={'By Heart'}
                    />
                    <WidgetThird>
                      <WidgetProtocolIcon large name="uniswap" size={24} />
                      <WidgetLink
                        href="https://info.uniswap.org/#/pools/0xe2de090153403b0f0401142d5394da897630dcb7"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Uni V3
                        <Icon name={IconName.link} size={16} />
                      </WidgetLink>
                    </WidgetThird>
                  </WidgetBody>
                </HeartBlueWidgetContainer>
                <HeartBlueWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <Icon name={IconName.shield} size={24} />
                      <span>Babylon Shield</span> <WidgetFeePercentage feeWeight={heartDetails.feeWeights.shield} />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <WidgetItem
                      type={2}
                      value={BigNumber.from(1375).mul(1e9).mul(1e9)}
                      convertFrom={weth}
                      fiat
                      label={'Smart Cover'}
                    />
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.shield}
                      convertFrom={weth}
                      fiat
                      label={'In Reserve'}
                    />
                    <WidgetThird>
                      <WidgetProtocolIcon large name="nexus" size={24} />
                      <WidgetLink href="https://app.nexusmutual.io/cover" target="_blank" rel="noopener noreferrer">
                        Nexus
                        <Icon name={IconName.link} size={16} />
                      </WidgetLink>
                    </WidgetThird>
                  </WidgetBody>
                </HeartBlueWidgetContainer>
                <HeartBlueWidgetContainer height={isMobile ? '165px' : undefined}>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <span>Garden Investments</span>{' '}
                      <WidgetFeePercentage feeWeight={heartDetails.feeWeights.gardenInvestments} />
                      <GardenInvestmentsModal
                        heartDetails={heartDetails}
                        votingWeight={hgDetails?.contribution?.votingPower || BigNumber.from(0)}
                      />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    {heartDetails.gardenWeights.map((gardenWeight: GardenWeight, index: number) => (
                      <GardenInvestment
                        key={gardenWeight.address}
                        rank={index + 1}
                        gardenAddress={gardenWeight.address}
                        weight={gardenWeight.weight}
                      />
                    ))}
                  </WidgetBody>
                </HeartBlueWidgetContainer>
                <HeartBlueWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <span>Fuse Liquidity</span> <WidgetFeePercentage feeWeight={heartDetails.feeWeights.fuse} />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.fuse}
                      convertFrom={weth}
                      fiat
                      label={'Heart TVL'}
                    />
                    <WidgetThird>
                      <FuseAssets>
                        <TokenDisplay
                          size={20}
                          token={tokenListService.getTokenBySymbol('BABL') as Token}
                          symbol={false}
                        />
                        <TokenDisplay
                          size={20}
                          token={tokenListService.getTokenBySymbol('FRAX') as Token}
                          symbol={false}
                        />
                        <TokenDisplay
                          size={20}
                          token={tokenListService.getTokenBySymbol('FEI') as Token}
                          symbol={false}
                        />
                        <TokenDisplay
                          size={20}
                          token={tokenListService.getTokenBySymbol('DAI') as Token}
                          symbol={false}
                        />
                        <TokenDisplay
                          size={20}
                          token={tokenListService.getTokenBySymbol('WETH') as Token}
                          symbol={false}
                        />
                      </FuseAssets>
                    </WidgetThird>
                    <WidgetThird>
                      <WidgetProtocolIcon name="rari" size={24} />
                      <WidgetLink
                        href="https://app.rari.capital/fuse/pool/144/info"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Fuse Pool
                        <Icon name={IconName.link} size={16} />
                      </WidgetLink>
                    </WidgetThird>
                  </WidgetBody>
                </HeartBlueWidgetContainer>
                <HeartBlueWidgetContainer>
                  <WidgetTitleContainer>
                    <WidgetTitle limit>
                      <span>Treasury</span> <WidgetFeePercentage feeWeight={heartDetails.feeWeights.treasury} />
                    </WidgetTitle>
                  </WidgetTitleContainer>
                  <WidgetBody>
                    <WidgetItem
                      type={2}
                      value={BigNumber.from(1900000).mul(1e9).mul(1e9)}
                      fiat
                      convertFrom={dai}
                      label={'Holdings'}
                    />
                    <WidgetItem
                      type={2}
                      value={heartDetails.totalStats.treasury}
                      convertFrom={weth}
                      fiat
                      label={'By Heart'}
                    />
                    <WidgetThird>
                      <WidgetEmoji>🏛️</WidgetEmoji>
                      <WidgetLink
                        href="https://etherscan.io/address/0xD7AAf4676F0F52993cb33aD36784BF970f0E1259"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Treasury
                        <Icon name={IconName.link} size={16} />
                      </WidgetLink>
                    </WidgetThird>
                  </WidgetBody>
                </HeartBlueWidgetContainer>
              </HeartWidgetsSection>
              <HeartFeeTitle>
                <Icon name={IconName.steward} size={24} />
                Strategies and Governance
              </HeartFeeTitle>
              <HeartFeeSubtitle>The Heart of Babylon Strategies</HeartFeeSubtitle>
              <HeartStrategies
                fetchData={() => loadHeartDetailsAndBalances(true)}
                userPermissions={userPermissions}
                gardenDetails={heartDetails.gardenDetails}
                metricData={metricData}
              />
              <HeartFeeSubtitle>Governance proposals</HeartFeeSubtitle>
              <GovernanceProposals
                heartDetails={heartDetails}
                votingWeight={hgDetails?.contribution?.votingPower || BigNumber.from(0)}
              />
              <DiscordContainer>
                <DiscordButton overrideLink={'https://discord.gg/ffPYsEQ3bV'} />
              </DiscordContainer>
            </OverlayingContainer>
          </ContentWrapper>
        </>
      )}
    </HeartContainer>
  );
};

const StyledFiatNumber = styled(FiatNumber)`
  font-size: 22px;
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const StyledReserveNumber = styled(ReserveNumber)`
  font-size: 22px;
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const HeartContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const BondWrapper = styled.div`
  display: flex;
  width: 1440px;
  background: linear-gradient(90.25deg, #3317a5 30.85%, #421dd9 70.18%);
  height: 100px;
  padding: 0 40px;

  @media only screen and (max-width: 1440px) {
    padding: 0 100px;
    width: 100%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    padding: 0 30px;
  }
`;

const ContentWrapper = styled.div<{ loaded: boolean }>`
  display: flex;
  position: relative;
  margin: 0 auto;
  height: ${(p) => (p.loaded ? '3400px' : 'auto')};
  width: var(--screen-lg-min);
  padding: 0 40px;

  @media only screen and (max-width: 1440px) {
    padding: 0 100px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    padding: 0 30px;
    height: 3100px;
  }
`;

const BondsBanner = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    justify-content: flex-start;
  }
`;

const BondCopy = styled.div`
  font-size: 24px;
  color: white;
  margin-left: 12px;
  margin-right: 35px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: 10px;
    margin-right: 10px;
    font-size: 18px;
    line-height: 22px;
    width: 100%;
  }
`;

const BondExplanation = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const HeartImageContainer = styled.div`
  display: flex;
  height: auto;
  position: absolute;
  z-index: 1;
  margin-top: 0px;
  right: 162px;
  top: -4px;
`;

const OverlayingContainer = styled.div`
  position: absolute;
  top: 0;
  z-index: 2;
  width: 1240px;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    position: relative;
  }
`;

const UVPContainer = styled.div`
  margin-top: 55px;
  width: 500px;
  text-align: left;
  line-height: 38px;
  font-size: 32px;
  color: white;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    margin-top: 30px;
    width: 100%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    line-height: 30px;
    font-size: 24px;
  }
`;

const APRSection = styled.div`
  width: 500px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin: 35px 0;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    margin: 20px 0;
  }
`;

const WidgetThird = styled.div<{ clickable?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: left;
  justify-content: flex-start;
  padding: 0 20px;
  border-right: 1px solid var(--border-blue);
  width: 33%;
  height: 60px;

  &:first-child {
    padding-left: 0;
  }

  > div:first-child {
    cursor: ${(p) => (p.clickable ? 'pointer' : 'default')};
    text-decoration: ${(p) => (p.clickable ? 'underline' : 'none')};
  }

  &:last-child {
    border-right: none;
    padding-right: 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 10px;
  }
`;

const WidgetThirdValue = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;

  > span {
    font-feature-settings: 'pnum' on, 'lnum' on;
    font-family: cera-bold;
  }
`;

const APRItemValue = styled(WidgetThirdValue)`
  font-size: 28px;
  line-height: 40px;
  color: var(--yellow);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 24px;
  }
`;

const NavValue = styled(APRItemValue)`
  color: var(--white);
`;

const FeeWidgetValue = styled(NavValue)`
  font-size: 16px;
`;

const WidgetThirdLabel = styled.div<{ stack?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: var(--blue-03);
  font-size: 15px;
  line-height: 20px;

  a {
    margin: 0 0 0 4px;

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      margin-left: 0;
    }
  }

  ${(p) => (p.stack ? 'flex-flow: row wrap;' : '')}
`;

const WidgetMainCTAs = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0 24px;
  font-size: 16px;

  button {
    height: 40px;
  }

  div {
    height: 40px;
    width: auto;
  }

  img {
    height: 40px;
    width: 40px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px 12px 0 12px;
    justify-content: flex-start;
  }
`;

const GroupButtons = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;

  button:first-child {
    margin-right: 8px;
    width: 50%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-left: auto;
    width: 100%;

    button:first-child {
      width: 50%;
    }

    button:last-child {
      width: 50%;
    }
  }
`;

const BablRewardContainer = styled(Icon)`
  padding: 0;
  margin-right: 8px;
`;

const MyStakeSection = styled.div`
  width: 392px;
  margin-top: 30px;
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--purple-07);
  border-radius: 4px;
  min-height: 240px;
  margin-bottom: 24px;
  padding: 24px 0 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 12px 0;
    margin-top: 30px;
    margin-bottom: 20px;
    width: 100%;
    min-height: 220px;
  }
`;

const HeartWidgetsSection = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  width: 100%;
  margin-bottom: 47px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: column nowrap;
    margin-bottom: 0;
  }
`;

const HeartWidgetContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  background-color: var(--modal-blue);
  border-radius: 4px;
  margin-right: 21px;
  width: 392px;
  height: 156px;
  margin-bottom: 24px;
  padding: 20px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    padding: 12px;
    margin-right: 0;
    margin-bottom: 30px;
    height: 126px;
    max-width: 330px;
  }
`;

const HeartBlueWidgetContainer = styled(HeartWidgetContainer)<{ height?: string }>`
  background-color: var(--blue-09);
  ${(p) => (p.height ? `height: ${p.height};` : '')}
`;
const HeartBlueWidgetSpacer = styled(HeartBlueWidgetContainer)`
  background-color: transparent;
`;

const HeartFeeTitle = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  font-family: cera-medium;
  font-size: 18px;
  margin-bottom: 20px;

  svg {
    margin-right: 8px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-bottom: 10px;
  }
`;

const HeartFeeSubtitle = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  font-family: cera-bold;
  font-size: 16px;
  color: var(--blue-03);
  margin-top: 56px;
  margin-bottom: 24px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-top: 10px;
    margin-bottom: 12px;
  }
`;

const WidgetTitle = styled.div<{ limit?: boolean }>`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    span {
      ${(p) => (p.limit ? 'width: 110px;' : '')}
    }
  }
`;

const WidgetSubTitle = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  font-size: 13px;
`;

const WidgetTitleContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  margin-bottom: 15px;
`;

const WidgetTitlePaddedContainer = styled(WidgetTitleContainer)`
  padding: 0 24px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
    padding: 0 12px;
  }
`;

const WidgetTitlePaddedContainerHorizontal = styled(WidgetTitlePaddedContainer)`
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const LeftTitle = styled.div``;

const RightTitle = styled.div``;

const APRLabel = styled.div`
  font-size: 13px;
  color: var(--blue-03);
  margin-bottom: 2px;
`;

const APRValue = styled.div`
  font-size: 15px;
  font-weight: bold;
  color: var(--positive);
`;

const WidgetBody = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
`;

const WidgetBuybackBody = styled(WidgetBody)`
  div {
    border-right: none;
  }
`;

const HeartCapacityStats = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: cera-medium;
  color: var(--blue-03);
`;

const HeartBar = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  height: 6px;
  background: var(--blue-06);
`;

const HeartBarFilled = styled.div<{ filled: number }>`
  display: flex;
  width: ${(p) => p.filled}%;
  height: 100%;
  background: var(--purple-02);
  transition-property: width;
  transition-duration: 4s;
  transition-delay: 2s;
`;

const HeartBarNumber = styled.div`
  font-size: 16px;
  color: var(--purple-02);
  margin-top: 4px;
`;

const HeartCapacityIcon = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  > div {
    font-size: 28px;
    color: white;
    margin-left: 4px;

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      font-size: 24px;
    }
  }
`;

const Vertical = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const WidgetBalancePadded = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  padding: 0 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--blue-05);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 12px 20px;
  }
`;

const WidgetFeeWeight = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 6px 12px;
  background: var(--blue-06);
  color: var(--yellow);
  font-size: 13px;
  border-radius: 12px;
  margin-left: 4px;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const BuybackBar = styled.div`
  width: 96px;
  height: 1px;
  background: var(--border-blue);
`;

const WidgetProtocolIcon = styled(ProtocolIcon)`
  height: 40px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const WidgetLink = styled.a`
  display: inline-flex;
  font-size: 16px;
  color: var(--turquoise-02);
  text-decoration: underline;
  cursor: pointer;
  margin-top: 4px;

  &:visited,
  &:hover {
    color: var(--turquoise-02);
  }

  > div {
    margin-left: 2px;
  }
`;

const FuseAssets = styled.div`
  display: flex;
  flex-flow: row wrap;

  > div {
    margin: 4px 4px 4px 0;

    img {
      margin-right: 0;
    }
  }
`;

const StyledGardenReturn = styled(GardenReturn)`
  div {
    font-size: 16px;
  }

  margin-left: 0;
`;

const DiscordContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
`;

const WidgetEmoji = styled.div`
  font-size: 24px;
`;

export default React.memo(Heart);
