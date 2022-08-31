import { IdentityResponse } from 'models';
import axios from 'axios';

class IdentityService {
  private static instance: IdentityService;

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }

    return IdentityService.instance;
  }

  public async getIdentities(addresses: string[]): Promise<IdentityResponse | undefined> {
    return await fetch('/api/v1/get-identities', {
      body: JSON.stringify({ addresses }),
      method: 'POST',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to get identities withTally ${addresses.join(',')}`, error);
        return [];
      });
  }

  public async getCountry(): Promise<string | undefined> {
    return await axios
      .get('https://ipapi.co/json/?key=xcPt4hRMIzbWNfpT1iEmDJCgcLvtT6G8qfRp67iNx0aCu9CjUG')
      .then((response) => {
        return response.data.country_code;
      })
      .catch(() => {
        console.error('Could not fetch country code');
        return undefined;
      });
  }
}

export default IdentityService;
