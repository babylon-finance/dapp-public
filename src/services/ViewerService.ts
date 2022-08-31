import addresses from 'constants/addresses';
import { loadContractFromNameAndAddress, getAddressByName } from 'hooks/ContractLoader';
import { Viewer, MardukGate, IERC20, BabControllerProxy } from 'constants/contracts';
import { TokenListService } from 'services';
import { StrategyStateRow } from 'shared/strategy/models';
import {
  retrieveFullGardenDetails,
  retrieveHeartDetails,
  updatesFeesAndReturnsGarden,
  retrieveFullStrategyDetails,
  retrievePartialGardenDetails,
  getContributionObject,
} from './mappers';
import {
  GardenPermission,
  Token,
  GatePermissions,
  UserStratStats,
  UserGardens,
  GardensCache,
  UserGardenPermsCache,
  BablAsReserveCache,
  UserGatePermissions,
  Contributor,
  GardenDetails,
  FullGardenDetails,
  StrategyDetails,
  HeartDetails,
  GardenInvitesCache,
  InvitesCount,
  UserGardensKeyCache,
  UserStratStatsCache,
} from 'models';
import { formatEtherDecimal, formatReserveFloat } from 'helpers/Numbers';
import { wrapAwait } from 'utils/AwaitWrapper';
import { ADMIN_ADDRESSES, getProvider, IS_MAINNET, GOVERNANCE_PROPOSALS_INFO, ZERO_ADDRESS } from 'config';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { isGardenCreator } from 'helpers/Addresses';
import { bonds } from 'constants/addresses';

export interface ContractsCache {
  [key: string]: Contract;
}

interface FirstNavData {
  address: string;
  garden: string;
  nav: string;
}

const FEATURED_GARDENS = [
  '0xB5bD20248cfe9480487CC0de0d72D0e19eE0AcB6',
  '0x1D50c4F18D7af4fCe2Ea93c7942aae6260788596',
  '0xd42B3A30ca89155d6C3499c81F0C4e5A978bE5c2',
  '0xb05241EA50e9f5f240168CebF7Ec7cFc57aFA003',
  '0xf0C38ae1Fcd1d8bD72579187a070b703582acFD7',
];

class ViewerService {
  private static instance: ViewerService;
  private contracts: ContractsCache = {};
  private userGardensKeysCache: UserGardensKeyCache = {};
  private gardensCache: GardensCache = {};
  private gardenPermsCache: UserGardenPermsCache = {};
  private gardenInvitesCache: GardenInvitesCache = {};
  private userPermsCache: UserGatePermissions = {};
  private userStatsCache: UserStratStatsCache = {};
  private bablAsReserveCache: BablAsReserveCache = {};

  public static getInstance() {
    if (!ViewerService.instance) {
      ViewerService.instance = new ViewerService();
    }
    return ViewerService.instance;
  }

  public static getFeaturedGardens(gardens: GardenDetails[]): string[] {
    if (IS_MAINNET) {
      return FEATURED_GARDENS;
    }
    return gardens.slice(0, 4).map((g: GardenDetails) => g.address);
  }

  // Cached by user
  public async getUserPermissionsGlobal(address: string): Promise<GatePermissions> {
    if (this.userPermsCache[address]) {
      return this.userPermsCache[address];
    }
    this.userPermsCache[address] = {
      hasGate: true,
      creator: true,
    };
    return this.userPermsCache[address];
  }

  public async isPriceValid(asset: string, gardenDetails: FullGardenDetails): Promise<boolean> {
    if (asset.toLowerCase() === gardenDetails.reserveAsset.toLowerCase()) {
      return true;
    }
    const tokenListService = TokenListService.getInstance();
    const assetToken = tokenListService.getTokenByAddress(asset.toLowerCase());
    const reserveToken = tokenListService.getTokenByAddress(gardenDetails.reserveAsset.toLowerCase());
    // Check liquidity in token list
    const minLiquidity = formatReserveFloat(gardenDetails.minLiquidityAsset, reserveToken as Token);
    return !!assetToken && !!reserveToken && assetToken.liquidity >= minLiquidity;
  }

