import {
  AggWalletMetricResponse,
  GardenMetricResponse,
  LatestMetricForGardensResponse,
  WalletMetricResponse,
} from 'models/MetricRow';

import store from 'store2';
import moment from 'moment';

const GARDEN_CACHE = 'babylonGardenMetricsCache';
const WALLET_CACHE = 'babylonWalletMetricsCache';
class MetricsService {
  private static instance: MetricsService;
  private gardenCache: any;
  private walletCache: any;

  private constructor() {
    this.gardenCache = store.namespace(GARDEN_CACHE);
    this.walletCache = store.namespace(WALLET_CACHE);
  }

  public static getInstance() {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }

    return MetricsService.instance;
  }

  public async getAllMetricsForWallet(
    address: string,
    forceRefresh: boolean = false,
  ): Promise<AggWalletMetricResponse | undefined> {
    const result = await this.doFetchMetricsForWalletAll(address);
    return result;
  }

  public async getMetricsForWallet(
    address: string,
    garden: string,
    forceRefresh: boolean = false,
  ): Promise<WalletMetricResponse | undefined> {
    const fetchNow = Date.now();
    const maybeCacheResult = this.walletCache.get(`${address}.${garden}`, undefined);

    if (maybeCacheResult && !forceRefresh) {
      const deltaHours = moment(fetchNow).diff(moment(this.walletCache.get(`${address}.${garden}.latest`, 0)), 'hours');

      if (deltaHours < 12) {
        return Promise.resolve(maybeCacheResult);
      }
    }

    // Default to fetching from the db if nothing in cache or delta greater than 12 hours
    const result = await this.doFetchMetricsForWallet(address, garden);
    this.gardenCache.set(`${address}${garden}.latest`, fetchNow);
    this.gardenCache.set(`${address}.${garden}`, result);

    return result;
  }

  public async getLatestMetricForGardens(
    gardens: string[],
    forceRefresh: boolean = false,
  ): Promise<LatestMetricForGardensResponse> {
    const fetchNow = Date.now();
    const maybeCacheResult = this.gardenCache.get('all-gardens', undefined);

    if (maybeCacheResult && !forceRefresh) {
      const deltaHours = moment(fetchNow).diff(moment(this.gardenCache.get(`all-gardens.latest`, 0)), 'hours');

      if (deltaHours < 12) {
        return Promise.resolve(maybeCacheResult);
      }
    }

    // Default to fetching from the db if nothing in cache or delta greater than 12 hours
    const result = await this.doFetchMetricsForGardensBulk(gardens);
    this.gardenCache.set(`all-gardens.latest`, fetchNow);
    this.gardenCache.set('all-gardens', result);

    return result;
  }

  public async getMetricsForGarden(garden: string, forceRefresh: boolean = false): Promise<GardenMetricResponse> {
    const fetchNow = Date.now();
    const maybeCacheResult = this.gardenCache.get(garden, undefined);

    if (maybeCacheResult && !forceRefresh) {
      const deltaHours = moment(fetchNow).diff(moment(this.gardenCache.get(`${garden}.latest`, 0)), 'hours');

      if (deltaHours < 12) {
        return Promise.resolve(maybeCacheResult);
      }
    }

    // Default to fetching from the db if nothing in cache or delta greater than 12 hours
    const result = await this.doFetchMetricsForGarden(garden);
    this.gardenCache.set(`${garden}.latest`, fetchNow);
    this.gardenCache.set(garden, result);

    return result;
  }

  public async getMetricsForGardensBulk(gardens: string[]): Promise<GardenMetricResponse> {
    const result = await this.doFetchMetricsForGardensBulk(gardens);
    return result;
  }

  public async doFetchMetricsForWalletAll(address: string): Promise<AggWalletMetricResponse | undefined> {
    const results = await fetch(`/api/v1/get-wallet-metrics-all/${address}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch ALL wallet metrics', err.toString());
        return undefined;
      });

    return results;
  }

  public async doFetchMetricsForWallet(address: string, garden: string): Promise<WalletMetricResponse | undefined> {
    const results = await fetch(`/api/v1/get-wallet-metrics/${address}/${garden}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch wallet metrics', err.toString());
        return undefined;
      });

    return results;
  }

  public async doFetchMetricsForGarden(garden: string): Promise<GardenMetricResponse> {
    const results = await fetch(`/api/v1/get-garden-metrics/${garden}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch garden metrics', err.toString());
        return { garden: [], strategy: [] };
      });

    return results;
  }

  public async doFetchMetricsForGardensBulk(gardens: string[]): Promise<any> {
    const results = await fetch(`/api/v1/get-garden-metrics-bulk`, {
      method: 'POST',
      body: JSON.stringify({ gardens }),
    })
      .then((response) => {
        return response.json();
      })
      .catch((err) => {
        console.log('Failed to fetch bulk garden metrics', err.toString());
        return {};
      });

    return results;
  }

  public clearAll() {
    this.gardenCache.clearAll();
  }
}

export default MetricsService;
