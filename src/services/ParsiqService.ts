import { FullGardenDetails, GardenNFTMeta, ParsiqTransport, Token } from 'models';
import NftService from './NftService';
import TokenListService from './TokenListService';

import axios from 'axios';

class ParsiqService {
  private static instance: ParsiqService;
  private nftService: NftService;
  private tokenListService: TokenListService;

  private constructor(nftService: NftService, tokenListService: TokenListService) {
    this.nftService = nftService;
    this.tokenListService = tokenListService;
  }

  public static getInstance(): ParsiqService {
    if (!ParsiqService.instance) {
      const nftService = NftService.getInstance();
      const tokenListService = TokenListService.getInstance();
      ParsiqService.instance = new ParsiqService(nftService, tokenListService);
    }

    return ParsiqService.instance;
  }

  public async createGardenTransport(
    gardenAddress: string,
    gardenDetails: FullGardenDetails,
  ): Promise<ParsiqTransport | undefined> {
    const tokenDetails = this.tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
    const { decimals, symbol } = tokenDetails;
    const { name } = gardenDetails;

    return await axios
      .post('/api/v1/create-garden-transport', {
        body: JSON.stringify({ gardenAddress, name, symbol, decimals }),
        method: 'POST',
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (error.response.status === 409) {
          console.error('Transport already exists, skipping...');

          return undefined;
        } else {
          console.error(error.response.statusText);

          return undefined;
        }
      });
  }

  public async deleteGardenTransport(gardenAddress: string): Promise<boolean> {
    return await axios
      .delete(`/api/v1/delete-garden-transport/${gardenAddress}`)
      .then(() => {
        // Maybe also delete the transport status row here
        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  public async getTransportStatus(transportId: string): Promise<boolean> {
    return await axios
      .get(`/api/v1/transport-status/${transportId}`)
      .then((response) => {
        return response.data === true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }

  public async watchStrategy(
    strategyAddress: string,
    strategyName: string,
    gardenAddress: string,
    seed: number,
  ): Promise<boolean> {
    try {
      const gardenNFT: GardenNFTMeta | undefined = await this.nftService.getGardenNft(gardenAddress, seed);
      const transportID = gardenNFT?.transport?.transport_id;

      if (transportID) {
        await fetch('/api/v1/watch-strategy', {
          body: JSON.stringify({ strategyAddress, strategyName, transportID }),
          method: 'POST',
        });

        return true;
      } else {
        console.log(`Transport data not found for garden: ${gardenAddress}... Skipping alert setup.`);

        return false;
      }
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  public async unwatchStrategy(strategyAddress: string): Promise<boolean> {
    return await axios
      .delete(`/api/v1/unwatch-strategy/${strategyAddress}`)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  }
}

export default ParsiqService;
