import { BASE_IPFS_GATEWAY_URL } from 'config';

// Number of image / color variations for random selection, we should update this when/if we add
// more icon variations in Pinata
const VARIATIONS = 20;
// IMPORTANT: If we add more Icons we must update this CID sinc folder are technically files in IPFS and
// thus CID must change if file contents change.
const FOLDER_CID = 'Qmbdwgt4rXqhAup7ncwHKuSxQxBhVQ9siSmsgSQyAmCdVy';
const URL_ROOT = `${BASE_IPFS_GATEWAY_URL}${FOLDER_CID}`;

// Supports up to 999 variations
const getVariation = (seed: number): string => {
  return String((seed % VARIATIONS) + 1).padStart(3, '0');
};

// Example: https://babylon.mypinata.cloud/ipfs/Qmbdwgt4rXqhAup7ncwHKuSxQxBhVQ9siSmsgSQyAmCdVy/001.png
export const getInitialGardenImage = (seed: number): string => {
  return `${URL_ROOT}/${getVariation(seed)}.png`;
};
