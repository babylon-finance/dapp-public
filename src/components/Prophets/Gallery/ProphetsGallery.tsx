import { Icon, OpenSeaButton } from 'components/shared';
import { ProphetProfile } from './';
import { IconName } from 'models';

import { useHistory, useLocation } from 'react-router';
import styled from 'styled-components';
import React, { useState } from 'react';
import qs from 'query-string';

interface GalleryProps {
  isMobile: boolean;
}

const PROPHETS = 9000;
const PAGE_SIZE = 24;
const PAGE_COUNT = PROPHETS / PAGE_SIZE - 1;
const GREAT_PROPHETS_START = Math.floor(8000 / PAGE_SIZE);

const GalleryPageButton = ({ page, setPage, active }) => {
  return (
    <GalleryPage onClick={() => !active && setPage(page)} active={active}>
      {page + 1}
    </GalleryPage>
  );
};
const QuickLinkShortcut = ({ name, page, setPage, active, scrollToY, isMobile }) => {
  return (
    <QuickLink
      onClick={() => {
        setPage(page);
        window.scrollTo(0, scrollToY * (isMobile ? 2 : 1));
      }}
      active={active}
    >
      {name}
    </QuickLink>
  );
};

const ProphetsGallery = ({ isMobile }: GalleryProps) => {
  const prophetIds = Array(PROPHETS).fill(null);
  const history = useHistory();
  const location = useLocation();
  const urlParams = qs.parse(location.search);
  const [page, setPage] = useState<number>(Number(urlParams.page) || 0);
  const from = page * PAGE_SIZE;
  const to = (page + 1) * PAGE_SIZE;
  const pageProphets = prophetIds.slice(from, to);

  const updatePage = (page: number) => {
    const params = new URLSearchParams({ page: page.toString() });
    history.replace({ pathname: location.pathname, search: params.toString() });
    setPage(page);
  };

  return (
    <>
      <GalleryWrapper>
        <InnerWrapper>
          <HeaderSection>
            <HeaderTitle>Gallery</HeaderTitle>
            <OpenSeaButton />
            <QuickLinks>
              <QuickLinkShortcut
                active={page < GREAT_PROPHETS_START}
                name="Common Prophets"
                page={0}
                setPage={updatePage}
                scrollToY={0}
                isMobile={isMobile}
              />
              <QuickLinkShortcut
                active={page >= GREAT_PROPHETS_START && page < PAGE_COUNT}
                name="Great Prophets"
                page={GREAT_PROPHETS_START}
                setPage={updatePage}
                scrollToY={1200}
                isMobile={isMobile}
              />
              <QuickLinkShortcut
                scrollToY={2500}
                isMobile={isMobile}
                active={page === PAGE_COUNT}
                name="The Richest 7"
                page={PAGE_COUNT}
                setPage={updatePage}
              />
            </QuickLinks>
          </HeaderSection>
          <GalleryBody>
            {pageProphets.map((a: any, prophetId: number) => (
              <ProphetProfile small prophetId={from + prophetId + 1} />
            ))}
          </GalleryBody>
          <GalleryPages>
            <GalleryPagesCurrent>{`${from + 1}-${Math.min(9000, to + 1)} of 9000`}</GalleryPagesCurrent>
            <GalleryPagesButtons>
              {page > 0 && (
                <div onClick={() => updatePage(0)}>
                  <StyledLeft color="white" name={IconName.chevronDown} size={20} />
                </div>
              )}
              {page !== 0 && <GalleryPageButton page={0} active={page === 0} setPage={updatePage} />}
              {page > 1 && <GalleryPage block>...</GalleryPage>}
              {page > 1 && <GalleryPageButton page={page - 1} active={false} setPage={updatePage} />}
              <GalleryPageButton page={page} active setPage={updatePage} />
              {page < PAGE_COUNT - 1 && <GalleryPageButton page={page + 1} active={false} setPage={updatePage} />}
              {page < PAGE_COUNT - 1 && <GalleryPage block>...</GalleryPage>}
              {page !== PAGE_COUNT && (
                <GalleryPageButton page={PAGE_COUNT} active={page === PAGE_COUNT} setPage={updatePage} />
              )}
              {page < PAGE_COUNT && (
                <div onClick={() => updatePage(PAGE_COUNT)}>
                  <StyledRight color="white" name={IconName.chevronDown} size={20} />
                </div>
              )}
            </GalleryPagesButtons>
          </GalleryPages>
        </InnerWrapper>
      </GalleryWrapper>
    </>
  );
};

const GalleryWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  width: 100%;
  background-color: var(--blue-alt);
  min-height: 85vh;
  padding-bottom: 70px;
  background-image: url('/gallery-background.png');
  background-repeat: repeat-x;

  @media only screen and (max-width: 598px) {
    padding-left: 14px;
    background-image: url('/gallery-background-small.png');
  }
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  max-width: var(--screen-lg-min);
  padding: 30px;
  width: 100%;

  @media only screen and (max-width: 1440px) {
    padding: 40px 100px 0 100px;
  }

  @media only screen and (max-width: 598px) {
    padding: 40px 5px 0 20px;
  }
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 65px 0 12px 0;

  @media only screen and (max-width: 598px) {
    padding-top: 20px;
  }
`;

const QuickLinks = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  margin: 60px 0;

  @media only screen and (max-width: 598px) {
    > div {
      width: 100%;
      text-align: center;
      margin: 6px 0;
    }
    margin: 20px 0;
  }
`;

const QuickLink = styled.div<{ active: boolean }>`
  width: auto;
  margin: 0 60px;
  cursor: pointer;
  font-size: 18px;
  text-decoration: ${(p) => (p.active ? 'underline' : 'none')};
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderTitle = styled.div`
  font-size: 48px;
  line-height: 40px;
  margin-bottom: 10px;
  font-weight: bold;
`;

const GalleryBody = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  @media only screen and (max-width: 798px) {
    justify-content: center;
  }
`;

const GalleryPages = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  margin-top: 35px;
`;
const GalleryPagesCurrent = styled.div`
  font-size: 14px;
  colro: var(--blue-04);
  margin-right: 15px;
`;
const GalleryPagesButtons = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;
const GalleryPage = styled.div<{ active?: boolean; block?: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  margin: 0 5px;
  background: ${(p) => (p.active ? 'var(--purple-02)' : 'none')};

  &:hover {
    background: ${(p) => (!p.block ? 'var(--purple-02)' : 'none')};
    cursor: pointer;
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

export default React.memo(ProphetsGallery);
