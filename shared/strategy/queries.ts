import {
  FaunaResponse,
  RefStateRow,
  StrategyAction,
  StrategyError,
  StrategyStateRow,
  StrategyStatus,
  mkStrategyRow,
} from './models';
import { INDICES, COLLECTIONS } from './constants';

import faunadb, { Client } from 'faunadb';

const q = faunadb.query;

/* ######################### READ QUERIES ######################### */

const getRowByStrategy = async (client: Client, strategy: string): Promise<RefStateRow | undefined> => {
  try {
    return await _executePagedQuery(client, INDICES.statesByStrategy, strategy).then((response) => {
      return response?.data[0];
    });
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

const getRowsByGarden = async (
  client: Client,
  garden: string,
  offset: number = 0,
): Promise<StrategyStateRow[] | undefined> => {
  return await _executePagedQuery(client, INDICES.statesByGarden, garden)
    .then((response) => response?.data.map((row) => row.data))
    .catch((error) => {
      console.log('Error fetching garden rows', error);
      return undefined;
    });
};

/* ######################### WRITE QUERIES ######################### */

const insertRowForStrategy = async (client: Client, row: StrategyStateRow): Promise<void> => {
  try {
    await client.query(q.Create(q.Collection(COLLECTIONS.strategyStates), { data: { ...row } }));
  } catch (error) {
    console.log(`Error inserting row for :: Strategy: ${row.strategy}, Action: ${row.action}`, error);
  }
};

const updateRowForStrategy = async (
  client: Client,
  action: StrategyAction,
  status: StrategyStatus,
  duration: number,
  executedAt: number,
  refRow: RefStateRow,
  error: StrategyError | undefined,
): Promise<StrategyStateRow> => {
  return await client.query(
    q.Update(refRow.ref, {
      data: {
        action: action,
        status: status,
        duration: duration,
        executedAt: executedAt,
        // Apparently if you want to clear a field the value must be null not undefined :\
        error: error ? error : null,
        updatedAt: Date.now(),
      },
    }),
  );
};

const insertOrUpdateRowForStrategy = async (
  strategy: string,
  garden: string,
  duration: number,
  executedAt: number,
  client: Client,
  action: StrategyAction,
  status: StrategyStatus,
  error: StrategyError | undefined,
) => {
  try {
    await getRowByStrategy(client, strategy).then(async (rowRef) => {
      if (rowRef && rowRef.ref) {
        // Fauna docs are a bit of a pain, everything in Update is a merge if the field is an Object
        // so we need to first clear the error field by setting to undefined.
        await updateRowForStrategy(client, action, status, duration, executedAt, rowRef, undefined);
        await updateRowForStrategy(client, action, status, duration, executedAt, rowRef, error);
      } else {
        await insertRowForStrategy(
          client,
          mkStrategyRow(strategy, garden, duration, executedAt, action, status, error),
        );
      }
    });
  } catch (e) {
    console.log(`Error updating/inserting result for strategy: ${strategy}`, e);
  }
};

const insertKeeperStatsRow = async (row: any, client: Client) => {
  try {
    await client.query(q.Create(q.Collection(COLLECTIONS.keeperStats), { data: { ...row } }));
  } catch (error) {
    console.log('Failed to insert keeper stats, skipping...', error);
  }
};

/* ######################### HELPERS ######################### */

const _executePagedQuery = async (
  client: Client,
  index: string,
  key: string,
  size: number = 100,
  offset: number = 0,
): Promise<FaunaResponse | undefined> => {
  const match = q.Match(q.Index(index), key);

  if (!(await client.query(q.Exists(match)))) {
    return;
  }

  return await client.query(
    q.Map(
      q.Paginate(match, {
        size: 100,
      }),
      q.Lambda(['ref'], q.Get(q.Var('ref'))),
    ),
  );
};

export {
  getRowByStrategy,
  getRowsByGarden,
  insertKeeperStatsRow,
  insertOrUpdateRowForStrategy,
  insertRowForStrategy,
  updateRowForStrategy,
};
