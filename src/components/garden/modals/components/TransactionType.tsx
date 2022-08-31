import { TxType } from 'models';
import { HoverTooltip } from 'components/shared';
import { firstUpper } from 'helpers/Strings';
import { RoutesExternal } from 'constants/Routes';
import { BREAKPOINTS } from 'config';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

interface TransactionTypeProps {
  usingSignature: boolean;
  canUseSignature: boolean;
  setUsingSignature: (sig: boolean) => void;
  type: TxType;
}

const LABELS = {
  claimRewards: 'claim',
  withdraw: 'withdrawal',
  deposit: 'deposit',
  bond: 'bond',
};

const TransactionType = ({ canUseSignature, setUsingSignature, type, usingSignature }: TransactionTypeProps) => {
  const txLabel = firstUpper(LABELS[type]);
  return (
    <NotificationsWrapper>
      <Title>
        {usingSignature ? `This is a gasless ${txLabel.toLowerCase()}` : `This is a standard ${txLabel.toLowerCase()}`}
        <HoverTooltip
          outDelay={350}
          placement={'top'}
          content={
            <>
              {canUseSignature && (
                <div>
                  <span>
                    <b>Minimize fees</b> with a gasless transaction.
                  </span>
                  <StyledLink
                    to={{
                      pathname: RoutesExternal.gaslessTx,
                    }}
                    target="_blank"
                  >
                    Learn more
                  </StyledLink>{' '}
                </div>
              )}
              {!canUseSignature && (
                <DisabledSpan>
                  <span>{txLabel} by signature is not possible for this transaction.</span>
                </DisabledSpan>
              )}
            </>
          }
        />
        {canUseSignature && (
          <Switch onClick={() => setUsingSignature(!usingSignature)}>
            [Use {usingSignature ? 'standard' : 'signature'}]
          </Switch>
        )}
      </Title>
    </NotificationsWrapper>
  );
};

const StyledLink = styled(Link)`
  padding-left: 6px;
  font-family: cera-regular;
  color: white;
  text-decoration: underline;
  min-width: 90px;

  &:hover {
    color: white;
    text-decoration: underline;
    opacity: 0.8;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
    text-align: right;
  }
`;

const DisabledSpan = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  > span {
    &:first-child {
      margin-right: 6px;
    }

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      font-size: 14px;
    }
  }
`;

const NotificationsWrapper = styled.div`
  display: flex;
  width: 100%;
  color: white;
  flex-flow: column nowrap;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.div`
  font-size: 18px;
  line-height: 22px;
  font-weight: 400;
  margin-bottom: 6px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 16px;
    line-height: 18px;
  }
`;

const Subtitle = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  color: white;
  font-size: 15px;
  line-height: 20px;
  min-height: 20px;
  > div {
    flex-flow: row nowrap;
    display: flex;
  }
  span {
    color: var(--blue-03);
  }
`;

const Switch = styled.div`
  color: var(--turquoise-01);
  font-size: 16px;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    text-decoration: underline;
  }
`;

export default React.memo(TransactionType);
