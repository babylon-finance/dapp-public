import { GardenDetailsBlock } from './';

import { FullGardenDetails, GardenMetricResponse, GardenPermission } from 'models';
import { ViewerService } from 'services';

import { Box } from 'rimble-ui';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface GardenDetailHeaderProps {
  metricData: GardenMetricResponse;
  gardenDetails: FullGardenDetails;
  userPermissions: GardenPermission | undefined;
  refetch: () => void;
}

const GardenDetailHeader = ({ gardenDetails, metricData, refetch, userPermissions }: GardenDetailHeaderProps) => {
  const [bablToReserve, setBablToReserve] = useState<BigNumber | undefined>(undefined);
  const viewerService = ViewerService.getInstance();

  const setBablQuote = async () => {
    const result = await viewerService.getBablAsReserve(gardenDetails.reserveAsset);
    setBablToReserve(result[0]);
  };

  useEffect(() => {
    setBablQuote();
  }, []);

  return (
    <>
      <HeaderWrapper>
        <ContainerLarge>
          {bablToReserve && metricData && (
            <GardenDetailsBlock
              metricData={metricData}
              gardenDetails={gardenDetails}
              refetch={refetch}
              userPermissions={userPermissions}
              bablToReserve={bablToReserve}
            />
          )}
        </ContainerLarge>
      </HeaderWrapper>
    </>
  );
};

const ContentWrapper = styled.div`
  width: 100%;
  height: auto;
`;

const HeaderWrapper = styled(ContentWrapper)``;

const ContainerLarge = styled(Box)`
  position: relative;
  padding: 10px 30px 0 30px;
  width: var(--screen-lg-min);
  margin: 0 auto;

  @media only screen and (max-width: 1440px) {
    width: 100%;
    padding: 10px 100px;
  }

  @media only screen and (max-width: 1240px) {
    padding-left: 30px;
    padding-right: 30px;
  }
`;

export default React.memo(GardenDetailHeader);
