import { BREAKPOINTS } from 'config';
import React from 'react';
import styled from 'styled-components';
import { ReactComponent as ManWithAnphora } from './anphora.svg';

enum ExternalTarget {
  JYOUNG,
  DIALECTIC,
  FOMOSAURUS,
  HARVEST,
  SEMANTIC,
  COINSHARES,
  MAPLELEAF,
}

interface InvestorType {
  target: ExternalTarget;
  icon: string;
}

const getTargetLink = (target: ExternalTarget) => {
  switch (target) {
    case ExternalTarget.DIALECTIC:
      return 'https://dialectic.ch/';
    case ExternalTarget.FOMOSAURUS:
      return 'https://twitter.com/fomosaurus';
    case ExternalTarget.MAPLELEAF:
      return 'https://twitter.com/MapleLeafCap';
    case ExternalTarget.JYOUNG:
      return 'https://twitter.com/iamjosephyoung';
    case ExternalTarget.HARVEST:
      return 'https://harvest.finance/';
    case ExternalTarget.COINSHARES:
      return 'https://coinshares.com/';
    case ExternalTarget.SEMANTIC:
      return 'https://www.semantic.vc/';
  }
};

const Investors = () => {
  const investors = [
    { target: ExternalTarget.SEMANTIC, icon: './investors/Investors_04.png' },
    { target: ExternalTarget.DIALECTIC, icon: './investors/Investors_07.png' },
    { target: ExternalTarget.JYOUNG, icon: './investors/Investors_03.png' },
    { target: ExternalTarget.FOMOSAURUS, icon: './investors/Investors_01.png' },
    { target: ExternalTarget.MAPLELEAF, icon: './investors/Investors_05.png' },
    { target: ExternalTarget.HARVEST, icon: './investors/Investors_06.png' },
  ];

  const renderInvestor = ({ target, icon }: InvestorType) => (
    <a href={getTargetLink(target)} target="_blank" rel="noopener noreferrer">
      <InvestorIconBlock>
        <InvestorIcon src={icon} alt={icon} />
      </InvestorIconBlock>
    </a>
  );

  return (
    <InvestorsContainer>
      <IconWrapper>
        <ManWithAnphora />
      </IconWrapper>
      <InvestorsLabelWrapper>Backed by world-class investors</InvestorsLabelWrapper>
      <InvestorShowcaseRow>
        {investors.map((investor: InvestorType) => (
          <InvestorItem key={investor.target}>{renderInvestor(investor)}</InvestorItem>
        ))}
      </InvestorShowcaseRow>
    </InvestorsContainer>
  );
};

const InvestorIcon = styled.img`
  width: 100%;

  &:hover {
    opacity: 0.6;
  }
`;

const IconWrapper = styled.div`
  width: 90px;
  height: auto;

  svg {
    width: 90px;
  }
`;

const InvestorIconBlock = styled.div`
  width: 200px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const InvestorItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 50%;
  }
`;

const InvestorShowcaseRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 20px 100px;

  @media only screen and (max-width: 1240px) {
    padding: 0;
    flex-flow: row wrap;
    justify-content: center;
  }
`;

const InvestorsContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  padding: 60px 0 100px;

  @media only screen and (max-width: 1240px) {
    margin-top: 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    margin-top: 0;
  }
`;

const InvestorsLabelWrapper = styled.div`
  padding: 40px 20px 45px;
  width: 100%;
  color: var(--white);
  font-family: cera-regular;
  font-size: 32px;
  text-align: center;
  font-weight: 700;

  @media only screen and (max-width: 1240px) {
    padding: 30px 0 20px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 0 0 30px;
    font-size: 28px;
  }
`;

export default React.memo(Investors);
