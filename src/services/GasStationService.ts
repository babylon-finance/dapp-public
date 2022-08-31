import { buildGasPriceFromResult, GasPrices, EmptyGasPrices, GasStationResult } from 'models';
import { BLOCKNATIVE_DAPPID, BLOCKNATIVE_API_URL } from '../config';

import axios from 'axios';
import moment from 'moment';

class GasStationService {
  private static instance: GasStationService;
  public prices: GasPrices;

  private constructor() {
    this.prices = EmptyGasPrices;
  }

  public static getInstance(): GasStationService {
    if (!GasStationService.instance) {
      GasStationService.instance = new GasStationService();
    }

    return GasStationService.instance;
  }

  public async fetchUpdatedPrices(force: boolean = false): Promise<GasPrices> {
    const latestPriceFetch = moment(this.prices.timestamp);
    const diffSince = moment().diff(latestPriceFetch);
    const sinceLatestSec = moment.duration(diffSince).seconds();

    if (sinceLatestSec < 30 && this.prices.timestamp !== 0 && !force) {
      return this.prices;
    }

    try {
      const config = {
        headers: {
          Authorization: BLOCKNATIVE_DAPPID,
        },
      };
      const result: GasPrices = await axios
        .get(`${BLOCKNATIVE_API_URL}/gasprices/blockprices`, config)
        .then((response) => {
          return buildGasPriceFromResult(response.data as GasStationResult);
        });
      this.prices = result;

      return result;
    } catch (err) {
      console.log('Failed to fetch updated gas prices', err);
      return this.prices;
    }
  }
}

export default GasStationService;
