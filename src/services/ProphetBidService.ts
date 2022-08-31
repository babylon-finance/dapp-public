import { ProphetBid, ProphetBidBuckets, ProphetMaxMinted, ProphetSignature } from 'models';

import axios from 'axios';

export const getExistingBidsForWallet = async (address: string): Promise<ProphetBid[] | undefined> => {
  return await axios
    .get(`/api/v1/get-prophet-bids-by-address/${address}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Failed to fetch existing bid for wallet', error);
      return undefined;
    });
};

export const getBidBuckets = async (): Promise<ProphetBidBuckets | undefined> => {
  return await axios
    .get(`/api/v1/get-prophet-bids`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Failed to fetch bid data', error);
      return undefined;
    });
};

export const getSignatures = async (): Promise<ProphetSignature[]> => {
  return await axios
    .get(`/api/v1/get-prophet-sigs`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Failed to fetch signatures');
      return [];
    });
};

export const getMintedImages = async (force: boolean = false): Promise<any[]> => {
  return await axios
    .get(`/api/v1/get-prophet-images?force=${force}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Failed to fetch minted image list');
      return [];
    });
};
