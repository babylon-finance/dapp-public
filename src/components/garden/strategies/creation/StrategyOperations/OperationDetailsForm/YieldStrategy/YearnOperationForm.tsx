import { GardenTable, Member, ReserveNumber, BaseLoader } from 'components/shared/';
import { Button } from 'rimble-ui';
import { FullGardenDetails, StrategyOperation } from 'models';
import { OperationInfoMessage } from '../';
import YearnService from 'services/YearnService';
import { Vault } from './YieldStrategyForm';
import { yearn } from 'constants/addresses';
import styled from 'styled-components';
import numeral from 'numeral';
import { arrayify, hexDataSlice } from '@ethersproject/bytes';
import React, { useEffect, useState } from 'react';

interface YearnOperationFormProps {
  gardenDetails: FullGardenDetails;
  previousOperation: StrategyOperation | undefined;
  integrationData: any;
  integration: string;
  operationIndex: number;
  setIntegrationData: (data: any, dataAux: any) => void;
}

const YearnOperationForm = ({
  integrationData,
  previousOperation,
  setIntegrationData,
  gardenDetails,
}: YearnOperationFormProps) => {
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vault, setVault] = useState<string | undefined>(integrationData);
  const yearnService = YearnService.getInstance();

  const fetchYearnVaults = async () => {
    setLoading(true);
    const newVaults = await yearnService.fetchVaults();

    if (newVaults) {
      setVaults(newVaults);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchYearnVaults();
  }, []);

  let underlyingAsset: string | undefined;
  if (previousOperation) {
    underlyingAsset = hexDataSlice(previousOperation.data, 12, 32)?.toLowerCase();
    // get lp token from crv pool
    const lpTokenVault = yearn.vaults.find((v: any) => {
      return v.crvpool && v.crvpool.toLowerCase() === underlyingAsset?.toLowerCase();
    });
    if (lpTokenVault) {
      underlyingAsset = lpTokenVault ? lpTokenVault?.needs?.toLowerCase() : undefined;
    }
  }

  const isDisabled = (yearnVault: Vault): boolean => {
    return (
      !!yearnVault.needsPrevious &&
      (!underlyingAsset || underlyingAsset.toLowerCase() !== yearnVault?.underlying?.address?.toLowerCase())
    );
  };

  const selectableVaults = underlyingAsset
    ? vaults.filter((vault: Vault) => vault?.underlying?.address.toLowerCase() === underlyingAsset?.toLowerCase())
    : vaults;
  return (
    <YearnWrapper>
      <OperationInfoMessage>
        <span>
          This operation will automatically swap the reserve asset into the token(s) needed to enter the vault. Assets
          need to meet the Garden min liquidity requirements:{' '}
          <b>
            <ReserveNumber value={gardenDetails.minLiquidityAsset} address={gardenDetails.reserveAsset} />
          </b>
          <br />
          <br />
          <b>Note:</b> Vaults that require complex assets (e.g crv family) cannot be purchased and you need to enter the
          curve pool first.
        </span>
      </OperationInfoMessage>
      <ContentWrapper>
        {loading && <BaseLoader size={40} text="Loading vaults..." />}
        {!loading && vaults?.length > 0 && (
          <GardenTable headers={['Address', 'Name', 'TVL (USD)', 'Price per Share', '']}>
            {selectableVaults.map((yearnVault: Vault) => (
              <tr key={yearnVault.id}>
                <td>
                  <Member size={10} address={yearnVault.id} avatarUrl={yearnVault.iconURI} showText />
                </td>
                <td>{yearnVault.name}</td>
                <td>{numeral(yearnVault.balance).format('($0.0a)')}</td>
                <td>{numeral(yearnVault.pricePerFullShare).format('($0.0a)')}</td>
                <td>
                  {yearnVault.id !== vault && (
                    <Button
                      disabled={isDisabled(yearnVault)}
                      onClick={() => {
                        setVault(yearnVault.id);
                        setIntegrationData(arrayify(yearnVault.id), [yearnVault.id]);
                      }}
                    >
                      {isDisabled(yearnVault) ? 'Enter Curve first' : 'Select'}
                    </Button>
                  )}
                  {yearnVault.id === vault && <div>✅</div>}
                </td>
              </tr>
            ))}
          </GardenTable>
        )}
      </ContentWrapper>
    </YearnWrapper>
  );
};

const YearnWrapper = styled.div`
  padding: 20px 0;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px 0;
`;

export default React.memo(YearnOperationForm);
