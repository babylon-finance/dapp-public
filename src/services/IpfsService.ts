import { PinObjectResponse, PinListResponse } from 'models';

class IpfsService {
  private static instance: IpfsService;

  public static getInstance(): IpfsService {
    if (!IpfsService.instance) {
      IpfsService.instance = new IpfsService();
    }

    return IpfsService.instance;
  }

  public async pinObject(object: Object, options?: Object): Promise<PinObjectResponse> {
    const body = object;
    return await fetch('/api/v1/pin-to-ipfs', {
      body: JSON.stringify({ body, options }),
      method: 'POST',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to pin IPFS object`, error);
        return [];
      });
  }

  public async pinImage(formData: FormData): Promise<PinObjectResponse | undefined> {
    return await fetch('/api/v1/pin-image-to-ipfs', {
      body: formData,
      method: 'POST',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to pin IPFS image`, error);
        return undefined;
      });
  }

  public async getFilteredPins(filters?: Object): Promise<PinListResponse> {
    return (
      await fetch('/api/v1/get-filtered-pins', {
        body: JSON.stringify({ filters }),
        method: 'POST',
      })
    ).json();
  }
}

export default IpfsService;
