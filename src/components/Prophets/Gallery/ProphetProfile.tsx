import ProphetImage from './ProphetImage';
import { BablRewardIcon, DepositIcon } from 'components/shared/Icons';
import { Icon, BaseLoader, OpenSeaButton } from 'components/shared/';

import ProphetsJson from '../contracts/Prophets.json';
import { IconName } from 'models';
import { PROPHET_ADDRESS, PROPHETS_MINTED, GREAT_PROPHETS_MINTED } from 'config';
import { getProphetObject } from './utils/getProphetObject';
import { useW3Context } from 'context/W3Provider';

import Tooltip from 'react-tooltip-lite';
import styled from 'styled-components';
import { Contract } from '@ethersproject/contracts';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

interface ProphetProfileProps {
  match?: any;
  small?: boolean;
  bid?: boolean;
  noInfo?: boolean;
  prophetId?: number;
  actions?: boolean;
  thumb?: boolean;
  stake?: boolean;
  staked?: boolean;
}

const ProphetBonusCoins = ({ value }) => {
  return (
    <ProphetCoinsWrapper>
      <ProphetCoin>
        <Icon size={22} name={IconName.coin} />
        {value < 1 && <CoinFiller pixels={Math.floor(22 * value)} />}
      </ProphetCoin>
      <ProphetCoin>
        <Icon size={22} name={IconName.coin} />
        {value < 2 && <CoinFiller pixels={Math.floor(22 * (value - 1))} />}
      </ProphetCoin>
      <ProphetCoin>
        <Icon size={22} name={IconName.coin} />
        {value < 3 && <CoinFiller pixels={Math.floor(22 * (value - 2))} />}
      </ProphetCoin>
      <ProphetCoin>
        <Icon size={22} name={IconName.coin} />
        {value < 4 && <CoinFiller pixels={Math.floor(22 * (value - 3))} />}
      </ProphetCoin>
      <ProphetCoin>
        <Icon size={22} name={IconName.coin} />
        {value < 5 && <CoinFiller pixels={Math.floor(22 * (value - 4))} />}
      </ProphetCoin>
    </ProphetCoinsWrapper>
  );
};

const ProphetReward = ({ title, icon, value, claimed }) => {
  return (
    <ProphetRewardOuterWrapper>
      <ProphetRewardTitle>{title}</ProphetRewardTitle>
      <ProphetRewardWrapper>
        {icon}
        <ProphetRewardValue red={claimed}>{value}</ProphetRewardValue>
      </ProphetRewardWrapper>
    </ProphetRewardOuterWrapper>
  );
};

const ProphetBonus = ({ kind, value }) => {
  const iconName = {
    lp: IconName.babNeutral,
    voter: IconName.steward,
    strategist: IconName.strategist,
    creator: IconName.garden,
  }[kind];
  return (
    <ProphetBonusWrapper>
      <ProphetBonusKind>
        <Icon size={30} name={iconName} />
        <ProphetKindName>{kind}</ProphetKindName>
      </ProphetBonusKind>
      <ProphetBonusValue>
        <ProphetBonusCoins value={value} />
        <ProphetBonusPercentage>{value}%</ProphetBonusPercentage>
      </ProphetBonusValue>
    </ProphetBonusWrapper>
  );
};

const MiniProphetProfile = ({ prophetObject, dead }) => {
  const prophetId = prophetObject.attributes.id;
  return (
    <MiniProphetProfileWrapper>
      <Link to={`/prophets/gallery/${prophetId}`}>
        <MiniInnerWrapper>
          <ProphetImageSmallStyled dead={dead} hover image={prophetObject.image} />
          <ProphetName small>
            {dead ? 'Dead ' : ''}
            {prophetObject.name}
          </ProphetName>
          <ProphetBabl>{prophetObject.attributes.babl} BABL</ProphetBabl>
        </MiniInnerWrapper>
      </Link>
    </MiniProphetProfileWrapper>
  );
};

