import InviteImage from 'components/garden/detail/components/illustrations/invite.svg';
import GardenChatImage from 'components/garden/detail/components/illustrations/member_chat.svg';
import WheatShareImage from 'components/garden/detail/components/illustrations/wheat_share.svg';
import AltPositionContent from './AltPositionContent';
import AltRewardContent from './AltRewardContent';
import MetricCard from './MetricCard';
import PositionContent from './PositionContent';
import RewardsContent from './RewardsContent';
import GardenProfitSplit from './GardenProfitSplit';
import ReturnTooltip from './ReturnTooltip';

import {
  FeatureTour,
  GardenPill,
  GardenTokenIcon,
  Icon,
  Member,
  TokenDisplay,
  HoverTooltip,
  ReserveNumber,
  SparkLine,
  PurpleButton,
  TurquoiseButton,
} from 'components/shared';
import { ReactComponent as TelegramIcon } from './illustrations/telegram.svg';
import addresses from 'constants/addresses';
import { daysBetween } from 'helpers/Date';
import {
  AprResult,
  FullGardenDetails,
  GardenMetricResponse,
  GardenPermission,
  getGardenCategory,
  IconName,
  Identity,
  Token,
  WalletMetricResponse,
} from 'models';
import { BREAKPOINTS, GARDEN_NEW_NUM_DAYS } from 'config';
import { Garden, IERC20 } from 'constants/contracts';
import { IdentityService, TokenListService, MetricsService } from 'services';
import { buildEtherscanContractUrl } from 'helpers/Urls';
import { isGardenCreator } from 'helpers/Addresses';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';
import { CustomGardenDetails, CustomDetails } from 'constants/customDetails';

import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { commify } from '@ethersproject/units';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React, { lazy, useState, useEffect } from 'react';
import GardenNftModal from 'components/garden/modals/GardenNftModal';

// Garden splitting
const DepositModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ DepositModal }) => ({
    default: DepositModal,
  })),
);
const WithdrawModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ WithdrawModal }) => ({
    default: WithdrawModal,
  })),
);
const ClaimModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ ClaimModal }) => ({
    default: ClaimModal,
  })),
);
const StakeProphetModal = lazy(() =>
  import(/* webpackChunkName: 'modals' */ 'components/garden/modals/').then(({ StakeProphetModal }) => ({
    default: StakeProphetModal,
  })),
);
const AdminPanel = lazy(() =>
  import(/* webpackChunkName: 'adminpanel' */ './admin').then(({ AdminPanel }) => ({ default: AdminPanel })),
);

interface GardenDetailsBlockProps {
  bablToReserve: BigNumber;
  metricData: GardenMetricResponse;
  gardenDetails: FullGardenDetails;
  userPermissions: GardenPermission | undefined;
  refetch: () => void;
}

interface GardenDepositProps {
  gardenDetails: FullGardenDetails;
  userPermissions: GardenPermission | undefined;
  showTour: boolean;
  gardenContract: Contract;
  reserveContract: Contract;
  disable: () => void;
  refetch: () => void;
}

const DepositAction = ({
  refetch,
  gardenDetails,
  userPermissions,
  gardenContract,
  reserveContract,
  showTour,
  disable,
}: GardenDepositProps) => {
  if (!userPermissions) {
    return null;
  }

  return (
    <FeatureTour
      enabled={!isMobile && showTour && !gardenDetails.contribution}
      textPrimary={`Join ${gardenDetails.totalContributors.toNumber()} other members in this Garden!`}
      textSecondary={'Deposit funds to join this community and start investing in DeFi Together.'}
      disable={disable}
      illustration={<img alt="deposit-img" src={WheatShareImage} />}
      width={isMobile ? 100 : undefined}
      children={
        <DepositModal
          refetch={refetch}
          gardenContract={gardenContract}
          reserveContract={reserveContract}
          buttonText={
            gardenDetails.contribution && !gardenDetails.contribution.isDust ? 'Deposit' : 'Deposit to join this Garden'
          }
          userPermissions={userPermissions}
          gardenDetails={gardenDetails}
        />
      }
    />
  );
};

