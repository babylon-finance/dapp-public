import { HoverTooltip, Icon } from 'components/shared';
import { MAX_GAS_FULL_SUBSIDY_PRICE, BREAKPOINTS } from 'config';
import {
  formatReserveToFiatDisplay,
  formatReserveDisplay,
  convertReserveFiat,
  formatReserveFloat,
} from 'helpers/Numbers';
import { IconName, Token } from 'models';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import styled from 'styled-components';

interface FeesProps {
  shouldWarnGas: boolean;
  userCurrency: string;
  reserveAsset: Token;
  ethAsset: Token;
  estimateGasETH: BigNumber;
  fullSubsidy?: boolean;
  isSubsidy?: boolean;
  receivingAmountAfterFees?: BigNumber;
  votingPower?: BigNumber;
  reserveInFiat: number;
  receivingSymbol: string;
  isSignatureSelected: boolean;
  ethPrice: number;
  liquidationPenalty?: BigNumber;
  isDeposit?: boolean;
  bonus?: number;
}

const Fees = ({
  shouldWarnGas,
  isSignatureSelected,
  estimateGasETH,
  ethAsset,
  bonus,
  ethPrice,
  userCurrency,
  fullSubsidy,
  isSubsidy,
  reserveAsset,
  receivingAmountAfterFees,
  receivingSymbol,
  liquidationPenalty,
  reserveInFiat,
  isDeposit,
  votingPower,
}: FeesProps) => {
  const gasPriceInFiat = formatReserveToFiatDisplay(estimateGasETH, ethAsset, userCurrency, ethPrice.toString());
  const gasPriceInFiatNumber = convertReserveFiat(estimateGasETH, ethAsset, ethPrice.toString());
  // Safe to use formatEther since this is not a variable decimal token
  const gasPriceInReserve = parseFloat(formatEther(gasPriceInFiatNumber)) / reserveInFiat;
  return (
    <FeeDetailsWrapper>
      <ExtraDetailsRow>
        <FeeDetailsLeft>
          {shouldWarnGas && (
            <HoverTooltip
              size={16}
              icon={IconName.flame}
              content={`Gas prices are very high (>${MAX_GAS_FULL_SUBSIDY_PRICE})!`}
              placement="top"
            />
          )}
          {liquidationPenalty && liquidationPenalty.gt(0) && (
            <HoverTooltip
              size={16}
              color={'var(--yellow)'}
              icon={IconName.warning}
              content={
                'This withdrawal exceeds the liquid capital of the Garden and will incur the gas cost to partially unwind capital from an active Strategy. Learn more about withdrawal mechanics at https://docs.babylon.finance/'
              }
              placement="top"
            />
          )}
          {isSubsidy && (
            <HoverTooltip
              icon={IconName.gate}
              size={16}
              content={`Transaction cost will be ${
                estimateGasETH.eq(0) ? 'fully' : 'partially (25-50%)'
              } subsidized by the garden.`}
              placement="top"
            />
          )}
          Estimated Gas Fee
        </FeeDetailsLeft>
        <ExtraDetailsRight>
          {fullSubsidy && 'FREE'}
          {!estimateGasETH.eq(0) && (
            <>
              (~ {gasPriceInFiat}){' '}
              {estimateGasETH
                ? `${parseFloat(
                    isSignatureSelected ? gasPriceInReserve.toString() : formatEther(estimateGasETH),
                  ).toFixed(3)} ${isSignatureSelected ? reserveAsset.symbol : 'Ξ'}`
                : '--'}
            </>
          )}
        </ExtraDetailsRight>
      </ExtraDetailsRow>
      {liquidationPenalty && liquidationPenalty.gt(0) && (
        <ExtraDetailsRow>
          <FeeDetailsLeft>
            <HoverTooltip
              textOverride="Liquidation Penalty"
              content={`This Garden lacks the required liquidity for your withdrawal, withdrawing now will unwind capital from an active strategy and incur a 2% penalty to compensate Garden members.`}
              placement="top"
            />
          </FeeDetailsLeft>
          <ExtraDetailsRight>{formatReserveDisplay(liquidationPenalty, reserveAsset)}</ExtraDetailsRight>
        </ExtraDetailsRow>
      )}
      {!!bonus && (
        <ExtraDetailsRow>
          <FeeDetailsLeft>
            <StyledIcon name={IconName.starShooting} size={16} />
            Total Bonus
          </FeeDetailsLeft>
          <ExtraDetailsRight>{bonus}%</ExtraDetailsRight>
        </ExtraDetailsRow>
      )}
      {receivingAmountAfterFees && (
        <ExtraDetailsRow>
          <FeeDetailsLeft>
            <StyledIcon name={IconName.coinStack} size={16} />
            Minimum Receiving
          </FeeDetailsLeft>
          <ExtraDetailsRight>
            {formatReserveFloat(receivingAmountAfterFees, isDeposit ? ethAsset : reserveAsset, 4)} {receivingSymbol}
          </ExtraDetailsRight>
        </ExtraDetailsRow>
      )}
      {votingPower && (
        <ExtraDetailsRow>
          <FeeDetailsLeft>
            <StyledIcon name={IconName.steward} size={16} />
            Voting Power
          </FeeDetailsLeft>
          <ExtraDetailsRight>{formatReserveFloat(votingPower, ethAsset, 4)}</ExtraDetailsRight>
        </ExtraDetailsRow>
      )}
    </FeeDetailsWrapper>
  );
};

const FeeDetailsWrapper = styled.div`
  width: 100%;
  border-top: none;
  padding-top: 0;
`;

const ExtraDetailsContent = styled.div`
  color: var(--blue-03);
  font-size: 16px;
  font-family: cera-regular;
  flex-grow: 1;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
  }
`;

const ExtraDetailsRow = styled.div`
  padding-top: 4px;
  display: flex;
  flex-flow: row nowrap;
  height: 25px;
  justify-content: space-between;
`;

const ExtraDetailsLeft = styled(ExtraDetailsContent)`
  text-align: left;
`;

const ExtraDetailsRight = styled(ExtraDetailsContent)`
  text-align: right;
  display: flex;
  flex-flow: column nowrap;
`;

const FeeDetailsLeft = styled(ExtraDetailsLeft)`
  font-family: cera-medium;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;
const StyledIcon = styled(Icon)`
  padding: 4px;
`;

export default React.memo(Fees);
