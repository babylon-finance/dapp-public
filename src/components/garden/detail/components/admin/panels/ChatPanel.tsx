import { PurpleButton, TurquoiseButton, Icon, CheckmarkDisplay } from 'components/shared';
import { NftService, ParsiqService } from 'services';
import { FullGardenDetails, IconName, ParsiqTransport } from 'models';
import usePoller from 'hooks/Poller';

import { Input, Loader } from 'rimble-ui';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface ChatPanelProps {
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

const ChatPanel = ({ gardenDetails, refetch }: ChatPanelProps) => {
  const [result, setResult] = useState<ParsiqTransport | undefined>(undefined);
  const [generateSuccess, setGenerateSuccess] = useState<boolean | undefined>(undefined);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean | undefined>(undefined);
  const [newTelegram, setNewTelegram] = useState<boolean>(false);
  const [telegramEdit, setTelegramEdit] = useState<boolean>(false);
  const [telegramLink, setTelegramLink] = useState<string>(gardenDetails.nft?.telegram || '');
  const [telegramValid, setTelegramValid] = useState<boolean>(true);
  const [telegramInputDirty, setTelegramInputDirty] = useState<boolean>(false);
  const [telegramSaving, setTelegramSaving] = useState<boolean>(false);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState<boolean | undefined>(undefined);
  const [telegramCompleted, setTelegramCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const parsiqService = ParsiqService.getInstance();
  const nftService = NftService.getInstance();

  useEffect(() => {
    getTransportStatus();
  }, []);

  usePoller(() => {
    getTransportStatus();
  }, 10000);

  const getTransportStatus = async () => {
    if (gardenDetails.nft?.transport?.transport_id) {
      const status = await parsiqService.getTransportStatus(gardenDetails.nft?.transport?.transport_id);
      setTelegramCompleted(status);
    }
  };

  const generateTransport = async () => {
    setLoading(true);
    try {
      gardenDetails.nft?.transport && (await deleteTransport(false));
      const result: ParsiqTransport | undefined = await parsiqService.createGardenTransport(
        gardenDetails.address,
        gardenDetails,
      );

      if (result) {
        await nftService.updateGardenNft(gardenDetails.address, gardenDetails.seed, { transport: result });
        setResult(result);
        setGenerateSuccess(true);
        window.open(result.transport_connection_url);
        refetch();
      } else {
        setGenerateSuccess(false);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const checkTelegramValid = (url: string) => {
    try {
      if (!url) {
        return true;
      }

      return new URL(url) && true;
    } catch (err) {
      return false;
    }
  };

  const saveTelegramUrl = async () => {
    if (telegramValid && telegramInputDirty) {
      setTelegramSaving(true);
      try {
        await nftService.updateGardenNft(gardenDetails.address, gardenDetails.seed, { telegram: telegramLink });
        setTelegramSaveSuccess(true);
      } catch (error) {
        console.error(error);
        setTelegramSaveSuccess(false);
      } finally {
        setTelegramEdit(false);
        setTelegramInputDirty(false);
        setTelegramSaving(false);
      }
    }
  };

  const handleTelegramChange = (e) => {
    e.preventDefault();
    if (e.target.value !== gardenDetails.nft?.telegram) {
      setTelegramInputDirty(true);
    }

    setTelegramValid(!!checkTelegramValid(e.target.value));
    setTelegramLink(e.target.value);
  };

  const deleteTransport = async (withLoading: boolean = true) => {
    withLoading && setLoading(true);
    const success: boolean = await parsiqService.deleteGardenTransport(gardenDetails.address);

    if (success) {
      try {
        await nftService.updateGardenNft(gardenDetails.address, gardenDetails.seed, { transport: undefined });
        setDeleteSuccess(true);
        refetch();
      } catch (error) {
        console.error(error);
        setDeleteSuccess(false);
      }
    } else {
      setDeleteSuccess(false);
    }
    withLoading && setLoading(false);
  };

  const toggleEdit = () => {
    // If it is a cancel, clear dirty and reset to original value
    if (telegramEdit) {
      setTelegramInputDirty(false);
      setTelegramLink(gardenDetails.nft?.telegram || '');
      setTelegramEdit(false);
    } else {
      setTelegramEdit(true);
    }
  };

  const createSuccess = result && generateSuccess;
  const existingTransport = gardenDetails.nft?.transport;

  return (
    <ContentContainer>
      <ContentWrapper>
        {!telegramLink && !telegramInputDirty && !newTelegram && (
          <AddChatButton onClick={() => setNewTelegram(true)}>
            <Icon name={IconName.plus} size={24} color={'var(--turquoise-01)'} />
            <span>Add Telegram</span>
          </AddChatButton>
        )}
        {(telegramLink || telegramInputDirty || newTelegram) && (
          <>
            <PlatformLabel>Telegram</PlatformLabel>
            <UrlInputWrapper>
              <UrlInput
                active={telegramEdit}
                required
                disabled={!telegramEdit}
                name="Telegram"
                onChange={handleTelegramChange}
                valid={telegramValid}
                placeholder="Paste valid invite link..."
                value={telegramLink}
              />
              <ManageButtonWrapper>
                <ActionButton disabled={false} onClick={toggleEdit}>
                  {telegramEdit ? (
                    <ActionSpan>
                      <span>Cancel</span>
                    </ActionSpan>
                  ) : (
                    <ActionSpan>
                      <Icon name={IconName.edit} size={24} color={'var(--white)'} />
                      <span>Edit</span>
                    </ActionSpan>
                  )}
                </ActionButton>
                {!createSuccess && !telegramCompleted && (
                  <ActionButton disabled={loading} onClick={generateTransport}>
                    {loading ? (
                      <Loader size={12} color="var(--white)" />
                    ) : (
                      <ActionSpan>
                        <Icon name={IconName.bellActive} size={24} color={'var(--white)'} />
                        <span>Connect Notifications</span>
                      </ActionSpan>
                    )}
                  </ActionButton>
                )}
                {telegramCompleted && !deleteSuccess && (
                  <ActionButton disabled={false} onClick={deleteTransport}>
                    {loading ? (
                      <Loader size={12} color="var(--white)" />
                    ) : (
                      <ActionSpan>
                        <Icon name={IconName.bellDisabled} size={24} color={'var(--white)'} />
                        <span>Disable Notifications</span>
                      </ActionSpan>
                    )}
                  </ActionButton>
                )}
                {(existingTransport || createSuccess) && telegramCompleted && (
                  <AuthStateWrapper>
                    <CheckmarkDisplay label="Connected" value={true} size={24} />
                  </AuthStateWrapper>
                )}
              </ManageButtonWrapper>
            </UrlInputWrapper>
          </>
        )}
        {!generateSuccess && deleteSuccess === false && (
          <ResultText>Failed to disconnect Telegram notifications! Please try again later.</ResultText>
        )}
        {generateSuccess === false && (
          <ResultText>Failed to connect Telegram notifications! Please try again later.</ResultText>
        )}
      </ContentWrapper>
      <PanelButtonRow>
        {telegramInputDirty && telegramEdit && (
          <TurquoiseButton disabled={!telegramValid} onClick={saveTelegramUrl}>
            {telegramSaveSuccess === undefined && telegramSaving ? (
              <Loader size={12} color="var(--modal-blue)" />
            ) : (
              'Save'
            )}
          </TurquoiseButton>
        )}
      </PanelButtonRow>
    </ContentContainer>
  );
};

const PanelButtonRow = styled.div`
  margin-top: auto;
  margin-left: auto;
`;

const ActionSpan = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  svg {
    margin-right: 4px;
  }
`;

const AuthStateWrapper = styled.div`
  margin-left: 20px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  height: 60px%;
`;

const ActionButton = styled(PurpleButton)`
  margin-right: 8px;
`;

const PlatformLabel = styled.div`
  color: var(--white);
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
`;

const AddChatButton = styled.div`
  display: flex;
  flex-flow: row nowrap;
  color: var(--turquoise-01);
  font-size: 16px;
  cursor: pointer;

  span {
    margin-left: 6px;
  }

  &:hover {
    opacity: 0.7;
  }
`;

const ManageButtonWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
`;

const UrlInputWrapper = styled.div`
  color: var(--white);
  font-weight: 600;
  opacity: 1 important!;

  input[type='text'][disabled] {
    color: var(--purple-aux);
  }

  input {
    &:disabled {
      opacity: 1;
    }

    ::placeholder {
      color: var(--purple-aux);
      opacity: 0.9;
    }

    font-size: 16px;
  }
`;

const UrlInput = styled(Input)<{ active: boolean }>`
  color: var(--purple-aux);
  background: ${(p) => (p.active ? 'transparent' : 'var(--blue-07)')};
  border: ${(p) => (p.active ? '1px solid var(--white)' : 'none')};
  margin-bottom: 8px;
  width: 100%;
  box-shadow: none;

  &:focus {
    outline: none;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    box-shadow: none;
  }
`;

const ResultText = styled.div`
  margin-top: 30px;
  color: var(--white);
  font-size: 16px;
  font-family: cera-bold;
  text-align: center;

  animation: cssAnimation 0s ease-in 2s forwards;
  animation-fill-mode: forwards;
  -moz-animation: cssAnimation 0s ease-in 2s forwards;
  -webkit-animation: cssAnimation 0s ease-in 2s forwards;
  -webkit-animation-fill-mode: forwards;
  -o-animation: cssAnimation 0s ease-in 2s forwards;

  @keyframes cssAnimation {
    to {
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  @-webkit-keyframes cssAnimation {
    to {
      width: 0;
      height: 0;
      visibility: hidden;
    }
  }
`;

const ContentContainer = styled.div`
  background-color: var(--modal-blue);
  border: none;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  width: 100%;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export default React.memo(ChatPanel);