  // Cached by garden
  public async getGardenDetails(
    gardenAddr: string,
    userAddr: string | undefined = undefined,
    force: boolean = false,
    nft: boolean = false,
  ): Promise<FullGardenDetails> {
    const userKey = userAddr || '0x';
    const userGardens = userAddr ? await this.getUserGardenList(userKey, true) : undefined;
    const index = userGardens ? userGardens.gardens.map((c) => c.toLowerCase()).indexOf(gardenAddr.toLowerCase()) : -1;
    const hasInviteAndDeposited = index > -1 && userGardens?.hasDepositedFlags[index];
    if (this.gardensCache[gardenAddr] && !force) {
      if (
        !userAddr ||
        !userGardens?.hasDepositedFlags[index] ||
        (userGardens?.hasDepositedFlags[index] && this.gardensCache[gardenAddr].contribution?.address === userAddr)
      ) {
        return this.gardensCache[gardenAddr];
      }
    }
    const viewer = await this.getContract(Viewer);
    const garden = await wrapAwait(viewer.getGardenDetails(gardenAddr), undefined, `GardenDetails ${gardenAddr}`);
    if (garden) {
      let contribution: Contributor | undefined = undefined;
      const cached = garden.contribution?.address === userAddr;
      if (userAddr && hasInviteAndDeposited && (!cached || force)) {
        contribution = await this.getContributionAndRewards(gardenAddr, userAddr);
      }
      this.gardensCache[gardenAddr] = await retrieveFullGardenDetails(userAddr, gardenAddr, garden, contribution, nft);
      // Grab Also strategies
      await this.getStrategiesForGarden(this.gardensCache[gardenAddr]);
      return this.gardensCache[gardenAddr];
    }
    return garden;
  }

  // Cached by user and garden
  public async getUserGardens(address: string | undefined, force: boolean = false): Promise<GardenDetails[]> {
    try {
      // First we get the gardens
      const userGardens = await this.getUserGardenList(address, force);
      // Then we grab all the details
      let fullGardens: GardenDetails[] = [];
      const promises = userGardens.gardens.map(async (gardenAddr: string, index: number) => {
        if (
          (index < userGardens.hasDepositedFlags.length && userGardens.hasDepositedFlags[index]) ||
          index >= userGardens.hasDepositedFlags.length
        ) {
          fullGardens.push(await this.getGardenDetails(gardenAddr, address, force));
        } else {
          fullGardens.push(await retrievePartialGardenDetails(userGardens.data[index]));
        }
      });
      await Promise.all(promises);
      return fullGardens;
    } catch (e) {
      console.log('Error fetching Gardens for user', e);
      return [];
    }
  }

  // Gets all the heart details
  public async getHeartDetails(address: string | undefined, force: boolean = false): Promise<HeartDetails> {
    const heartViewer = await this.getContract(Viewer);
    const heartDetails = await heartViewer.getAllHeartDetails();
    const promises: Promise<any>[] = [];
    promises.push(this.getGardenDetails(heartDetails[0][0], address, force));
    promises.push(
      heartViewer.getGovernanceProposals(
        IS_MAINNET ? GOVERNANCE_PROPOSALS_INFO.slice(0, 10).map((p: any) => BigNumber.from(p.id)) : [],
      ),
    );
    promises.push(heartViewer.getBondDiscounts(bonds.map((b: any) => b.address)));
    let results: any[] = [];
    await Promise.all(promises).then((values: any) => {
      results = values;
    });
    return retrieveHeartDetails(heartDetails, results[0], results[1], results[2]);
  }

