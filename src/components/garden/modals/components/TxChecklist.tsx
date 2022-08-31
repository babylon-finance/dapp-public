import { CheckboxInput, Icon, HoverTooltip } from 'components/shared';
import { TxType, IconName } from 'models';
import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';
import { BigNumber } from '@ethersproject/bignumber';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

interface TxChecklistProps {
  handleCheck: (e: React.FormEvent) => void;
  confirmations: any;
  depositHardlock?: BigNumber;
  txType: TxType;
  hasActiveStrategies?: boolean;
}

enum Confirmations {
  terms = 'terms',
  nft = 'nft',
  risk = 'risk',
  pending = 'pending',
  stake = 'stake',
  lock = 'lock',
}

const RISK_LANGUAGE =
  'I acknowledge that depositing capital into this garden is risky and could result in a loss of funds.';

const TxChecklist = ({
  hasActiveStrategies,
  confirmations,
  handleCheck,
  txType,
  depositHardlock,
}: TxChecklistProps) => {
  return (
    <ChecklistWrapper>
      {txType === TxType.withdraw && hasActiveStrategies && (
        <ConfirmationRow>
          <StyledCheckboxInput name={Confirmations.pending} onChange={handleCheck} checked={confirmations.pending} />
          <CheckboxContentYellow>
            <StyledTextTooltip
              icon={IconName.warning}
              size={20}
              color={'var(--yellow)'}
              content={'Pending rewards for active Strategies are not allocated until the position has been closed.'}
              placement="down"
            />
            <WarningSpan>I understand that I will lose all pending BABL rewards if I withdraw my funds.</WarningSpan>
          </CheckboxContentYellow>
        </ConfirmationRow>
      )}
      {(txType === TxType.deposit || txType === TxType.bond) && (
        <>
          <ConfirmationRow>
            <StyledCheckboxInput name={Confirmations.terms} onChange={handleCheck} checked={confirmations.terms} />
            <CheckboxContent>
              <span>I agree to the</span>
              <StyledLink to={`/terms`} target="_blank" rel="noopener noreferrer">
                Terms & Conditions.
              </StyledLink>
            </CheckboxContent>
          </ConfirmationRow>
          <ConfirmationRow>
            <StyledCheckboxInput name={Confirmations.risk} onChange={handleCheck} checked={confirmations.risk} />
            <CheckboxContent>{RISK_LANGUAGE}</CheckboxContent>
          </ConfirmationRow>
          {depositHardlock?.gt(86400) && (
            <ConfirmationRow>
              <StyledCheckboxInput name={Confirmations.lock} onChange={handleCheck} checked={confirmations.lock} />
              <CheckboxContent>
                <span>
                  I understand that my funds will be{' '}
                  <b>locked for {Math.floor(depositHardlock?.toNumber() / 86400)} days </b>
                  from transaction confirmation.
                </span>
              </CheckboxContent>
            </ConfirmationRow>
          )}
        </>
      )}
      {txType === TxType.claimRewards && (
        <>
          <ConfirmationRow>
            <StyledCheckboxInput name={Confirmations.stake} onChange={handleCheck} checked={confirmations.stake} />
            <CheckboxContent>
              <Icon name={IconName.heartFull} size={20} />
              <span>Stake my claimed BABL</span>
              <StyledLink to={{ pathname: RoutesExternal.heartPost }} target="_blank" rel="noopener noreferrer">
                Learn more about the Heart
              </StyledLink>
            </CheckboxContent>
          </ConfirmationRow>
        </>
      )}
    </ChecklistWrapper>
  );
};

const StyledTextTooltip = styled(HoverTooltip)`
  height: auto;
  padding: 0;

  > div {
    font-size: 14px;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    > div {
      font-size: 12px;
    }
  }
`;

const StyledLink = styled(Link)`
  font-family: cera-regular;
  color: var(--white);
  text-decoration: underline;

  &:hover {
    color: var(--white);
    text-decoration: underline;
    opacity: 0.8;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    a {
      font-size: 12px;
    }
  }
`;

const StyledCheckboxInput = styled(CheckboxInput)`
  label {
    padding-right: 8px;
  }
`;

const WarningSpan = styled.div`
  width: 100%;
  padding-left: 10px;
  display: flex;
  align-items: center;
`;

const ChecklistWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const CheckboxContent = styled.div`
  width: 100%;
  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;
  text-align: left;
  color: var(--blue-03);
  font-family: cera-regular;
  font-size: 14px;
  a {
    margin-left: 2px;
  }

  > span {
    &:first-child {
      margin-right: 4px;
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 12px;
  }
`;

const CheckboxContentYellow = styled(CheckboxContent)`
  color: var(--yellow);
`;

const ConfirmationRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  padding-top: 10px 0;
  &:last-child {
    padding-bottom: 10px;
  }
`;

export default React.memo(TxChecklist);
