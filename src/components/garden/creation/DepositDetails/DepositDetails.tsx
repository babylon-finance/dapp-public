import { NumberInput } from 'components/shared/';

import { RESERVES_CREATION_CONFIG } from 'config';
import { GardenCreationDepositDetails, GardenCreationMainDetails, FullGardenDetails, Token } from 'models/';
import { TokenListService } from 'services';

import { commify } from '@ethersproject/units';
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface MainDetailsProps {
  className?: string;
  gardenDetails: GardenCreationMainDetails | FullGardenDetails;
  details: GardenCreationDepositDetails | undefined;
  setDepositDetails: (details: GardenCreationDepositDetails, isValid: boolean) => void;
}

enum DetailProps {
  minContribution = 'minContribution',
  maxDepositLimit = 'maxDepositLimit',
  depositHardlock = 'depositHardlock',
  sharePriceDelta = 'sharePriceDelta',
  sharePriceDeltaDecay = 'sharePriceDeltaDecay',
}

const defaultDetails: GardenCreationDepositDetails = {
  minContribution: 0.1,
  maxDepositLimit: 100,
  depositHardlock: 1,
  sharePriceDelta: 25,
  sharePriceDeltaDecay: 100,
};

const DepositDetails = ({ details, className, setDepositDetails, gardenDetails }: MainDetailsProps) => {
  const tokenListService = TokenListService.getInstance();
  const reserveTokenSymbol = (tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token).symbol;
  const reserveConfig = RESERVES_CREATION_CONFIG[reserveTokenSymbol.toLowerCase()];
  defaultDetails.minContribution = reserveConfig.minDeposit;
  defaultDetails.maxDepositLimit = reserveConfig.minDeposit * 1000;
  const detailsToRender = details || defaultDetails;

  const onChangeItem = (prop: string, value: number) => {
    const newDetails: GardenCreationDepositDetails = { ...detailsToRender } as GardenCreationDepositDetails;
    newDetails[prop] = value;
    setDepositDetails(newDetails, isFormValid(newDetails));
  };

  const isValid = (prop: string, value: number): boolean => {
    if (prop === DetailProps.minContribution && value) {
      return value >= reserveConfig.minDeposit && value <= reserveConfig.totalDepositLimit / 100;
    }

    if (prop === DetailProps.maxDepositLimit && value) {
      return value >= reserveConfig.minDeposit * 100 && value <= reserveConfig.totalDepositLimit;
    }

    if (prop === DetailProps.sharePriceDelta && value) {
      return value >= 2 && value <= 1000;
    }

    if (prop === DetailProps.sharePriceDeltaDecay && value) {
      return value >= 10 && value <= 500;
    }

    return value > 0;
  };

  useEffect(() => setDepositDetails(detailsToRender, isFormValid(detailsToRender)), []);

  const isFormValid = (newDetails: GardenCreationDepositDetails) => {
    return (
      isValid(DetailProps.minContribution, newDetails.minContribution) &&
      isValid(DetailProps.maxDepositLimit, newDetails.maxDepositLimit) &&
      isValid(DetailProps.depositHardlock, newDetails.depositHardlock) &&
      isValid(DetailProps.sharePriceDelta, newDetails.sharePriceDelta) &&
      isValid(DetailProps.sharePriceDeltaDecay, newDetails.sharePriceDeltaDecay)
    );
  };

  return (
    <DepositDetailsWrapper className={className}>
      <NumberInputWrapper>
        <NumberInput
          name={DetailProps.minContribution}
          value={detailsToRender.minContribution}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem(DetailProps.minContribution, Number(e.currentTarget.value));
          }}
          label={'Minimum Member Deposit'}
          required
          valid={isValid(DetailProps.minContribution, detailsToRender.minContribution)}
          postSpan={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
          tooltip={`Minimum amount a user has to deposit to become a member. (${
            reserveConfig.minDeposit
          } ${tokenListService.getInputSymbol(gardenDetails.reserveAsset)})`}
        />
        <NumberInput
          name={DetailProps.maxDepositLimit}
          value={detailsToRender.maxDepositLimit}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem(DetailProps.maxDepositLimit, Number(e.currentTarget.value));
          }}
          label={'Maximum Garden Capacity'}
          required
          valid={isValid(DetailProps.maxDepositLimit, detailsToRender.maxDepositLimit)}
          postSpan={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
          tooltip={`Maximum amount that can be deposited into a Garden by all members. (Up to ${commify(
            reserveConfig.totalDepositLimit,
          )} ${tokenListService.getInputSymbol(gardenDetails.reserveAsset)})`}
        />
        <NumberInput
          name={DetailProps.depositHardlock}
          value={detailsToRender.depositHardlock}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem(DetailProps.depositHardlock, Number(e.currentTarget.value));
          }}
          label={'Deposit Hardlock (secs)'}
          required
          valid={isValid(DetailProps.depositHardlock, detailsToRender.depositHardlock)}
          postSpan="secs"
          tooltip={'Number of seconds a member has to wait after depositing to withdraw. Flash loan prevention.'}
        />
        <NumberInput
          name={DetailProps.sharePriceDeltaDecay}
          value={detailsToRender.sharePriceDeltaDecay}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem(DetailProps.sharePriceDeltaDecay, Number(e.currentTarget.value));
          }}
          label={'Share Price Delta Decay'}
          required
          valid={isValid(DetailProps.sharePriceDeltaDecay, detailsToRender.sharePriceDeltaDecay)}
          postSpan="%"
          tooltip={
            'Rate of allowed share price change over 365 days. This is a security feature to avoid potential TWAP manipulation attacks in a Garden.'
          }
        />
        <NumberInput
          name={DetailProps.sharePriceDelta}
          value={detailsToRender.sharePriceDelta}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem(DetailProps.sharePriceDelta, Number(e.currentTarget.value));
          }}
          label={'Max Share Price Delta'}
          required
          valid={isValid(DetailProps.sharePriceDelta, detailsToRender.sharePriceDelta)}
          postSpan="%"
          tooltip={
            'Max allowed change in share price between two actions. This is a security feature to avoid potential TWAP manipulation attacks in a Garden.'
          }
        />
      </NumberInputWrapper>
    </DepositDetailsWrapper>
  );
};

const DepositDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  color: white;
`;

const NumberInputWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 10px 0;
  color: white;
`;

export default React.memo(DepositDetails);
