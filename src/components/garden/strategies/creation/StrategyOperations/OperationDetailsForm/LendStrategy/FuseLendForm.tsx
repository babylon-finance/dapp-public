import { GardenTable, TokenDisplay, ReserveNumber } from 'components/shared/';
import { OperationInfoMessage } from '../';
import { Token, IntegrationName, FullGardenDetails } from 'models';
import { TokenListService } from 'services';
import { arrayify } from '@ethersproject/bytes';
import { Button } from 'rimble-ui';
import styled from 'styled-components';
import React, { useState } from 'react';

interface Reserve {
  token: Token;
  collateralFactor: string;
  supplyRewardRate: string;
}

interface FuseLendFormProps {
  gardenDetails: FullGardenDetails;
  integration: IntegrationName;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const FuseLendForm = ({ gardenDetails, integration, integrationData, setIntegrationData }: FuseLendFormProps) => {
  const [selectedReserve, setSelectedReserve] = useState<string | undefined>(integrationData);
  const tokenListService = TokenListService.getInstance();

  const reserves: Reserve[] = [];
  const babl = tokenListService.getTokenBySymbol('BABL') as Token;
  reserves.push({
    token: babl,
    collateralFactor: '45',
    supplyRewardRate: '0.0005',
  });
  const fei = tokenListService.getTokenBySymbol('FEI') as Token;
  reserves.push({
    token: fei,
    collateralFactor: '75',
    supplyRewardRate: '0.0007',
  });
  const frax = tokenListService.getTokenBySymbol('FRAX') as Token;
  reserves.push({
    token: frax,
    collateralFactor: '70',
    supplyRewardRate: '0.0008',
  });
  const dai = tokenListService.getTokenBySymbol('DAI') as Token;
  reserves.push({
    token: dai,
    collateralFactor: '75',
    supplyRewardRate: '0.0009',
  });
  const eth = tokenListService.getTokenByAddress('0x') as Token;
  reserves.push({
    token: eth,
    collateralFactor: '70',
    supplyRewardRate: '0.0002',
  });

  const headers = ['Asset', 'Collateral Factor', 'Supply Reward Rate (BABL)'];

  const getReserveRow = (selected: string | undefined, reserve: Reserve, integration: string) => {
    return (
      <tr key={reserve.token.address + integration}>
        <td>
          <TokenDisplay size={28} token={reserve.token} reserveSymbol={reserve.token.symbol} />
        </td>
        <td>{reserve.collateralFactor}%</td>
        <td>{reserve.supplyRewardRate} BABL</td>
        <td>
          {selected !== reserve.token.address && (
            <Button
              onClick={() => {
                setSelectedReserve(reserve.token.address);
                setIntegrationData(arrayify(reserve.token.address));
              }}
            >
              Select
            </Button>
          )}
          {selected === reserve.token.address && <div>✅</div>}
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
          On exit, the strategy will sell any accrued governance tokens (BABL) back to the reserve asset.
          <br />
          <br />
          <b>Note:</b> The greater the collateral factor, the more principal the strategy is able to borrow.
        </span>
      </OperationInfoMessage>
      <FormBox>
        {reserves && reserves.length > 0 && (
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

export default React.memo(FuseLendForm);
