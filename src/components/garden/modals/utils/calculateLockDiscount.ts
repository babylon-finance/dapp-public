import { HEART_LOCKING_PERIODS } from 'config';
import { HeartLockingPeriod } from 'models';

export const calculateLockDiscount = (userLock: number): number => {
  let timeDiscount = 0;
  for (let i = 0; i < HEART_LOCKING_PERIODS.length; i++) {
    const heartLockingPeriod: HeartLockingPeriod = HEART_LOCKING_PERIODS[i];
    if (userLock < heartLockingPeriod.seconds) {
      return timeDiscount;
    }
    timeDiscount = heartLockingPeriod.discount;
  }
  return timeDiscount;
};
