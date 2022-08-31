import { TurquoiseButton, TxLoader } from 'components/shared/';
import {
  FullGardenDetails,
  Token,
  GardenCreationDepositDetails,
  GardenCreationMechanics,
  GardenCreationNftDetails,
  UpdateGardenParamsRequest,
} from 'models/';
import { DepositDetails, GardenMechanics, NftDetails } from 'components/garden/creation/';
import { useW3Context } from 'context/W3Provider';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { Garden } from 'constants/contracts';
import { formatReserveFloat, parseReserve } from 'helpers/Numbers';
import { NftService, TokenListService } from 'services';

import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { formatEther, parseEther } from '@ethersproject/units';
import styled from 'styled-components';
import React, { useState } from 'react';

interface ParamsPanelProps {
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

const ParamsPanel = ({ gardenDetails, refetch }: ParamsPanelProps) => {
  const { txProvider, canSubmitTx } = useW3Context();
  const nftService = NftService.getInstance();
  const tokenListService = TokenListService.getInstance();
  const reserve = tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token;
  const [isValid, setIsValid] = useState(true);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [depositDetails, setDepositDetails] = useState<GardenCreationDepositDetails>({
    minContribution: Number(formatReserveFloat(gardenDetails.minContribution, reserve, 2)), //3
    maxDepositLimit: Number(formatReserveFloat(gardenDetails.maxDepositLimit, reserve, 2)), // 0
    depositHardlock: gardenDetails.depositHardlock.toNumber(), // 2
    sharePriceDelta: parseFloat(formatEther(gardenDetails.sharePriceDelta)) * 100,
    sharePriceDeltaDecay: parseFloat(formatEther(gardenDetails.sharePriceDeltaDecay)) * 100,
  });
  const [nftDetails, setNftDetails] = useState<GardenCreationNftDetails>({
    image: gardenDetails.nft?.image || '',
    mintNftAfter: gardenDetails.nft?.mintNftAfter || 0,
    seed: gardenDetails.seed,
  });
  const [mechanics, setGardenMechanics] = useState<GardenCreationMechanics>({
    earlyWithdrawalPenalty: 2.5,
    minStrategyDuration: gardenDetails.minStrategyDuration.toNumber() / 3600 / 24, //6
    maxStrategyDuration: gardenDetails.maxStrategyDuration.toNumber() / 3600 / 24, //7
    // Safe use of formatEther
    minVotesQuorum: Math.floor(parseFloat(formatEther(gardenDetails.minVotesQuorum)) * 100), //5
    strategyCooldownPeriod: (gardenDetails.strategyCooldownPeriod.toNumber() / 3600) * 2, //4
    minLiquidityAsset: Number(formatReserveFloat(gardenDetails.minLiquidityAsset, reserve, 1)), //1
    minVoters: gardenDetails.minVoters.toNumber(), //8
    customIntegrations: false,
  });

  const updateNft = async (details: GardenCreationNftDetails) => {
    await nftService.updateGardenNft(gardenDetails.address, gardenDetails.seed, { ...details });
  };

  const updateParams = async () => {
    if (txProvider) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;
      try {
        const updateParamsRequest = new UpdateGardenParamsRequest([
          parseReserve(depositDetails.maxDepositLimit.toString(), reserve),
          parseReserve(mechanics.minLiquidityAsset.toString(), reserve),
          BigNumber.from(depositDetails.depositHardlock),
          parseReserve(depositDetails.minContribution.toString(), reserve),
          BigNumber.from((60 * 60 * mechanics.strategyCooldownPeriod) / 2),
          parseEther((mechanics.minVotesQuorum / 100).toString()),
          BigNumber.from(60 * 60 * 24 * mechanics.minStrategyDuration),
          BigNumber.from(60 * 60 * 24 * mechanics.maxStrategyDuration),
          BigNumber.from(mechanics.minVoters),
          parseEther((depositDetails.sharePriceDeltaDecay / 100).toString()),
          parseEther((depositDetails.sharePriceDelta / 100).toString()),
          BigNumber.from(nftDetails.mintNftAfter),
          BigNumber.from(mechanics.customIntegrations ? 1 : 0),
        ]);
        setTxReady(
          gardenContract.updateGardenParams(...updateParamsRequest.getProps()).then(async (success) => {
            await updateNft(nftDetails);
          }),
        );
      } catch (err) {
        console.error('Update Garden Params error', err);
      }
    }
  };
  return (
    <ParamsPanelWrapper>
      {!txReady && (
        <ContentWrapper>
          <h4>Update Garden Properties</h4>
          <SectionWrapper>
            <DepositTitle>Deposit Details</DepositTitle>
            <StyledDepositDetails
              details={depositDetails}
              gardenDetails={gardenDetails}
              setDepositDetails={(depositDetails: GardenCreationDepositDetails, valid: boolean) => {
                setIsValid(valid);
                setDepositDetails(depositDetails);
              }}
            />
            <GardenMechanics
              gardenDetails={gardenDetails}
              mechanics={mechanics}
              setMechanics={(mechanics: GardenCreationMechanics, valid: boolean) => {
                setIsValid(valid);
                setGardenMechanics(mechanics);
              }}
            />
            <NftDetailsWrapper>
              <NftDetails
                gardenDetails={{
                  name: gardenDetails.name,
                  symbol: gardenDetails.symbol,
                  reserveAsset: gardenDetails.reserveAsset,
                  description: '',
                }}
                seed={gardenDetails.seed}
                details={nftDetails}
                setNftDetails={(nftDetails: GardenCreationNftDetails, isValid: boolean) => {
                  setIsValid(isValid);
                  setNftDetails(nftDetails);
                }}
              />
            </NftDetailsWrapper>
          </SectionWrapper>
          <ButtonRow>
            <ButtonWrapper>
              <TurquoiseButton disabled={!canSubmitTx || !isValid} onClick={() => updateParams()}>
                Update Garden Parameters
              </TurquoiseButton>
            </ButtonWrapper>
          </ButtonRow>
        </ContentWrapper>
      )}
      {txReady && (
        <TxLoader
          inModal
          txObject={txReady}
          waitForConfirmation
          onConfirm={() => {
            setTxReady(undefined);
            refetch();
          }}
          onFailure={() => setTxReady(undefined)}
        />
      )}
    </ParamsPanelWrapper>
  );
};

const NftDetailsWrapper = styled.div`
  margin-bottom: 30px;
`;

const StyledDepositDetails = styled(DepositDetails)`
  min-height: auto;
`;

const ParamsPanelWrapper = styled.div`
  color: white;
  height: 100%;
  width: 100%;
`;

const DepositTitle = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  width: 100%;
`;

const SectionWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-flow: column nowrap;
  padding-top: 30px;
`;

const ButtonRow = styled.div`
  width: 100%;
`;

const ButtonWrapper = styled.div`
  margin-left: auto;
`;

export default React.memo(ParamsPanel);
