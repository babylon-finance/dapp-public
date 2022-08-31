import { GardenTable, BaseLoader, TokenDisplay, NumberInput } from 'components/shared/';

import { getUnifiedReserveData, getReserveQuery } from './borrowAdapter';
import { OperationInfoMessage } from '../';
import { Integration, getIntegrationByName, Token, IntegrationName, StrategyOperation } from 'models';
import { TokenListService } from 'services';
import { parseEther } from '@ethersproject/units';
import { useLazyQuery } from '@apollo/client';
import { Button } from 'rimble-ui';
import { arrayify, hexDataSlice, zeroPad } from '@ethersproject/bytes';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { defaultAbiCoder } from '@ethersproject/abi';

interface Reserve {
  id: string;
  name: string;
  symbol: string;
  borrowRate: string;
  collateralFactor: string;
  marketSize: string;
}

interface BorrowStrategyFormProps {
  graphClient: any;
  integration: IntegrationName;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const BorrowStrategyForm = ({
  integration,
  integrationData,
  previousOperation,
  setIntegrationData,
  graphClient,
}: BorrowStrategyFormProps) => {
  const [reserves, setReserves] = useState<Reserve[] | undefined>(undefined);
  const [maxBorrow, setMaxBorrow] = useState<number>(50);
  const [selectedReserve, setSelectedReserve] = useState<string | undefined>(integrationData);
  const tokenListService = TokenListService.getInstance();

  const integrationObj = getIntegrationByName(integration) as Integration;
  const [getReserves, { loading: loadingReserves, data: pairResponse }] = useLazyQuery(
    getReserveQuery(integrationObj),
    {
      client: graphClient,
    },
  );

  const onChangeWithValidation = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setMaxBorrow(Number(value));
  };

  useEffect(() => {
    if (pairResponse) {
      const borrows = getUnifiedReserveData(integrationObj, pairResponse);
      setReserves(borrows);
    }
  }, [pairResponse]);

  useEffect(() => {
    if (graphClient) {
      getReserves();
    } else {
      const borrows = getUnifiedReserveData(integrationObj, {});
      setReserves(borrows);
    }
  }, []);

  const headers = ['Asset', 'Borrow Rate'];

  const maxBorrowBN = parseEther(Number(maxBorrow / 100).toString());

  return (
    <LendStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will borrow your desired % of the collateral value deposited in the previous operation. <br />
          On exit, the strategy will sell any accrued governance tokens (COMP, AAVE etc) back to the reserve asset.
        </span>
      </OperationInfoMessage>
      <FormBox>
        {loadingReserves && <BaseLoader size={40} text="Loading reserves..." />}
        {!loadingReserves && reserves && reserves.length > 0 && (
          <OperationBody>
            <NumberInput
              name={'maxBorrow'}
              value={maxBorrow}
              onChange={onChangeWithValidation}
              label={'% to borrow'}
              required
              valid={maxBorrow > 0 && maxBorrow <= 100}
              postSpan="%"
              tooltip={
                'The percent relative to the amount of collateral and its collateral factor. Borrowings = (Collateral Deposited) x (% to borrow) x (max collateral factor)'
              }
            />
            <GardenTable headers={headers}>
              {reserves
                .filter(
                  (reserve: Reserve) =>
                    !!tokenListService.getTokenByAddress(reserve.id) &&
                    (!previousOperation ||
                      hexDataSlice(previousOperation.data, 12, 32).toLowerCase() !== reserve.id.toLowerCase()),
                )
                .map((reserve: Reserve) => (
                  <tr key={reserve.id}>
                    <td>
                      <TokenDisplay size={28} token={tokenListService.getTokenByAddress(reserve.id) as Token} />
                    </td>
                    <td>{reserve.borrowRate}%</td>
                    <td>
                      {selectedReserve !== reserve.id && (
                        <Button
                          disabled={maxBorrow <= 0 || maxBorrow > 100}
                          onClick={() => {
                            setSelectedReserve(reserve.id);
                            setIntegrationData(
                              arrayify(
                                defaultAbiCoder.encode(['address', 'uint256', 'uint256'], [reserve.id, maxBorrowBN, 0]),
                              ).slice(12, 76),
                            );
                          }}
                        >
                          Select
                        </Button>
                      )}
                      {selectedReserve === reserve.id && <div>✅</div>}
                    </td>
                  </tr>
                ))}
            </GardenTable>
          </OperationBody>
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

const OperationBody = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const LendStrategyWrapper = styled.div`
  padding: 10px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

export default React.memo(BorrowStrategyForm);
