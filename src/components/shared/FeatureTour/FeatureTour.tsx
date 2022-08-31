import { Icon } from '../';
import { IconName } from 'models';

import styled from 'styled-components';
import React, { useState } from 'react';
import { isMobile } from 'react-device-detect';

interface FeatureTourProps {
  children: React.ReactNode;
  illustration?: React.ReactNode;
  textPrimary: string;
  textSecondary?: string;
  enabled: boolean;
  pad?: boolean;
  ml?: number; // margin-left
  mr?: number; // margin-right
  width?: number;
  disable: () => void;
}

const OVERLAY_INDEX = 10;

const FeatureTour = ({
  children,
  enabled,
  illustration,
  disable,
  textPrimary,
  textSecondary,
  pad = true,
  ml,
  mr,
  width,
}: FeatureTourProps) => {
  const [hide, setHide] = useState<boolean>(false);

  return (
    <FeatureTourWrapper ml={ml || 0} mr={mr || 0} width={width}>
      {enabled && !hide && <FeatureTourOverlay />}
      <ChildWrapper pad={pad} enabled={enabled && !hide}>
        {children}
      </ChildWrapper>
      {enabled && !hide && (
        <FeatureTourContent>
          <ContentPointer />
          <FeatureTourTip>
            <TourTipRow>
              <ExitWrapper
                onClick={() => {
                  disable();
                  setHide(true);
                }}
              >
                <Icon name={IconName.xLarge} size={20} />
              </ExitWrapper>
            </TourTipRow>
            <TourImageRow>{illustration}</TourImageRow>
            <TourTipRow>
              <TipTextPrimary>{textPrimary}</TipTextPrimary>
            </TourTipRow>
            {textSecondary && (
              <TourTipRow>
                <TipTextSecondary>{textSecondary}</TipTextSecondary>
              </TourTipRow>
            )}
          </FeatureTourTip>
        </FeatureTourContent>
      )}
    </FeatureTourWrapper>
  );
};

const FeatureTourWrapper = styled.div<{ ml: number; mr: number; width: number | undefined }>`
  margin-left: ${(p) => p.ml}px;
  margin-right: ${(p) => p.mr}px;
  ${(p) => (p.width ? `width: ${p.width}%` : '')}
`;

const ChildWrapper = styled.div<{ enabled: boolean; pad: boolean }>`
  position: relative;
  border-radius: 4px;
  z-index: ${(p) => (p.enabled ? OVERLAY_INDEX + 1 : 0)};
  ${(p) => (p.pad && !isMobile ? 'border: 8px solid transparent' : '')};
  ${(p) => p.enabled && 'outline: 1px solid var(--purple);'}
`;

const FeatureTourContent = styled.div`
  position: relative;
`;

const FeatureTourTip = styled.div`
  background: var(--purple-07);
  border-radius: 4px;
  height: 375px;
  left: -55%;
  top: 20px;
  position: absolute;
  width: 400px;
  padding: 40px;
  z-index: ${OVERLAY_INDEX + 1};
`;

const TourTipRow = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-flow: row nowrap;
  text-align: center;
  justify-content: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TourImageRow = styled(TourTipRow)`
  max-height: 150px;
  margin-bottom: 20px;
`;

const TipTextPrimary = styled.span`
  font-size: 18px;
  font-family: cera-bold;
  color: var(--yellow);
`;

const TipTextSecondary = styled.span`
  font-size: 16px;
  font-family: cera-regular;
  color: var(--white);
`;

const ExitWrapper = styled.div`
  margin-left: auto;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;

const ContentPointer = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  top: 10px;
  left: 80px;
  overflow: hidden;
  transform: rotate(45deg);
  background: var(--purple-07);
  z-index: ${OVERLAY_INDEX + 1};
`;

const FeatureTourOverlay = styled.div`
  background: var(--blue-alt);
  height: 100%;
  left: 0;
  opacity: 0.6;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: ${OVERLAY_INDEX};
`;

export default FeatureTour;
