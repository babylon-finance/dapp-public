import { TurquoiseButton } from 'components/shared';
import React from 'react';
import styled from 'styled-components';
import { ReactComponent as FacePalm } from './facepalm.svg';
import { Link } from 'react-router-dom';

const NotSupported = () => {
  return (
    <NotSupportedContainer>
      <FacePalm />
      <NotSupportedTitle>Mobile Not Supported</NotSupportedTitle>
      <NotSupportedText>Sorry this page is not mobile friendly yet! It should be available soon.</NotSupportedText>
      <Link to="/">
        <TurquoiseButton onClick={() => {}}>Back to Homepage</TurquoiseButton>
      </Link>
    </NotSupportedContainer>
  );
};

const NotSupportedContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 80px 40px;
`;
const NotSupportedTitle = styled.p`
  font-size: 24px;
  margin: 24px 0 22px;
  color: white;
`;
const NotSupportedText = styled.p`
  font-size: 16px;
  text-align: center;
  color: var(--blue-04);
  margin-bottom: 40px;
`;

export default React.memo(NotSupported);
