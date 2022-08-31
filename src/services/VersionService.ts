import { VersionResponse } from 'models';

class VersionService {
  private static instance: VersionService;

  public static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService();
    }

    return VersionService.instance;
  }

  public async getVersion(): Promise<VersionResponse | undefined> {
    return await fetch('/api/v1/get-version', {
      method: 'GET',
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(`Failed to get version`, error);
        return [];
      });
  }
}

export default VersionService;
