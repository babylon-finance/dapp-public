import { GardenTable, Member } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import { convex } from 'constants/addresses';
import React, { useState } from 'react';

interface ConvexOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const ConvexOperationForm = ({ integrationData, previousOperation, setIntegrationData }: ConvexOperationFormProps) => {
  const [vault, setVault] = useState<string | undefined>(integrationData);

  const curvePool = previousOperation ? hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase() : undefined;

  const isDisabled = (convexPool: any): boolean => {
    return !previousOperation || convexPool.crvpool.toLowerCase() !== curvePool;
  };

  let selectablePools = convex.pools;
  if (curvePool) {
    selectablePools = selectablePools.filter((pool: any) => pool.crvpool.toLowerCase() === curvePool);
  }

  return (
    <ConvexWrapper>
      <OperationInfoMessage>
        <span>This operation will deposit the Curve LP tokens and stake them into Convex.</span>
      </OperationInfoMessage>
      <ContentWrapper>
        <GardenTable headers={['Address', 'Name', '']}>
          {selectablePools.map((convexPool: any) => (
            <tr key={convexPool.cvxpool}>
              <td>
                <Member size={10} address={convexPool.cvxpool} showText />
              </td>
              <td>{convexPool.name}</td>
              <td>
                {vault !== convexPool.cvxpool && (
                  <Button
                    disabled={isDisabled(convexPool)}
                    onClick={() => {
                      setVault(convexPool.cvxpool);
                      setIntegrationData(arrayify(convexPool.cvxpool), [convexPool.crvpool]);
                    }}
                  >
                    {isDisabled(convexPool) ? 'Enter Curve first' : 'Select'}
                  </Button>
                )}
                {vault === convexPool.cvxpool && <div>✅</div>}
              </td>
            </tr>
          ))}
        </GardenTable>
      </ContentWrapper>
    </ConvexWrapper>
  );
};

const ConvexWrapper = styled.div`
  padding: 20px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px 0;
`;

export default React.memo(ConvexOperationForm);
