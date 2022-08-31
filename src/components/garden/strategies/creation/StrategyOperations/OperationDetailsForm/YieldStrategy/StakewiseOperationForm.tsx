import { PurpleButton } from 'components/shared/';
import { FullGardenDetails } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify } from '@ethersproject/bytes';
import addresses from 'constants/addresses';
import React from 'react';

interface StakewiseOperationFormProps {
  gardenDetails: FullGardenDetails;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const StakewiseOperationForm = ({
  // gardenDetails,
  // operationIndex
  // integration,
  // integrationData,
  setIntegrationData,
}: StakewiseOperationFormProps) => {
  return (
    <StakewiseWrapper>
      <OperationInfoMessage>
        <span>This operation will automatically swap the reserve asset into ETH and deposit it into Stakewise.</span>
      </OperationInfoMessage>
      <ContentWrapper>
        <StyledPurpleButton
          onClick={() => {
            setIntegrationData(arrayify(addresses.stakewise.seth2), [addresses.stakewise.seth2]);
          }}
        >
          Stake ETH
        </StyledPurpleButton>
      </ContentWrapper>
    </StakewiseWrapper>
  );
};

const StakewiseWrapper = styled.div`
  padding: 20px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;
const StyledPurpleButton = styled(PurpleButton)`
  width: 150px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px 0;
`;

export default React.memo(StakewiseOperationForm);
