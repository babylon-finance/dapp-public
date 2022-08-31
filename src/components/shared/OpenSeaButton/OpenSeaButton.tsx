import { Icon, TurquoiseButton } from 'components/shared';
import { IconName } from 'models';

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';

const BASE_URL = 'https://opensea.io/';

interface OpenSeaButtonProps {
  id?: number;
}

const OpenSeaButton = ({ id }: OpenSeaButtonProps) => {
  const linkPath = id ? `assets/0x26231a65ef80706307bbe71f032dc1e5bf28ce43/${id}` : 'collection/babylon-prophets';
  return (
    <Link to={{ pathname: `${BASE_URL}${linkPath}` }} target="_blank">
      <StyledButton onClick={() => {}}>
        <Icon name={IconName.opensea} /> <div>View on OpenSea</div>
      </StyledButton>
    </Link>
  );
};

const StyledButton = styled(TurquoiseButton)`
  width: 250px;
  margin: 20px 0;
  > span {
    flex-flow: row nowrap;
    display: flex;
    align-items: center;

    > div {
      margin-left: 5px;
    }
  }
`;

export default React.memo(OpenSeaButton);
