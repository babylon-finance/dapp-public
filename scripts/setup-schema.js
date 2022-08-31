/* bootstrap database in your FaunaDB account */
const readline = require('readline');
const faunadb = require('faunadb');
const q = faunadb.query;

const GARDEN_METRICS = 'garden_metrics';
const STRATEGY_METRICS = 'strategy_metrics';
const STRATEGY_FIRST_NAV_COLLECTION = 'strategy_first_nav';

async function main() {
  console.log('Attempting to creating your FaunaDB Database schema...\n');

  // 1. Check for required enviroment variables
  if (!process.env.FAUNADB_SERVER_SECRET) {
    console.log('Required FAUNADB_SERVER_SECRET enviroment variable not found.');
    process.exit(1);
  }

  try {
    await createFaunaDB(process.env.FAUNADB_SERVER_SECRET);
  } catch (e) {
    if (e.requestResult.statusCode === 400 && e.message === 'instance already exists') {
      console.log('Your database schema already exists');
      process.exit(0);
    } else {
      console.log('Failed to create database:', e.message);
      process.exit(1);
    }
  }
}

/* idempotent operation */
async function createFaunaDB(key) {
  console.log('Creating the database!');
  const client = new faunadb.Client({
    secret: key,
  });

  // First NAV Schema
  if (!(await client.query(q.IsCollection(q.Collection(STRATEGY_FIRST_NAV_COLLECTION))))) {
    const firstNAVCol = await client.query(q.CreateCollection({ name: STRATEGY_FIRST_NAV_COLLECTION }));
    console.log('Created first nav collection', firstNAVCol);
    await client.query(
      q.CreateIndex({
        name: 'first_nav_by_strategy',
        source: q.Collection(STRATEGY_FIRST_NAV_COLLECTION),
        unique: true,
        terms: [{ field: ['data', 'address'] }],
      }),
    );
    await client.query(
      q.CreateIndex({
        name: 'first_nav_by_garden',
        source: q.Collection(STRATEGY_FIRST_NAV_COLLECTION),
        terms: [{ field: ['data', 'garden'] }],
      }),
    );
    console.log('Created first NAV indexes');
  } else {
    console.log('First NAV collection already exist.');
  }

  // Voting Schema
  if (!(await client.query(q.IsCollection(q.Collection('votes'))))) {
    const voteCollection = await client.query(q.CreateCollection({ name: 'votes' }));
    console.log('Created votes collection', voteCollection);
    const vIndex1 = await client.query(
      q.CreateIndex({
        name: 'votes_by_address',
        source: q.Collection('votes'),
        unique: true,
        terms: [{ field: ['data', 'address'] }],
      }),
    );
    const vIndex2 = await client.query(
      q.CreateIndex({
        name: 'votes_by_garden_all',
        source: q.Collection('votes'),
        unique: false,
        terms: [{ field: ['data', 'garden'] }],
      }),
    );
    console.log('Created votes index', vIndex1);
  } else {
    console.log('Votes collection already exist.');
  }

  // Garden Metrics Schema
  if (!(await client.query(q.IsCollection(q.Collection(GARDEN_METRICS))))) {
    const gardenCollection = await client.query(q.CreateCollection({ name: GARDEN_METRICS }));
    console.log('Created garden metrics collection', gardenCollection);

    const gIndex1 = await client.query(
      q.CreateIndex({
        name: 'garden_metrics_by_garden_ts',
        source: q.Collection(GARDEN_METRICS),
        unique: true,
        terms: [
          {
            field: ['data', 'garden'],
          },
        ],
        values: [
          {
            field: ['data', 'insertedAt'],
          },
          {
            field: ['ref'],
          },
        ],
      }),
    );

    const gIndex2 = await client.query(
      q.CreateIndex({
        name: 'garden_metrics_ts',
        source: q.Collection(GARDEN_METRICS),
        unique: true,
        values: [
          {
            field: ['data', 'insertedAt'],
          },
          {
            field: ['ref'],
          },
        ],
      }),
    );
    console.log('Created garden metrics indices', [gIndex1, gIndex2]);
  } else {
    console.log('Garden metrics collection already exist.');
  }

  // Strategy Metrics Schema
  if (!(await client.query(q.IsCollection(q.Collection(STRATEGY_METRICS))))) {
    const strategyCollection = await client.query(q.CreateCollection({ name: STRATEGY_METRICS }));
    console.log('Created strategy metrics collection', strategyCollection);

    const sIndex1 = await client.query(
      q.CreateIndex({
        name: 'strategy_metrics_by_garden_ts',
        source: q.Collection(STRATEGY_METRICS),
        unique: true,
        terms: [
          {
            field: ['data', 'garden'],
          },
        ],
        values: [
          {
            field: ['data', 'insertedAt'],
          },
          {
            field: ['ref'],
          },
        ],
      }),
    );

    const sIndex2 = await client.query(
      q.CreateIndex({
        name: 'strategy_metrics_by_strategy_ts',
        source: q.Collection(STRATEGY_METRICS),
        unique: true,
        terms: [
          {
            field: ['data', 'strategy'],
          },
        ],
        values: [
          {
            field: ['data', 'insertedAt'],
          },
          {
            field: ['ref'],
          },
        ],
      }),
    );
    console.log('Created strategy metrics indices', [sIndex1, sIndex2]);
  } else {
    console.log('Strategy metrics collection already exist.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