const MiniBidProphetProfile = ({ prophetObject }) => {
  const prophetId = prophetObject.attributes.id;
  return (
    <MiniBidProphetProfileWrapper>
      <Link to={`/prophets/gallery/${prophetId}`}>
        <MiniInnerWrapper>
          <ProphetImageMiniBidStyled image={prophetObject.image} />
        </MiniInnerWrapper>
      </Link>
    </MiniBidProphetProfileWrapper>
  );
};

const BidProphetProfile = ({ prophetObject }) => {
  const prophetId = prophetObject.attributes.id;
  return (
    <BidProphetProfileWrapper>
      <Link to={`/prophets/gallery/${prophetId}`}>
        <MiniInnerWrapper>
          <ProphetImageBidStyled hover image={prophetObject.image} />
          <ProphetName small>
            {prophetObject.name} <span>#{prophetId}</span>
          </ProphetName>
          <ProphetRewardsSmall>
            <ProphetReward
              claimed={false}
              title="BABL loot"
              icon={<BablRewardIcon size={20} />}
              value={`${prophetObject.attributes.babl} BABL`}
            />
            <ProphetReward
              claimed={false}
              title="Floor price"
              icon={<DepositIcon size={20} />}
              value={`${prophetObject.attributes.floorPrice} ETH`}
            />
          </ProphetRewardsSmall>
        </MiniInnerWrapper>
      </Link>
    </BidProphetProfileWrapper>
  );
};

interface StakeRowProps {
  prophetObject: any;
  noName?: boolean;
}

const StakeRowProfile = ({ prophetObject }: StakeRowProps) => {
  return (
    <RowProphetProfileWrapper>
      <RowInnerWrapper>
        <ProphetImageSmallRow dead={false} image={prophetObject.image} />
        <StakeProphetContent>
          <ProphetNameRow>{prophetObject.name}</ProphetNameRow>
          <ProphetBonusMini>LP Bonus: {prophetObject.attributes.lpBonus}%</ProphetBonusMini>
        </StakeProphetContent>
      </RowInnerWrapper>
    </RowProphetProfileWrapper>
  );
};

const StakedRowProfile = ({ prophetObject }: StakeRowProps) => {
  return (
    <Tooltip content={`You have staked ${prophetObject.name}!`} zIndex={20000000} direction={'up'}>
      <RowProphetProfileWrapper>
        <RowInnerWrapper>
          <ProphetImageSmallRow image={prophetObject.image} />
        </RowInnerWrapper>
      </RowProphetProfileWrapper>
    </Tooltip>
  );
};

