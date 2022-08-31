import {
  GardenIcon,
  ParameterDisplay,
  ReviewPill,
  TokenDisplay,
  CheckmarkDisplay,
  CheckboxInput,
  NumberInput,
} from 'components/shared';

import usePoller from 'hooks/Poller';
import {
  GardenCreationMainDetails,
  GardenCreationNftDetails,
  GardenCreationDepositDetails,
  GardenCreationAccessDetails,
  GardenCreationMechanics,
  GardenCreationSummaryDetails,
  Token,
} from 'models/';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { useW3Context } from 'context/W3Provider';
import { IERC20 } from 'constants/contracts';
import { formatReserveFloat } from 'helpers/Numbers';
import { TokenListService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CreationSummaryProps {
  gardenDetails: GardenCreationMainDetails;
  depositDetails: GardenCreationDepositDetails;
  nftDetails: GardenCreationNftDetails;
  controlDetails: GardenCreationAccessDetails;
  mechanics: GardenCreationMechanics;
  summaryDetails: GardenCreationSummaryDetails;
  setApprovalNeeded(amount: number): void;
  onFinalizeSummary: (summaryDetails: GardenCreationSummaryDetails, valid: boolean) => void;
}

const CreationSummary = ({
  gardenDetails,
  depositDetails,
  controlDetails,
  nftDetails,
  mechanics,
  summaryDetails,
  setApprovalNeeded,
  onFinalizeSummary,
}: CreationSummaryProps) => {
  // The minimum deposit to create a garden should be higher
  const minCreatorDeposit = depositDetails.minContribution * 5;
  const defaultDetails: GardenCreationSummaryDetails = {
    creatorDeposit: minCreatorDeposit,
    terms: false,
  };
  const detailsToRender = summaryDetails || defaultDetails;
  const { provider, address } = useW3Context();
  const [userBalance, setUserBalance] = useState<BigNumber | undefined>(undefined);

  const tokenListService = TokenListService.getInstance();
  const reserveAsset = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;

  const loadToken = async () => {
    const tokenContract = await loadContractFromNameAndAddress(reserveAsset.address, IERC20, provider);
    setUserBalance(await tokenContract?.balanceOf(address));
  };

  useEffect(() => {
    setApprovalNeeded(detailsToRender.creatorDeposit);
  }, [address, gardenDetails?.reserveAsset]);

  useEffect(() => {
    loadToken();
  }, [gardenDetails?.reserveAsset]);

  // Refreshes user balance every 30 seconds to see if the user has enough to create the garden
  usePoller(() => {
    loadToken();
  }, 30000);

  const isValid = (prop: string, value: number): boolean => {
    if (prop === 'creatorDeposit' && value >= 0) {
      return value >= minCreatorDeposit && formatReserveFloat(userBalance || BigNumber.from(0), reserveAsset) >= value;
    }
    return value !== undefined;
  };

  const onChangeItem = async (prop: string, value: any) => {
    const newDetails = { ...detailsToRender } as GardenCreationSummaryDetails;
    newDetails[prop] = value;
    if (prop === 'creatorDeposit') {
      setApprovalNeeded(value);
    }
    onFinalizeSummary(newDetails, isFormValid(newDetails));
  };

  const isFormValid = (newDetails: GardenCreationSummaryDetails) => {
    return isValid('creatorDeposit', newDetails.creatorDeposit) && newDetails.terms;
  };

  const displaySymbol = reserveAsset.symbol.toUpperCase();
  return (
    <CreationSummaryWrapper>
      <Title>Almost done! Please review everything before submitting.</Title>
      <ContentWrapper>
        <ReviewPill title="Name">
          <GardenIcon url={nftDetails.image} size={48} />
          <p style={{ marginLeft: '15px' }}>
            {gardenDetails.name} - ({gardenDetails.symbol})
          </p>
        </ReviewPill>
        <ReviewPill title="Reserve Asset">
          <TokenDisplay size={28} token={reserveAsset} />
        </ReviewPill>
        <ReviewPill title="Deposits & Redemptions">
          <ParameterDisplay
            width={150}
            name="Minimum Deposit"
            postSymbol={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
            value={parseFloat(depositDetails.minContribution.toString()).toFixed(0)}
          />
          <ParameterDisplay
            width={150}
            name="Maximum Deposits"
            postSymbol={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
            value={depositDetails.maxDepositLimit.toString()}
          />
          <ParameterDisplay
            width={150}
            name="Deposit Hardlock"
            postSymbol="secs"
            value={depositDetails.depositHardlock.toString()}
          />
          <ParameterDisplay
            width={150}
            name="Share Price Delta Decay"
            postSymbol="%"
            value={depositDetails.sharePriceDeltaDecay.toString()}
          />
          <ParameterDisplay
            width={150}
            name="Share Price Delta"
            postSymbol="%"
            value={depositDetails.sharePriceDelta.toString()}
          />
        </ReviewPill>
        <ReviewPill title="Access Control">
          <CheckmarkDisplay label="Can Anyone Deposit?" value={controlDetails.publicLP} size={24} />
          <CheckmarkDisplay label="Can Anyone Vote?" value={controlDetails.publicVoter} size={24} />
          <CheckmarkDisplay label="Can Anyone Create a Strategy?" value={controlDetails.publicStrategist} size={24} />
        </ReviewPill>
        <ReviewPill title="Liquidity Preferences">
          <ParameterDisplay
            name="Early Withdrawal Penalty"
            postSymbol="%"
            value={mechanics.earlyWithdrawalPenalty.toString()}
          />
        </ReviewPill>
        <ReviewPill title="Strategy Preferences">
          <ParameterDisplay
            name="Minimum Strategy Duration"
            postSymbol="days"
            value={mechanics.minStrategyDuration.toString()}
          />
          <ParameterDisplay
            name="Maximum Strategy Duration"
            postSymbol="days"
            value={mechanics.maxStrategyDuration.toString()}
          />
          <ParameterDisplay name="Strategy Voting Quorum" postSymbol="%" value={mechanics.minVotesQuorum.toString()} />
          <ParameterDisplay name="Minimum Voters" value={mechanics.minVoters.toString()} />
        </ReviewPill>
        <ReviewPill title="Risk Preferences">
          <ParameterDisplay
            name="Minimum Asset Liquidity"
            postSymbol={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
            value={mechanics.minLiquidityAsset.toString()}
          />
          <CheckmarkDisplay label="Custom Integrations" value={mechanics.customIntegrations} size={24} />
        </ReviewPill>
        <NumberInput
          name={'creatorDeposit'}
          value={detailsToRender.creatorDeposit}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            onChangeItem('creatorDeposit', Number(e.currentTarget.value));
          }}
          label={`Your Deposit as a creator (wallet balance: ${formatReserveFloat(
            userBalance || BigNumber.from(0),
            reserveAsset,
            4,
          )} ${displaySymbol})`}
          required
          valid={isValid('creatorDeposit', detailsToRender.creatorDeposit)}
          postSpan={tokenListService.getInputSymbol(gardenDetails.reserveAsset)}
          tooltip={'Amount you want to deposit (Need to be at least 5x the min deposit)'}
        />
        {detailsToRender.creatorDeposit > formatReserveFloat(userBalance || BigNumber.from(0), reserveAsset) && (
          <CheckmarkDisplay
            label={`Connected wallet does not contain minimum ${reserveAsset.symbol} balance for the creator deposit!`}
            value={false}
            size={24}
          />
        )}
        <TermsAndConditionsWrapper>
          <TermsTitle> Terms & Conditions </TermsTitle>
          <Terms>
            By using this software, you understand, acknowledge and accept that Babylon Finance and/or the underlying
            software are provided “as is” and without warranties or representations of any kind either expressed or
            implied. Any use of this open source software released under the GNU General Public License version 3 (GPL
            3) is done at your own risk to the fullest extent permissible pursuant to applicable law any and all
            liability as well as all warranties, including any fitness for a particular purpose with respect to Babylon
            Finance and/or the underlying software and the use thereof are disclaimed.
          </Terms>

          <CheckboxInput
            name="terms"
            label="I agree to the Terms & Conditions"
            checked={detailsToRender.terms}
            onChange={(e: any) => onChangeItem('terms', e.target.checked)}
          />
        </TermsAndConditionsWrapper>
      </ContentWrapper>
    </CreationSummaryWrapper>
  );
};

const CreationSummaryWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;

  p {
    font-size: 14px;
    font-weight: 700;
  }
`;

const ContentWrapper = styled.div`
  width: 840px;
  display: flex;
  flex-flow: column nowrap;
  color: white;
  padding: 0 80px 20px 0;
`;

const TermsAndConditionsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  color: white;
  margin-top: 30px;
`;

const Title = styled.p`
  margin-top: 5px;
  font-size: 14px;
  line-height: 24px;
  color: white;
`;

const TermsTitle = styled.p`
  font-size: 14px;
  line-height: 16px;
  color: white;
`;

const Terms = styled.div`
  width: 100%;
  max-height: 250px;
  min-height: 100px;
  overflow: auto;
  font-size: 14px;
  line-height: 16px;
  color: white;
  margin: 10px 0 15px 0;
`;

export default React.memo(CreationSummary);
