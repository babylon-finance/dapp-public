import WheatShareImage from 'components/garden/detail/components/illustrations/wheat_share.svg';
import { BREAKPOINTS } from 'config';

import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';

const AltPositionContent = () => {
  return (
    <ContentRow>
      <InnerContainer width={'100%'}>
        <ImgRow>
          <ImgText>
            <span>Save gas, consolidate your transactions, and build wealth together.</span>
          </ImgText>
          <ImgWrapper>
            <img alt="deposit-img" src={WheatShareImage} height={isMobile ? '90%' : '100%'} />
          </ImgWrapper>
        </ImgRow>
      </InnerContainer>
    </ContentRow>
  );
};

const ImgText = styled.div`
  width: 75%;

  > span {
    font-size: 24px;
    font-family: cera-medium;

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      font-size: 18px;
    }
  }
`;

const ImgWrapper = styled.div`
  width: 25%;
  display: flex;
  justify-content: flex-end;
`;

const ImgRow = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-content: center;

  > span {
    padding-right: 25px;
  }
`;

const ContentRow = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const InnerContainer = styled.div<{ width: string }>`
  height: 100%;
  padding: 0 30px;
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
`;

export default React.memo(AltPositionContent);
