import { Icon } from 'components/shared';
import { IconName } from 'models';

import styled from 'styled-components';
import React from 'react';

interface DepositNotificationProps {
  color: string;
  children: React.ReactNode;
  type?: string;
  size?: number;
}

const DepositNotification = ({ color, children, size, type }: DepositNotificationProps) => {
  const iconName =
    {
      warning: IconName.warning,
      error: IconName.error,
    }[type || ''] || IconName.warning;
  return (
    <NotificationWrapper>
      <Icon name={iconName} size={size || 20} color={color || 'var(--yellow)'} />
      <NotifText>{children}</NotifText>
    </NotificationWrapper>
  );
};

const NotificationWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding-top: 40px;
  padding-top: 0;
  padding-left: 0;
  margin-left: 0;
  width: 100%;
`;

const NotifText = styled.div`
  padding-left: 12px;
  font-family: cera-regular;
  color: var(--blue-03);
  font-size: 14px;
`;

export default React.memo(DepositNotification);