interface GardenChatProps {
  gardenDetails: FullGardenDetails;
  showTour: boolean;
  customDetails: CustomDetails | undefined;
  disable: () => void;
}

const ChatAction = ({ gardenDetails, showTour, disable, customDetails }: GardenChatProps) => {
  let button = (
    <GardenSocialWrapper href={gardenDetails.nft?.telegram} target="_blank" rel="noopener noreferrer">
      <TelegramIcon height={20} width={20} />
      <StyledLink>{`Garden Chat`}</StyledLink>
    </GardenSocialWrapper>
  );
  if (customDetails) {
    button = (
      <StyledPurpleButton onClick={() => window.open(customDetails.discord)}>
        <LabelWrapper>
          <Icon name={IconName.discord} size={16} />
          <span>Garden Chat</span>
        </LabelWrapper>
      </StyledPurpleButton>
    );
  }
  return (
    <FeatureTour
      enabled={showTour && !isMobile}
      textPrimary={'Hey Settler! Babylon is all about the community.'}
      textSecondary={`Join the discussion on ${
        customDetails ? 'Discord' : 'Telegram'
      } and help shape the future of your Garden.`}
      disable={disable}
      illustration={<img alt="chat-img" src={GardenChatImage} />}
      children={button}
    />
  );
};

interface GardenAdminProps {
  gardenDetails: FullGardenDetails;
  showTour: boolean;
  refetch: () => void;
  disable: () => void;
}

const AdminAction = ({ gardenDetails, showTour, disable, refetch }: GardenAdminProps) => {
  return (
    <FeatureTour
      ml={20}
      enabled={showTour && !isMobile}
      textPrimary={'Hello Creator! With great power comes great responsibility.'}
      textSecondary={'Manage various Garden details in the Admin panel.'}
      disable={disable}
      illustration={<img alt="admin-img" src={InviteImage} />}
      children={<AdminPanel gardenDetails={gardenDetails} refetch={refetch} />}
    />
  );
};

interface StakeActionProps {
  gardenDetails: FullGardenDetails;
  showTour: boolean;
  disable: () => void;
}

const StakeAction = ({ disable, showTour, gardenDetails }: StakeActionProps) => {
  return (
    <FeatureTour
      enabled={showTour && !isMobile}
      textPrimary={'Stake your Prophet to earn the reward bonus!'}
      textSecondary={''}
      disable={disable}
      illustration={<img alt="admin-img" src={InviteImage} />}
      children={<StakeProphetModal garden={gardenDetails.address} />}
    />
  );
};

