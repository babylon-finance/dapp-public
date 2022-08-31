import { GardenTable, Member } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import styled from 'styled-components';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import { curve } from 'constants/addresses';
import React, { useState } from 'react';

interface CurveGaugeOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

interface CurvePool {
  name: string;
  address: string;
}

const CurveGaugeOperationForm = ({
  integrationData,
  previousOperation,
  setIntegrationData,
}: CurveGaugeOperationFormProps) => {
  const [vault, setVault] = useState<string | undefined>(integrationData);

  const previousAsset = previousOperation ? hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase() : undefined;

  const pools: CurvePool[] = [];
  Object.keys(curve.pools.v3).forEach((name: string) => {
    pools.push({ name: name, address: curve.pools.v3[name] });
  });
  Object.keys(curve.pools.crypto).forEach((name: string) => {
    pools.push({ name: name, address: curve.pools.crypto[name] });
  });
  Object.keys(curve.pools.factory).forEach((name: string) => {
    pools.push({ name: name, address: curve.pools.factory[name] });
  });
  Object.keys(curve.pools.cryptofactory).forEach((name: string) => {
    pools.push({ name: name, address: curve.pools.cryptofactory[name] });
  });
  let selectableGauges = pools.filter(
    (pool: any) =>
      pool.address.toLowerCase() === previousAsset && curve.pools.gaugeBlacklist.indexOf(pool.address) === -1,
  );

  return (
    <CurveGaugeWrapper>
      <OperationInfoMessage>
        <span>This operation will deposit the curve lp tokens into its gauge.</span>
      </OperationInfoMessage>
      <ContentWrapper>
        <GardenTable headers={['Address', 'Name', '']}>
          {selectableGauges.map((gauge: any) => (
            <tr key={gauge.address}>
              <td>
                <Member size={10} address={gauge.address} showText />
              </td>
              <td>{gauge.name}</td>
              <td>
                {vault !== gauge.address && (
                  <Button
                    onClick={() => {
                      setVault(gauge.address);
                      setIntegrationData(arrayify(gauge.address), [previousAsset || gauge.address]);
                    }}
                  >
                    Select
                  </Button>
                )}
                {vault === gauge.address && <div>✅</div>}
              </td>
            </tr>
          ))}
        </GardenTable>
      </ContentWrapper>
    </CurveGaugeWrapper>
  );
};

const CurveGaugeWrapper = styled.div`
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

export default React.memo(CurveGaugeOperationForm);
