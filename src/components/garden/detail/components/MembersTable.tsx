import { Member, GardenTable, BaseLoader, HoverTooltip, Icon } from 'components/shared';
import { GardenTokenIcon } from 'components/shared/Icons';

import { Contributor, FullGardenDetails, IdentityResponse, IconName, Token } from 'models';
import { useW3Context } from 'context/W3Provider';
import { IdentityService, TokenListService } from 'services';
import { formatReserveDisplay, formatTokenDisplay } from 'helpers/Numbers';
import { firstUpper } from 'helpers/Strings';
import { isGardenCreator } from 'helpers/Addresses';
import { wrapAwait } from 'utils/AwaitWrapper';

import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';

interface MembersTableProps {
  gardenDetails: FullGardenDetails;
  contributors: Contributor[];
}

const MEMBERS_PER_PAGE = 100;

const HEADERS = [
  '#',
  'Member',
  'Tokens',
  '% Ownership',
  'Principal',
  'Strategies',
  'Active Stake',
  'Profit Split',
  'BABL Rewards',
  'Permissions',
];

interface GardenTablePagerProps {
  page: number;
  pages: number;
  onChange(curPage: number): void;
}

const GardenTablePager = ({ page, pages, onChange }: GardenTablePagerProps) => {
  const buildPages = (pages: number) => {
    const pageKeys = [...Array(pages).fill(undefined)].map((val, index) => index + 1);

    return pageKeys.map((key) => {
      return (
        <PageItem key={key} active={key === page} onClick={() => onChange(key)}>
          {key}
        </PageItem>
      );
    });
  };

  return pages > 1 ? <PagesRow>{buildPages(pages)}</PagesRow> : null;
};

