import { TextInput, NumberInput } from 'components/shared/';
import { OperationInfoMessage } from '../';
import { IntegrationName, StrategyOperation, GardenDetails } from 'models';
import { Button } from 'rimble-ui';
import { arrayify } from '@ethersproject/bytes';
import React, { useState } from 'react';
import styled from 'styled-components';
import { isAddress } from '@ethersproject/address';
import { defaultAbiCoder } from '@ethersproject/abi';

import { ZERO_ADDRESS } from 'config';

interface CustomStrategyFormProps {
  integration: IntegrationName;
  gardenDetails: GardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const CustomStrategyForm = ({ integration, integrationData, setIntegrationData }: CustomStrategyFormProps) => {
  const [addressParam, setAddressParam] = useState<string>(ZERO_ADDRESS);
  const [numberParam, setNumberParam] = useState<number>(0);

  const onChangeWithValidation = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { value } = e.currentTarget;
    setNumberParam(Number(value));
  };

  return (
    <LendStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will call your smart contract with two optional parameters (a contract address and a number).{' '}
          <br />
          These parameters are optional and can be used to dynamically tell the integration which pool or asset to
          interact with.
        </span>
      </OperationInfoMessage>
      <FormBox>
        <OperationBody>
          <TextInput
            value={addressParam}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setAddressParam(e.currentTarget.value);
            }}
            name={'name'}
            label={'Address to pass to the custom integration'}
            width={'100%'}
            placeholder="0x...."
            required
            tooltip={'This parameter will be passed as part of the calldata as an uint to the integration'}
            valid={isAddress(addressParam)}
          />
          <NumberInput
            name={'numberParam'}
            value={numberParam}
            onChange={onChangeWithValidation}
            label={'Number to pass to the custom integration'}
            required
            valid={numberParam >= 0}
            tooltip={'This parameter will be passed as part of the calldata as an uint to the integration'}
          />
          <Button
            disabled={false}
            onClick={() => {
              setIntegrationData(
                arrayify(
                  defaultAbiCoder.encode(['address', 'uint256', 'uint256'], [addressParam, numberParam, 0]),
                ).slice(12, 76),
              );
            }}
          >
            Save Custom Integration
          </Button>
        </OperationBody>
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

export default React.memo(CustomStrategyForm);
