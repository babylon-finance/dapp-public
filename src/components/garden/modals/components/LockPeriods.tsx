import styled from 'styled-components';
import React from 'react';
import { HEART_LOCKING_PERIODS } from 'config';
import { HeartLockingPeriod } from 'models';

interface LockPeriodProps {
  setLock: (lock: number) => void;
  selectedLock: number;
  minLock: number;
}

const LockPeriods = ({ selectedLock, setLock, minLock }: LockPeriodProps) => {
  return (
    <LockPeriodsWrapper>
      <LockPeriodsTitle>Select the locking period</LockPeriodsTitle>
      <LockPeriodsContainer>
        {HEART_LOCKING_PERIODS.map((heartLockingPeriod: HeartLockingPeriod) => (
          <LockPeriod
            disabled={heartLockingPeriod.seconds < minLock}
            onClick={() => setLock(heartLockingPeriod.seconds)}
            key={heartLockingPeriod.index}
            selected={selectedLock === heartLockingPeriod.seconds}
          >
            <LockPeriodTitle>{heartLockingPeriod.label}</LockPeriodTitle>
            <LockPeriodDiscount>{heartLockingPeriod.discount}%</LockPeriodDiscount>
            <LockPeriodBonus>Bonus</LockPeriodBonus>
          </LockPeriod>
        ))}
      </LockPeriodsContainer>
    </LockPeriodsWrapper>
  );
};

const LockPeriodsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column nowrap;
  align-items: center;
  margin: 0 0 20px;
`;

const LockPeriodsTitle = styled.div`
  width: 100%;
  margin-bottom: 12px;
  font-size: 15px;
  color: var(--blue-04);
`;

const LockPeriodsContainer = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  align-items: center;
  margin: 5px 0;
  justify-content: space-between;
  align-items: center;
`;

const LockPeriod = styled.div<{ selected: boolean; disabled: boolean }>`
  display: flex;
  width: 96px;
  height: auto;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 16px;
  text-align: center;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  background: ${(p) => (p.selected ? 'var(--purple-07)' : p.disabled ? 'var(--blue-09)' : 'var(--blue-07)')};
  border: ${(p) => (!p.selected ? '1px solid transparent' : '1px solid var(--blue-05)')};

  &:hover {
    background: var(--purple-07);
  }
`;

const LockPeriodTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-top: 6px;
`;

const LockPeriodDiscount = styled.div`
  font-size: 32px;
  font-weight: bold;
  margin-top: 10px;
  color: var(--yellow);
`;

const LockPeriodBonus = styled.div`
  font-size: 13px;
  margin-top: 6px;
  color: var(--blue-03);
`;

export default React.memo(LockPeriods);