const ProphetProfile = ({
  match,
  small,
  bid,
  prophetId,
  noInfo,
  stake,
  staked,
  actions = true,
}: ProphetProfileProps) => {
  const { mintedImages, provider } = useW3Context();
  const [claimed, setClaimed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const prophetIdO = Number(match?.params?.id) || prophetId || 1;
  const prophetObject = getProphetObject(prophetIdO, mintedImages || []);
  const dead = prophetIdO > PROPHETS_MINTED && prophetIdO < 8001;

  useEffect(() => {
    const checkClaim = async () => {
      const prophetContract = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, provider);
      if (dead) {
        setClaimed(true);
      } else {
        setClaimed(await prophetContract.prophetsBABLClaimed(prophetIdO));
      }
      setLoading(false);
    };
    if (!stake && !staked) {
      checkClaim();
    }
  }, [prophetId]);

  if (noInfo) {
    return <MiniBidProphetProfile prophetObject={prophetObject} />;
  }
  if (small) {
    return <MiniProphetProfile prophetObject={prophetObject} dead={dead} />;
  }
  if (bid) {
    return <BidProphetProfile prophetObject={prophetObject} />;
  }
  if (stake) {
    return <StakeRowProfile prophetObject={prophetObject} />;
  }
  if (staked) {
    return <StakedRowProfile prophetObject={prophetObject} />;
  }
  const showName = window.location.href.indexOf('showName') !== -1;
  return (
    <ProphetProfilePage actions={actions}>
      <ProphetProfileInner>
        <ProfileHeader actions={actions}>
          {actions && <StyledLink to="/prophets/gallery">Back to Gallery</StyledLink>}
          <ProphetProfileTitle>{prophetObject.name}</ProphetProfileTitle>
        </ProfileHeader>
        {actions && (
          <ProphetProfileButtons>
            {prophetIdO > 1 ? (
              <Link to={`/prophets/gallery/${prophetIdO - 1}`}>
                <StyledLeft color="white" name={IconName.chevronDown} size={20} />
              </Link>
            ) : (
              <div />
            )}
            {prophetIdO < 9000 && (
              <Link to={`/prophets/gallery/${prophetIdO + 1}`}>
                <StyledRight color="white" name={IconName.chevronDown} size={20} />
              </Link>
            )}
          </ProphetProfileButtons>
        )}
        <ProphetProfileWrapper>
          <ProphetImageStyled image={prophetObject.image} dead={dead} />
          <ProphetAttributesWrapper>
            {showName && (
              <ProphetName>
                {dead ? 'Dead ' : ''}
                {prophetObject.name}
              </ProphetName>
            )}
            {loading && <BaseLoader size={30} />}
            {!loading && (
              <ProphetRewards>
                <ProphetReward
                  title="BABL loot"
                  icon={<BablRewardIcon size={30} />}
                  claimed={claimed}
                  value={`${claimed ? 'CLAIMED' : prophetObject.attributes.babl + ' BABL'}`}
                />
                <ProphetReward
                  title="Original Floor"
                  claimed={false}
                  icon={<DepositIcon size={30} />}
                  value={`${prophetObject.attributes.floorPrice} ETH`}
                />
              </ProphetRewards>
            )}
            <ProtocolBonuses>
              <ProtocolBonusesHeader>Protocol Bonuses</ProtocolBonusesHeader>
              <ProphetBonus kind="lp" value={prophetObject.attributes.lpBonus} />
              <ProphetBonus kind="voter" value={prophetObject.attributes.voterBonus} />
              <ProphetBonus kind="strategist" value={prophetObject.attributes.strategistBonus} />
              <ProphetBonus kind="creator" value={prophetObject.attributes.creatorBonus} />
            </ProtocolBonuses>
            <ProphetButtons>
              {(prophetIdO <= 8000 || GREAT_PROPHETS_MINTED.indexOf(prophetIdO.toString()) !== -1) && (
                <OpenSeaButton id={prophetIdO} />
              )}
            </ProphetButtons>
          </ProphetAttributesWrapper>
        </ProphetProfileWrapper>
      </ProphetProfileInner>
    </ProphetProfilePage>
  );
};

const ProphetProfilePage = styled.div<{ actions: boolean }>`
  display: flex;
  background-color: ${(p) => (p.actions ? 'var(--blue-alt)' : 'transparent')};
  min-height: ${(p) => (p.actions ? '85vh' : 'inherit')};
  flex-flow: column nowrap;
  width: 100%;
  align-items: center;
  background-image: ${(p) => (p.actions ? `url('/gallery-background.png')` : 'none')};
  background-repeat: repeat-x;

  @media only screen and (max-width: 598px) {
    background-image: url('/gallery-background-small.png');
  }
`;

const ProphetProfileInner = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  max-width: var(--screen-lg-min);

  @media only screen and (max-width: 1440px) {
    padding: 40px 100px 0 100px;
  }
  @media only screen and (max-width: 598px) {
    padding: 20px 0;
  }
`;

const ProfileHeader = styled.div<{ actions: boolean }>`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 12px;
  padding-top: ${(p) => (p.actions ? '60px' : '0px')};

  @media only screen and (max-width: 1440px) {
    padding-top: 20px;
  }
`;
const StyledLink = styled(Link)`
  color: white;
  font-size: 18px;
  margin-left: 40px;

  &:visited,
  &:hover,
  &:active {
    color: white;
  }

  &:hover {
    text-decoration: underline;
  }

  @media only screen and (max-width: 598px) {
    width: 100%;
    text-align: center;
    margin-left: 0px;
  }
