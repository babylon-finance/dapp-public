import faunadb from 'faunadb';

const q = faunadb.query;

// FaunaDb
const BABYLON_HEART_DIST_VOTES_ALL = 'babylon_heart_dist_votes_all';
const STRATEGY_VOTES_INDEX = 'votes_by_address';
const STRATEGY_COLLECTION = 'strategy_metrics_v2';
const GARDEN_COLLECTION = 'garden_metrics_v2';
const WALLET_COLLECTION = 'wallet_metrics';
const STRATEGY_FIRST_NAV_COLLECTION = 'strategy_first_nav';
const STRATEGY_FIRST_NAV_BY_STRAT = 'first_nav_by_strategy';

function getFaunaClient() {
  return new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET,
  });
}

export async function getHeartDistVoteAll() {
  if (!(await getFaunaClient().query(q.Exists(q.Match(q.Index(BABYLON_HEART_DIST_VOTES_ALL)))))) {
    return;
  }

  const match = q.Match(q.Index(BABYLON_HEART_DIST_VOTES_ALL));
  return (await getFaunaClient().query(q.Map(q.Paginate(match), q.Lambda(['ref'], q.Get(q.Var('ref')))))).data;
}

export async function getVotesForStrategy(strategy) {
  if (!(await getFaunaClient().query(q.Exists(q.Match(q.Index(STRATEGY_VOTES_INDEX), strategy))))) {
    return;
  }

  return (await getFaunaClient().query(q.Get(q.Match(q.Index(STRATEGY_VOTES_INDEX), strategy)))).data;
}

export async function getFirstNAVForStrategy(strategy) {
  if (!(await getFaunaClient().query(q.Exists(q.Match(q.Index(STRATEGY_FIRST_NAV_BY_STRAT), strategy))))) {
    return;
  }

  return (await getFaunaClient().query(q.Get(q.Match(q.Index(STRATEGY_FIRST_NAV_BY_STRAT), strategy)))).data;
}

export async function storeStrategyFirstNAV(garden, strategy, NAV) {
  if (!(await getFirstNAVForStrategy(strategy))) {
    // Create strategy document if it doesn't exist yet
    return await getFaunaClient().query(
      q.Create(q.Collection(STRATEGY_FIRST_NAV_COLLECTION), {
        data: {
          address: strategy,
          garden: garden,
          nav: NAV,
        },
      }),
    );
  }
}

export async function insertStrategyRows(rows) {
  await getFaunaClient().query(
    q.Map(rows, q.Lambda('row', q.Create(q.Collection(STRATEGY_COLLECTION), { data: q.Var('row') }))),
  );
}

export async function insertGardenRows(rows) {
  await getFaunaClient().query(
    q.Map(rows, q.Lambda('row', q.Create(q.Collection(GARDEN_COLLECTION), { data: q.Var('row') }))),
  );
}

export async function insertWalletRows(rows) {
  await getFaunaClient().query(
    q.Map(rows, q.Lambda('row', q.Create(q.Collection(WALLET_COLLECTION), { data: q.Var('row') }))),
  );
}
