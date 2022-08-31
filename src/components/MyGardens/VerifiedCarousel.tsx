import { Icon, HoverTooltip } from 'components/shared';

import { IconName } from 'models';

import Slider from 'react-slick';
import styled from 'styled-components';
import React, { useState } from 'react';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { isMobile } from 'react-device-detect';

interface SliderOverrides {
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
}

const carouselSettings = {
  arrows: false,
  infinite: true,
  lazyLoad: true,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
};

interface ArrowButtonProps {
  direction: 'next' | 'prev';
  onClick(): void;
}

const ArrowButton = ({ onClick, direction }: ArrowButtonProps) => {
  return (
    <ArrowContainer onClick={onClick}>
      <Icon size={18} name={IconName.arrowDown} rotate={direction === 'next' ? -90 : 90} color={'var(--white)'} />
    </ArrowContainer>
  );
};

interface VerfiedCarouselProps {
  children: React.ReactNode;
  overrides?: SliderOverrides;
  back?: boolean;
}

const VerifiedCarousel = ({ children, overrides, back }: VerfiedCarouselProps) => {
  const [sliderRef, setSliderRef] = useState<any | null>(null);

  return (
    <SliderContainer>
      <HeaderRow>
        <HeaderText>
          <DetailIcon>
            <HoverTooltip
              icon={IconName.check}
              size={20}
              color={'var(--white)'}
              content={'These Gardens have been verified by the Babylon community through an on-chain governance vote.'}
              placement={'up'}
            />
          </DetailIcon>
          <span>Verified Gardens</span>
        </HeaderText>
        {/* <NextWrapper>
          <ArrowButton direction={'next'} onClick={sliderRef?.slickNext} />
        </NextWrapper> */}
      </HeaderRow>
      {isMobile && <MobileCards>{children}</MobileCards>}
      {!isMobile && (
        <Slider ref={setSliderRef} {...{ ...carouselSettings, ...overrides }}>
          {children}
        </Slider>
      )}
    </SliderContainer>
  );
};

const MobileCards = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;

  > div {
    margin-top: 20px;

    &:first-child {
      margin: 0;
    }
  }
`;

const HeaderText = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  span {
    font-size: 18px;
    font-family: cera-bold;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
`;

const NextWrapper = styled.div`
  margin-left: auto;
  padding-right: 30px;
`;

const ArrowContainer = styled.div`
  width: 30px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const DetailIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  height: 22px;
  width: 22px;
  border-radius: 11px;
  background-color: var(--purple-07);
`;

export default React.memo(VerifiedCarousel);
