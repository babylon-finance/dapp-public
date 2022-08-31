import { FiatQuote, QuoteResult } from 'models';
import { RESERVES, FIAT_CURRENCIES } from '../config';

import moment from 'moment';

class QuoteService {
  private static instance: QuoteService;
  public quotes: QuoteResult | undefined;
  public lastFetch: any | undefined;

  private constructor() {
    this.quotes = undefined;
    this.lastFetch = undefined;
  }

  public static getInstance(): QuoteService {
    if (!QuoteService.instance) {
      QuoteService.instance = new QuoteService();
    }

    return QuoteService.instance;
  }

  public async fetchUpdatedPrices(): Promise<QuoteResult | undefined> {
    if (this.quotes) {
      const latestPriceFetch = moment(this.lastFetch);
      const diffSince = moment().diff(latestPriceFetch);
      const sinceLatestSec = moment.duration(diffSince).seconds();

      if (sinceLatestSec < 1200 || this.quotes !== undefined) {
        return this.quotes;
      }
    }

    try {
      const response = (
        await fetch('/api/v1/get-quotes', {
          body: JSON.stringify({ reserves: RESERVES, fiats: FIAT_CURRENCIES }),
          method: 'POST',
        })
      ).json() as any;

      this.lastFetch = moment();
      this.quotes = response as QuoteResult;

      return this.quotes;
    } catch (err) {
      console.log('Failed to fetch updated quote prices', err);

      return undefined;
    }
  }

  public getQuoteForReserveAndCurrency(
    reserveSymbol: string,
    currencySymbol: string,
    quotes?: QuoteResult,
  ): FiatQuote | undefined {
    try {
      const quote = quotes || this.quotes;
      const maybeQuote = quote ? quote[reserveSymbol.toUpperCase()] : undefined;

      if (!maybeQuote || !maybeQuote.quote) {
        throw new Error(`No quote found for reserve asset: ${reserveSymbol}`);
      }

      const fiatQuote = maybeQuote.quote[currencySymbol.toUpperCase()];

      if (!fiatQuote) {
        throw new Error(`No quote found for currency: ${currencySymbol}`);
      }

      return fiatQuote;
    } catch (error) {
      console.error(error);

      return undefined;
    }
  }
}

export default QuoteService;