const GardenDetailsBlock = ({
  bablToReserve,
  gardenDetails,
  metricData,
  refetch,
  userPermissions,
}: GardenDetailsBlockProps) => {
  const [creatorIdentity, setCreatorIdentity] = useState<Identity | undefined>(undefined);
  const [reserveContract, setReserveContract] = useState<Contract | undefined>(undefined);
  const [gardenContract, setGardenContract] = useState<Contract | undefined>(undefined);
  const [walletMetrics, setWalletMetrics] = useState<WalletMetricResponse | undefined>(undefined);

  const { connect, provider, address, canSubmitTx, txProvider, userPrefs, updateUserPrefs } = useW3Context();
  const identityService = IdentityService.getInstance();
  const tokenListService = TokenListService.getInstance();
  const metricsService = MetricsService.getInstance();

  const hardlockDays = gardenDetails.depositHardlock?.gt(86400) ? gardenDetails.depositHardlock.toNumber() / 86400 : 0;
  const gardenCreated = new Date(gardenDetails.gardenInitializedAt);
  const isNew = daysBetween(gardenCreated, new Date()) <= GARDEN_NEW_NUM_DAYS;
  const bablToken = tokenListService.getTokenBySymbol('BABL') as Token;
  const reserveToken = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
  const hasCreator = gardenDetails.creator.filter((c) => c !== addresses.zero).length > 0;
  const isPrivate = !gardenDetails.publicLP;
  const isCreator = address ? isGardenCreator(address, gardenDetails.creator) : false;
  const hasUnclaimedRewards = (() => {
    const rewards = gardenDetails.contribution?.rewards;
    if (rewards) {
      return rewards.totalProfits.gt(BigNumber.from(0)) || rewards.totalBabl.gt(BigNumber.from(0));
    } else {
      return false;
    }
  })();

  let vAPR: AprResult | undefined;

  if (metricData && metricData.garden?.length >= 90) {
    const { garden } = metricData;
    vAPR = garden[garden.length - 1].data.returnRates?.annual;
  }

  useEffect(() => {
    async function init(address: string | undefined) {
      if (address) {
        const walletMetricsResponse = await metricsService.getMetricsForWallet(address, gardenDetails.address);
        setWalletMetrics(walletMetricsResponse);
      }

      setReserveContract(await loadContractFromNameAndAddress(gardenDetails.reserveAsset, IERC20, txProvider));
      setGardenContract(await loadContractFromNameAndAddress(gardenDetails.address, Garden, txProvider));

      if (hasCreator) {
        const identities = await identityService.getIdentities(gardenDetails.creator);
        if (identities && identities?.usersByAddress) {
          const maybeIdentity = identities?.usersByAddress[(gardenDetails.creator[0] || '').toLowerCase()];
          setCreatorIdentity(maybeIdentity);
        }
      }
    }

    init(address);
  }, [address]);

  const disableChatTour = async () => {
    if (userPrefs) {
      updateUserPrefs({ ...userPrefs, hideChatTour: true });
    }
  };

  const disableAdminTour = async () => {
    if (userPrefs) {
      updateUserPrefs({ ...userPrefs, hideAdminTour: true });
    }
  };

  const disableDepositTour = async () => {
    if (userPrefs) {
      updateUserPrefs({ ...userPrefs, hideDepositTour: true });
    }
  };

  const disableStakeTour = async () => {
    if (userPrefs) {
      updateUserPrefs({ ...userPrefs, hideStakeTour: true });
    }
  };

  const showRewardsButton = (gardenDetails: FullGardenDetails) => {
    if (gardenDetails.contribution) {
      return gardenDetails.contribution.isDust ? hasUnclaimedRewards : true;
    }
  };

  const positionButtons = (() => {
    let maybeDeposit: React.ReactNode | null = null;
    let maybeWithdrawal: React.ReactNode | null = null;

    if (!address) {
      maybeDeposit = <TurquoiseButton onClick={connect}>Connect Wallet to Deposit</TurquoiseButton>;
    }

    if (gardenDetails && address && canSubmitTx && gardenContract && reserveContract) {
      maybeDeposit = (
        <DepositAction
          disable={disableDepositTour}
          showTour={false} // userPrefs ? !isCreator && userPrefs.hideDepositTour === false : true}
          refetch={refetch}
          gardenContract={gardenContract}
          reserveContract={reserveContract}
          userPermissions={userPermissions}
          gardenDetails={gardenDetails}
        />
      );
    }

    if (
      gardenDetails &&
      gardenDetails.contribution &&
      !gardenDetails.contribution.isDust &&
      address &&
      canSubmitTx &&
      gardenContract &&
      reserveContract
    ) {
      maybeWithdrawal = (
        <StyledModalConatiner>
          <WithdrawModal
            vapr={vAPR}
            refetch={refetch}
            gardenContract={gardenContract}
            reserveContract={reserveContract}
            gardenDetails={gardenDetails}
          />
        </StyledModalConatiner>
      );
    }

    return (
      <>
        {maybeDeposit}
        {maybeWithdrawal}
      </>
    );
  })();

  const rewardButtons = (() => {
    let maybeStake: React.ReactNode | null = null;
    let maybeClaim: React.ReactNode | null = null;

    if (
      gardenDetails &&
      gardenContract &&
      reserveContract &&
      address &&
      canSubmitTx &&
      provider &&
      showRewardsButton(gardenDetails)
    ) {
      maybeClaim = (
        <StyledModalConatiner>
          <ClaimModal
            gardenContract={gardenContract}
            gardenDetails={gardenDetails}
            hasUnclaimed={hasUnclaimedRewards}
            refetch={refetch}
            reserveContract={reserveContract}
          />
        </StyledModalConatiner>
      );
    }
    if (gardenDetails.contribution && !gardenDetails.contribution.isDust) {
      maybeStake = (
        <StyledModalConatiner>
          <StakeAction disable={disableStakeTour} showTour={false} gardenDetails={gardenDetails} />
        </StyledModalConatiner>
      );
    }
    return maybeStake || maybeClaim ? (
      <>
        {maybeStake}
        {maybeClaim}
      </>
    ) : undefined;
  })();

  const mintButton = (() => {
    if (gardenDetails && address && canSubmitTx && gardenContract && reserveContract) {
      return (
        <StyledModalConatiner>
          <GardenNftModal gardenContract={gardenContract} gardenDetails={gardenDetails} />
        </StyledModalConatiner>
      );
    }
  })();

  const navSparkData = metricData.garden?.slice(-29).map((item) => item.data.netAssetValue) || [];
  const shareSparkData =
    metricData.garden?.slice(-29).map((item) => item.data.netAssetValue / item.data.totalSupply) || [];

  const heroMetricWidth = vAPR ? '40%' : '50%';
  const verified = gardenDetails.verified > 0;
  const customDetails: CustomDetails | undefined = CustomGardenDetails[gardenDetails.address.toLowerCase()];
  const iconSize = isMobile ? 20 : 24;
  const tokenIconSize = isMobile ? 16 : 18;
  const daysSinceLastDeposit = gardenDetails.contribution?.lastDeposit
    ? (Date.now() - gardenDetails.contribution.lastDeposit.getTime()) / (86400 * 1000)
    : Infinity;

  const remainingDays = Math.floor(hardlockDays - daysSinceLastDeposit);
  const displayMintButton =
    !!gardenDetails.contribution && !gardenDetails.contribution.isDust && gardenDetails.mintNftAfter > 0;

  return (
    <DetailsContainer>
      <ColumnsContainer>
        <Col>
          <DetailsWrapper>
            <HeaderWrapper>
              {isMobile && verified && (
                <ThumbContainer>
                  <img
                    src={`/gardens/${gardenDetails.address.toLowerCase()}/thumb.png`}
                    alt={'garden-thumbnail'}
                    width={'100%'}
                    height={'100%'}
                  />
                </ThumbContainer>
              )}
              <NameWrapper>
                <GardenName>{gardenDetails.name}</GardenName>
                <SymbolWrapper>
                  <GardenTokenIcon size={28} />
                  <StyledAddressLink
                    href={buildEtherscanContractUrl(gardenDetails.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {gardenDetails.symbol}
                  </StyledAddressLink>
                </SymbolWrapper>
                {!isMobile && gardenDetails.contribution && !gardenDetails.contribution.isDust && isCreator && (
                  <AdminAction
                    disable={disableAdminTour}
                    showTour={userPrefs ? userPrefs.hideAdminTour === false : false}
                    gardenDetails={gardenDetails}
                    refetch={refetch}
                  />
                )}
              </NameWrapper>
            </HeaderWrapper>
            <ExtraDetails>
              <ExtraDetailsItem>
                <CreatorsWrapper>
                  <Member
                    size={isMobile ? 8 : 10}
                    address={gardenDetails.creator[0]}
                    avatarUrl={creatorIdentity?.avatarUrl}
                    displayName={creatorIdentity?.displayName}
                    link
                    showText={!isMobile}
                  />
                </CreatorsWrapper>
                {verified && (
                  <DetailIcon>
                    <HoverTooltip
                      icon={IconName.check}
                      size={iconSize}
                      color={'var(--white)'}
                      content={'This Garden has been verified by the Babylon community.'}
                      placement={'up'}
                    />
                  </DetailIcon>
                )}
                {isPrivate && (
                  <DetailIcon>
                    <HoverTooltip
                      icon={IconName.lock2}
                      size={18}
                      color={'var(--white)'}
                      content={'This Garden is private (invite-only).'}
                      placement={'up'}
                    />
                  </DetailIcon>
                )}
              </ExtraDetailsItem>
              <ExtraDetailsItem>
                <TokenDisplay token={reserveToken} size={iconSize} symbol={false} />
                <GardenPill text={getGardenCategory(gardenDetails.verified).display} />
                {gardenDetails.customIntegrationsEnabled && <CustomIcon name={IconName.customGarden} size={iconSize} />}
              </ExtraDetailsItem>
              <ExtraDetailsItem>
                <Icon name={IconName.member} size={iconSize} />
                <span>
                  {gardenDetails.totalContributors ? commify(gardenDetails.totalContributors.toNumber()) : '--'}
                </span>
              </ExtraDetailsItem>
              {gardenDetails.contribution && !gardenDetails.contribution.isDust && gardenDetails.nft?.telegram && (
                <ExtraDetailsItem>
                  <ChatAction
                    gardenDetails={gardenDetails}
                    disable={disableChatTour}
                    showTour={userPrefs ? userPrefs.hideChatTour === false && !isCreator : true}
                    customDetails={customDetails}
                  />
                </ExtraDetailsItem>
              )}
            </ExtraDetails>
            <ShortDescription>
              {customDetails?.shortDescription || `Deposit and grow your ${reserveToken.symbol}`}
            </ShortDescription>
            <GardenMetricsContainer>
              {vAPR && (
                <GardenMetricItem width={isMobile ? '100%' : '20%'}>
                  <MetricItem>
                    <StyledMetricNumber>{parseFloat(vAPR.aggregate.toFixed(2))}%</StyledMetricNumber>
                    <MetricLabel>
                      vAPR
                      <HoverTooltip
                        color={'var(--blue-03)'}
                        content={<ReturnTooltip result={vAPR} />}
                        placement="up"
                        size={16}
                      />
                    </MetricLabel>
                  </MetricItem>
                </GardenMetricItem>
              )}
              <GardenMetricItem width={isMobile ? '100%' : heroMetricWidth}>
                <SparkRow>
                  <MetricItem>
                    <TokenNumberWrapper>
                      <StyledReserveNumber
                        value={gardenDetails.netAssetValue}
                        address={gardenDetails.reserveAsset}
                        precision={2}
                        hideSymbol
                        color={'var(--yellow)'}
                      />
                      <TokenDisplay token={reserveToken} size={tokenIconSize} symbol={false} />
                    </TokenNumberWrapper>
                    <MetricLabel>Net Asset Value</MetricLabel>
                  </MetricItem>
                  <SparkWrapper>{!isNew && <SparkLine data={navSparkData} precision={1} />}</SparkWrapper>
                </SparkRow>
              </GardenMetricItem>
              <GardenMetricItem width={isMobile ? '100%' : heroMetricWidth}>
                <SparkRow>
                  <MetricItem>
                    <StyledReserveNumber
                      value={gardenDetails.sharePrice}
                      address={gardenDetails.reserveAsset}
                      precision={2}
                      hideSymbol
                      color={'var(--yellow)'}
                    />
                    <MetricLabel>Share Price</MetricLabel>
                  </MetricItem>
                  <SparkWrapper>{!isNew && <SparkLine data={shareSparkData} precision={4} />}</SparkWrapper>
                </SparkRow>
              </GardenMetricItem>
            </GardenMetricsContainer>
            <UserDetailsContainer>
              <MetricCardWrapper>
                <MetricCard
                  bgColor={'var(--purple)'}
                  label={gardenDetails.contribution ? 'My Position' : 'Join this Garden'}
                  buttons={positionButtons}
                  altButtons={
                    gardenDetails.contribution && remainingDays > 0 ? (
                      <span>Funds locked for {remainingDays} more days</span>
                    ) : undefined
                  }
                  token={gardenDetails.contribution ? reserveToken : undefined}
                  children={
                    gardenDetails.contribution ? (
                      <PositionContent
                        metricData={walletMetrics}
                        contribution={gardenDetails.contribution}
                        reserve={gardenDetails.reserveAsset}
                        bablToReserve={bablToReserve}
                      />
                    ) : (
                      <AltPositionContent />
                    )
                  }
                />
              </MetricCardWrapper>
              <MetricCardWrapper>
                <MetricCard
                  bgColor={'var(--blue-09)'}
                  label={gardenDetails.contribution ? 'My Rewards' : 'Earn Rewards'}
                  buttons={rewardButtons}
                  token={gardenDetails.contribution ? bablToken : undefined}
                  children={
                    gardenDetails.contribution ? (
                      <RewardsContent contribution={gardenDetails.contribution} reserve={gardenDetails.reserveAsset} />
                    ) : (
                      <AltRewardContent />
                    )
                  }
                />
              </MetricCardWrapper>
            </UserDetailsContainer>
          </DetailsWrapper>
        </Col>
        <Col2>
          {!isMobile && (
            <Mintable>
              <MintOverlay enabled={displayMintButton}>
                <MintButtonWrapper className="garden_mintButtonWrapper">{mintButton}</MintButtonWrapper>
              </MintOverlay>
              <GardenImg
                src={`/gardens/${customDetails?.customImg ? gardenDetails.address.toLowerCase() : 'generic'}/img.${
                  customDetails?.animated ? 'gif' : 'png'
                }`}
                alt={'garden-img'}
                width={'100%'}
              />
            </Mintable>
          )}
          <GardenPropertiesRow>
            <GardenPropertyCard>
              <PropertyCardTitle>Permissions</PropertyCardTitle>
              <PropertyContent>
                <Permissions>
                  <PermissionsItem>
                    <span>Who can submit strategies?</span>
                    {gardenDetails.publicStrategist ? (
                      <PermissionType>
                        <HoverTooltip
                          content={'Any member of the Garden can submit a strategy proposal.'}
                          icon={IconName.strategistPublic}
                          size={48}
                          placement="up"
                        />
                        <span>Open</span>
                      </PermissionType>
                    ) : (
                      <PermissionType>
                        <HoverTooltip
                          content={'Only whitelisted wallets can submit a strategy proposal.'}
                          icon={IconName.strategistPrivate}
                          size={48}
                          placement="up"
                        />
                        <span>Whitelist</span>
                      </PermissionType>
                    )}
                  </PermissionsItem>
                  <PermissionsItem>
                    <span>Who can vote on strategies?</span>
                    {gardenDetails.publicVoter ? (
                      <PermissionType>
                        <HoverTooltip
                          content={'Any member of the Garden can vote on strategy proposals.'}
                          icon={IconName.stewardPublic}
                          size={48}
                          placement="up"
                        />
                        <span>Open</span>
                      </PermissionType>
                    ) : (
                      <PermissionType>
                        <HoverTooltip
                          content={'Only whitelisted wallets can vote on strategy proposals.'}
                          icon={IconName.stewardPrivate}
                          size={48}
                          placement="up"
                        />
                        <span>Whitelist</span>
                      </PermissionType>
                    )}
                  </PermissionsItem>
                </Permissions>
              </PropertyContent>
            </GardenPropertyCard>
            <GardenPropertyCard minWidth={isMobile ? '100%' : '335px'}>
              <PropertyCardTitle>Profit Split</PropertyCardTitle>
              <PropertyContent>
                <SplitText>How is carried interest distributed in the Garden?</SplitText>
                <GardenProfitSplit
                  splits={[
                    { color: 'var(--blue-03)', percentage: 5, name: 'Protocol' },
                    { color: 'var(--purple-02)', percentage: gardenDetails.profits.strategist, name: 'Strategist' },
                    { color: 'var(--yellow)', percentage: gardenDetails.profits.stewards, name: 'Voters' },
                    { color: 'var(--turquoise-01)', percentage: gardenDetails.profits.lp, name: 'LPs' },
                  ]}
                />
              </PropertyContent>
            </GardenPropertyCard>
          </GardenPropertiesRow>
        </Col2>
      </ColumnsContainer>
    </DetailsContainer>
  );
};

const Mintable = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const MintButtonWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MintOverlay = styled.div<{ enabled: boolean }>`
  ${(p) => (!p.enabled ? 'display: none; pointer-events: none;' : '')}
  position: absolute;
  width: 100%;
  height: 100%;
  transition: 0.3s;
  overflow: hidden;
  border-radius: 4px;

  .garden_mintButtonWrapper {
    display: none;
  }

  &:hover {
    cursor: pointer;
    background: rgba(45, 23, 134, 0.5);

    .garden_mintButtonWrapper {
      display: flex;
    }
  }
`;

const TokenNumberWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  > div {
    &:first-child {
      margin-right: 10px;
    }
  }
`;

const ThumbContainer = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const StyledModalConatiner = styled.div`
  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const StyledPurpleButton = styled(PurpleButton)`
  height: 30px;
  padding: 4px 10px;
  left: -10px;

  > svg {
    margin-right: 6px;
  }
`;

const LabelWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;

  > span {
    margin-left: 6px;
  }
`;

const SplitText = styled.div`
  margin-bottom: 35px;
`;

const Permissions = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const PermissionsItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding-right: 10px;
  width: 50%;
  height: 100%;

  > span {
    padding-bottom: 10px;
    min-height: 80px;
  }

  &:first-child {
    border-right: 1px solid var(--border-blue);
  }

  &:last-child {
    padding-left: 10px;
    padding-right: 0;
  }
`;

const PermissionType = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  align-items: flex-start;
  justify-self: flex-end;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    align-items: center;
  }
`;

const PropertyContent = styled.div`
  width: 100%;
  height: 100%;
`;

const GardenPropertiesRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  width: 100%;
  padding-top: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: auto;
    flex-flow: column nowrap;
  }
`;

const GardenPropertyCard = styled.div<{ minWidth?: string }>`
  background-color: var(--blue-alt);
  border-radius: 4px;
  height: 250px;
  padding: 20px;
  width: 50%;
  ${(p) =>
    p.minWidth
      ? `min-width:
  ${p.minWidth};`
      : ''}

  &:first-child {
    margin-right: 30px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;

    &:first-child {
      margin: 0 0 30px 0;
    }
  }
`;

const PropertyCardTitle = styled.div`
  color: var(--white);
  display: flex;
  flex-flow: column nowrap;
  flex-flow: row nowrap;
  font-family: cera-bold;
  font-size: 18px;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
`;

const MetricItem = styled.div<{ row?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
`;

const MetricLabel = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-family: cera-medium;
  font-size: 15px;
  text-align: left;
  width: 100%;
  color: var(--blue-03);
`;

const GardenImg = styled.img`
  justify-self: flex-start;
  postion: relative;

  @media only screen and (max-width: 1280px) {
    display: none;
  }
`;

const SparkWrapper = styled.div`
  width: 50%;
`;

const MetricCardWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
`;

const StyledReserveNumber = styled(ReserveNumber)<{ color?: string }>`
  font-size: 22px;
  font-family: cera-bold;
  color: ${(p) => (p.color ? p.color : 'var(--white)')};

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const StyledMetricNumber = styled.span`
  font-size: 22px;
  font-family: cera-bold;
  color: var(--purple-aux);
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 20px;
  }
`;

const GardenMetricsContainer = styled.div`
  width: 100%;
  height: 100px;
  padding: 10px 0;
  margin: 20px 0 50px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: auto;
    margin: 10px 0 0 0;
    padding-bottom: 0;
    flex-direction: column;
  }
`;

const GardenMetricItem = styled.div<{ width: string }>`
  height: 100%;
  padding: 0 20px;
  border-right: 1px solid var(--border-blue);
  width: ${(p) => p.width};
  display: flex;
  flex-flow: column nowrap;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    border: none;
  }

  @media only screen and (max-width: 1300px) {
    border-right: none;
    padding: 0 0 10px 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    height: 70px;
  }
`;

const SparkRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
`;

const ShortDescription = styled.div`
  white-space: nowrap;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-blue);
  text-overflow: ellipsis;
  height: 53px;
  overflow: hidden;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    white-space: pre-line;
    height: auto;
  }
