import { ProphetImageUri, ProphetNFT } from 'models';
import prophets from 'constants/prophets.json';
import prophetImages from 'constants/prophetImages.json';

export const getProphetObject = (id: number, images?: ProphetImageUri[]): ProphetNFT => {
  const prophet = prophets[id - 1];
  if (id >= 8001) {
    prophet.image = prophetImages[id];
  }
  if (images && id <= 8000) {
    prophet.image = images.find((entry) => entry.id === id)?.uri;
  }
  return {
    name: prophet.name,
    image: prophet.image || '',
    description: prophet.description || '',
    attributes: { id, ...prophet },
  };
};
