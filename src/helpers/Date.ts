import moment from 'moment';

export const displayDurationString = (duration: moment.Duration, zeroLabel?: string): string => {
  const hoursAndMinutes = (duration.asMinutes() / 60).toFixed(2).split('.');
  const hours = Number(hoursAndMinutes[0]);
  const minutes = hoursAndMinutes.length > 1 ? Number(hoursAndMinutes[1]) : 0;
  if (zeroLabel && hours <= 0) {
    return zeroLabel;
  }
  const formattedDaysOrHours = hours >= 24 ? `${Math.floor(hours / 24)}D ${hours % 24}H` : `${hours}H`;
  const formattedMinutes = minutes > 0 ? `${((parseFloat(hoursAndMinutes[1]) / 100) * 60).toFixed(0)}m` : '';
  if (hours >= 24) {
    return formattedDaysOrHours;
  }

  return `${formattedDaysOrHours}${minutes > 0 ? ',' : ''}${' ' + formattedMinutes}`;
};

const treatAsUTC = (date: Date): Date => {
  var result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());

  return result;
};

export const daysBetween = (startDate: Date, endDate: Date): number => {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;

  return (treatAsUTC(endDate).valueOf() - treatAsUTC(startDate).valueOf()) / millisecondsPerDay;
};
