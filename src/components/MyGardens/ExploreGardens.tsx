import StyledGarden from './svgs/styled_garden.svg';
import VerifiedGardenCard from './VerifiedGardenCard';
import VerifiedCarousel from './VerifiedCarousel';
import { GardenCreation } from 'components/garden/creation/';
import { Dropdown, FeatureTour, GardenRow, Icon, ToggleInput } from 'components/shared';

import { GardenDetails, GardenRowType, IconName } from 'models';
import { getPublicGardens } from './utils/getPublicGardens';
import { getSortedGardens } from './utils/getSortedGardens';
import { useW3Context } from 'context/W3Provider';

import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React, { useState } from 'react';
import { BREAKPOINTS } from 'config';

interface NewUserTourProps {
  target: React.ReactNode;
  showTour: boolean;
  disable: () => void;
}

const NewUserTour = ({ target, disable, showTour }: NewUserTourProps) => {
  return (
    <FeatureTour
      pad={false}
      ml={5}
      enabled={showTour && !isMobile}
      textPrimary={`DeFi Together`}
      textSecondary={`Join a garden, save on gas, consolidate transactions and build wealth together.`}
      disable={disable}
      illustration={<img alt="deposit-img" src={StyledGarden} />}
      children={target}
    />
  );
};

interface CreateGardenCardProps {
  button: React.ReactNode;
}

const CreateGardenCard = ({ button }: CreateGardenCardProps) => {
  return (
    <CreateGardenContainer>
      <img src={'/halo_tower.png'} alt={'creation-img'} height={'136px'} />
      <CreateContent>Create a supercharged investment DAO in just minutes.</CreateContent>
      <CreateButtonRow>{button}</CreateButtonRow>
    </CreateGardenContainer>
  );
};

interface ExploreGardensProps {
  gardens: GardenDetails[];
  fetchData: (force: boolean) => void;
}

const SORT_OPTIONS = [
  { value: 'principal', label: 'Principal' },
  { value: 'members', label: 'Members' },
  { value: 'vapr', label: 'vAPR' },
  { value: '30d', label: '30D' },
];

const ExploreGardens = ({ gardens, fetchData }: ExploreGardensProps) => {
  const [fiat, setFiat] = useState<boolean>(true);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);

  const { admin, quotes, userPrefs, updateUserPrefs } = useW3Context();

  // Handles filter for public, greater than 1, and 10k minimum principal
  const sorted = getSortedGardens(getPublicGardens(gardens, quotes, admin), quotes, sort);
  const verified = getSortedGardens(
    gardens.filter((g) => g.verified > 0),
    quotes,
    SORT_OPTIONS[0].value,
  ).slice(0, 3);

  const disableNewUserTour = async () => {
    if (userPrefs) {
      updateUserPrefs({ ...userPrefs, hideNewUserTour: true });
    }
  };

  return (
    <ExploreGardensContainer>
      <ContainerLarge>
        <HeaderSection>
          <HeaderTitle>Explore Gardens</HeaderTitle>
          {verified.length === 3 && (
            <VerfiedGardens>
              <CarouselConatiner>
                <VerifiedCarousel
                  overrides={{ slidesToScroll: 0, slidesToShow: 3 }}
                  children={verified.map((garden) => (
                    <VerifiedGardenCard key={garden.address} garden={garden} />
                  ))}
                />
              </CarouselConatiner>
              {!isMobile && (
                <CreateCardContainer>
                  <CreateGardenCard button={<GardenCreation refetch={() => fetchData(true)} />} />
                </CreateCardContainer>
              )}
            </VerfiedGardens>
          )}
          {!isMobile && (
            <FilterRow>
              <LearnMore>
                <LearnMoreText>
                  Displaying public gardens created by the community with at least 2 members and $10K AUM. DYOR before
                  depositing.{' '}
                </LearnMoreText>
                <TourContainer>
                  <NewUserTour
                    disable={disableNewUserTour}
                    showTour={false && (userPrefs ? userPrefs?.hideNewUserTour === false : true)}
                    target={
                      <StyledLink href="https://docs.babylon.finance" target="_blank" rel="noopener noreferrer">
                        Learn more
                      </StyledLink>
                    }
                  />
                </TourContainer>
              </LearnMore>
              <FilterWrapper>
                <ToggleWrapper>
                  <ToggleInput
                    label="Fiat"
                    tooltip={'Display position values in preferred fiat conversion.'}
                    name="fiat"
                    required
                    checked={fiat}
                    onChange={(e: React.ChangeEvent<any>) => {
                      setFiat(!fiat);
                    }}
                  />
                </ToggleWrapper>
                <SortWrapper>
                  <Icon name={IconName.bars} size={24} />
                  <span>Sort by</span>
                  <StyledDropdown
                    name="Sort"
                    isSearchable={false}
                    stateCallback={(selected: any) => setSort(selected.value)}
                    options={SORT_OPTIONS}
                    preselectedOptions={[SORT_OPTIONS[0]]}
                  />
                </SortWrapper>
              </FilterWrapper>
            </FilterRow>
          )}
        </HeaderSection>
      </ContainerLarge>
      <SecondaryContentWrapper>
        <ContainerLarge>
          <LabelRow>
            <LabelItem width={isMobile ? 26 : 50}></LabelItem>
            <LabelItem width={isMobile ? 135 : 250}>Name</LabelItem>
            {!isMobile && <LabelItem width={200}>Category</LabelItem>}
            {!isMobile && <LabelItem width={125}>Members</LabelItem>}
            <LabelItem width={isMobile ? 75 : 150}>NAV</LabelItem>
            {!isMobile && <LabelItem width={125}>30D</LabelItem>}
            <LabelItem width={isMobile ? 75 : 125}>vAPR</LabelItem>
          </LabelRow>
          {sorted.length > 0 && (
            <>
              {sorted?.map((garden: GardenDetails) => (
                <GardenRow key={garden.address} garden={garden} rowType={GardenRowType.base} fiat={fiat} />
              ))}
            </>
          )}
        </ContainerLarge>
      </SecondaryContentWrapper>
    </ExploreGardensContainer>
  );
};

