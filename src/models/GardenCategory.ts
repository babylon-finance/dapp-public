export interface GardenCategory {
  key: string;
  display: string;
}

// These map to on-chain values for Verified Gardens
export const GardenCategories = [
  { key: 'other', display: 'Other' }, // 0
  { key: 'accumulation', display: 'Accumulation' }, // 1
  { key: 'high-risk', display: 'High Risk' }, // 2
  { key: 'official', display: 'Partner' }, // 3
];

export const getGardenCategory = (category: number): GardenCategory => {
  if (category > 0 && category <= Object.keys(GardenCategories).length - 1) {
    return GardenCategories[category];
  } else {
    return GardenCategories[0];
  }
};
