import { GardenTable, Member } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import { pickle } from 'constants/addresses';
import React, { useState } from 'react';

interface PickleFarmOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const PickleFarmOperationForm = ({
  integrationData,
  previousOperation,
  setIntegrationData,
}: PickleFarmOperationFormProps) => {
  const [vault, setVault] = useState<string | undefined>(integrationData);

  const previousAsset = previousOperation ? hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase() : undefined;

  let selectableJars = pickle.jars.filter((pool: any) => pool.address.toLowerCase() === previousAsset);

  return (
    <PickleWrapper>
      <OperationInfoMessage>
        <span>This operation will deposit the jar pTokens into its pickle farm.</span>
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
                    onClick={() => {
                      setVault(pickleJar.address);
                      setIntegrationData(arrayify(pickleJar.address), [previousAsset || pickleJar.address]);
                    }}
                  >
                    Select
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

export default React.memo(PickleFarmOperationForm);
