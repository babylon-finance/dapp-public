import { Dropdown, TurquoiseButton, GardenTable, Member, TextArea, TxLoader, Icon } from 'components/shared/';

import { BatchInviteRequest, FullGardenDetails, IconName, TxType } from 'models/';
import { useW3Context } from 'context/W3Provider';
import { getAddressByName, loadContractFromNameAndAddress } from 'hooks/ContractLoader';
import { MardukGate } from 'constants/contracts';
import { Contract } from '@ethersproject/contracts';
import { ViewerService } from 'services';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { isAddress } from '@ethersproject/address';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

const video = require('./media/gate.mov');

interface MembersPanelProps {
  gardenDetails: FullGardenDetails;
}

interface MemberInvite {
  address: string;
  permission: number;
}

interface InviteStats {
  total: number;
  used: number;
}

const ALL_OPTIONS = [
  { value: 0, label: 'No Permission' },
  { value: 1, label: 'Can Only Deposit' },
  { value: 2, label: 'Can Deposit & Vote' },
  { value: 3, label: 'Can Deposit, Vote & Submit Strategies' },
];

const MAX_INVITES_PER_TX = 100;

const MembersPanel = ({ gardenDetails }: MembersPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [txScreenIndex, setTxScreenIndex] = useState<number>(0);
  const [addressesField, setAddressesField] = useState('');
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [txReady, setTxReady] = useState<any | undefined>(undefined);
  const [inviteStats, setInviteStats] = useState<InviteStats | undefined>(undefined);

  let permissionOptions = ALL_OPTIONS;

  if (gardenDetails.publicLP) {
    permissionOptions = permissionOptions.filter((option) => option.value !== 1);
  }

  if (gardenDetails.publicVoter) {
    permissionOptions = permissionOptions.filter((option) => option.value !== 2);
  }

  if (gardenDetails.publicStrategist) {
    permissionOptions = permissionOptions.filter((option) => option.value !== 3);
  }

  const defaultOption = permissionOptions.length > 0 ? permissionOptions[permissionOptions.length - 1] : null;

  const { txProvider, canSubmitTx } = useW3Context();
  const viewerService = ViewerService.getInstance();

  const setRows = (addresses: string) => {
    setAddressesField(addresses);

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
      .slice(0, MAX_INVITES_PER_TX);

    setInvites(
      list.map((s) => {
        return { address: s, permission: defaultOption?.value as number };
      }),
    );
  };

  useEffect(() => {
    const setInvites = async () => {
      const invitesStats = await viewerService.getInvitesUsed(gardenDetails.address);
      setInviteStats(invitesStats);
    };
    setInvites();
  }, [gardenDetails.address]);

  const updatePermissions = (permissions: number, index: number) => {
    const newInvites = [...invites];
    newInvites[index].permission = permissions;
    setInvites(newInvites);
  };

  const handleSubmitInvites = async () => {
    if (txProvider) {
      const gateContract = (await loadContractFromNameAndAddress(
        getAddressByName(MardukGate),
        MardukGate,
        txProvider,
      )) as Contract;

      if (invites) {
        try {
          const inviteRequest = new BatchInviteRequest(
            gardenDetails.address,
            invites.map((i: MemberInvite) => i.address),
            invites.map((i: MemberInvite) => i.permission),
          );
          setTxScreenIndex(0);
          setTxReady(gateContract.grantGardenAccessBatch(...inviteRequest.getProps()));
        } catch (err) {
          console.log('Submit invites error', err);
        }
      }
    }
  };

  const validInvites = (invites.length > 0 && invites.length <= MAX_INVITES_PER_TX) || addressesField === '';

  return (
    <MembersPanelWrapper>
      {!txReady && (
        <ContentWrapper>
          <h4>Manage Members</h4>
          <SectionWrapper>
            <InviteSection>
              {permissionOptions.length > 0 && (
                <>
                  <span>Invite Members</span>
                  <TextArea
                    name={'ETH Addresses'}
                    value={addressesField}
                    rows={3}
                    lineHeight={22}
                    onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      setRows(e.currentTarget.value);
                    }}
                    label={`Enter up to ${MAX_INVITES_PER_TX} addresses separated by commas (",")`}
                    placeholder={'0xf126a... , 0xf126a...'}
                    required
                    valid={validInvites}
                  />
                </>
              )}
              {invites.length > 0 && (
                <InviteRows>
                  <GardenTable headers={['Address', ' Permissions']}>
                    {invites.map((invite: MemberInvite, index: number) => (
                      <tr key={index}>
                        <td>
                          <Member showText address={invite.address} />
                        </td>
                        <td>
                          <Dropdown
                            preselectedOptions={[defaultOption]}
                            options={permissionOptions}
                            stateCallback={(option: any) => updatePermissions(parseInt(option.value, 10), index)}
                            required
                            name={invite.address + 'perm'}
                          />
                        </td>
                      </tr>
                    ))}
                  </GardenTable>
                </InviteRows>
              )}
              <ButtonWrapper>
                <TurquoiseButton
                  onClick={() => handleSubmitInvites()}
                  disabled={!validInvites || !canSubmitTx || permissionOptions.length < 1 || invites.length < 1}
                >
                  Send Invites
                </TurquoiseButton>
              </ButtonWrapper>
            </InviteSection>
            <GateSection>
              <InvitesStats>
                <InvitesStatsTitle>Invites</InvitesStatsTitle>
                <InvitesStatsItems>
                  <InvitesStatsBlock>
                    <InvitesStatsValue>{inviteStats?.used}</InvitesStatsValue>
                    <InvitesStatsLabel>Used</InvitesStatsLabel>
                  </InvitesStatsBlock>
                  <InvitesStatsBlock>
                    <InvitesStatsValue>{inviteStats?.total}</InvitesStatsValue>
                    <InvitesStatsLabel>Total</InvitesStatsLabel>
                  </InvitesStatsBlock>
                </InvitesStatsItems>
              </InvitesStats>
            </GateSection>
          </SectionWrapper>
        </ContentWrapper>
      )}
      {txReady && (
        <TxLoader
          type={TxType.sendInvites}
          inModal
          txObject={txReady}
          waitForConfirmation
          onConfirm={() => setTxReady(undefined)}
          onFailure={() => setTxReady(undefined)}
        >
          <InviteConfirmation>
            <GateVideo autoPlay loop muted width={180} height={180}>
              <source src={video} type="video/mp4"></source>
            </GateVideo>
            {txScreenIndex === 0 && <InvitesSent>Invites Sent</InvitesSent>}
            <InvitesText>
              Share the garden link {txScreenIndex === 0 && 'with the wallets you invited'}. The can now deposit to gain
              access to the garden.
            </InvitesText>
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
    </MembersPanelWrapper>
  );
};

const MembersPanelWrapper = styled.div`
  color: white;
`;

const InvitesStats = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const InvitesStatsTitle = styled.div`
  font-size: 16px;
  color: white;
  margin-bottom: 10px;
  text-align: center;
`;

const InvitesStatsItems = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row nowrap;
`;

const InvitesStatsBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column nowrap;
  width: 75px;

  &:first-child {
    border-right: 1px solid var(--blue-03);
  }
`;

const InvitesStatsValue = styled.div`
  font-family: cera-medium;
  font-feature-settings: 'pnum' on, 'lnum' on;
  font-size: 28px;
  color: var(--purple-02);
`;

const InvitesStatsLabel = styled.div`
  font-size: 13px;
  color: var(--blue-03);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const SectionWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const GateSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const GateVideo = styled.video``;

const InviteSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 620px;
  padding: 0 20px 0 0;
`;

const InviteRows = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20px;
  width: 100%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 10px;
  width: 100%;
  flex-flow: row nowrap;
  justify-content: flex-end;
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

const InvitesText = styled.div`
  font-size: 16px;
  width: 300px;
  text-align: center;
  color: var(--blue-04);
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

export default React.memo(MembersPanel);
