import {
  BaseLoader,
  BaseModal,
  GardenTable,
  Icon,
  Member,
  PurpleButton,
  RedButton,
  TextArea,
  TurquoiseButton,
  TxLoader,
} from 'components/shared';

import addresses from 'constants/addresses';
import { Garden } from 'constants/contracts';
import { FullGardenDetails, IconName, IdentityResponse } from 'models';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { IdentityService } from 'services';
import { isAddress } from '@ethersproject/address';
import { useW3Context } from 'context/W3Provider';

import { Contract } from '@ethersproject/contracts';
import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

interface CreatorsPanelProps {
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

const MAX_NUM_CREATORS = 5;

const HEADERS = ['Identity', 'Member', 'Action'];
const TRANSFER_TEXT = 'You are about to transfer your creator role to a new address. This action cannot be undone!';
const RENOUNCE_TEXT =
  'You are about to renounce your creator role. This action cannot be undone and you will no longer be able to manage configuration of this garden!';
const ADD_CREATOR_TEXT =
  'Note that only existing members can be added as creators. This is a one time action and cannot be undone.';

interface TransferModalProps {
  open: boolean;
  isValid: boolean;
  value: string;
  toggle(): void;
  handleTransfer(): void;
  addressOnChange(e: any): void;
}

interface RenounceModalProps {
  open: boolean;
  toggle(): void;
  handleRenounce(): void;
}

interface ConfirmationContentProps {
  headerText: string;
  bodyText: string;
  buttonText: string;
  back?: () => void;
  toggle(): void;
  action(): void;
}

interface AddCreatorsInput {
  gardenDetails: FullGardenDetails;
  identityService: IdentityService;
  toggle(): void;
  handleAddCreators(creators: string[]): void;
}

const ConfirmationContent = ({ headerText, bodyText, buttonText, toggle, action, back }: ConfirmationContentProps) => {
  return (
    <ConfirmationWrapper>
      <ConfirmIconWrapper>
        <Icon name={IconName.stop} size={92} />
      </ConfirmIconWrapper>
      <ConfirmHeader>{headerText}</ConfirmHeader>
      <ConfirmBody>{bodyText}</ConfirmBody>
      <ConfirmationLabel>Do you confirm this action?</ConfirmationLabel>
      <ConfirmButtonRow>
        <PurpleButton onClick={back ? back : toggle}>{back ? 'Back' : 'Cancel'}</PurpleButton>
        <RedButton
          onClick={() => {
            toggle();
            action();
          }}
        >
          {buttonText}
        </RedButton>
      </ConfirmButtonRow>
    </ConfirmationWrapper>
  );
};

const RenounceModal = ({ handleRenounce, open, toggle }: RenounceModalProps) => {
  return (
    <StyledModal header={'Renounce Creator Role'} isOpen={open} toggleModal={toggle} width={'500px'}>
      <ConfirmationContent
        headerText={'Renounce Creator Role'}
        bodyText={RENOUNCE_TEXT}
        buttonText={'Yes, I want to renounce creator role'}
        toggle={toggle}
        action={handleRenounce}
      />
    </StyledModal>
  );
};

const TransferModal = ({ handleTransfer, addressOnChange, open, toggle, isValid, value }: TransferModalProps) => {
  const [step, setStep] = useState<number>(1);

  return (
    <StyledModal header={'Transfer Creator Role'} isOpen={open} toggleModal={toggle} width={'500px'}>
      {step === 1 && (
        <ModalContent>
          Note: You can only transfer the creator role to an existing Garden member.
          <AddressInputContainer>
            <TextArea
              name={'Transfer Address'}
              label={'New Creator Address'}
              placeholder={'0x00...0000'}
              valid={isValid}
              value={value}
              onChange={addressOnChange}
              rows={1}
              lineHeight={22}
            />
            <ModalWarningRow>
              <Icon name={IconName.warning} size={18} />
              <ModalWarningText>Warning! This action cannot be undone.</ModalWarningText>
            </ModalWarningRow>
          </AddressInputContainer>
          <ModalActionRow>
            <TurquoiseButton
              inverted
              onClick={() => {
                setStep(1);
                toggle();
              }}
            >
              Cancel
            </TurquoiseButton>
            <TurquoiseButton disabled={!isValid || value === ''} onClick={() => setStep(2)}>
              Begin Transfer
            </TurquoiseButton>
          </ModalActionRow>
        </ModalContent>
      )}
      {step === 2 && (
        <ConfirmationContent
          headerText={'Transfer Creator Role'}
          bodyText={TRANSFER_TEXT + ` You are transfering role to ${value}.`}
          buttonText={'Yes, I want to transfer creator role'}
          toggle={toggle}
          back={() => setStep(1)}
          action={handleTransfer}
        />
      )}
    </StyledModal>
  );
};

const AddCreatorsInput = ({ gardenDetails, identityService, toggle, handleAddCreators }: AddCreatorsInput) => {
  const [addresses, setAddresses] = useState<string>('');
  const [creators, setCreators] = useState<string[]>([]);
  const [identities, setIdentities] = useState<IdentityResponse | undefined>(undefined);
  const [isValid, setIsValid] = useState<boolean>(false);

  const fetchData = async () => {
    const identities = await identityService.getIdentities(creators);
    setIdentities(identities);
  };

  useEffect(() => {
    fetchData();
  }, [creators]);

  const setInviteData = (addresses: string) => {
    setAddresses(addresses);

    const list = Array.from(
      new Set(
        addresses
          .toLowerCase()
          .trim()
          .split(',')
          .map((s) => s.trim()),
      ),
    )
      .filter((s) => isAddress(s))
      // Filter down to only addresses who have deposited into the garden aka Contributors
      .filter((s) => gardenDetails.contributors?.map((c) => c.address.toLowerCase()).includes(s.toLowerCase()))
      // Filter any addresses that already exist in the creator array for the garden
      .filter((s) => !gardenDetails.creator.map((c) => c.toLowerCase()).includes(s.toLowerCase()))
      // Slice off any invites > than the max total creators for a garden (5)
      .slice(0, MAX_NUM_CREATORS - gardenDetails.creator.length);

    const valid = list.length > 0 && list.length + gardenDetails.creator.length <= MAX_NUM_CREATORS;
    setIsValid(valid);
    setCreators(list);
  };

  const rows = (() => {
    return creators.map((address: string, index: number) => {
      const maybeIdentity = identities?.usersByAddress[address];
      const displayName = maybeIdentity?.displayName;
      const avatarUrl = maybeIdentity?.avatarUrl;

      return (
        <tr key={index}>
          <td>
            <Member displayName={displayName} avatarUrl={avatarUrl} showText address={address} />
          </td>
        </tr>
      );
    });
  })();

  return (
    <TableWrapper>
      <AddCreatorInputWrapper>
        <h4>Add Creators</h4>
        <ModalWarningRow>
          <Icon name={IconName.warning} size={18} />
          <ModalWarningText>{ADD_CREATOR_TEXT}</ModalWarningText>
        </ModalWarningRow>
        <TextInputWrapper>
          <TextArea
            name={'ETH Addresses'}
            value={addresses}
            rows={3}
            lineHeight={22}
            onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
              setInviteData(e.currentTarget.value);
            }}
            label={`Add up to ${MAX_NUM_CREATORS - gardenDetails.creator.length} addresses separated by commas (",")`}
            placeholder={'0xf126a... , 0xf126a...'}
            required
            valid={isValid}
          />
        </TextInputWrapper>
        {creators.length > 0 && (
          <AddCreatorRows>
            <GardenTable headers={['Identity']}>{rows}</GardenTable>
          </AddCreatorRows>
        )}
        <ActionButtonRow>
          <ActionButtonWrapper rightAlign>
            <TurquoiseButton
              inverted
              onClick={() => {
                toggle();
              }}
            >
              Cancel
            </TurquoiseButton>
            <TurquoiseButton disabled={!isValid} onClick={() => handleAddCreators(creators)}>
              Add Creators
            </TurquoiseButton>
          </ActionButtonWrapper>
        </ActionButtonRow>
      </AddCreatorInputWrapper>
    </TableWrapper>
  );
};

