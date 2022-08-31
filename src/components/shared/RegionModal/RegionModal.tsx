import { joinSignature } from '@ethersproject/bytes';
import { BaseModal, TurquoiseButton } from 'components/shared';

import { IdentityService } from 'services';
import { IS_DEV } from 'config';
import { useW3Context } from 'context/W3Provider';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

const RegionModal = () => {
  const [usModal, setUsModal] = useState<boolean>(false);
  const [confirmSignatureWaiting, setConfirmSignatureWaiting] = useState<boolean>(false);

  const { address, txProvider, userPrefs, updateUserPrefs } = useW3Context();
  const identityService = IdentityService.getInstance();

  useEffect(() => {
    const loadCountry = async () => {
      if (userPrefs && address) {
        const country = userPrefs?.countryCheck;
        if (!country || country === 'undefined') {
          const country = await identityService.getCountry();
          if (country) {
            updateUserPrefs({ ...userPrefs, countryCheck: country });
          }
        }
        if (country === 'US' && !IS_DEV) {
          const signed = userPrefs?.signedNonUsResident;
          if (!signed) {
            setUsModal(true);
          }
        }
      }
    };
    loadCountry();
  }, [userPrefs, address]);

  const signNonUS = async () => {
    if (txProvider && userPrefs) {
      const signer = txProvider.getSigner();
      setConfirmSignatureWaiting(true);
      const message = 'I confirm I am not a US resident';
      const signature = joinSignature(await signer.signMessage(message));
      updateUserPrefs({ ...userPrefs, signedNonUsResident: signature });
      setConfirmSignatureWaiting(false);
      setUsModal(false);
    }
  };

  return (
    <BaseModal
      header={'Warning: Verify you are not a US resident'}
      width={'600'}
      isOpen={usModal}
      toggleModal={() => setUsModal(!usModal)}
      hideClose
    >
      <ModalCard>
        <p>
          You may review information on the website and participate in voting with delegated tokens, but may not
          delegate votes or use any staking or reward services unless you confirm that you are not a US resident.
          <br />
          <br />
          For more information, see our <Link to="/terms">Terms of Use</Link>.
        </p>
        <TurquoiseButton onClick={() => signNonUS()} disabled={confirmSignatureWaiting}>
          {confirmSignatureWaiting ? 'Waiting for signature...' : 'I confirm that I am not a US resident'}
        </TurquoiseButton>
      </ModalCard>
    </BaseModal>
  );
};

const ModalCard = styled.div`
  background-color: var(--modal-blue);
  border: none;
  display: flex;
  flex-flow: column nowrap;
  height: auto;
  width: 460px;

  > p {
    padding-bottom: 20px;
  }
`;

export default React.memo(RegionModal);