  // Cached by garden
  public async getContributorsForGarden(
    gardenDetails: FullGardenDetails,
    force: boolean = false,
  ): Promise<Contributor[]> {
    const maybeBrowserCached = this.gardensCache[gardenDetails.address].contributors;
    if (maybeBrowserCached && maybeBrowserCached.length > 0 && !force) {
      return maybeBrowserCached as Contributor[];
    }

    const addresses = await this.getMembersForGarden(gardenDetails.address);

    if (addresses && addresses.map) {
      const tokenListService = TokenListService.getInstance();
      const reserve = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
      const promises = addresses.map(async (address: string) => {
        const rawContribution = await this.getContributionAndRewards(gardenDetails.address, address);
        const isCreator = address ? isGardenCreator(address, gardenDetails.creator) : false;
        const permission = await wrapAwait(
          this.getGardenPermissions(gardenDetails.address, address, isCreator),
          undefined,
        );
        return getContributionObject(
          address,
          gardenDetails.address,
          gardenDetails,
          rawContribution,
          reserve,
          permission,
        );
      });
      const contributors = await wrapAwait(Promise.all(promises), [], 'GardenContributors');
      const deduped = contributors.filter((c: Contributor | undefined) => !!c) as Contributor[];

      this.gardensCache[gardenDetails.address].contributors = deduped;
    }

    return this.gardensCache[gardenDetails.address].contributors || [];
  }

  // Cached by garden
  public async getStrategiesForGarden(
    gardenDetails: FullGardenDetails,
    force: boolean = false,
    withKeeperStatus: boolean = false,
  ): Promise<StrategyDetails[]> {
    try {
      if (this.gardensCache[gardenDetails.address].fullStrategies && !force) {
        return this.gardensCache[gardenDetails.address].fullStrategies as StrategyDetails[];
      }
      const finalized = gardenDetails.finalizedStrategies;
      const current = gardenDetails.strategies;
      const firstNavs = await this.getFirstNavForGarden(gardenDetails.address);
      const strategyPromises = [...current, ...finalized].map(async (address: string) => {
        const firstNav = firstNavs.find((g) => g.address.toLowerCase() === address.toLowerCase());
        return this.getStrategyDetails(address, gardenDetails, firstNav?.nav, withKeeperStatus);
      });

      this.gardensCache[gardenDetails.address].fullStrategies = await Promise.all(strategyPromises);
      const bablToReserve = await this.getBablAsReserve(gardenDetails.reserveAsset);
      this.gardensCache[gardenDetails.address] = updatesFeesAndReturnsGarden(
        this.gardensCache[gardenDetails.address],
        bablToReserve[0],
      );

      return this.gardensCache[gardenDetails.address].fullStrategies as StrategyDetails[];
    } catch (e) {
      console.log(`Failed to fetch strategy data for garden: ${gardenDetails.address}`);
      throw Error(e);
    }
  }

  public async getStrategyDetails(
    strategyAddress: string,
    gardenDetails: FullGardenDetails,
    firstNAV: string | undefined,
    withKeeperStatus: boolean = false,
  ): Promise<StrategyDetails> {
    const viewer = await this.getContract(Viewer);
    const completeStrategy = await wrapAwait(
      viewer.getCompleteStrategy(strategyAddress),
      undefined,
      `GardenStrategy Full ${strategyAddress}`,
    );
    let keeperStatus;
    // check if we should include keeper status and only if the strategy is not finalized
    if (withKeeperStatus && !completeStrategy[3][2]) {
      keeperStatus = await this.getStrategyStatus(strategyAddress);
    }
    const ops = await wrapAwait(
      viewer.getOperationsStrategy(strategyAddress),
      undefined,
      `StrategyOps ${strategyAddress}`,
    );
    return retrieveFullStrategyDetails(strategyAddress, gardenDetails, completeStrategy, ops, firstNAV, keeperStatus);
  }

  // Cached by user and garden
  public async gardenExists(address: string, userAddr: string | undefined, admin: boolean = false): Promise<boolean> {
    const userGardens = await this.getUserGardenList(userAddr);
    if (admin) {
      return true;
    }
    return userGardens.gardens.map((c) => c.toLowerCase()).indexOf(address.toLowerCase()) !== -1;
  }