const CreatorsPanel = ({ gardenDetails, refetch }: CreatorsPanelProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [transferAddressValid, setTransferAddressValid] = useState<boolean>(false);
  const [identities, setIdentities] = useState<IdentityResponse | undefined>(undefined);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showRenounceModal, setShowRenounceModal] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);

  const { address, canSubmitTx, txProvider } = useW3Context();
  const identityService = IdentityService.getInstance();

  const fetchData = async () => {
    const identities = await identityService.getIdentities(gardenDetails.creator.map((creator: string) => creator));
    setIdentities(identities);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenounce = async () => {
    if (gardenDetails.publicLP && canSubmitTx && txProvider) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;

      setTxReady(gardenContract.transferCreatorRights(addresses.zero, 0));
    }
  };

  const handleTransfer = async () => {
    if (transferAddress && transferAddress !== addresses.zero && canSubmitTx && txProvider) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;

      const creatorPosition = gardenDetails.creator
        .map((creator, index) => {
          return { creator, index };
        })
        .filter((item) => item.creator.toLowerCase() === address?.toLowerCase());

      if (creatorPosition[0].index === undefined) {
        console.log('Unable to determine creator position for transfer');

        return;
      }

      setTxReady(gardenContract.transferCreatorRights(transferAddress, creatorPosition[0].index));
    }
  };

  const handleAddCreators = async (creators: string[]) => {
    if (txProvider && creators.length > 0 && gardenDetails.creator.length + creators.length <= MAX_NUM_CREATORS) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;

      let creatorArray = [...Array(4)].map((i) => addresses.zero);

      creators.forEach((c, index) => {
        creatorArray[index] = c;
      });

      setTxReady(gardenContract.addExtraCreators(creatorArray));
    }
  };

  const rows = (() => {
    return gardenDetails.creator.map((creator, index) => {
      const maybeIdentity = identities?.usersByAddress[creator];
      const displayName = maybeIdentity?.displayName;
      const avatarUrl = maybeIdentity?.avatarUrl;
      const you = address?.toLowerCase() === creator.toLowerCase();
      const hasJoined =
        gardenDetails.contributors?.map((c) => c.address.toLowerCase()).includes(creator.toLowerCase()) || false;
      const canRenounce = you && (gardenDetails.publicLP || creator !== gardenDetails.creator[0]);

      return (
        <StyledRow key={creator + index} you={you}>
          <IdentityTd>
            <Member showText you={you} address={creator} avatarUrl={avatarUrl} displayName={displayName} />
          </IdentityTd>
          <td>
            <Icon name={hasJoined ? IconName.success : IconName.failure} size={24} />
          </td>
          <td>
            {you ? (
              <ActionButtonRow>
                <ActionButtonWrapper>
                  <StyledActionButton onClick={() => setShowTransferModal(!showTransferModal)}>
                    <Icon name={IconName.transfer} size={24} />
                    Transfer Role
                  </StyledActionButton>
                  {canRenounce && (
                    <StyledActionButton onClick={() => setShowRenounceModal(!showRenounceModal)}>
                      <Icon name={IconName.cancel} size={24} />
                      Renounce
                    </StyledActionButton>
                  )}
                </ActionButtonWrapper>
              </ActionButtonRow>
            ) : null}
          </td>
        </StyledRow>
      );
    });
  })();

  const canAddCreator = ((): boolean => {
    return (
      gardenDetails.creator.length === 1 && (gardenDetails.creator[0] || '').toLowerCase() === address?.toLowerCase()
    );
  })();

  const onChangeTransferAddress = (e) => {
    const isSelf = e.target.value.toLowerCase() === address?.toLowerCase();
    const isMember =
      gardenDetails.contributors?.map((c) => c.address.toLowerCase()).includes(e.target.value.toLowerCase()) || false;
    setTransferAddress(e.target.value);
    setTransferAddressValid(!isSelf && isMember && isAddress(e.target.value));
  };

  return (
    <ContentWrapper>
      {loading && <BaseLoader size={60} />}
      {!txReady && !loading && (
        <TableWrapper>
          <TableHeaderWrapper>
            <TableTitle>Creators</TableTitle>{' '}
            <TableMetric>
              ({gardenDetails.creator.length} of {MAX_NUM_CREATORS})
            </TableMetric>
          </TableHeaderWrapper>
          <GardenTable
            key={'manage-creators-table'}
            emptyLabel={'No creators found'}
            emptyImageKey={'members'}
            headers={HEADERS}
          >
            {rows}
          </GardenTable>
        </TableWrapper>
      )}
      {!txReady && !loading && canAddCreator && (
        <>
          {!addOpen && (
            <AddButtonWrapper>
              <AddButton onClick={() => setAddOpen(true)}>
                <Icon name={IconName.members} color="var(--turquoise-01)" /> Add Creator
              </AddButton>
            </AddButtonWrapper>
          )}
          {addOpen && (
            <AddCreatorsInput
              gardenDetails={gardenDetails}
              identityService={identityService}
              handleAddCreators={handleAddCreators}
              toggle={() => setAddOpen(false)}
            />
          )}
        </>
      )}
      {showTransferModal && (
        <TransferModal
          open={showTransferModal}
          value={transferAddress}
          isValid={transferAddressValid}
          handleTransfer={handleTransfer}
          addressOnChange={onChangeTransferAddress}
          toggle={() => setShowTransferModal(false)}
        />
      )}
      {showRenounceModal && (
        <RenounceModal
          open={showRenounceModal}
          handleRenounce={handleRenounce}
          toggle={() => setShowRenounceModal(false)}
        />
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
    </ContentWrapper>
  );
};

const ModalActionRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  width: 100%;
  margin-top: auto;

  > button {
    &:first-child {
      margin-right: 20px;
    }
  }
`;

const AddressInputContainer = styled.div`
  margin-top: 40px;
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const StyledModal = styled(BaseModal)`
  height: 500px;
`;

const AddButtonWrapper = styled.div`
  margin: 30px 0;
`;

const AddButton = styled.div`
  color: var(--turquoise-01);
  text-decoration: underline;
  display: flex;
  flex-flow: row nowrap;

  svg {
    margin-right: 6px;
  }

  &:hover {
    cursor: pointer;
    opacity: 0.8;

    svg {
      opacity: 0.8;
    }
  }
`;

const ActionButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
`;

const ActionButtonWrapper = styled.div<{ rightAlign?: boolean }>`
  margin-left: ${(p) => (p.rightAlign ? 'auto' : '0')};

  > button {
    &:first-child {
      margin-right: 20px;
    }
  }
`;

const StyledActionButton = styled(PurpleButton)`
  height: 40px;

  > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: flex-start;

    svg {
      margin-right: 4px;
    }
  }
