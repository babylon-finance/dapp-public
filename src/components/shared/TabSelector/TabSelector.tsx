import React from 'react';
import styled from 'styled-components';

interface TabItem {
  name: string;
  value: string;
}

interface TabSelectorProps {
  current: string;
  tabs: TabItem[];
  changeTab: (tab: string) => void;
}

const TabSelector = ({ current, changeTab, tabs }: TabSelectorProps) => {
  return (
    <TabSelectorWrapper>
      {tabs.map((tab: TabItem) => (
        <TabItemWrapper
          key={tab.value}
          active={current === tab.value}
          onClick={() => {
            if (current !== tab.value) {
              changeTab(tab.value);
            }
          }}
        >
          {tab.name}
        </TabItemWrapper>
      ))}
    </TabSelectorWrapper>
  );
};

const TabSelectorWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const TabItemWrapper = styled.div<{ active: boolean }>`
  display: flex;
  text-align: center;
  color: white;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  border: 1px solid var(--blue-03);
  background: ${(p) => `${p.active ? 'var(--purple-04)' : 'transparent'} `};

  &:hover {
    background: var(--purple-03);
  }

  &:nth-child(odd) {
    border-right: none;
  }
`;

export default React.memo(TabSelector);
