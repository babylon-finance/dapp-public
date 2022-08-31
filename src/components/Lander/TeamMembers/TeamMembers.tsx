import { ReactComponent as TwitterLogo } from 'icons/twitter_logo_small.svg';
import { ReactComponent as LinkedInLogo } from 'icons/linkedin_logo.svg';
import { ReactComponent as GithubLogo } from 'icons/github_logo.svg';
import { ReactComponent as WebLogo } from 'icons/web_logo.svg';

import { BREAKPOINTS } from 'config';

import React from 'react';
import styled from 'styled-components';

const TEAM_MEMBERS = ['rr', 'undfined', 'rriesco', 'ylv', 'sofi'];
const TeamLinks = {
  rr: {
    name: 'rrecuero',
    img: '/team/rrecuero.svg',
    twitter: 'https://twitter.com/ramonrecuero',
    linkedin: 'https://www.linkedin.com/in/ramonrecuero/',
    github: 'https://github.com/rrecuero',
    web: 'https://ramonrecuero.com/',
  },
  undfined: {
    name: 'undfined',
    twitter: 'https://twitter.com/denifdnu',
    github: 'https://github.com/undfined',
    img: '/team/undfined.svg',
  },
  rriesco: {
    name: 'rriesco',
    img: '/team/rriesco.svg',
    twitter: 'https://twitter.com/rriescog',
    linkedin: 'https://www.linkedin.com/in/raul-riesco-granadino',
    github: 'https://github.com/rriescog',
  },
  ylv: {
    name: 'ylv',
    img: '/team/ylv.svg',
    github: 'https://github.com/ylv-io',
    twitter: 'https://twitter.com/ylv_io',
  },
  sofi: {
    name: 'sofi',
    img: '/team/sofi.svg',
    linkedin: 'https://www.linkedin.com/in/sofi-vissani',
  },
};

const renderSocialIcon = (social: string, memberInfo: any, Icon: any) => {
  if (memberInfo[social]) {
    return (
      <a href={memberInfo[social]} target="_blank" rel="noopener noreferrer">
        <TeamMemberLinkIcon>
          <Icon />
        </TeamMemberLinkIcon>
      </a>
    );
  }
};

const TeamMembers = () => {
  return (
    <TeamSectionWrapper>
      <TeamSectionLabel>
        Meet the <Emphasize>core team</Emphasize>
      </TeamSectionLabel>
      <TeamSectionRow>
        <RowLabel>Members</RowLabel>
        {TEAM_MEMBERS.map((member: string) => (
          <TeamMemberItem key={member}>
            <TeamMemberImage src={TeamLinks[member].img} alt={member} />
            <TeamMemberName>{TeamLinks[member].name}</TeamMemberName>
            <TeamMemberLinks>
              {renderSocialIcon('web', TeamLinks[member], WebLogo)}
              {renderSocialIcon('twitter', TeamLinks[member], TwitterLogo)}
              {renderSocialIcon('linkedin', TeamLinks[member], LinkedInLogo)}
              {renderSocialIcon('github', TeamLinks[member], GithubLogo)}
            </TeamMemberLinks>
          </TeamMemberItem>
        ))}
      </TeamSectionRow>
      <ExperienceSectionRow>
        <RowLabel>Experience</RowLabel>
        <ExperienceWrapper>
          <ExperienceItem>
            <img src="/companies/ycombinator.svg" alt="yc-logo" />
          </ExperienceItem>
          <ExperienceItem>
            <img src="/companies/openzeppelin.svg" alt="oz-logo" />
          </ExperienceItem>
          <ExperienceItem>
            <img src="/companies/telefonica.svg" alt="tele-logo" />
          </ExperienceItem>
          <ExperienceItem>
            <img src="/companies/google.svg" alt="google-logo" />
          </ExperienceItem>
          <ExperienceItem>
            <img src="/companies/zynga.svg" alt="zynga-logo" />
          </ExperienceItem>
        </ExperienceWrapper>
      </ExperienceSectionRow>
    </TeamSectionWrapper>
  );
};

const RowLabel = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  flex-grow: 1;
  font-size: 18px;
  font-family: cera-medium;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    display: none;
  }
`;

const TeamMemberLinks = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0 20px;
`;

const TeamMemberLinkIcon = styled.div`
  display: flex;

  svg {
    width: 30px;
    height: 30px;
    fill: var(--white);
    opacity: 0.7;
    padding: 4px;
    &:hover {
      color: var(--white);
      opacity: 0.9;
    }
  }
`;

const TeamMemberName = styled.span`
  text-align: center;
  font-size: 18px;
  font-family: cera-bold;
  margin: 10px 0;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    font-size: 18px;
  }
`;

const TeamMemberImage = styled.img`
  width: 100px;
  height: 100px;
  background-color: white;
  border-radius: 50%;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 100px;
    height: 100px;
  }
`;

const TeamMemberItem = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 16%;
  padding: 10px 40px;

  @media only screen and (max-width: 1240px) {
    padding: 30px 40px 30px 40px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    width: 50%;
  }
`;

const ExperienceItem = styled.div`
  flex-grow: 1;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 20px 0;
    width: 50%;
  }
`;

const ExperienceWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    margin-top: 20px;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

const TeamSectionRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  padding: 40px 0;
  width: 100%;
  border-top: 1px solid var(--border-blue);

  &:last-child {
    border-bottom: 1px solid var(--border-blue);
    margin-bottom: 60px;
  }

  @media only screen and (max-width: 1240px) {
    margin-bottom: 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    justify-content: space-between;
  }
`;

const ExperienceSectionRow = styled(TeamSectionRow)`
  padding-bottom: 60px;

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    flex-flow: column nowrap;
    width: 100%;
  }
`;

const TeamSectionWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 100px 100px 0;
  min-height: 700px;
  width: 100%;

  @media only screen and (max-width: 1240px) {
    padding: 10px 10px 0 10px;
  }
`;

const TeamSectionLabel = styled.div`
  padding: 50px 20px 100px 20px;
  width: 100%;
  color: var(--white);
  font-family: cera-regular;
  font-size: 36px;
  text-align: center;

  @media only screen and (max-width: 1240px) {
    padding: 50px 0 20px 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.medium}) {
    padding: 30px;
    font-size: 24px;
  }
`;

const Emphasize = styled.span`
  font-family: cera-bold;
`;

export default React.memo(TeamMembers);
