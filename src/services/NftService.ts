import { BASE_IPFS_GATEWAY_URL } from 'config';
import { generate32BitIntegerHash } from 'helpers/Numbers';
import { PinObjectResponse, PinObjectResponseWithUri, BaseNFT, GardenNFTMeta, GardenNFTOptionals } from 'models';
import IpfsService from './IpfsService';

class NftService {
  private static instance: NftService;
  private ipfs: IpfsService;

  private constructor(ipfs: IpfsService) {
    this.ipfs = ipfs;
  }

  public static getInstance() {
    if (!NftService.instance) {
      NftService.instance = new NftService(IpfsService.getInstance());
    }

    return NftService.instance;
  }

  public buildNftSeed(name: string, timestamp: number): number {
    return generate32BitIntegerHash(name + timestamp.toString());
  }

  // Note: repeatedly pinning with the same pin will result in unique IPFS objects, but Pinata.pinList(seed)
  // will return a list of pins that share this seed for "name" sorted newest -> oldest
  public async pinNft<T extends BaseNFT>(seed: string, nft: T): Promise<PinObjectResponseWithUri> {
    const options = {
      pinataMetadata: {
        name: seed,
      },
    };

    const pinObject: PinObjectResponse = await this.ipfs.pinObject(nft, options);

    return { ...pinObject, uri: `${BASE_IPFS_GATEWAY_URL}${pinObject.IpfsHash}` };
  }

  public async pinImage(seed: string, formData: FormData): Promise<PinObjectResponseWithUri | undefined> {
    const options = {
      pinataMetadata: {
        name: seed,
      },
    };

    formData.append('options', JSON.stringify(options));

    const pinObject: PinObjectResponse | undefined = await this.ipfs.pinImage(formData);
    if (pinObject) {
      return { ...pinObject, uri: `${BASE_IPFS_GATEWAY_URL}${pinObject.IpfsHash}` };
    }
    return undefined;
  }

  public async getGardenNft(address: string, seed: number): Promise<GardenNFTMeta | undefined> {
    return await fetch(`/api/v1/nft/${seed}`, {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        const result = json;

        return Object.keys(result).length > 0 ? result : undefined;
      })
      .catch((error) => {
        console.log(`Failed to fetch NFT for: ${address}`, error);
      });
  }

  public async updateGardenNft(
    gardenAddress: string,
    seed: number,
    nftUpdate: GardenNFTOptionals,
  ): Promise<PinObjectResponse | undefined> {
    try {
      const currentNft = await this.getGardenNft(gardenAddress, seed);

      if (currentNft) {
        const updated = this._mergeNftUpdate(currentNft, { ...nftUpdate, updatedAt: Date.now() });

        // In the unexpected case where a garden NFT doesn't contain seed we add one.
        const seed = String(currentNft.seed ? currentNft.seed : this.buildNftSeed(currentNft.name, Date.now()));

        return this.pinNft(seed, updated);
      } else {
        throw new Error(`NFT not found for garden: ${gardenAddress}`);
      }
    } catch (err) {
      console.log(err);

      return;
    }
  }

  private _mergeNftUpdate(previous: GardenNFTMeta, updated: GardenNFTOptionals): GardenNFTMeta {
    let result = { ...previous };

    Object.keys({ ...updated }).forEach((key) => {
      result[key] = updated[key];
    });

    return result as GardenNFTMeta;
  }
}

export default NftService;
