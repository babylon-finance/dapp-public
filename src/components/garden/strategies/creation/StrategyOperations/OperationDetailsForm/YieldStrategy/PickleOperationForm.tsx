import { GardenTable, Member } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import { pickle } from 'constants/addresses';
import React, { useState } from 'react';

interface PickleOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const PickleOperationForm = ({ integrationData, previousOperation, setIntegrationData }: PickleOperationFormProps) => {
  const [vault, setVault] = useState<string | undefined>(integrationData);

  const previousAsset = previousOperation ? hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase() : undefined;

  const isDisabled = (picklePool: any): boolean => {
    const poolNeedsPrevious = picklePool.crvpool || picklePool.sushi || picklePool.uni;
    return poolNeedsPrevious && poolNeedsPrevious.toLowerCase() !== previousAsset;
  };

  let selectableJars = pickle.jars;
  if (previousAsset) {
    selectableJars = selectableJars.filter(
      (pool: any) => (pool.crvpool || pool.uni || pool.sushi || '').toLowerCase() === previousAsset,
    );
  }

  return (
    <PickleWrapper>
      <OperationInfoMessage>
        <span>This operation will deposit the LP tokens and stake them into Pickle.</span>
      </OperationInfoMessage>
      <ContentWrapper>
        <GardenTable headers={['Address', 'Name', '']}>
          {selectableJars.map((pickleJar: any) => (
            <tr key={pickleJar.address}>
              <td>
                <Member size={10} address={pickleJar.address} showText />
              </td>
              <td>{pickleJar.name}</td>
              <td>
                {vault !== pickleJar.address && (
                  <Button
                    disabled={isDisabled(pickleJar)}
                    onClick={() => {
                      setVault(pickleJar.address);
                      setIntegrationData(arrayify(pickleJar.address), [previousAsset || pickleJar.address]);
                    }}
                  >
                    {isDisabled(pickleJar) ? 'Get LP first' : 'Select'}
                  </Button>
                )}
                {vault === pickleJar.address && <div>✅</div>}
              </td>
            </tr>
          ))}
        </GardenTable>
      </ContentWrapper>
    </PickleWrapper>
  );
};

const PickleWrapper = styled.div`
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

export default React.memo(PickleOperationForm);
