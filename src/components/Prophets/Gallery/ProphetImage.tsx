import styled from 'styled-components';
import React from 'react';

const misteryImage = require('./mistery.svg');
const deadImage = require('./dead.svg');
const eye = require('./eye.svg');

interface ProphetImageProps {
  image: string;
  className?: string;
  hover?: boolean;
  thumb?: boolean;
  dead?: boolean;
}

const ProphetImage = ({ image, className, hover, dead, thumb = false }: ProphetImageProps) => {
  return (
    <ProphetImageWrapper className={className} thumb={thumb}>
      <img alt="prophet-img" src={image || (dead ? deadImage : misteryImage)} />
      {hover && (
        <OverlayPic>
          <img alt="eye-img" src={eye} width={75} />
          <HoverText thumb={thumb}>View Profile</HoverText>
        </OverlayPic>
      )}
    </ProphetImageWrapper>
  );
};

const ProphetImageWrapper = styled.div<{ thumb: boolean }>`
  width: ${(p) => (p.thumb ? '200px' : '100%')};
  height: ${(p) => (p.thumb ? '200px' : '100%')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 21px;
  background: var(--primary);
  border-radius: 20px;
  border: ${(p) => (p.thumb ? 'none' : '1px solid var(--blue-04)')};
  box-shadow: 2px 2px 8px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
  }

  &:hover div {
    display: flex;
  }
`;

const HoverText = styled.div<{ thumb: boolean }>`
  font-size: ${(p) => (p.thumb ? '18px' : '24px')};
  margin-top: 22px;
  text-align: center;
`;

const OverlayPic = styled.div`
  width: 100%;
  height: 100%;
  margin-left: calc(-100%);
  opacity: 0.9;
  background: #4420d8;
  display: none;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
`;

export default React.memo(ProphetImage);