const MembersTable = ({ gardenDetails, contributors }: MembersTableProps) => {
  const [identities, setIdentities] = useState<IdentityResponse | undefined>(undefined);
  // Note: Use 1 indexed so we can display human readable
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const { address } = useW3Context();
  const identityService = IdentityService.getInstance();
  const tokenListService = TokenListService.getInstance();
  const pagedContributors = contributors.slice((page - 1) * MEMBERS_PER_PAGE, MEMBERS_PER_PAGE * page);

  const fetchData = async () => {
    if (gardenDetails) {
      const identities = await wrapAwait(
        identityService.getIdentities(pagedContributors.map((c: Contributor) => c.address)),
        undefined,
        'Error fetching identities',
      );
      setIdentities(identities);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const setTablePage = (curPage: number) => {
    setPage(curPage);
  };

  const getPermissionIcons = (contributor: Contributor) => {
    const { permissions } = contributor;
    const matchedPermissions = permissions
      ? Object.keys(permissions)
          .map((key) => {
            return permissions[key] === true ? key : undefined;
          })
          .filter((r) => r !== 'member')
          .filter((r) => r !== undefined)
          .reverse()
      : [];

    return matchedPermissions.map((permission) => {
      return (
        <IconWrapper key={`${contributor.address}-${permission}`}>
          <HoverTooltip
            icon={IconName[permission || IconName.question]}
            size={24}
            placement={'up'}
            color={undefined}
            content={permission ? firstUpper(permission) : ''}
          />
        </IconWrapper>
      );
    });
  };

  const buildRows = () => {
    const colors = ['#4420d8', '#ffbe44', '#0f0a45', '#ff2972', '#7ac936'];
    return pagedContributors.map((contributor: Contributor, index: number) => {
      if (!contributor) {
        return null;
      }

      const maybeIdentity = identities?.usersByAddress[contributor.address.toLowerCase()];
      const displayName = maybeIdentity?.displayName;
      const avatarUrl = maybeIdentity?.avatarUrl;
      const you = address?.toLowerCase() === contributor.address.toLowerCase();

      const isCreator = isGardenCreator(contributor.address, gardenDetails.creator);
      const claimableBABL = (contributor.rewards?.totalBabl || BigNumber.from(0)).add(
        contributor.pendingRewards?.totalBabl || BigNumber.from(0),
      );
      const claimedBABL = contributor.claimedBABL;

      return (
        <StyledRow key={contributor.address} you={you}>
          <td>{(page - 1) * MEMBERS_PER_PAGE + index + 1}</td>
          <IdentityTd>
            <Member
              color={colors[index % colors.length]}
              bgcolor={!you ? '#160e6b' : '#231D65'}
              address={contributor.address}
              you={you}
              creator={isCreator}
              displayName={displayName}
              avatarUrl={avatarUrl}
              link
              showText
            />
          </IdentityTd>
          <td>
            <GardenIconWrapper>
              <TokenWrapper>
                <StyledToken size={24} />
              </TokenWrapper>
              {formatTokenDisplay(contributor.tokens, undefined, true)}
            </GardenIconWrapper>
          </td>
          <td>{contributor.percentOwnershipDisplay}%</td>
          <td>
            {formatReserveDisplay(
              contributor.totalCurrentDeposits,
              tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token,
              2,
              true,
            )}
          </td>
          <td>{contributor.createdStrategies}</td>
          <td>
            {contributor.lockedBalance.gt(BigNumber.from(0)) ? (
              <GardenIconWrapper>
                <TokenWrapper>
                  <GardenTokenIcon size={24} />
                </TokenWrapper>
                {formatTokenDisplay(contributor.lockedBalance, undefined, true)}
              </GardenIconWrapper>
            ) : (
              '--'
            )}
          </td>
          <td>
            {contributor.rewards?.totalProfits.gt(BigNumber.from(0))
              ? formatReserveDisplay(
                  contributor.claimedProfits.add(contributor.rewards?.totalProfits || BigNumber.from(0)),
                  tokenListService.getTokenByAddress(gardenDetails.reserveAsset) as Token,
                  2,
                  true,
                )
              : '--'}
          </td>
          <td>
            {claimedBABL.gt(BigNumber.from(0)) || claimableBABL.gt(BigNumber.from(0)) ? (
              <GardenIconWrapper>
                <TokenWrapper>
                  <Icon name={IconName.babToken} size={24} />
                </TokenWrapper>
                {formatTokenDisplay(claimedBABL.add(claimableBABL), undefined, true)}
              </GardenIconWrapper>
            ) : (
              '--'
            )}
          </td>
          <PermsTd>{contributor.permissions ? getPermissionIcons(contributor) : ''}</PermsTd>
        </StyledRow>
      );
    });
  };

  return (
    <TableWrapper>
      {contributors && !loading && (
        <>
          <GardenTable
            key={'completed-strategy-table'}
            emptyLabel={'No members'}
            emptyImageKey={'members'}
            headers={HEADERS}
          >
            {buildRows()}
          </GardenTable>
          <GardenTablePager
            page={page}
            pages={contributors.length > MEMBERS_PER_PAGE ? Math.ceil(contributors.length / MEMBERS_PER_PAGE) : 1}
            onChange={setTablePage}
          />
        </>
      )}
      {loading && (
        <LoaderWrapper>
          <BaseLoader size={60} />
        </LoaderWrapper>
      )}
    </TableWrapper>
  );
};

const StyledToken = styled(GardenTokenIcon)``;

const TokenWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  margin-right: 4px;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const PagesRow = styled.div`
  padding: 40px 0;
  height: 40px;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
`;

const PageItem = styled.div<{ active?: boolean }>`
  padding: 4px 12px;
  font-size: 18px;
  pointer-events: ${(p) => (p.active ? 'none' : 'inherit')};
  color: ${(p) => (p.active ? 'var(--purple-aux)' : 'var(--white)')};
  font-family: ${(p) => (p.active ? 'cera-bold' : 'cera-medium')};
  font-feature-settings: 'pnum' on, 'lnum' on;

  &:hover {
    ${(p) => (!p.active ? 'opacity: 0.8; cursor: pointer;' : '')}
  }
`;

const PermsTd = styled.td`
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  padding: 36px 10px 0 10px;
  height: 100%;
`;

const IdentityTd = styled.td``;

const TableWrapper = styled.div`
  padding-top: 20px;
  min-height: 400px;
`;

const GardenIconWrapper = styled.div`
  display: flex;

  img {
    margin-left: 3px;
  }
`;

const StyledRow = styled.tr<{ you: boolean }>`
  & > td:first-child {
    padding-left: 10px;
  }
  ${(p) => (p.you ? 'background: #231D65 !important;' : '')}
`;

export default React.memo(MembersTable);