`;

const ProphetProfileTitle = styled.div`
  font-size: 32px;
  line-height: 40px;
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
  font-weight: bold;

  @media only screen and (max-width: 598px) {
    font-size: 26px;
    margin-top: 30px;
  }
`;

const ProphetButtons = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  a:first-child {
    margin-right: 30px;
  }

  a button {
    width: 100%;

    > span {
      flex-flow: row nowrap;
      display: flex;
      align-items: center;

      > div {
        margin-left: 5px;
      }
    }
  }

  @media only screen and (max-width: 598px) {
    flex-flow: row wrap;
    a:first-child {
      margin-right: 0px;
    }

    a {
      width: 100%;
      display: flex;
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
`;

// mask: repeating-conic-gradient(#000 0% 4%, transparent 0% 8%);
// background: linear-gradient(0deg, #4420d8, #4420d8), #ffffff;

const ProphetProfileWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  width: 100%;
  color: white;
  padding: 30px 0;

  @media only screen and (max-width: 598px) {
    padding: 20px;
    width: calc(100%);
  }
`;

const ProphetImageStyled = styled(ProphetImage)`
  max-width: 546px;
  max-height: 546px;
  width: 100%;
  height: auto;
  margin: 10px 0;
  overflow: hidden;
`;

const ProphetAttributesWrapper = styled.div`
  max-width: 598px;
  width: 100%;
  max-height: 546px;
  margin: 10px 0 10px 10px;
  padding: 45px 55px;
  background: var(--primary);
  border-radius: 21px;
  display: flex;
  flex-flow: column nowrap;

  @media only screen and (max-width: 598px) {
    padding: 45px 10px 10px;
    margin: 10px 0 10px 5px;
    height: auto;
    max-height: 2000px;
  }
`;

const ProphetName = styled.div<{ small?: boolean }>`
  font-weight: bold;
  font-style: normal;
  font-size: ${(p) => (p.small ? '24px' : '38px')};
  margin-top: ${(p) => (p.small ? '16px' : '0')};
  width: 100%;
  text-align: center;
  margin-bottom: ${(p) => (p.small ? '2px' : '33px')};

  span {
    color: var(--blue-03);
  }
`;

const ProphetNameRow = styled.div`
  font-family: cera-medium;
  font-size: 18px;
  padding-left: 10px;
`;

const ProphetBabl = styled.div`
  font-size: 16px;
  color: var(--blue-03);
`;

const ProphetRewards = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row nowrap;

  @media only screen and (max-width: 598px) {
    flex-flow: row wrap;
  }
`;

const ProphetRewardOuterWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: space-between;
  margin-bottom: 5px;
`;

const ProphetRewardTitle = styled.div`
  font-size: 18px;
  color: var(--blue-04);
  text-align: left;
`;

const ProphetRewardWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row nowrap;
  margin-bottom: 35px;
  border-radius: 6px;
  background: var(--purple);
  padding: 10px 10px;
  margin-right: 28px;
  min-width: 190px;

  > div:first-child {
    padding: 10px;
  }

  @media only screen and (max-width: 598px) {
    width: 100%;
    margin: 5px 0 15px;
  }
`;

const ProphetRewardValue = styled.div<{ red: boolean }>`
  font-size: 28px;
  margin-left: 2px;

  color: ${(p) => (p.red ? 'var(--negative)' : 'white')};
`;

const ProtocolBonuses = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;

  @media only screen and (max-width: 598px) {
    margin-top: 20px;
  }
`;

const ProtocolBonusesHeader = styled.div`
  width: 100%;
  font-size: 24px;
  color: var(--blue-04);
  padding-bottom: 10px;
`;

const ProphetBonusWrapper = styled.div`
  width: 100%;
  height: 55px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--blue-04);
`;

const ProphetBonusKind = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const ProphetKindName = styled.div`
  font-size: 28px;
  color: var(--purple-06);
  text-transform: capitalize;
  margin-left: 12px;
  width: 160px;

  @media only screen and (max-width: 598px) {
    font-size: 16px;
    width: 100px;
  }
