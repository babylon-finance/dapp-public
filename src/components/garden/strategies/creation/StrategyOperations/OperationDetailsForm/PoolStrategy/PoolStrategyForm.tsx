import { GardenTable, Member, ProtocolIcon, TokenSelector, BaseLoader, ReserveNumber } from 'components/shared/';
import { buildPoolsQueryParams, getUnifiedPoolData, getPoolQuery } from './poolAdapter';
import { useLazyQuery } from '@apollo/client';
import { OperationInfoMessage } from '../';
import { Integration, getIntegrationByName, FullGardenDetails, IntegrationName, StrategyOperation } from 'models';
import { Button } from 'rimble-ui';
import { ViewerService } from 'services';
import React, { useState, useEffect } from 'react';
import { arrayify } from '@ethersproject/bytes';
import numeral from 'numeral';
import styled from 'styled-components';

interface Pool {
  id: string;
  name: string;
  liquidity: string;
  volume: string;
  stakeable?: string[];
}

interface PoolStrategyFormProps {
  graphClient: any;
  previousOperation: StrategyOperation | undefined;
  gardenDetails: FullGardenDetails;
  integration: IntegrationName;
  integrationData: any;
  setIntegrationData: any;
  operationIndex: number;
}

const PoolStrategyForm = ({
  gardenDetails,
  integration,
  previousOperation,
  setIntegrationData,
  integrationData,
  graphClient,
}: PoolStrategyFormProps) => {
  const [pools, setPools] = useState<any[] | undefined>([]);
  const [selectedPool, setSelectedPool] = useState<string | undefined>(integrationData);
  const [tokens, setTokens] = useState<string[] | undefined>([]);

  const integrationObj = getIntegrationByName(integration) as Integration;
  const [getPools, { loading: loadingPair, data: pairResponse }] = useLazyQuery(getPoolQuery(integrationObj), {
    client: graphClient,
  });

  const viewerService = ViewerService.getInstance();
  const showStakeableColumn = pools && pools.length > 0 && pools.find((p) => !!p.stakeable);

  useEffect(() => {
    if (pairResponse) {
      const pools = getUnifiedPoolData(integrationObj, pairResponse);
      setPools(pools);
    }
  }, [pairResponse]);

  useEffect(() => {
    const fetchPools = async () => {
      if ((tokens && tokens.length >= 2) || integrationObj.name === IntegrationName.CurvePool) {
        getPools(await buildPoolsQueryParams(integrationObj, graphClient, tokens || []));
      }
    };
    setPools([]);
    fetchPools();
  }, [integration, tokens]);

  const onChangePairAssets = async (selectedAddresses: string[]) => {
    let valid = true;

    selectedAddresses.forEach(async (address: string) => {
      const validAsset: boolean = await viewerService.isPriceValid(address, gardenDetails);
      valid = valid || validAsset;
    });

    if (valid) {
      setTokens(selectedAddresses);
    } else {
      alert('Asset does meet garden liquidity requirements in Uniswap V3');
    }
  };

  const headers = ['Address', 'Name'];

  if (pools && pools.length > 0 && pools[0].liquidity) {
    headers.push('Liquidity');
  }

  if (pools && pools.length > 0 && pools[0].volume) {
    headers.push('Volume');
  }

  if (showStakeableColumn) {
    headers.push('Stakeable In');
  }

  headers.push('Select');

  return (
    <PoolStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will automatically swap the reserve asset into the pool tokens. Pool tokens need to be above
          this liquidity:{' '}
          <b>
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />
          </b>
        </span>
      </OperationInfoMessage>
      {integrationObj.name !== IntegrationName.CurvePool && (
        <TokenSelector
          name="tokens-pool"
          label="Search pool by Assets"
          isMulti
          disabled={loadingPair}
          required
          onlySwappable
          maxTokens={integrationObj.name === 'BalancerIntegration' ? 8 : 2}
          stateCallback={onChangePairAssets}
        />
      )}
      <FormBox>
        {loadingPair && <BaseLoader size={40} text="Loading pools..." />}
        {!loadingPair && pools && pools.length > 0 && (
          <GardenTable headers={headers}>
            {pools.map((pool: Pool) => (
              <tr key={pool.id}>
                <td>
                  <Member size={10} address={pool.id} showText />
                </td>
                <td>{pool.name}</td>
                {!!pool.liquidity && <td>{numeral(pool.liquidity).format('($0.0a)')}</td>}
                {!!pool.volume && <td>{numeral(pool.volume).format('($0.0a)')}</td>}
                {showStakeableColumn && (
                  <td>
                    <StakeableProtocols>
                      {pool.stakeable &&
                        pool.stakeable.map((protocol: string) => (
                          <ProtocolIcon key={protocol} name={protocol} size={20} />
                        ))}
                    </StakeableProtocols>
                  </td>
                )}
                <td>
                  {selectedPool !== pool.id && (
                    <Button
                      onClick={() => {
                        setSelectedPool(pool.id);
                        setIntegrationData(arrayify(pool.id), tokens);
                      }}
                    >
                      Select
                    </Button>
                  )}
                  {selectedPool === pool.id && <div>✅</div>}
                </td>
              </tr>
            ))}
          </GardenTable>
        )}
      </FormBox>
    </PoolStrategyWrapper>
  );
};

const FormBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const StakeableProtocols = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;

  > div {
    margin: 0 4px;
  }
`;

const PoolStrategyWrapper = styled.div`
  padding: 10px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

export default React.memo(PoolStrategyForm);
