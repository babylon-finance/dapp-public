import { ReactComponent as GardenImage1 } from '../svg/garden1.svg';
import { ReactComponent as GardenImage2 } from '../svg/garden2.svg';
import { ReactComponent as GardenImage3 } from '../svg/garden3.svg';
import { GardenTable, Icon, Member, HoverTooltip } from 'components/shared';

import { formatNumberFiatDisplay, ordinalOf } from 'helpers/Numbers';
import { GardenLeader, QuoteResult, Token, BablToReserves, IconName, AprResult } from 'models';
import { TokenListService, LeaderboardService } from 'services';
import { useW3Context } from 'context/W3Provider';

import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import React from 'react';
import ReturnTooltip from 'components/garden/detail/components/ReturnTooltip';

const HEADERS = ['Rank', '', 'Garden', 'Reserve', 'Inception', 'Members', 'NAV', 'vAPR', 'Net Returns'];
const DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

const gardenImageMap = {
  1: <GardenImage1 />,
  2: <GardenImage2 />,
  3: <GardenImage3 />,
};

interface TokenTDProps {
  reserve: Token;
}

const TokenTD = ({ reserve }: TokenTDProps) => {
  return (
    <td>
      <TokenIcon alt={'reserve-icon'} src={reserve.logoURI} />
    </td>
  );
};

interface ReturnsTDProps {
  value: number;
  currency: string;
}

const ReturnsTD = ({ value, currency }: ReturnsTDProps) => {
  return <NetTD>{formatNumberFiatDisplay(value, currency, 2, true)}</NetTD>;
};

interface RowProps {
  row: GardenLeader;
  wealthFiat: number;
  navFiat: number;
  principalFiat: number;
  bablFiat: number;
  reserve: Token;
}

const buildRows = (
  rawRows: GardenLeader[],
  currency: string,
  tokenListService: TokenListService,
  leaderboardService: LeaderboardService,
  bablToReserves: BablToReserves,
  quotes: QuoteResult,
  onClick: (garden: string) => void,
) => {
  const offset = 3;
  const result = rawRows
    .map((row: GardenLeader) => {
      const reserve = tokenListService.getTokenByAddress(row.reserveAsset) as Token;
      const metrics = leaderboardService.mkMetricsForGarden(row, bablToReserves, currency, quotes, reserve);
      return { ...metrics, row };
    })
    // Leaving this merge of row and metrics here in case we want to add a sort in the near term
    .map((props: RowProps, index) => {
      // @ts-ignore
      const inception = new Date(props.row.createdAt).toLocaleDateString(undefined, DATE_OPTIONS);
      const vapr = props.row.returnRates?.annual?.aggregate;
      const verified = props.row.verified ? props.row.verified > 0 : false;
      return (
        <LinkTR key={index} onClick={() => onClick(props.row.garden)}>
          <td>{offset + index + 1}</td>
          <VerifiedTD>
            {verified && (
              <HoverTooltip
                size={24}
                icon={IconName.check}
                color={'var(--white)'}
                content={'This Garden has been verified by the Babylon community.'}
                placement={'up'}
              />
            )}
          </VerifiedTD>
          <td>
            {
              <Member
                avatarUrl={verified ? `gardens/${props.row.garden.toLowerCase()}/thumb.png` : undefined}
                address={props.row.garden}
                showText
                link={false}
                displayName={props.row.name}
                noTruncate
              />
            }
          </td>
          <TokenTD reserve={props.reserve} />
          <td>{inception}</td>
          <td>{props.row.contributors}</td>
          <td>
            <b>{formatNumberFiatDisplay(props.navFiat, currency, 2, true)}</b>
          </td>
          <td>
            <NetValue>{vapr ? `${parseFloat(vapr.toFixed(2))}%` : '--'}</NetValue>
          </td>
          <ReturnsTD value={props.wealthFiat} currency={currency} />
        </LinkTR>
      );
    });

  return result;
};

