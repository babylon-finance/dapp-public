import { GardenTable, GlobalLoader, HoverTooltip, Member } from 'components/shared';

import { ViewerService } from 'services';
import { StrategyStateRow } from 'shared/strategy/models';

import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

const STRAT_HEADERS = ['Strategy', 'Garden', 'Action', 'Status', 'Error', 'Updated'];

interface PrettyPrintProps {
  object: any;
}

const PrettyPrint = ({ object }: PrettyPrintProps) => {
  return (
    <PrettyP>
      <pre>{JSON.stringify(object, null, 2)}</pre>
    </PrettyP>
  );
};

interface StrategyAdminProps {
  className?: string;
}

const StrategyAdmin = ({ className }: StrategyAdminProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<StrategyStateRow[]>([]);

  const viewerService = ViewerService.getInstance();

  const fetchData = async () => {
    setData(await viewerService.getStrategyStatusAll());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildRows = (data: StrategyStateRow[]) => {
    return data
      .sort((a, b) => a.status.localeCompare(b.status))
      .map((row, index) => {
        return (
          <tr key={row.strategy}>
            <td>
              <Member displayName={row.strategy} noTruncate address={row.strategy} link showText />
            </td>
            <td>
              <Member displayName={row.garden} noTruncate address={row.garden} link showText />
            </td>
            <td>{row.action}</td>
            <td>{row.status}</td>
            <td>
              {row.error?.code ? (
                <HoverTooltip
                  styleOverride={{ width: '100%' }}
                  contentClassName={'admin-tooltip'}
                  outDelay={200}
                  placement="up"
                  textOverride={row.error?.code}
                  content={<PrettyPrint object={row.error.data || { data: 'None' }} />}
                />
              ) : (
                '--'
              )}
            </td>
            <td>{`${((+Date.now() - row.updatedAt) / 1000 / 3600).toFixed(1)} hours ago`}</td>
          </tr>
        );
      });
  };

  return (
    <MainWrapper className={className}>
      {loading && <GlobalLoader />}
      {!loading && (
        <>
          <TableWrapper>
            <TableName>Proposals</TableName>
            <GardenTable
              headers={STRAT_HEADERS}
              children={buildRows(data.filter((row) => row.status !== 'executed' && row.status !== 'finalized'))}
            />
          </TableWrapper>
          <TableWrapper>
            <TableName>Finalizing</TableName>
            <GardenTable
              headers={STRAT_HEADERS}
              children={buildRows(data.filter((row) => row.action === 'finalize' && row.status !== 'finalized'))}
            />
          </TableWrapper>
        </>
      )}
    </MainWrapper>
  );
};

const PrettyP = styled.div`
  padding: 30px;
`;

const TableName = styled.span`
  padding-bottom: 20px;
  width: 100%;
  text-laign: left;
  font-size: 32px;
  font-family: cera-bold;
`;

const TableWrapper = styled.div`
  padding-top: 50px;
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
`;

const MainWrapper = styled.div`
  width: 100%;
  padding-bottom: 80px;
`;

export default React.memo(StrategyAdmin);