const CreateContent = styled.div`
  text-align: center;
  width: 75%;
  font-family: cera-medium;
  padding: 20px 0;
`;

const CreateButtonRow = styled.div`
  margin-top: 20px;
`;

const CarouselConatiner = styled.div`
  width: 77%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const CreateCardContainer = styled.div`
  padding-top: 50px;
  margin-left: auto;
`;

const VerfiedGardens = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 30px 0 50px 0;
  width: 100%;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin: 0 0 30px 0;
  }
`;

const StyledLink = styled.a`
  margin-right: 4px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ToggleWrapper = styled.div`
  padding-right: 30px;
  margin-left: auto;
`;

const LabelRow = styled.div`
  padding-left: 30px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  height: 40px;
  align-items: center;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: 5px;
  }
`;

const LabelItem = styled.div<{ width?: number }>`
  width: ${(p) => (p.width ? `${p.width}px` : '100px')};
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const ExploreGardensContainer = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  min-height: 80vh;
  margin-bottom: 50px;
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  border-bottom: 1px solid var(--blue-05);
  padding-bottom: 12px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0;
  }
`;

const HeaderTitle = styled.div`
  font-size: 28px;
  font-family: cera-medium;
  line-height: 40px;
  margin-bottom: 10px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 22px;
  }
`;

const LearnMore = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  align-items: center;
`;

const LearnMoreText = styled.span`
  font-size: 13px;
  color: var(--blue-03);
`;

const TourContainer = styled.div`
  width: 100px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-end;

  a {
    color: var(--purple-02);
    margin-left: 5px;
    font-size: 13px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-left: auto;
  justify-content: flex-end;
`;

const SortWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 15px;
  color: white;
`;

const StyledDropdown = styled(Dropdown)`
  width: 150px;
  min-width: 170px;
  margin-left: 8px;
  margin-top: -8px;
`;

const SecondaryContentWrapper = styled.div`
  width: 100%;
  background-color: var(--blue-alt);
  padding-top: 40px;
  background-color: transparent;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-top: 10px;
  }

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

const CreateGardenContainer = styled.div`
  background-color: var(--blue-07);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column nowrap;
  height: 400px;
  padding: 10px;
  width: 320px;
`;

const ContainerLarge = styled.div`
  position: relative;
  width: 100%;
  margin: 0 auto;

  @media only screen and (max-width: 1440px) {
    width: 100%;
  }

  @media only screen and (max-width: 1240px) {
    padding: 20px 30px 0 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0;
  }
`;

export default React.memo(ExploreGardens);
