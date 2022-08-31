import { GateKeeper } from 'components/shared/Icons';
import { Icon } from 'components/shared';
import { IconName } from 'models';

import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const AuditsBlock = () => {
  return (
    <AuditSectionWrapper>
      <GateKeeper size={145} pt={0} pb={0} />
      <SectionHeader>Security Audits</SectionHeader>
      <SectionContent>
        <div>
          Babylon is built on secure-by-design principles and is continually focused on reducing the attack surface area
          wherever possible. Completed audits and detailed security plan can be reviewed at the link below.
        </div>
        <Link to={{ pathname: RoutesExternal.audits }} target={'_blank'}>
          <DetailsLink>
            <LinkContent>View Audits</LinkContent>
          </DetailsLink>
        </Link>
      </SectionContent>
      <SectionHeader>Bug Bounty Program</SectionHeader>
      <SectionContent>
        <div>
          We have partnered with Immunefi to create a bounty program with up to a $100k in prizes for security
          researches.
        </div>
        <Link to={{ pathname: RoutesExternal.bounties }} target={'_blank'}>
          <DetailsLink>
            <Icon name={IconName.immunefi} />
            <LinkContent>View Bounties</LinkContent>
          </DetailsLink>
        </Link>
      </SectionContent>
    </AuditSectionWrapper>
  );
};

const AuditSectionWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  padding: 0 100px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 0;
  }
`;

const SectionHeader = styled.div`
  font-family: cera-bold;
  font-size: 36px;
  text-align: center;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100%;
    font-size: 24px;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding-bottom: 60px;

  &:last-child {
    border-bottom: 1px solid var(--border-blue);
  }

  > div {
    font-size: 18px;
    width: 50%;
    text-align: center;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    > div {
      width: 100%;
      font-size: 16px;
      padding: 0 0 0 40px;
      text-align: left;
    }
  }
`;

const DetailsLink = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 18px;
  font-family: cera-medium;
  color: var(--purple-aux);
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 15px;
  }
`;

const LinkContent = styled.div`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 0 0 8px 10px;
  height: 50px;
`;

export default React.memo(AuditsBlock);
