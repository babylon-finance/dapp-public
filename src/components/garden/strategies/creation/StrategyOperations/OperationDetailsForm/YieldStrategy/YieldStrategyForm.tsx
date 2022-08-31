import { TokenSelector, GardenTable, Member, BaseLoader, ReserveNumber } from 'components/shared/';
import { buildVaultsQueryParams, getUnifiedVaultData, getVaultQuery } from './yieldAdapter';
import { Integration, getIntegrationByName, IntegrationName, FullGardenDetails, VaultToken } from 'models';
import { OperationInfoMessage } from '../';
import { Box, Button } from 'rimble-ui';
import { useLazyQuery } from '@apollo/client';
import styled from 'styled-components';
import { ViewerService } from 'services';
import numeral from 'numeral';
import { arrayify } from '@ethersproject/bytes';

import React, { useEffect, useState } from 'react';

interface YieldStrategyFormProps {
  gardenDetails: FullGardenDetails;
  integrationData: any;
  integration: string;
  graphClient: any;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

export interface Vault {
  id: string;
  name: string;
  balance: number;
  pricePerFullShare: number;
  supply?: number;
  earnings?: number;
  iconURI?: string;
  underlying?: VaultToken;
  needsPrevious?: boolean;
}

const YieldStrategyForm = ({
  gardenDetails,
  integration,
  integrationData,
  setIntegrationData,
  graphClient,
}: YieldStrategyFormProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [vaultAsset, setVaultAsset] = useState<string | undefined>(undefined);
  const [vault, setVault] = useState<string | undefined>(integrationData);
  const [vaults, setVaults] = useState<any[]>([]);
  const [loadingToken, setLoadingToken] = useState<boolean>(false);
  const integrationObj = getIntegrationByName(integration) as Integration;

  const viewerService = ViewerService.getInstance();

  const [getVaults, { loading: vaultsLoading, data: vaultsResponse }] = useLazyQuery(getVaultQuery(integrationObj), {
    client: graphClient,
  });

  const fetchVaults = async () => {
    setVaults([]);

    if (integrationObj.name === IntegrationName.Harvest) {
      getVaults(await buildVaultsQueryParams(integrationObj, graphClient, [vaultAsset || '']));
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  useEffect(() => {
    if (vaultsResponse && integrationObj.name === IntegrationName.Harvest) {
      const vaults = getUnifiedVaultData(integrationObj, vaultsResponse);
      setVaults(vaults);
    }
  }, [vaultsResponse]);

  useEffect(() => {
    fetchVaults();
  }, [integration, vaultAsset]);

  const handleVaultAssetChange = async (addresses: string[]) => {
    const validAsset: boolean = await viewerService.isPriceValid(addresses[0], gardenDetails);
    if (validAsset) {
      setVaultAsset(addresses[0]);
      setLoadingToken(true);
      getVaults(await buildVaultsQueryParams(integrationObj, graphClient, addresses));
      setLoadingToken(false);
    } else {
      alert('Asset does meet garden liquidity requirements in Uniswap V3');
    }
  };

  let headers = ['Address', 'Name', 'Balance', 'Price per Share', ''];

  return (
    <YieldStrategyWrapper>
      <OperationInfoMessage>
        <span>
          This operation will automatically swap the reserve asset into the token(s) needed to enter the vault. Assets
          need to meet the Garden min liquidity requirements:{' '}
          <b>
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />
          </b>
          <br />
          <br />
          <b>Note:</b> Vaults that require complex assets (e.g crv family) cannot be purchased and are disabled until
          the underlying protocol integration (Curve) is completed.
        </span>
      </OperationInfoMessage>
      <TokenSelector
        name="vaultAsset"
        label="Filter by Vault Asset"
        disabled={vaultsLoading}
        required
        onlySwappable
        stateCallback={handleVaultAssetChange}
      />
      <ContentWrapper>
        {(loading || vaultsLoading) && <BaseLoader size={40} text="Loading vaults..." />}
        {!loading && !vaultsLoading && vaults?.length > 0 && (
          <GardenTable headers={headers}>
            {vaults.map((vaultIter: Vault) => (
              <tr key={vaultIter.id}>
                <td>
                  <Member size={10} address={vaultIter.id} avatarUrl={vaultIter.iconURI} showText />
                </td>
                <td>{vaultIter.name}</td>
                <td>{numeral(vaultIter.balance).format('($0.0a)')}</td>
                <td>{numeral(vaultIter.pricePerFullShare).format('($0.0a)')}</td>
                <td>
                  {vault !== vaultIter.id && (
                    <Button
                      onClick={() => {
                        setVault(vaultIter.id);
                        setIntegrationData(arrayify(vaultIter.id), [vaultIter.underlying?.address || vaultAsset]);
                      }}
                    >
                      Select
                    </Button>
                  )}
                  {vault === vaultIter.id && <div>✅</div>}
                </td>
              </tr>
            ))}
          </GardenTable>
        )}
        {!loading && !vaultsLoading && !loadingToken && vaults && vaultAsset && vaults.length === 0 && (
          <p>No vaults found for this asset</p>
        )}
      </ContentWrapper>
    </YieldStrategyWrapper>
  );
};

const YieldStrategyWrapper = styled(Box)`
  padding: 20px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px;
`;

export default React.memo(YieldStrategyForm);
