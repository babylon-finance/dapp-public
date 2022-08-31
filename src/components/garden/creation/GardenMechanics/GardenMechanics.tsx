import { NumberInput, ToggleInput } from 'components/shared/';
import { RESERVES_CREATION_CONFIG } from 'config';
import { GardenCreationMechanics, GardenCreationMainDetails, FullGardenDetails, Token } from 'models/';
import { TokenListService } from 'services';

import React, { useEffect } from 'react';
import styled from 'styled-components';

interface MainDetailsProps {
  gardenDetails: GardenCreationMainDetails | FullGardenDetails;
  mechanics: GardenCreationMechanics | undefined;
  setMechanics: (mechanics: GardenCreationMechanics, isValid: boolean) => void;
}

const defaultDetails: GardenCreationMechanics = {
  earlyWithdrawalPenalty: 2.5,
  minStrategyDuration: 30,
  maxStrategyDuration: 150,
  minVotesQuorum: 5,
  minVoters: 1,
  strategyCooldownPeriod: 7,
  minLiquidityAsset: 30,
  customIntegrations: false,
};

const GardenMechanics = ({ mechanics, setMechanics, gardenDetails }: MainDetailsProps) => {
  const tokenListService = TokenListService.getInstance();
  const reserveTokenSymbol = (tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token).symbol;
  const reserveConfig = RESERVES_CREATION_CONFIG[reserveTokenSymbol.toLowerCase()];
  defaultDetails.minLiquidityAsset = reserveConfig.minLiquidityAsset;
  const detailsToRender = mechanics || defaultDetails;

  const onChangeItem = (prop: string, value: any) => {
    const newDetails: GardenCreationMechanics = { ...detailsToRender } as GardenCreationMechanics;
    newDetails[prop] = value;
    setMechanics(newDetails, isFormValid(newDetails));
  };

  const isValid = (prop: string, value: number): boolean => {
    if (prop === 'earlyWithdrawalPenalty' && value) {
      return value === 2.5;
    }
    if (prop === 'minStrategyDuration' && value) {
      return value >= 1 && value <= detailsToRender.maxStrategyDuration;
    }
    if (prop === 'maxStrategyDuration' && value) {
      return value >= 1 && value >= detailsToRender.minStrategyDuration && value <= 500;
    }
    if (prop === 'minVotesQuorum' && value) {
      return value >= 5 && value <= 50;
    }
    if (prop === 'minVoters' && value) {
      return value >= 1 && value < 10;
    }
    if (prop === 'strategyCooldownPeriod' && value) {
      return value >= 1 && value <= 24 * 7;
    }
    if (prop === 'minLiquidityAsset' && value) {
      return value >= defaultDetails.minLiquidityAsset;
    }
    return value !== undefined;
  };

  const isFormValid = (details: GardenCreationMechanics) => {
    return (
      isValid('earlyWithdrawalPenalty', details.earlyWithdrawalPenalty) &&
      isValid('minStrategyDuration', details.minStrategyDuration) &&
      isValid('maxStrategyDuration', details.maxStrategyDuration) &&
      isValid('minVotesQuorum', details.minVotesQuorum) &&
      isValid('minVoters', details.minVoters) &&
      isValid('strategyCooldownPeriod', details.strategyCooldownPeriod) &&
      isValid('minLiquidityAsset', details.minLiquidityAsset)
    );
  };

  useEffect(() => setMechanics(detailsToRender, isFormValid(detailsToRender)), []);

  return (
    <DepositDetailsWrapper>
      <GroupTitle>Liquidity Preferences</GroupTitle>
      <NumberInputWrapper>
        <NumberInput
          name={'earlyWithdrawalPenalty'}
          value={detailsToRender.earlyWithdrawalPenalty}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem('earlyWithdrawalPenalty', Number(e.currentTarget.value));
          }}
          label={'Early Withdrawal Penalty'}
          required
          disabled
          valid={isValid('earlyWithdrawalPenalty', detailsToRender.earlyWithdrawalPenalty)}
          postSpan="%"
          tooltip={
            'Penalty for triggering a withdrawal when there are no idle funds and it liquidates an active strategy.'
          }
        />
      </NumberInputWrapper>
      <GroupTitle>Strategy Preferences</GroupTitle>
      <RowWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'minStrategyDuration'}
            value={detailsToRender.minStrategyDuration}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('minStrategyDuration', Number(e.currentTarget.value));
            }}
            label={'Minimum Strategy Duration'}
            required
            valid={isValid('minStrategyDuration', detailsToRender.minStrategyDuration)}
            postSpan="days"
          />
        </NumberInputWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'maxStrategyDuration'}
            value={detailsToRender.maxStrategyDuration}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('maxStrategyDuration', Number(e.currentTarget.value));
            }}
            label={'Maximum Strategy Duration'}
            required
            valid={isValid('maxStrategyDuration', detailsToRender.maxStrategyDuration)}
            postSpan="days"
          />
        </NumberInputWrapper>
      </RowWrapper>
      <RowWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'minVotesQuorum'}
            value={detailsToRender.minVotesQuorum}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('minVotesQuorum', Number(e.currentTarget.value));
            }}
            label={'% Quorum to approve a strategy'}
            required
            valid={isValid('minVotesQuorum', detailsToRender.minVotesQuorum)}
            postSpan="%"
            tooltip={'% of shares that need to upvote a strategy to be approved.'}
          />
        </NumberInputWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'minVoters'}
            value={detailsToRender.minVoters}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('minVoters', Number(e.currentTarget.value));
            }}
            label={'# Voters to Reach Quorum'}
            required
            valid={isValid('minVoters', detailsToRender.minVoters)}
            postSpan="Voter(s)"
            tooltip={'The minimum number of voters required for a Strategy to be approved and reach quorum.'}
          />
        </NumberInputWrapper>
      </RowWrapper>
      <RowWrapper>
        <NumberInput
          name={'strategyCooldownPeriod'}
          value={detailsToRender.strategyCooldownPeriod}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem('strategyCooldownPeriod', Number(e.currentTarget.value));
          }}
          label={'Strategy Cooldown Period'}
          required
          valid={isValid('strategyCooldownPeriod', detailsToRender.strategyCooldownPeriod)}
          postSpan="hours"
          tooltip={'Hours to wait before executing a Strategy after a quorum has been reached.'}
        />
      </RowWrapper>
      <GroupTitle>Risk Preferences</GroupTitle>
      <RowWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'minLiquidityAsset'}
            value={detailsToRender.minLiquidityAsset}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('minLiquidityAsset', Number(e.currentTarget.value));
            }}
            label={'Only assets above this liquidity'}
            required
            valid={isValid('minLiquidityAsset', detailsToRender.minLiquidityAsset)}
            postSpan={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
            tooltip={'Assets with more liquidity are generally safer.'}
          />
        </NumberInputWrapper>
        <ToggleInput
          name="customIntegrations"
          label="Custom integrations?"
          disabled={!!(gardenDetails as FullGardenDetails).verified}
          tooltip="Whether you want to allow strategies that connect custom logic via our SDK. High Risk"
          defaultChecked={false}
          checked={detailsToRender.customIntegrations}
          onChange={(e: React.ChangeEvent<any>) => {
            onChangeItem('customIntegrations', e.target.checked);
          }}
          required
        />
      </RowWrapper>
    </DepositDetailsWrapper>
  );
};

const DepositDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
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

const GroupTitle = styled.div`
  font-size: 14px;
  color: white;
  margin-top: 40px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  width: 90%;

  > div {
    width: 45%;
  }
`;

export default React.memo(GardenMechanics);
