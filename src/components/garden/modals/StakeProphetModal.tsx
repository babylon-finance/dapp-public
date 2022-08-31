import { BaseModal, TxLoader, TurquoiseButton, GardenTable, HoverTooltip, OpenSeaButton } from 'components/shared';
import { ProphetProfile } from 'components/Prophets/Gallery';

import addresses from 'constants/addresses';
import ProphetsJson from 'components/Prophets/contracts/Prophets.json';
import { IconName } from 'models';
import { PROPHET_ADDRESS, BREAKPOINTS } from 'config';
import { ViewerService } from 'services';
import { useW3Context } from 'context/W3Provider';

import { Link } from 'react-router-dom';
import { Loader } from 'rimble-ui';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const RadioTD = ({ id, selected, setSelected }) => {
  return (
    <StyledRadio onChange={() => setSelected(id)} type="radio" value={id} checked={selected} selected={selected} />
  );
};

interface StakeProphetModalProps {
  garden: string;
  linkButton?: boolean;
}

const StakeProphetModal = ({ garden, linkButton }: StakeProphetModalProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [prophetIds, setProphetIds] = useState<number[] | undefined>(undefined);
  const [stakedIds, setStakedIds] = useState<number[]>([]);
  const [stakedGarden, setStakedGarden] = useState<number | undefined>(undefined);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);

  const { address, provider, txProvider } = useW3Context();
  const viewerService = ViewerService.getInstance();

  const fetchData = async (address: string) => {
    try {
      const prophetIdsBN = await viewerService.getAllProphets(address);
      const prophetIds = prophetIdsBN.map((b: BigNumber) => b.toNumber());
      setProphetIds(prophetIds);
      if (prophetIds.length === 1) {
        setSelected(prophetIds[0]);
      }
      const prophets = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, provider);
      const promises = prophetIds.map(async (id) => {
        return [id, await getStaked(id, prophets)];
      });
      const stakedResults = await Promise.all(promises);
      const ids = stakedResults.filter((r) => r[1] !== addresses.zero).map((r) => r[0]) as number[];
      setStakedIds(ids);
      const gardenStaked = stakedResults.find((r) => r[1] === garden);
      if (gardenStaked) {
        setStakedGarden(gardenStaked[0]);
        setSelected(gardenStaked[0]);
      }
    } catch (err) {
      setProphetIds([]);
    } finally {
      setLoading(false);
    }
  };

  const getStaked = async (id: number, prophets: Contract) => {
    try {
      const staked = await prophets.targetOf(id);
      return staked;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleSubmitStake = async () => {
    if (address && txProvider && selected) {
      try {
        const prophets = new Contract(PROPHET_ADDRESS, ProphetsJson.abi, txProvider.getSigner());
        setTxReady(prophets.stake(BigNumber.from(selected), garden));
      } catch (error) {
        console.log('Error staking Prophet', error);
      }
    }
  };

  const onFinish = () => {
    setShowModal(false);
    setTxReady(undefined);
  };

  useEffect(() => {
    if (address) {
      fetchData(address);
    } else {
      setLoading(false);
    }
  }, [address]);

  const buildRows = (prophetIds: number[], stakedIds: number[]) => {
    return prophetIds.map((id) => {
      const showWarning = stakedIds.includes(id);
      return (
        <tr key={id}>
          <td>
            <ProfileRowItem>
              <ProphetProfile prophetId={id} stake />
              {showWarning && (
                <HoverTooltip
                  placement={'up'}
                  icon={IconName.warning}
                  size={14}
                  color={'var(--yellow)'}
                  content={'Warning: Staking this Prophet will unstake it from the Garden it is currently held by.'}
                />
              )}
            </ProfileRowItem>
          </td>
          <td>
            <RadioTD id={id} setSelected={setSelected} selected={selected === id || prophetIds.length === 1} />
          </td>
        </tr>
      );
    });
  };

  return (
    <>
      {loading && <Loader size={24} />}
      {!loading && address && (
        <>
          {!stakedGarden && (
            <>
              {linkButton && <LinkButton onClick={() => setShowModal(!showModal)}>Stake Prophet</LinkButton>}
              {!linkButton && (
                <TurquoiseButton
                  width={isMobile ? '100%' : undefined}
                  disabled={loading}
                  inverted
                  onClick={() => setShowModal(!showModal)}
                >
                  {!isMobile ? 'Stake' : ''} Prophet
                </TurquoiseButton>
              )}
            </>
          )}
          {stakedGarden && (
            <ProfileWrapper onClick={() => setShowModal(!showModal)}>
              <ProphetProfile prophetId={stakedGarden} staked />
            </ProfileWrapper>
          )}
          <BaseModal width={isMobile ? '100%' : ''} isOpen={showModal} toggleModal={() => setShowModal(!showModal)}>
            <ModalCard>
              {!txReady && (
                <>
                  <ModalHeadingRow>Stake a Prophet</ModalHeadingRow>
                  <ModalContentWrapper>
                    <StyledLink
                      to={{
                        pathname: 'https://docs.babylon.finance/babl/mining#prophet-bonuses',
                      }}
                      target="_blank"
                    >
                      Learn about staking a Prophet
                    </StyledLink>
                    {prophetIds && prophetIds?.length > 0 && stakedIds && (
                      <>
                        <GardenTable headers={[]}>{buildRows(prophetIds, stakedIds)}</GardenTable>
                        <StyledButtonRowWrapper>
                          <TurquoiseButton disabled={selected === undefined} onClick={handleSubmitStake}>
                            Stake Prophet
                          </TurquoiseButton>
                        </StyledButtonRowWrapper>
                      </>
                    )}
                    {prophetIds && prophetIds.length === 0 && (
                      <NoProphets>
                        <h3>Wallet has no Prophets!</h3>
                        <p>Check OpenSea for available Prophets and earn reward bonuses by staking.</p>
                        <OpenSeaButton />
                      </NoProphets>
                    )}
                  </ModalContentWrapper>
                </>
              )}
              {txReady && <TxLoader txObject={txReady} onConfirm={onFinish} waitForConfirmation />}
            </ModalCard>
          </BaseModal>
        </>
      )}
    </>
  );
};

const NoProphets = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  height: 400px;
`;

const ModalContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const ModalHeadingRow = styled.div`
  font-size: 24px;
  font-family: cera-bold;
  color: var(--white);
  margin-bottom: 10px;
  width: 100%;
`;

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  display: flex;
  flex-flow: column nowrap;
  height: auto;
  width: 460px;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    width: 100%;
  }
`;

const StyledLink = styled(Link)`
  font-family: cera-regular;
  color: var(--turquoise-01);
  text-decoration: underline;
  padding-bottom: 30px;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const ProfileWrapper = styled.div`
  padding-right: 8px;
  cursor: pointer;
`;

const ProfileRowItem = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  height: 100%;

  div:last-child {
    margin-top: 3px;
  }
`;

const LinkButton = styled.div`
  font-family: cera-regular;
  font-size: 16px;
  color: var(--turquoise-01);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--turquoise-01);
    text-decoration: none;
    opacity: 0.8;
  }
`;

const StyledButtonRowWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  flex-flow: row nowrap;
  height: 50px;
  justify-content: flex-end;
  width: 100%;

  > button {
    width: 100%;
  }
`;

const StyledRadio = styled.input<{ selected: boolean }>`
  appearance: none;
  background-color: transparent;
  margin: 0;
  font: inherit;
  color: var(--purple-aux);
  width: 1.15em;
  height: 1.15em;
  border: 0.13em solid var(--purple-aux);
  border-radius: 50%;
  transform: translateY(-0.075em);
  display: grid;
  place-content: center;

  &:hover {
    cursor: ${(p) => (p.selected ? 'initial' : 'pointer')};
  }

  &:before {
    content: '';
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--purple-aux);
  }

  &:checked::before {
    transform: scale(1);
  }
`;

export default React.memo(StakeProphetModal);
