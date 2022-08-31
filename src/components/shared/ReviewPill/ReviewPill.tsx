import React from 'react';
import styled from 'styled-components';

interface ReviewPillProps {
  className?: string;
  title?: string;
  children: React.ReactNode;
  showYellowGradient?: boolean;
}

const ReviewPill = ({ className, title, children, showYellowGradient }: ReviewPillProps) => {
  return (
    <ReviewPillWrapper className={className}>
      {title && <PillTitle>{title}</PillTitle>}
      <PillContent showYellowGradient={showYellowGradient}>{children}</PillContent>
    </ReviewPillWrapper>
  );
};

const ReviewPillWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  padding: 20px 0;
`;

const PillTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const PillContent = styled.div<{ showYellowGradient?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-top: 8px;
  padding: 12px 16px;
  background: ${(p) =>
    p.showYellowGradient ? 'linear-gradient(90deg, var(--yellow) 0%, var(--blue-07) 100%);' : 'var(--purple-02-alpha)'};

  p {
    color: var(--purple-02);
    font-size: 16px;
    font-weight: 400;
  }
`;

export default React.memo(ReviewPill);