interface HeroCardProps {
  gardenRow: GardenLeader;
  bablToReserves: BablToReserves;
  tokenListService: TokenListService;
  leaderboardService: LeaderboardService;
  currency: string;
  quotes: QuoteResult;
  rank: number;
}

const HeroCard = ({
  gardenRow,
  tokenListService,
  leaderboardService,
  currency,
  rank,
  bablToReserves,
  quotes,
}: HeroCardProps) => {
  const history = useHistory();
  const token = tokenListService.getTokenByAddress(gardenRow.reserveAsset) as Token;
  const { wealthFiat, navFiat } = leaderboardService.mkMetricsForGarden(
    gardenRow,
    bablToReserves,
    currency,
    quotes,
    token,
  );
  // @ts-ignore
  const inception = new Date(gardenRow.createdAt).toLocaleDateString(undefined, DATE_OPTIONS);
  const isHeart = gardenRow.garden.toLowerCase() === '0xaA2D49A1d66A58B8DD0687E730FefC2823649791'.toLowerCase();
  const verifiedIcon =
    gardenRow.verified && gardenRow.verified > 0 ? (
      <img
        src={`/gardens/${gardenRow.garden.toLowerCase()}/thumb.png`}
        alt={'garden-thumbnail'}
        width={'100%'}
        height={'100%'}
      />
    ) : undefined;

  return (
    <MetricBox
      key={rank}
      private={gardenRow.private}
      onClick={() => (gardenRow.private ? null : history.push(isHeart ? '/heart' : `/garden/${gardenRow.garden}`))}
    >
      <MetricTitle>{ordinalOf(rank)}</MetricTitle>
      <GardenImageWrapper>{verifiedIcon || gardenImageMap[rank]}</GardenImageWrapper>
      <MetricValueName>{gardenRow.name}</MetricValueName>
      <HeroValue>
        {verifiedIcon && (
          <HoverTooltip
            size={24}
            icon={IconName.check}
            color={'var(--white)'}
            content={'This Garden has been verified by the Babylon community.'}
            placement={'up'}
          />
        )}
        <TokenIcon alt={'reserve-icon'} src={token.logoURI} />
      </HeroValue>
      <HeroValue>
        <HoverTooltip
          textOverride="vAPR:"
          content={<ReturnTooltip result={gardenRow.returnRates?.annual as AprResult} />}
          placement="up"
          size={16}
        />
        <NetValue positive={true}>{`${parseFloat(
          (gardenRow.returnRates?.annual.aggregate || 0).toFixed(2),
        )}%`}</NetValue>
      </HeroValue>
      <HeroValue>
        <HoverTooltip
          textOverride={'Net Returns:'}
          content={'Net Returns includes Strategy return on investment and accrued BABL rewards.'}
          placement={'up'}
        />{' '}
        <NetValue>{formatNumberFiatDisplay(wealthFiat, currency, 2, true)}</NetValue>
      </HeroValue>
      <HeroValue>Net Asset Value: {formatNumberFiatDisplay(navFiat, currency, 2, true)}</HeroValue>
      <HeroValue>Inception: {inception}</HeroValue>
      <HeroValue>
        <MembersIcon name={IconName.member} /> {gardenRow.contributors}
      </HeroValue>
    </MetricBox>
  );
};

interface HeroCardsProps {
  gardens: GardenLeader[];
  currency: string;
  quotes: QuoteResult;
  bablToReserves: BablToReserves;
  tokenListService: TokenListService;
  leaderboardService: LeaderboardService;
}

const HeroCards = ({
  gardens,
  currency,
  tokenListService,
  leaderboardService,
  quotes,
  bablToReserves,
}: HeroCardsProps) => {
  return (
    <HeroMetricRow>
      {gardens.map((garden, index) => {
        return (
          <HeroCard
            key={garden.garden}
            gardenRow={garden}
            tokenListService={tokenListService}
            leaderboardService={leaderboardService}
            bablToReserves={bablToReserves}
            currency={currency}
            rank={index + 1}
            quotes={quotes}
          />
        );
      })}
    </HeroMetricRow>
  );
};

