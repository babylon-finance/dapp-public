import {
  HeartDetails,
  FullGardenDetails,
  HeartStats,
  HeartWeights,
  GardenWeight,
  GovernanceProposal,
  HeartBond,
} from 'models';
import { GOVERNANCE_PROPOSALS_INFO, IS_MAINNET } from 'config';
import { BigNumber } from '@ethersproject/bignumber';
import { bonds, tokens } from 'constants/addresses';

export const retrieveHeartDetails = async (
  heartDetails: any,
  heartGardenDetails: FullGardenDetails,
  proposals: any,
  bondDiscounts: BigNumber[],
): Promise<HeartDetails> => {
  const stats: HeartStats = {
    totalFees: heartDetails[1][0],
    treasury: heartDetails[1][1],
    buybacks: heartDetails[1][2],
    liquidity: heartDetails[1][3],
    gardenInvestments: heartDetails[1][4],
    fuse: heartDetails[1][5],
    weeklyRewards: heartDetails[1][6],
    shield: heartDetails[1][7],
  };

  const weights: HeartWeights = {
    treasury: heartDetails[2][0],
    buybacks: heartDetails[2][1],
    liquidity: heartDetails[2][2],
    gardenInvestments: heartDetails[2][3],
    fuse: heartDetails[2][4],
    shield: heartDetails[2][5],
  };

  const gardenWeights: GardenWeight[] = [];

  heartDetails[3].forEach((gardenAdd: string, index: number) => {
    gardenWeights.push({
      address: gardenAdd,
      weight: heartDetails[4][index],
    });
  });

  const heartBonds = [...bonds]
    .map((bondObj: any, index: number) => {
      return {
        name: bondObj.name,
        address: bondObj.address,
        discount: bondDiscounts[index].mul(100).div(1e9).div(1e9).toNumber(),
        link: bondObj.link || undefined,
      };
    })
    .filter((bond: HeartBond) => bond.discount > 0 || bond.address.toLowerCase() === tokens.BABL.toLowerCase());

  const cleanedProposals: GovernanceProposal[] = [];
  const proposalsInfo = IS_MAINNET ? GOVERNANCE_PROPOSALS_INFO : [];

  proposalsInfo.slice(0, 10).forEach((proposal: any, index: number) => {
    cleanedProposals.push({
      displayId: proposal.displayId,
      id: proposal.id,
      name: proposal.name,
      proposer: proposals[0][index],
      endedAt: proposals[1][index].toNumber(),
      netVotes: proposals[2][index],
      state: proposals[3][index],
    });
  });

  const detailsObj: HeartDetails = {
    gardenAddress: heartDetails[0][0],
    gardenDetails: heartGardenDetails,
    nextLendAsset: heartDetails[0][1],
    totalStats: stats,
    feeWeights: weights,
    gardenWeights: gardenWeights,
    weeklyReward: heartDetails[5][0],
    rewardLeft: heartDetails[5][1],
    lastPumpAt: heartDetails[6][0],
    lastVoteAt: heartDetails[6][1],
    currentLiquidityWeth: heartDetails[7][0],
    currentLiquidityBabl: heartDetails[7][1],
    proposals: cleanedProposals,
    bonds: heartBonds,
  };

  return detailsObj;
};
