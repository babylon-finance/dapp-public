import { YEARN_VAULT_LIST_API_URL } from 'config';
import { YearnVaultV2 } from 'models';
import { yearn } from 'constants/addresses';
import { Vault } from 'components/garden/strategies/creation/StrategyOperations/OperationDetailsForm/YieldStrategy/YieldStrategyForm';

import axios from 'axios';
import moment from 'moment';

class YearnService {
  private static instance: YearnService;
  public vaults: Vault[] | undefined;
  public lastFetch: any | undefined;

  private constructor() {
    this.vaults = undefined;
    this.lastFetch = undefined;
  }

  public static getInstance(): YearnService {
    if (!YearnService.instance) {
      YearnService.instance = new YearnService();
    }

    return YearnService.instance;
  }

  private getYearnVaultsFromResponseV2(vault: YearnVaultV2): Vault {
    return {
      id: vault.address,
      name: vault.name,
      supply: 0,
      balance: parseFloat((vault.tvl?.tvl || 0).toFixed(2)),
      pricePerFullShare: parseFloat(vault.tvl?.price?.toFixed(2) || '0'),
      earnings: 0,
      iconURI: vault.icon,
      underlying: vault.token,
      needsPrevious: vault.name.toLowerCase().includes('curve'),
    };
  }

  public async fetchVaults(): Promise<Vault[] | undefined> {
    if (this.vaults) {
      const latestFetch = moment(this.lastFetch);
      const diffSince = moment().diff(latestFetch);
      const sinceLatestSec = moment.duration(diffSince).seconds();

      if (this.vaults !== undefined && sinceLatestSec < 60 * 60) {
        return this.vaults;
      }
    }
    const supportedVaults = yearn.vaults.map((v) => v.vault.toLowerCase());

    return await axios
      .get(YEARN_VAULT_LIST_API_URL)
      .then((response) => {
        const { data } = response;
        const final = data
          .filter((r) => supportedVaults.includes(r.address.toLowerCase()))
          .filter((r) => r.emergencyShutdown !== true)
          .filter((r) => r.endorsed === true)
          .filter((r) => r.type === 'v2') as YearnVaultV2[];
        this.lastFetch = moment();
        this.vaults = final.sort((a, b) => b.tvl.tvl - a.tvl.tvl).map(this.getYearnVaultsFromResponseV2);
        return this.vaults;
      })
      .catch((err) => {
        console.log('Failed to fetch updated yearn vaults', err);
        return this.vaults;
      });
  }
}

export default YearnService;
