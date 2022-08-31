import React from 'react';
import styled from 'styled-components';
import { Breadcrumb } from './Breadcrumb';

interface BreadcrumbsProps {
  steps: string[];
  currentStep: number;
}

const Breadcrumbs = ({ steps, currentStep }: BreadcrumbsProps) => {
  return (
    <BreadcrumbsWrapper>
      <BreadrumbLine width={(steps.length - 1) * 45} />
      <Steps>
        {steps.map((step: string, index: number) => (
          <Breadcrumb key={index} completed={index < currentStep} current={currentStep === index} text={step} />
        ))}
      </Steps>
    </BreadcrumbsWrapper>
  );
};

const BreadcrumbsWrapper = styled.div`
  width: auto;
  min-width: 250px;
  position: relative;
`;

const Steps = styled.div`
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
`;

const BreadrumbLine = styled.div<{ width: Number }>`
  position: absolute;
  z-index: 0;
  left: 12px;
  width: 1px;
  background: var(--blue-05);
  height: ${(p) => `${p.width}px`};
`;

export default React.memo(Breadcrumbs);