  // Cached by user
  public async getUserStrategyActions(strategies: string[], address: string): Promise<UserStratStats> {
    if (this.userStatsCache[address]) {
      return this.userStatsCache[address];
    }
    const viewer = await this.getContract(Viewer);
    const stratStats = await wrapAwait(
      viewer.getUserStrategyActions(strategies, address),
      [BigNumber.from(0), BigNumber.from(0)],
      'getUserStrategyActions',
    );
    // Votes are safe to use formatEther
    let votes = formatEtherDecimal(stratStats[1]);
    // HACK: Because of wrong values in old strategy
    if (votes.toString().length > 18) {
      votes = formatEtherDecimal(BigNumber.from(votes.toString()));
    }
    this.userStatsCache[address] = {
      activatedStrategies: stratStats[0].toNumber(),
      activatedVotes: votes,
    };
    return this.userStatsCache[address];
  }

  // Cached by user address and then garden address
  public async getGardenPermissions(garden: string, wallet: string, isCreator: boolean): Promise<GardenPermission> {
    if (isCreator) {
      return { strategist: true, steward: true, member: true };
    }
    if (this.gardenPermsCache[wallet] && this.gardenPermsCache[wallet][garden]) {
      return this.gardenPermsCache[wallet][garden];
    }
    const viewer = await this.getContract(Viewer);
    const gardenPerms = await wrapAwait(
      viewer.getGardenPermissions(garden, wallet),
      {
        strategist: false,
        steward: false,
        member: false,
      },
      'GardenPermissions',
    );
    if (!this.gardenPermsCache[garden]) {
      this.gardenPermsCache[garden] = {};
    }
    this.gardenPermsCache[garden][wallet] = {
      strategist: gardenPerms[2],
      steward: gardenPerms[1],
      member: gardenPerms[0],
    };
    return this.gardenPermsCache[garden][wallet];
  }

  // Cached by garden
  public async getInvitesUsed(garden: string, force: boolean = false): Promise<InvitesCount> {
    if (this.gardenInvitesCache[garden] && !force) {
      return this.gardenInvitesCache[garden];
    }
    const mardukGate = await this.getContract(MardukGate);
    const total = await mardukGate.maxNumberOfInvites();
    const used = await mardukGate.gardenAccessCount(garden);

    this.gardenInvitesCache[garden] = {
      total: total.toNumber(),
      used: used.toNumber(),
    };
    return this.gardenInvitesCache[garden];
  }

  public async getTokenBalance(tokenAddress: string, userAddr: string): Promise<BigNumber> {
    const token = (await loadContractFromNameAndAddress(tokenAddress, IERC20, getProvider())) as Contract;
    return await token.balanceOf(userAddr);
  }

  public async getTokenControllerAllowance(tokenAddress: string, userAddr: string): Promise<BigNumber> {
    const token = (await loadContractFromNameAndAddress(tokenAddress, IERC20, getProvider())) as Contract;
    return await token.allowance(userAddr, getAddressByName(BabControllerProxy));
  }

  // Get garden voting tokens
  public async getGardenVotingTokens(garden: string, members: string[]): Promise<BigNumber> {
    const viewer = await this.getContract(Viewer);
    return await viewer.getPotentialVotes(garden, members);
  }

  // Get garden voting tokens
  public async getAllProphets(user: string): Promise<BigNumber[]> {
    const viewer = await this.getContract(Viewer);
    return await viewer.getAllProphets(user);
  }

  // Get BABL to Reserve exchange
  public async getBablAsReserve(reserve: string, skipCache: boolean = false): Promise<BigNumber[]> {
    if (this.bablAsReserveCache[reserve] && !skipCache) {
      return Promise.resolve(this.bablAsReserveCache[reserve]);
    }
    const tokenListService = TokenListService.getInstance();
    const reserveToken = tokenListService.getTokenByAddress(reserve) as Token;
    const viewer = await this.getContract(Viewer);

    let bablPrice;
    let reserveBablPrice;

    if (reserveToken.decimals !== 18) {
      try {
        bablPrice = await viewer.getPriceAndLiquidity(addresses.tokens.WETH, addresses.tokens.BABL);
        const reservePrice = await viewer.getPriceAndLiquidity(addresses.tokens.WETH, reserve);
        reserveBablPrice = reservePrice[0]
          .mul(10 ** 9)
          .mul(10 ** 9)
          .div(bablPrice[0]);
      } catch (e) {
        console.log(`Failed to fetch price and liquidity for pair WETH / ${reserve}`);
        throw Error(e);
      }
    } else {
      try {
        bablPrice = await viewer.getPriceAndLiquidity(addresses.tokens.BABL, addresses.tokens.WETH);
        const wethPrice = await viewer.getPriceAndLiquidity(addresses.tokens.WETH, reserve);
        reserveBablPrice = bablPrice[0]
          .mul(wethPrice[0])
          .div(10 ** 9)
          .div(10 ** 9);
      } catch (e) {
        console.log(`Failed to fetch price and liquidity for pair WETH / ${reserve}`);
        throw Error(e);
      }
    }

    this.bablAsReserveCache[reserve] = [reserveBablPrice, bablPrice[1]];
    return Promise.resolve([reserveBablPrice, bablPrice[1]]);
  }