`;

const UserDetailsContainer = styled.div`
  width: 100%;
`;

const CreatorsWrapper = styled.div``;

const DetailIcon = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  height: 30px;
  width: 30px;
  border-radius: 15px;
  background-color: var(--purple-07);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    border-radius: 12px;
    height: 24px;
    width: 24px;
  }
`;

const ExtraDetailsItem = styled.div`
  min-height: 30px;
  margin-left: 16px;
  height: 100%;
  width: auto;
  min-width: 80px;
  display: flex;
  flex-flow: row nowrap;
  padding-right: 16px;
  align-items: center;
  border-right: 1px solid var(--border-blue);

  > span {
    padding-left: 6px;
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    border: none;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-width: 70px;
    padding-right: 8px;
    margin-left: 8px;

    &:nth-child(4) {
      margin: 10px 0 0 10px;
    }

    /* Be sure to update this if we add more items */
    &:nth-child(3) {
      border-right: none;
    }
  }
`;

const ExtraDetails = styled.div`
  padding: 10px 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  height: 45px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: row wrap;
    height: auto;
  }
`;

const StyledAddressLink = styled.a`
  color: var(--blue-03);
  font-size: 16px;
  padding-left: 8px;
  text-decoration: underline;

  &:hover {
    color: var(--blue-03);
    text-decoration: none;
  }
`;

const SymbolWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Col = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-flow: column nowrap;
  width: 50%;
  height: 100%;

  &:first-child {
    margin-right: 30px;
  }

  @media only screen and (max-width: 1280px) {
    width: 100%;
  }
`;

const Col2 = styled(Col)`
  min-height: 900px;
  justify-content: flex-end;
  padding-bottom: 24px;

  @media only screen and (max-width: 1280px) {
    min-height: auto;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-bottom: 10px;
  }
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding-top: 20px;
  width: 100%;
  margin-bottom: 20px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  height: 900px;

  @media only screen and (max-width: 1280px) {
    flex-flow: column nowrap;
    width: 100%;
    height: auto;
    align-items: flex-start;
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const NameWrapper = styled.div`
  display: flex;
  flex-flex: row nowrap;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    flex-flow: column nowrap;
    align-items: flex-start;
    width: 230px;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:first-child {
      margin-bottom: 8px;
    }
  }
`;

const GardenName = styled.div`
  height: 50px;
  font-family: cera-medium;
  font-size: 32px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 100%;
  padding-right: 10px;
  font-feature-settings: 'pnum' on, 'lnum' on;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 24px;
    width: 230px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 0;
  }
`;

const DetailsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const StyledLink = styled.span`
  text-underline-offset: 3px;
  margin-left: 4px;
  cursor: pointer;
  color: var(--white);
  text-decoration: underline;
  &:hover {
    color: var(--blue-03);
  }
`;

const CustomIcon = styled(Icon)`
  margin-left: 5px;
`;

const GardenSocialWrapper = styled.a`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 16px;

  &:hover {
    color: white;
    opacity: 0.8;
  }
  color: white;

  svg {
    margin-right: 4px;
  }
`;

export default React.memo(GardenDetailsBlock);
