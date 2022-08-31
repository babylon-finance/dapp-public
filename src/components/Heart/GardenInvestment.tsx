import { ReactComponent as GardenImage1 } from 'components/Leaderboard/svg/garden1.svg';
import { ReactComponent as GardenImage2 } from 'components/Leaderboard/svg/garden2.svg';
import { ReactComponent as GardenImage3 } from 'components/Leaderboard/svg/garden3.svg';

import { CustomGardenDetails, CustomDetails } from 'constants/customDetails';
import { FullGardenDetails } from 'models';
import { formatEtherDecimal } from 'helpers/Numbers';
import { ViewerService } from 'services';

import { Tooltip } from 'rimble-ui';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface GardenInvestmentProps {
  gardenAddress: string;
  weight: BigNumber;
  rank: number;
}

const GardenInvestment = ({ gardenAddress, rank, weight }: GardenInvestmentProps) => {
  const [gardenDetails, setGardenDetails] = useState<FullGardenDetails | undefined>(undefined);
  const customDetails: CustomDetails | undefined = CustomGardenDetails[gardenAddress.toLowerCase()];
  const gardenImageMap = {
    1: <GardenImage1 />,
    2: <GardenImage2 />,
    3: <GardenImage3 />,
  };

  const gardenImage = (rank: number) => {
    if (customDetails?.hasIcon) {
      return (
        <img
          src={`/gardens/${gardenAddress.toLowerCase()}/thumb.png`}
          alt={'garden-thumbnail'}
          width={'100%'}
          height={'100%'}
        />
      );
    } else {
      return gardenImageMap[rank];
    }
  };
  const viewerService = ViewerService.getInstance();

  useEffect(() => {
    const init = async () => {
      const gardenDetails: FullGardenDetails = await viewerService.getGardenDetails(gardenAddress, undefined);
      setGardenDetails(gardenDetails);
    };
    init();
  }, [gardenAddress]);

  const name = gardenDetails ? gardenDetails.name : '...';
  return (
    <GardenInvestmentContainer>
      <GardenRankingAndImage>
        <GardenRanking>{rank}.</GardenRanking>
        <GardenImage>{gardenImage(rank)}</GardenImage>
      </GardenRankingAndImage>
      <GardenName>
        <Tooltip message={name} position="top">
          <div>{name}</div>
        </Tooltip>
      </GardenName>
      <GardenWeight>{formatEtherDecimal(weight.mul(100), 0)}%</GardenWeight>
    </GardenInvestmentContainer>
  );
};

const GardenInvestmentContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: left;
  justify-content: flex-start;
  padding: 0 20px;
  border-right: 1px solid var(--border-blue);
  width: 33%;
  height: 60px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border-right: none;
  }
`;

const GardenRankingAndImage = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const GardenRanking = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-right: 4px;
`;

const GardenImage = styled.div`
  width: 35px;
  height: 35px;
  margin-left: 10px;

  svg {
    width: 95%;
    height: 95%;
  }
`;

const GardenName = styled.div`
  display: block;
  width: 100%;
  height: 16px;
  margin: 4px 0;
  font-size: 15px;
  color: var(--blue-03);

  div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

const GardenWeight = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: white;
`;

export default React.memo(GardenInvestment);
