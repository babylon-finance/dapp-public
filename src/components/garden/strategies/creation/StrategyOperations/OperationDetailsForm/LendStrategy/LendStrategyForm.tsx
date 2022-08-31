import { GardenTable, BaseLoader, TokenDisplay, ReserveNumber } from 'components/shared/';
import { OperationInfoMessage } from '../';

import { getUnifiedReserveData, getReserveQuery } from './lendAdapter';
import { Integration, getIntegrationByName, Token, IntegrationName, FullGardenDetails } from 'models';
import { TokenListService } from 'services';

import { arrayify } from '@ethersproject/bytes';
import { Button } from 'rimble-ui';
import { useLazyQuery } from '@apollo/client';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface Reserve {
  id: string;
  name: string;
  symbol: string;
  marketSize: string;
  collateralFactor: string;
  liquidityRate: string;
}

interface LendStrategyFormProps {
  gardenDetails: FullGardenDetails;
  graphClient: any;
  integration: IntegrationName;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const LendStrategyForm = ({
  gardenDetails,
  integration,
  integrationData,
  setIntegrationData,
  graphClient,
}: LendStrategyFormProps) => {
  const [reserves, setReserves] = useState<Reserve[] | undefined>(undefined);
  const [selectedReserve, setSelectedReserve] = useState<string | undefined>(integrationData);
  const integrationObj = getIntegrationByName(integration) as Integration;
  const [getReserves, { loading: loadingReserves, data: pairResponse }] = useLazyQuery(
    getReserveQuery(integrationObj),
    {
      client: graphClient,
    },
  );

  const tokenListService = TokenListService.getInstance();

  useEffect(() => {
    if (pairResponse) {
      const lends = getUnifiedReserveData(integrationObj, pairResponse);
      setReserves(lends);
    }
  }, [pairResponse]);

  useEffect(() => {
    getReserves();
  }, [integration]);

  useEffect(() => {
    getReserves();
  }, []);

  const headers = ['Asset', 'Collateral Factor', 'Supply APY'];

  const getReserveRow = (selected: string | undefined, reserve: Reserve, integration: string) => {
    const maybeToken = tokenListService.getTokenByAddress(reserve.id);

    return (
      <tr key={reserve.id + integration}>
        <td>
          <TokenDisplay size={28} token={maybeToken} reserveSymbol={reserve.symbol} />
        </td>
        <td>{reserve.collateralFactor}%</td>
        <td>{reserve.liquidityRate}%</td>
        <td>
          {selected !== reserve.id && (
            <Button
              onClick={() => {
                setSelectedReserve(reserve.id);
                setIntegrationData(arrayify(reserve.id));
              }}
            >
              Select
            </Button>
          )}
          {selected === reserve.id && <div>✅</div>}
        </td>
      </tr>
    );
  };

  return (
    <LendStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will automatically swap the reserve asset into the collateral before lending to the protocol.
          Collateral assets need to meet the Garden min liquidity requirements:
          <br />
          <b>
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />
          </b>
          <br />
          <br />
          On exit, the strategy will sell any accrued governance tokens (COMP, AAVE etc) back to the reserve asset.
          <br />
          <br />
          <b>Note:</b> The greater the collateral factor, the more principal the strategy is able to borrow.
        </span>
      </OperationInfoMessage>
      <FormBox>
        {loadingReserves && <BaseLoader size={40} text="Loading reserves..." />}
        {!loadingReserves && reserves && reserves.length > 0 && (
          <GardenTable headers={headers}>
            {reserves.map((reserve: Reserve) => getReserveRow(selectedReserve, reserve, integration))}
          </GardenTable>
        )}
      </FormBox>
    </LendStrategyWrapper>
  );
};

const FormBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const LendStrategyWrapper = styled.div`
  padding: 10px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

export default React.memo(LendStrategyForm);
