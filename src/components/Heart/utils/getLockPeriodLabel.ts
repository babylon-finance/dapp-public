import { HEART_LOCKING_PERIODS } from 'config';
import { HeartLockingPeriod } from 'models';

export const getLockPeriodLabel = (userLock: number): string => {
  let timeDiscount = 0;
  for (let i = 0; i < HEART_LOCKING_PERIODS.length; i++) {
    const heartLockingPeriod: HeartLockingPeriod = HEART_LOCKING_PERIODS[i];
    if (userLock === heartLockingPeriod.seconds) {
      return heartLockingPeriod.label;
    }
  }
  return Math.floor(timeDiscount / 86400).toString() + ' days';
};
