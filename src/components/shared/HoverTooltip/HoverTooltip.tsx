import { Icon } from '../Icons';
import { IconName } from 'models';

import Tooltip from 'react-tooltip-lite';
import React from 'react';
import styled from 'styled-components';

interface HoverTooltipProps {
  content: React.ReactNode;
  placement: string;
  icon?: IconName;
  color?: string;
  size?: number;
  textOverride?: string;
  fontSize?: number;
  styleOverride?: any;
  className?: string;
  contentClassName?: string;
  outDelay?: number;
  iconPad?: number;
}

export enum TipPlacement {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  upLeft = 'up-left',
  upRight = 'up-right',
  downLeft = 'down-left',
  downRight = 'down-right',
}

const HoverTooltip = ({
  icon = IconName.question,
  iconPad = 4,
  content,
  color,
  placement,
  size = 18,
  fontSize,
  textOverride,
  styleOverride = undefined,
  className = undefined,
  contentClassName = undefined,
  outDelay = 0,
}: HoverTooltipProps) => {
  const optionals = {};

  if (styleOverride) {
    optionals['styles'] = styleOverride;
  }

  if (className) {
    optionals['className'] = className;
  }

  if (contentClassName) {
    optionals['tipContentClassName'] = contentClassName;
  }

  return (
    <Tooltip content={content} zIndex={20000000} direction={placement} {...optionals} mouseOutDelay={outDelay}>
      {!textOverride && (
        <IconWrapper pad={iconPad}>
          <Icon name={icon} size={size} color={color === undefined ? undefined : color} />
        </IconWrapper>
      )}
      {textOverride && (
        <TextWrapper fontSize={fontSize} color={color}>
          {textOverride}
        </TextWrapper>
      )}
    </Tooltip>
  );
};

const TextWrapper = styled.div<{ fontSize: number | undefined; color: string | undefined }>`
  display: flex;
  flex-flow: column nowrap;
  text-align: left;
  justify-content: center;
  padding: 4px 0 4px;
  text-decoration: underline dotted;
  text-underline-offset: 2px;
  font-size: ${(p) => (p.fontSize ? p.fontSize : '16')}px;
  color: ${(p) => (p.color ? p.color : 'white')};
`;

const IconWrapper = styled.div<{ pad: number }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  padding: ${(p) => p.pad}px;
`;

export default React.memo(HoverTooltip);
