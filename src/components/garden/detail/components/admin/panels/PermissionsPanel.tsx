import { TurquoiseButton, ToggleInput, TxLoader, Icon, PurpleButton } from 'components/shared/';

import { PublicFlagsRequest, FullGardenDetails, IconName, TxType } from 'models/';
import { useW3Context } from 'context/W3Provider';
import { loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { Garden } from 'constants/contracts';
import { Contract } from '@ethersproject/contracts';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import React, { useState } from 'react';

const video = require('./media/gate.mov');

interface PermissionsPanelProps {
  gardenDetails: FullGardenDetails;
  refetch(): void;
}

const PermissionsPanel = ({ gardenDetails, refetch }: PermissionsPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [txScreenIndex, setTxScreenIndex] = useState<number>(0);
  const [publicVotes, setPublicVotes] = useState(gardenDetails.publicVoter);
  const [publicStrategist, setPublicStrategist] = useState(gardenDetails.publicStrategist);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);

  const { txProvider, canSubmitTx } = useW3Context();

  const makeGardenPublic = async () => {
    if (txProvider) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;
      try {
        setTxScreenIndex(1);
        setTxReady(gardenContract.makeGardenPublic());
      } catch (err) {
        console.log('Make garden public error', err);
      }
    }
  };

  const setPublicFlags = async () => {
    if (txProvider) {
      const gardenContract = (await loadContractFromNameAndAddress(
        gardenDetails.address,
        Garden,
        txProvider,
      )) as Contract;
      try {
        setTxScreenIndex(2);
        const publicFlagsRequest = new PublicFlagsRequest(publicStrategist, publicVotes);
        setTxReady(gardenContract.setPublicRights(...publicFlagsRequest.getProps()));
      } catch (err) {
        console.log('Set public flags error', err);
      }
    }
  };

  return (
    <PermissionsPanelWrapper>
      {!txReady && (
        <ContentWrapper>
          <h4>Manage Permissions</h4>
          <SectionWrapper>
            <ActionSection>
              <div>
                {!gardenDetails.publicLP && (
                  <PermissionWrapper>
                    <PublicButtonWrapper>
                      <WarningRow>
                        <Icon name={IconName.warning} size={18} />
                        <WarningText>
                          Warning! This action cannot be undone and will enable anyone to deposit and join this Garden.
                        </WarningText>
                      </WarningRow>
                      <StyledPurpleButton onClick={() => makeGardenPublic()}>Make Garden Public</StyledPurpleButton>
                    </PublicButtonWrapper>
                  </PermissionWrapper>
                )}
                {gardenDetails.publicLP && (
                  <PermissionWrapper>
                    <RowToggle>
                      <ToggleWrapper>
                        <ToggleInput
                          label="Open Votes"
                          tooltip={'If enabled, members will be able to vote on candidate strategies.'}
                          name="publicVoter"
                          required
                          checked={publicVotes}
                          onChange={(e: React.ChangeEvent<any>) => {
                            setPublicVotes(e.target.checked);
                          }}
                        />
                      </ToggleWrapper>
                      <ToggleWrapper>
                        <ToggleInput
                          label="Open Strategies"
                          tooltip={'If enabled, members will be able to create strategies.'}
                          name="publicStrategist"
                          required
                          checked={publicStrategist}
                          onChange={(e: React.ChangeEvent<any>) => {
                            setPublicStrategist(e.target.checked);
                          }}
                        />
                      </ToggleWrapper>
                    </RowToggle>
                  </PermissionWrapper>
                )}
              </div>
            </ActionSection>
          </SectionWrapper>
          {gardenDetails.publicLP && (
            <ButtonRow>
              <ButtonWrapper>
                <TurquoiseButton
                  disabled={
                    !canSubmitTx ||
                    (publicVotes === gardenDetails.publicVoter && publicStrategist === gardenDetails.publicStrategist)
                  }
                  onClick={() => setPublicFlags()}
                >
                  Update Permissions
                </TurquoiseButton>
              </ButtonWrapper>
            </ButtonRow>
          )}
        </ContentWrapper>
      )}
      {txReady && (
        <TxLoader
          type={TxType.sendInvites}
          inModal
          txObject={txReady}
          waitForConfirmation
          onConfirm={() => {
            setTxReady(undefined);
            refetch();
          }}
          onFailure={() => setTxReady(undefined)}
        >
          <InviteConfirmation>
            <GateVideo autoPlay loop muted width={180} height={180}>
              <source src={video} type="video/mp4"></source>
            </GateVideo>
            {txScreenIndex === 1 && <InvitesSent>Garden is now public</InvitesSent>}
            {txScreenIndex === 2 && <InvitesSent>Garden Permissions Updated</InvitesSent>}
            <CopySection>
              <CopySectionTitle>Link to garden:</CopySectionTitle>
              <CopyInputWrapper>
                <CopyInput>{window.location.href}</CopyInput>
                <CopyToClipboard text={window.location.href} onCopy={() => setCopied(true)}>
                  <ClipboardWrapper>
                    <Icon name={IconName.clipboard} size={24} />
                    {!copied ? 'Copy Link' : 'Copied :)'}
                  </ClipboardWrapper>
                </CopyToClipboard>
              </CopyInputWrapper>
            </CopySection>
          </InviteConfirmation>
        </TxLoader>
      )}
    </PermissionsPanelWrapper>
  );
};

const StyledPurpleButton = styled(PurpleButton)`
  width: 200px;
`;

const PublicButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

const WarningText = styled.div`
  margin-left: 12px;
  color: var(--negative);
`;

const WarningRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 30px;
`;

const ToggleWrapper = styled.div`
  margin-left: 40px;

  &:first-child {
    margin-left: 0px;
  }
`;

const PermissionsPanelWrapper = styled.div`
  color: white;
  height: 100%;
  width: 100%;
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
  flex-flow: row nowrap;
  padding-top: 30px;
`;

const GateVideo = styled.video``;

const ActionSection = styled.div`
  width: 100%;
`;

const ButtonRow = styled.div`
  width: 100%;
`;

const ButtonWrapper = styled.div`
  margin-left: auto;
`;

const PermissionWrapper = styled.div`
  display: flex;
  margin: 0 0 30px;
  flex-flow: column nowrap;
  padding-bottom: 20px;
  max-width: 400px;
`;

const InviteConfirmation = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 60px 20px;
`;

const InvitesSent = styled.div`
  text-align: center;
  margin: 42px 0 26px;
  font-size: 24px;
  color: white;
  width: 300px;
`;

const CopySection = styled.div`
  width: 500px;
  margin-top: 40px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
`;

const CopySectionTitle = styled.div`
  font-size: 13px;
  color: white;
  width: 400px;
  margin-bottom: 5px;
`;

const CopyInputWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
`;

const CopyInput = styled.div`
  width: 300px;
  padding: 8px;
  font-size: 16px;
  color: white;
  background: var(--blue-07);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 10px;
`;

const ClipboardWrapper = styled.div`
  display: flex;
  font-size: 16px;
  color: var(--turquoise-01);
  flex-flow: row nowrap;
  align-items: center;
  cursor: pointer;
`;

const RowToggle = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export default React.memo(PermissionsPanel);