  public async getStrategyStatusAll(): Promise<StrategyStateRow[]> {
    return await fetch('api/v1/get-strategy-status-all', {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log('Failed to fetch statuses', error);
        return [];
      });
  }

  // Private functions
  private async getContributionAndRewards(garden: string, address: string): Promise<any> {
    const viewer = await this.getContract(Viewer);
    const contribution = await wrapAwait(
      viewer.getContributionAndRewards(garden, address),
      undefined,
      'GardenContributions',
    );
    return contribution;
  }

  // Cached by contract name
  private async getContract(type: string, proxy?: string): Promise<Contract> {
    if (this.contracts[type]) {
      return this.contracts[type];
    }
    this.contracts[type] = (await loadContractFromNameAndAddress(
      getAddressByName(proxy || type),
      type,
      getProvider(),
    )) as Contract;
    return this.contracts[type];
  }

  // Cached by user key
  private async getUserGardenList(user: string | undefined, force: boolean = false): Promise<UserGardens> {
    const userKey = user || 'default';
    const userAddress = user || addresses.tokens.DAI; // TODO: replace with ZERO_ADDRESS
    if (this.userGardensKeysCache[userKey] && !force) {
      return this.userGardensKeysCache[userKey];
    }

    const viewer = await this.getContract(Viewer, 'Viewer');
    // First we get the gardens
    let rawUserGardens = await wrapAwait(viewer.getGardensUser(userAddress, 0), [[], [], []], 'UserGardens');
    let gardens = rawUserGardens[0];
    gardens = gardens.filter((a: string) => a.toLowerCase() !== addresses.zero.toLowerCase());
    let flags = rawUserGardens[1].slice(0, gardens.length);
    let data = rawUserGardens[2].slice(0, gardens.length);
    if (rawUserGardens[0].length >= 50 && rawUserGardens) {
      // TODO: Need to fetch again and append every 100
      rawUserGardens = await wrapAwait(viewer.getGardensUser(userAddress, 50), [[], [], []], 'UserGardens');
      const newGardens = rawUserGardens[0].filter((a: string) => a !== addresses.zero);
      gardens = gardens.concat(newGardens);
      flags = flags.concat(rawUserGardens[1].slice(0, newGardens.length));
      data = data.concat(rawUserGardens[2].slice(0, newGardens.length));
    }
    this.userGardensKeysCache[userKey] = {
      gardens: gardens,
      hasDepositedFlags: flags,
      data: data,
    };
    return this.userGardensKeysCache[userKey];
  }

  private async getMembersForGarden(gardenAddress: string, force: boolean = false): Promise<string[]> {
    return await fetch(`/api/v1/get-members/${gardenAddress}?force=${force}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to get members for ${gardenAddress}`, error);
        return [];
      });
  }

  private async getFirstNavForGarden(gardenAddress: string): Promise<FirstNavData[]> {
    return await fetch(`/api/v1/get-first-nav/${gardenAddress}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to get first nav for ${gardenAddress}`, error);
        return [];
      });
  }

  private async getStrategyStatus(strategyAddress: string): Promise<StrategyStateRow> {
    return await fetch(`/api/v1/get-strategy-status/${strategyAddress}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to fetch status for strategy: ${strategyAddress}`, error);
        return {};
      });
  }
}

export default ViewerService;
