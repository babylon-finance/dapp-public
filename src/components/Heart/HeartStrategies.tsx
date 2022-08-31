import { FullGardenDetails, GardenPermission, ExistingVotes } from 'models';
import { getStrategiesByType } from 'components/garden/detail/utils/getStrategiesByType';
import { GardenStrategiesTab } from 'components/garden/detail/components/';

import { BREAKPOINTS } from 'config';
import { getVotesForStrategy } from 'services';
import { getAllSubgraphClients } from 'utils/SubgraphClient';
import { useW3Context } from 'context/W3Provider';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
interface HeartStrategiesProps {
  gardenDetails: FullGardenDetails;
  fetchData: () => void;
  userPermissions: GardenPermission;
  metricData?: any;
}

const HeartStrategies = ({ gardenDetails, fetchData, userPermissions, metricData }: HeartStrategiesProps) => {
  const { address, blockTimestamp, wallet, network } = useW3Context();

  const [existingVotes, setExistingVotes] = useState<ExistingVotes | undefined>(undefined);

  const strategies = getStrategiesByType(gardenDetails, blockTimestamp || 0, address);

  useEffect(() => {
    const init = async () => {
      let votes = {};
      if (gardenDetails.fullStrategies) {
        await Promise.all(
          gardenDetails.fullStrategies.map(async (row) => {
            const results = await getVotesForStrategy(row.address);
            if (results) {
              votes[row.address.toLowerCase()] = results;
            }
          }),
        );
      }
      setExistingVotes(votes);
    };
    init();
  }, [address, wallet, network]);

  return (
    <HeartStrategiesContainer>
      <GardenStrategiesTab
        hideTitle
        isHeart
        strategies={strategies}
        gardenDetails={gardenDetails}
        userPermissions={userPermissions}
        existingVotes={existingVotes}
        subgraphClients={getAllSubgraphClients()}
        fetchData={() => fetchData()}
        metricData={metricData}
      />
    </HeartStrategiesContainer>
  );
};

const HeartStrategiesContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1224px;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 30px;
  background-color: var(--blue-alt);

  > div {
    padding: 0;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 12px;
  }
`;

export default React.memo(HeartStrategies);
