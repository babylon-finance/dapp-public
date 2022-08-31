import { GardenTable, NoAccess, TabbedNavigation } from 'components/shared';
import { StrategyAdmin } from '../Strategies';

import { ADMIN_TABS } from 'components/garden/detail/tabs';
import { useW3Context } from 'context/W3Provider';

import styled from 'styled-components';
import React, { useState } from 'react';
import { Tab } from 'models';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<any>(Tab.STRATEGIES);

  const { admin } = useW3Context();

  return (
    <ContainerFull>
      {!admin && <NoAccess noAdmin />}
      {admin && (
        <>
          <BorderWrapper>
            <ContainerLarge>
              <HeaderSection>
                <HeaderTitle>Admin</HeaderTitle>
              </HeaderSection>
              <TabbedNavigation
                altStyle
                border={false}
                tabs={Object.entries(ADMIN_TABS).map((entry) => entry[1])}
                setActiveTab={setActiveTab}
              />
            </ContainerLarge>
          </BorderWrapper>
          <ContainerLarge>
            {activeTab === Tab.STRATEGIES && <StrategyAdmin />}
            {activeTab === Tab.GARDENS && <GardenTable headers={[]} children={[]} />}
          </ContainerLarge>
        </>
      )}
    </ContainerFull>
  );
};

const ContentWrapper = styled.div`
  width: 100%;
`;

const BorderWrapper = styled(ContentWrapper)`
  border-bottom: 1px solid var(--border-blue);
  background-color: var(--blue-alt);
`;

const ContainerFull = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  width: 100%;
  min-height: 85vh;
`;

const ContainerLarge = styled.div`
  position: relative;
  padding: 10px 30px 0;
  position: relative;
  max-width: var(--screen-lg-min);
  width: 100%;
  margin: 0 auto;

  @media only screen and (max-width: 1440px) {
    padding: 10px 100px;
  }

  @media only screen and (max-width: 992px) {
    padding: 10px 50px;
  }

  @media only screen and (max-width: 598px) {
    padding: 10px 20px;
  }
`;

const HeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding-bottom: 12px;
`;

const HeaderTitle = styled.div`
  font-size: 32px;
  line-height: 40px;
  margin-bottom: 10px;
  font-weight: bold;
`;

export default React.memo(AdminPage);