`;

const ProphetBonusValue = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const ProphetBonusPercentage = styled.div`
  font-size: 26px;
  margin-left: 10px;
  width: 70px;

  @media only screen and (max-width: 598px) {
    font-size: 16px;
  }
`;

const ProphetCoinsWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const ProphetCoin = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  margin-right: 6px;
  overflow: hidden;
  position: relative;

  @media only screen and (max-width: 598px) {
    margin-right: 3px;
  }
`;

const CoinFiller = styled.div<{ pixels: number }>`
  position: absolute;
  background-color: var(--purple);
  width: 22px;
  height: 22px;
  right: ${(p) => `-${p.pixels}px`};
  top: 0;
`;

const RowProphetProfileWrapper = styled.div<{ thumb?: boolean }>``;

const MiniProphetProfileWrapper = styled.div<{ thumb?: boolean }>`
  width: 26vw;
  height: 26vw;
  min-width: ${(p) => (p.thumb ? '0' : '360px')};
  min-height: ${(p) => (p.thumb ? '0' : '360px')};
  max-width: 410px;
  margin: ${(p) => (p.thumb ? '0' : '30px 30px 0 0')};
  cursor: pointer;
  background: ${(p) => (p.thumb ? 'transparent' : 'var(--blue-alt)')};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
  height: auto;
  padding: 10px;
  color: white;

  &:hover img {
    opacity: 0.7;
  }

  &:first-child {
    margin-left: 0;
  }

  a {
    display: flex;
    width: 100%;
  }
`;

const MiniBidProphetProfileWrapper = styled.div`
  width: 56px;
  height: 56px;
  cursor: pointer;
  background: var(--blue-alt);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
  height: auto;
  color: white;

  &:hover img {
    opacity: 0.7;
  }

  &:first-child {
    margin-left: 0;
  }

  a {
    display: flex;
    width: 100%;
  }
`;

const ProphetProfileButtons = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 20px 0;

  a {
    color: white;
    cursor: pointer;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }

  padding: 0 30px;

  @media only screen and (max-width: 598px) {
    padding: 0 20px;
  }
`;

const RowInnerWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  color: white;
`;

const MiniInnerWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex-flow: column nowrap;
  color: white;
  overflow: visible;

  @media only screen and (max-width: 598px) {
    overflow: visible;
  }
`;

const StyledLeft = styled(Icon)`
  transform: rotate(90deg);
  cursor: pointer;

  &:hover {
    svg path {
      fill: var(--purple-02) !important;
    }
  }
`;
const StyledRight = styled(Icon)`
  transform: rotate(-90deg);
  cursor: pointer;

  &:hover {
    svg path {
      fill: var(--purple-02) !important;
    }
  }
`;

const BidProphetProfileWrapper = styled(MiniProphetProfileWrapper)`
  width: 380px;
  height: auto;
  cursor: pointer;
  background: transparent;
  margin: 0;
`;

const ProphetRewardsSmall = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  font-size: 15px;
  align-items: center;
  justify-content: space-between;
  color: white;

  > div {
    width: 150px;
    height: 80px;

    > div:last-child {
      min-width: 150px;
    }
  }

  div {
    font-size: 18px;
  }
`;
const StakeProphetContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const ProphetBonusMini = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding-left: 10px;
  font-size: 16px;
  color: var(--blue-03);
`;

const ProphetImageSmallStyled = styled(ProphetImage)``;

const ProphetImageSmallRow = styled(ProphetImage)`
  border: none;
  border-radius: 0;
  height: 50px;
  width: 50px;
`;

const ProphetImageBidStyled = styled(ProphetImage)`
  width: 380px !important;
  height: auto;
  border: none;
  border-radius: 0px;
`;

const ProphetImageMiniBidStyled = styled(ProphetImage)`
  border-radius: 5px !important;
`;

export default React.memo(ProphetProfile);
