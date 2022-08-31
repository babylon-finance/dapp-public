import { ContributorRewards, FullGardenDetails, Token } from 'models';
import { TokenListService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import { commify, formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { EtherSymbol } from '@ethersproject/constants';
import moment from 'moment';
import numeral from 'numeral';
import invariant from 'invariant';

const tokenListService = TokenListService.getInstance();

const getNumeralFormatByPrecision = (precision: number) => {
  let format: string = '0a';
  if (precision > 0) {
    format = '0.' + new Array(precision).fill(0).join('') + 'a';
  }
  return format;
};

export const formatTokenDisplay = (value: BigNumber, precision: number = 2, useNumeral: boolean = false): string => {
  const number = formatEtherDecimal(value);
  if (useNumeral) {
    return numeral(number).format(getNumeralFormatByPrecision(precision));
  } else {
    return commify(number);
  }
};

export const formatBigNumberDate = (value: BigNumber): Date => {
  return new Date(value.toNumber() * 1000);
};

export const formatEtherDisplay = (value: BigNumber, precision: number = 2, useNumeral: boolean = false): string => {
  return `${commify(formatEtherDecimal(value, precision))}${EtherSymbol}`;
};

export const formatEtherDecimal = (value: BigNumber, precision: number = 2): number => {
  return truncateDecimals(parseFloat(formatEther(value)), precision);
};

export const formatReserveFloat = (reserveAmount: BigNumber, reserve: Token, precision: number = 4): number => {
  if (reserve.decimals < 18) {
    reserveAmount = reserveAmount.mul(10 ** (18 - reserve.decimals));
  }

  return parseFloat(parseFloat(formatEther(reserveAmount)).toFixed(precision));
};

export const formatGardenTokensDisplay = (
  reserveAmount: BigNumber,
  gardenSymbol: string,
  precision: number = 2,
  useNumeral: boolean = false,
  useSymbol: boolean = true,
): string => {
  let truncated = truncateDecimals(formatReserveFloat(reserveAmount, { decimals: 18 } as Token), precision).toString();
  try {
    if (useNumeral) {
      truncated = numeral(truncated).format(getNumeralFormatByPrecision(precision));
    } else {
      truncated = commify(truncated);
    }
  } catch (error) {
    // -1e18
    truncated = '0';
  }
  return `${truncated} ${useSymbol ? gardenSymbol : ''}`;
};

export const formatReserveDisplay = (
  reserveAmount: BigNumber,
  reserve: Token,
  precision: number = 2,
  useNumeral: boolean = false,
  useSymbol: boolean = true,
): string => {
  let truncated = truncateDecimals(formatReserveFloat(reserveAmount, reserve), precision).toString();
  try {
    if (useNumeral) {
      truncated = numeral(truncated).format(getNumeralFormatByPrecision(precision));
    } else {
      truncated = commify(truncated);
    }
  } catch (error) {
    // -1e18
    truncated = '0';
  }
  return `${truncated} ${useSymbol ? tokenListService.getInputSymbol(reserve.address) : ''}`;
};

export const formatReserveToFiatDisplay = (
  reserveAmount: BigNumber,
  reserve: Token,
  fiat: string,
  reserveToFiat: string,
  useNumeral: boolean = false,
  precision: number | undefined = undefined,
): string => {
  const inFiatBN = convertReserveFiat(reserveAmount, reserve, reserveToFiat);
  return formatFiatDisplay(inFiatBN, fiat, precision, useNumeral);
};

export const convertReserveFiat = (reserveAmount: BigNumber, reserve: Token, reserveToFiat: string): BigNumber => {
  if (reserve.decimals < 18) {
    reserveAmount = reserveAmount.mul(10 ** (18 - reserve.decimals));
  }

  if (!reserveAmount || !reserveAmount.mul) {
    return BigNumber.from(0);
  }

  return reserveAmount.mul(parseEther(reserveToFiat.toString())).div(parseEther('1'));
};

export const formatFiatDisplay = (
  value: BigNumber,
  fiat: string,
  precision: number = 2,
  useNumeral: boolean = false,
): string => {
  const fiatSymbol = { USD: '$', EUR: '€', JPY: '¥', CNY: '元' }[fiat];
  const valueFloat = parseFloat(formatEther(value));

  if (useNumeral) {
    return `${fiatSymbol}${numeral(valueFloat).format(getNumeralFormatByPrecision(precision))}`;
  }

  try {
    return `${valueFloat < 0 ? '-' : ''}${fiatSymbol}${commify(truncateDecimals(Math.abs(valueFloat), precision))}`;
  } catch (e) {
    console.error(e);
    return '0';
  }
};

export const formatNumberFiatDisplay = (
  value: number,
  fiat: string,
  precision: number = 2,
  useNumeral: boolean = false,
) => {
  const fiatSymbol = { USD: '$', EUR: '€', JPY: '¥', CNY: '元' }[fiat];

  if (useNumeral) {
    return `${fiatSymbol}${numeral(value).format(getNumeralFormatByPrecision(precision))}`;
  }

  try {
    return `${value < 0 ? '-' : ''}${fiatSymbol}${commify(truncateDecimals(Math.abs(value), precision))}`;
  } catch (e) {
    console.error(e);
    return '0';
  }
};

export const generate32BitIntegerHash = (str: string): number => {
  for (var i = 0, h = 9; i < str.length; ) h = Math.imul(h ^ str.charCodeAt(i++), 9 ** 9);

  const hashInt = h ^ (h >>> 9);
  invariant(hashInt <= 4294967295, 'Resulting hash greater than max Uint32');

  return Math.abs(hashInt);
};

export const formatToGas = (units: number): number => {
  return units > 0 ? parseInt((units / 10 ** 9).toFixed(0)) : 0;
};

export const calculateUserReturnForDisplay = (
  deposits: BigNumber,
  expected: BigNumber,
  unclaimed: ContributorRewards | undefined,
  pending: ContributorRewards | undefined,
  bablInReserve: BigNumber,
): string => {
  // NOTE: We have removed BABL calculation for the time being but I've left the code
  // to make it easy if we want to change in the future
  const splitBN = (unclaimed?.totalProfits || BigNumber.from(0)).add(pending?.totalProfits || BigNumber.from(0));
  const bablBN = (unclaimed?.totalBabl || BigNumber.from(0)).add(pending?.totalBabl || BigNumber.from(0));
  const bablFloat = parseFloat(formatEther(bablBN)) * parseFloat(formatEther(bablInReserve));
  const splitFloat = parseFloat(formatEther(splitBN));
  const expectedFloat = parseFloat(formatEther(expected)) + splitFloat;
  const depositsFloat = parseFloat(formatEther(deposits));

  if (depositsFloat <= 0) {
    return 0 + '%';
  }

  const netReturns = expectedFloat - depositsFloat;
  const netReturnsPercent = (netReturns / depositsFloat) * 100;

  return commify(truncateDecimals(netReturnsPercent)) + '%';
};

export const truncateDecimals = (value: number, digits: number = 2): number => {
  // Basically hide decimals if 3 0's or more in the integer.
  if (value >= 1000) {
    digits = 0;
  }
  const numS = value.toString();
  const decPos = numS.indexOf('.');
  const substrLength = decPos === -1 ? numS.length : 1 + decPos + digits;
  const trimmedResult = numS.substr(0, substrLength);

  return isNaN(parseFloat(trimmedResult)) ? 0 : parseFloat(trimmedResult);
};

export const parseReserve = (value: string, reserve: Token): BigNumber => {
  return parseUnits(value, reserve.decimals);
};

export const getAnnualizedReturn = (gardenDetails: FullGardenDetails, sinceInception: boolean = false): BigNumber => {
  const pctReturns = gardenDetails.sharePrice.sub(parseEther('1')).mul(10000).div(parseEther('1'));
  if (sinceInception) {
    return pctReturns;
  }
  const gardenStarted = moment(gardenDetails.gardenInitializedAt);
  const daysSince = moment().diff(gardenStarted, 'days');

  return daysSince > 0 ? pctReturns.div(daysSince).mul(365) : BigNumber.from(0);
};

export const ordinalOf = (i: number): string => {
  const j = i % 10;
  const k = i % 100;

  if (j === 1 && k !== 11) {
    return i + 'st';
  }

  if (j === 2 && k !== 12) {
    return i + 'nd';
  }

  if (j === 3 && k !== 13) {
    return i + 'rd';
  }

  return i + 'th';
};