interface GardenLeadersProps {
  data: GardenLeader[];
  bablToReserves: BablToReserves;
  currency: string;
}

const GardenLeaders = ({ data, currency, bablToReserves }: GardenLeadersProps) => {
  const { quotes } = useW3Context();
  const leaderboardService = LeaderboardService.getInstance();
  const tokenListService = TokenListService.getInstance();

  const history = useHistory();
  const handleClick = (garden: string) => {
    history.push(`/garden/${garden}`);
  };

  return (
    <MainContainer>
      {quotes && (
        <LeadersWrapper>
          <HeroCards
            currency={currency}
            gardens={data.slice(0, 3)}
            leaderboardService={leaderboardService}
            tokenListService={tokenListService}
            bablToReserves={bablToReserves}
            quotes={quotes}
          />
          <TableWrapper>
            <GardenTable
              headers={HEADERS}
              children={buildRows(
                data.slice(3),
                currency,
                tokenListService,
                leaderboardService,
                bablToReserves,
                quotes,
                handleClick,
              )}
            />
            {/* <CriteriaText>
              <span>Only displaying Gardens that meet the Leaderboard criteria</span>
              <HoverTooltip
                color={'var(--blue-03)'}
                content="Public, 5 or more members, $10,000 or more in net asset value, and positive vAPR (requires 90 days of performance data)"
                placement="up"
                size={16}
              />
            </CriteriaText> */}
          </TableWrapper>
        </LeadersWrapper>
      )}
    </MainContainer>
  );
};

const VerifiedTD = styled.td`
  width: 75px !important;
`;

const LinkTR = styled.tr`
  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;

const CriteriaText = styled.div`
  color: var(--blue-03);
  padding: 40px 0 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
`;

const NetValue = styled.span<{ positive?: boolean }>`
  padding-left: 6px;
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;
  color: ${(p) => (p.positive !== undefined ? (p.positive === true ? 'var(--positive)' : 'var(--negative)') : '')};
`;

const NetTD = styled.td`
  font-family: cera-bold;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const LeadersWrapper = styled.div`
  animation: fadeInAnimation ease 0.5s;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;

  @keyframes fadeInAnimation {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const GardenImageWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  width: 100%;

  svg,
  img {
    height: 85px;
    width: 85px;
  }
`;

const MembersIcon = styled(Icon)`
  margin-right: 15px;
`;

const TokenIcon = styled.img`
  height: 20px;
  width: 20px;
`;

const TableWrapper = styled.div`
  padding: 30px;
  background-color: var(--blue-alt);
`;

const MainContainer = styled.div`
  width: 100%;
`;

const HeroMetricRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const MetricBox = styled.div<{ private?: boolean }>`
  background-color: var(--blue-alt);
  display: flex;
  flex-flow: column nowrap;
  margin-right: 30px;
  padding: 30px;
  width: 33%;
  pointer-events: ${(p) => (p.private ? 'none' : 'auto')};

  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }

  &:last-child {
    margin-right: 0;
  }
`;

const MetricTitle = styled.span`
  width: 100%;
  text-align: center;
  font-family: cera-medium;
  font-size: 24px;
  padding-bottom: 12px;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const MetricValue = styled.span`
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-feature-settings: 'pnum' on, 'lnum' on;
`;

const MetricValueName = styled.span`
  color: var(--yellow);
  font-size: 22px;
  font-family: cera-medium;
  text-align: center;
  padding: 10px 0;
`;

const HeroValue = styled(MetricValue)`
  padding-bottom: 4px;
  font-size: 16px;
  font-family: cera-medium;
`;

export default GardenLeaders;
