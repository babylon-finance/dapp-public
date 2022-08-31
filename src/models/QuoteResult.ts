export interface Ticker {
  quote: Quote;
  id: number;
  name: string;
}

export interface Quote {
  USD: FiatQuote;
  JPY: FiatQuote;
  CNY: FiatQuote;
  EUR: FiatQuote;
}

export enum Fiats {
  USD,
  JPY,
  CNY,
  EUR,
}

export type FiatStrings = keyof typeof Fiats;

export interface FiatQuote {
  price: number;
  market_cap: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
}

export interface QuoteResult {
  ETH: Ticker;
  WETH: Ticker;
  WBTC: Ticker;
  USDC: Ticker;
  DAI: Ticker;
  BABL: Ticker;
  AAVE: Ticker;
  updatedAt?: number;
}