`;

const StyledRow = styled.tr<{ you: boolean }>`
  & > td:first-child {
    padding-left: 10px;
  }

  ${(p) => (p.you ? 'background: #231D65;' : '')}
`;

const TableHeaderWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  height: 40px;
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-family: cera-bold;
`;

const TableMetric = styled.div`
  padding-left: 8px;
  font-size: 16px;
  font-family: cera-regular;
`;

const IdentityTd = styled.td``;

const TableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const ContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

const ModalContent = styled.div`
  width: 100%;
  min-height: 350px;
  display: flex;
  flex-flow: column nowrap;
`;

const ModalWarningText = styled.div`
  margin-left: 12px;
  color: var(--negative);
`;

const ModalWarningRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

const ConfirmationWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  min-height: 350px;
`;

const ConfirmHeader = styled.div`
  color: var(--red);
  font-family: cera-medium;
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
  width: 100%;
`;

const ConfirmBody = styled.div`
  color: var(--white);
  font-size: 16px;
  margin-bottom: 50px;
  text-align: center;
  width: 100%;
`;

const ConfirmationLabel = styled.div`
  font-family: cera-medium;
  font-size: 16px;
  margin-bottom: 30px;
  text-align: center;
  width: 100%;
`;

const ConfirmButtonRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  width: 100%;

  > button {
    &:first-child {
      margin-right: 20px;
    }
  }
`;

const ConfirmIconWrapper = styled.div`
  padding: 30px;
  width: 100%;
  display: inline-flex;
  justify-content: center;
`;

const AddCreatorRows = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 20px 0 30px 0;
  width: 100%;
`;

const AddCreatorInputWrapper = styled.div`
  margin-top: 40px;
`;

const TextInputWrapper = styled.div`
  margin: 30px 0;
`;

export default React.memo(CreatorsPanel);
