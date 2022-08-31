import EmptyTable from 'components/garden/detail/components/EmptyTable';
import { generate32BitIntegerHash } from 'helpers/Numbers';
import { BREAKPOINTS } from 'config';

import React from 'react';
import styled from 'styled-components';

interface GardenTableProps {
  headers: string[];
  children: React.ReactNode;
  emptyChildren?: React.ReactNode;
  emptyImageKey?: string;
  fillSpace?: boolean;
  emptyLabel?: string;
  className?: string;
}

const GardenTable = ({
  children,
  headers,
  emptyLabel,
  emptyImageKey,
  fillSpace = false,
  className,
}: GardenTableProps) => {
  if (!children || (children as any).length === 0) {
    return (
      <EmptyTableWrapper>
        <EmptyTable emptyImageKey={emptyImageKey}>
          <EmptyTableLabel>{emptyLabel || 'No Results'}</EmptyTableLabel>
        </EmptyTable>
      </EmptyTableWrapper>
    );
  }

  return (
    <GardenTableWrapper fillSpace={fillSpace} className={className}>
      {headers.length > 0 && (
        <GardenTableHeader fillSpace={fillSpace}>
          <GardenTableHeaderRow>
            {headers.map((header) => (
              <th key={generate32BitIntegerHash(header)}>{header}</th>
            ))}
          </GardenTableHeaderRow>
        </GardenTableHeader>
      )}
      <TBody fillSpace={fillSpace}>{children}</TBody>
    </GardenTableWrapper>
  );
};

const GardenTableWrapper = styled.table<{ fillSpace: boolean }>`
  border-color: var(--blue-01);
  border-collapse: collapse;
  border: none;
  color: var(--white);
  font-family: cera-regular;
  width: 100%;
  table-layout: ${(p) => (p.fillSpace === true ? 'fixed' : 'inherit')};
`;

const EmptyTableWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  min-height: 300px;
  height: 100%;
  width: 100%;
  background: transparent;
`;

const EmptyTableLabel = styled.div`
  text-align: center;
  display: inline;
`;

const GardenTableHeader = styled.thead<{ fillSpace: boolean }>`
  text-align: left;
  width: 100%;
  border: none;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
    height: 40px;
  }

  th:last-child {
    text-align: ${(p) => (p.fillSpace === true ? 'right' : 'left')};
  }
`;

const GardenTableHeaderRow = styled.tr`
  height: 80px;
  padding: 10px 0 6px 0;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    font-size: 14px;
    height: 40px;
  }
`;

const TBody = styled.tbody<{ fillSpace: boolean }>`
  table {
    table-layout: fixed;
  }

  & > tr {
    height: 100px;
    text-align: left;
    border-bottom: 1px solid var(--border-blue);
    border-top: 1px solid var(--border-blue);

    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      height: 70px;
    }

    & > td {
      border: none;
      padding: 10px 0;
    }

    &:nth-child(odd) {
      background-color: var(--odd-table-row);
    }

    td {
      padding: 0 5px;
    }

    td:last-child {
      min-width: 0px;
      text-align: ${(p) => (p.fillSpace === true ? 'right' : 'inherit')};
    }
  }
`;

export default React.memo(GardenTable);
