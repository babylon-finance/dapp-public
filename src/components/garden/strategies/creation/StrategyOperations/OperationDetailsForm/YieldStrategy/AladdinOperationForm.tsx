import { GardenTable, Member } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import { aladdin } from 'constants/addresses';
import React, { useState } from 'react';

interface AladdinOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const AladdinOperationForm = ({
  integrationData,
  previousOperation,
  setIntegrationData,
}: AladdinOperationFormProps) => {
  const [vault, setVault] = useState<string | undefined>(integrationData);

  const previousAsset = previousOperation ? hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase() : undefined;

  return (
    <AladdinWrapper>
      <OperationInfoMessage>
        <span>
          This operation will deposit into Clever, crv Concentrator or any of the Convex Concentrator vaults. If you
          want to enter a convex concentrator vault, please enter the crv pool first.
        </span>
      </OperationInfoMessage>
      <ContentWrapper>
        <GardenTable headers={['Address', 'Name', '']}>
          {aladdin.pools.map((aladdinPool: any) => (
            <tr key={aladdinPool.lptoken}>
              <td>
                <Member size={10} address={aladdinPool.lptoken} showText />
              </td>
              <td>{aladdinPool.name}</td>
              <td>
                {vault !== aladdinPool.lptoken && (
                  <Button
                    disabled={aladdinPool.crvpool && aladdinPool.crvpool.toLowerCase() !== previousAsset}
                    onClick={() => {
                      setVault(aladdinPool.lptoken);
                      setIntegrationData(arrayify(aladdinPool.lptoken), [previousAsset || aladdinPool.lptoken]);
                    }}
                  >
                    {aladdinPool.crvpool && aladdinPool.crvpool.toLowerCase() !== previousAsset
                      ? ' Enter Curve First'
                      : 'Select'}
                  </Button>
                )}
                {vault === aladdinPool.lptoken && <div>✅</div>}
              </td>
            </tr>
          ))}
        </GardenTable>
      </ContentWrapper>
    </AladdinWrapper>
  );
};

const AladdinWrapper = styled.div`
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

export default React.memo(AladdinOperationForm);
