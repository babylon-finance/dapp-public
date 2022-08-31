import { TokenSelector, BaseLoader, ReserveNumber } from 'components/shared/';
import addresses from 'constants/addresses';
import { Token } from 'models';
import { Box } from 'rimble-ui';
import { OperationInfoMessage } from '../';
import { TokenListService, ViewerService } from 'services';
import { concat } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { parseReserve } from 'helpers/Numbers';
import { arrayify } from '@ethersproject/bytes';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

interface LongStrategyFormProps {
  gardenDetails: any;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const LongStrategyForm = ({
  gardenDetails,
  integrationData,
  setIntegrationData,
  operationIndex,
}: LongStrategyFormProps) => {
  const [longToken, setLongToken] = useState<string | undefined>(integrationData);
  const [longTokenDetails, setLongTokenDetails] = useState<Token | undefined>(undefined);
  const [validAsset, setValidAsset] = useState<boolean>(false);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);

  const viewerService = ViewerService.getInstance();
  const tokenListService = TokenListService.getInstance();
  const minRebalanceCapital = 1;

  useEffect(() => {
    updateQuotePair();
  }, [longToken, minRebalanceCapital]);

  const handleLongTokenOnChange = async (address: string[]) => {
    setLongToken(address[0]);
    const longTokenDetailsNew = tokenListService.getTokenByAddress(address[0]);
    if (longTokenDetailsNew) {
      setLongTokenDetails(longTokenDetailsNew);
    }
  };

  const updateQuotePair = async () => {
    if (longTokenDetails && minRebalanceCapital > 0) {
      setQuoteLoading(true);
      const validAsset: boolean = await viewerService.isPriceValid(longTokenDetails.address, gardenDetails);
      if (validAsset && longToken) {
        setValidAsset(true);
        let minimum = BigNumber.from(0);
        if (
          gardenDetails.reserveAsset.toLowerCase() === addresses.tokens.DAI &&
          parseReserve(gardenDetails.minimumLiquidityAsset, gardenDetails.reserveAsset).lt(100000)
        ) {
          minimum = BigNumber.from(2);
        }
        if (
          gardenDetails.reserveAsset.toLowerCase() === addresses.tokens.WETH &&
          parseReserve(gardenDetails.minimumLiquidityAsset, gardenDetails.reserveAsset).lt(30)
        ) {
          minimum = BigNumber.from(2);
        }
        setIntegrationData(concat([arrayify(longToken), arrayify(minimum.toHexString())]));
      }
      setQuoteLoading(false);
    }
  };

  return (
    <LongStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will allocate the capital received from the garden to purchase the token selected below. The
          asset liquidity must be above{': '}
          <b>
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />
          </b>
        </span>
      </OperationInfoMessage>
      <TokenSelector
        name="long-token"
        label="Asset to long"
        disabled={quoteLoading}
        filterAddresses={operationIndex === 0 ? [gardenDetails.reserveAsset] : []}
        required
        onlySwappable
        stateCallback={handleLongTokenOnChange}
      />
      <LoadingWrapper>
        {quoteLoading && <BaseLoader color="white" size={30} text={'Checking if asset is valid...'} />}
        {!quoteLoading && longTokenDetails && !validAsset && (
          <LiquidityError>
            The liquidity of {longTokenDetails.symbol} is less than{' '}
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />. <br />
            Please, select another token or ask the creator to increase the minimum liquidity requirements.
          </LiquidityError>
        )}
        {!quoteLoading && !longToken && <SelectorSub>Select a token to verify the avilable liquidity.</SelectorSub>}
      </LoadingWrapper>
    </LongStrategyWrapper>
  );
};

const SelectorSub = styled.div`
  font-size: 14px;
  color: var(--blue-03);
`;
const LiquidityError = styled.p`
  color: var(--red);
`;

const LongStrategyWrapper = styled(Box)`
  padding: 10px 0;
  width: 100%;
  display: flex;
  margin-top: 20px;
  flex-flow: column nowrap;
`;

const LoadingWrapper = styled.div`
  padding: 10px 0;
`;

export default React.memo(LongStrategyForm);
