import React from 'react';
import styled from 'styled-components';
import { ReactComponent as Checkmark } from './checkmark.svg';

interface BreadcrumbProps {
  current: boolean;
  completed: boolean;
  text: string;
}

const Breadcrumb = ({ current, completed, text }: BreadcrumbProps) => {
  return (
    <BreadcrumbWrapper>
      <BreadcrumbCircle completed={completed}>
        {current && <BreacrumbInnerCircle />}
        {completed && <CheckmarkStyled />}
      </BreadcrumbCircle>
      <BreadcrumbText current={current} completed={completed}>
        {text}
      </BreadcrumbText>
    </BreadcrumbWrapper>
  );
};

const CheckmarkStyled = styled(Checkmark)`
  width: 10px;
`;

const BreadcrumbWrapper = styled.div`
  padding: 0 0 16px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const BreadcrumbCircle = styled.div<{ completed: boolean }>`
  border-radius: 12px;
  width: 24px;
  height: 24px;
  border: 1px solid ${(p) => (p.completed ? 'var(--purple)' : 'var(--blue-05)')};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  background: ${(p) => (p.completed ? 'var(--purple)' : 'var(--modal-blue)')};
`;
const BreacrumbInnerCircle = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background: var(--yellow);
`;

const BreadcrumbText = styled.div<{ current: boolean; completed: boolean }>`
  font-family: cera-regular;
  color: white;
  font-size: 16px;
  font-weight: ${(p) => (p.current ? '700' : '400')};
  color: ${(p) => (p.current ? 'white' : p.completed ? 'var(--purple-02)' : 'var(--blue-03)')};
`;

export default React.memo(Breadcrumb);
