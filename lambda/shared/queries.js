const { MINTED_RECORD, BASE_BLOXY_URL, BLOXY_HOLDERS_ROUTE } = require('./constants.js');

const faunadb = require('faunadb');
const q = faunadb.query;
const axios = require('axios');

//INDEXES
const LEADERBOARD_METRICS_DESC_INDEX = 'leaderboard_metrics_ts_desc_v1';
const GARDEN_METRICS_BY_GARDEN_DESC_INDEX = 'garden_metrics_by_garden_ts_desc_v1';
const WALLET_METRICS_BY_WALLET_DESC_INDEX = 'wallet_metrics_by_wallet_desc_v1';
const WALLET_METRICS_BY_GARDEN_DESC_INDEX = 'wallet_metrics_by_garden_desc';
const STRATEGY_METRICS_BY_GARDEN_DESC_INDEX = 'strategy_metrics_by_garden_ts_desc_v1';
const GARDEN_VOTES_ALL_INDEX = 'votes_by_garden_all';
const STRATEGY_VOTES_INDEX = 'votes_by_address';
const TRANSPORT_STATUS_INDEX = 'transport_status_by_id';
const FIRST_NAV_BY_GARDEN_INDEX = 'first_nav_by_garden';
const GARDEN_MEMBERS_BY_GARDEN_INDEX = 'garden_members_by_garden';
const PROPHET_CODE_BY_USER_INDEX = 'prophet_code_by_user';
const PROPHET_FORM_BY_CODE_INDEX = 'prophet_form_by_code';
const PROPHET_FORM_BY_EMAIL_INDEX = 'prophet_form_by_email';
const PROPHET_FORM_BY_TWITTER_INDEX = 'prophet_form_by_twitter';
const PROPHET_FORM_BY_WALLET_INDEX = 'prophet_form_by_wallet';
const PROPHET_BIDS_BY_WALLET_INDEX = 'prophet_bids_by_wallet';
const PROPHET_BIDS_ALL_INDEX = 'prophet_bids_all';
const PROPHET_MINTS_LATEST_INDEX = 'prophet_mints_latest';
const STATES_ALL_INDEX = 'strategy_states_all_v2';
const STATES_BY_STRATEGY_INDEX = 'strategy_states_by_strategy_v2';
const STATES_BY_GARDEN_INDEX = 'strategy_states_by_garden_v2';
const PROTOCOL_METRICS_ALL_DESC_INDEX = 'protocol_metrics_all_desc_v1';
const BABYLON_GOVERNANCE_VOTES_USER_INDEX = 'babylon_governance_votes_user';
const BABYLON_GOVERNANCE_VOTES_PROPOSAL_INDEX = 'babylon_governance_votes_by_proposal';
const BABYLON_GOVERNANCE_VOTES_BY_PAIR_INDEX = 'babylon_governance_votes_by_pair';
const BABYLON_HEART_DIST_VOTES_BY_USER_INDEX = 'babylon_heart_dist_votes_by_user';
const BABYLON_HEART_DIST_VOTES_BY_GARDEN_INDEX = 'babylon_heart_dist_votes_by_garden';

// COLLECTIONS
const VOTES_COLLECTION = 'votes';
const LEADERBOARD_COLLECTION = 'leaderboard_metrics';
const GARDEN_TRANSPORT_COLLECTION = 'garden_transport';
const GARDEN_MEMBERS_COLLECTION = 'garden_members';
const PROTOCOL_METRICS_COLLECTION = 'protocol_metrics_cache';
const PROPHET_CODES_COLLECTION = 'prophet_codes';
const PROPHET_FORMS_COLLECTION = 'prophet_forms';
const PROPHET_BIDS_COLLECTION = 'prophet_bids';
const PROPHET_MINTS_COLLECTION = 'prophet_mints';
const BABYLON_GOVERNANCE_VOTES_COLLECTION = 'babylon_governance_votes';
const BABYLON_HEART_DIST_VOTES_COLLECTION = 'babylon_heart_dist_votes';

// For now consider that 6 * 30 ~ 180 rows per 30 days
// We will make this dynamic when users can set larger
// lookback windows in the UI.
const METRICS_PAGE_SIZE = 750;

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

module.exports = {
  insertHeartDistVote: async function (signature, amount, address, garden, insertedAt) {
    return await client.query(
      q.Create(q.Collection(BABYLON_HEART_DIST_VOTES_COLLECTION), {
        data: {
          garden,
          address,
          amount,
          signature,
          insertedAt,
          updatedAt: insertedAt,
        },
      }),
    );
  },
  updateHeartDistVoteForUser: async function (refStr, garden, amount, address, signature) {
    return await client.query(
      q.Update(refStr.ref, {
        data: {
          garden,
          address,
          amount,
          signature,
          updatedAt: Date.now(),
        },
      }),
    );
  },
  getHeartDistVoteByUser: async function (address) {
    const match = q.Match(q.Index(BABYLON_HEART_DIST_VOTES_BY_USER_INDEX), address);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    const result = await client.query(
      q.Map(
        q.Paginate(match, {
          size: 1,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );

    return result;
  },
  getHeartDistVoteByGarden: async function (garden) {
    const match = q.Match(q.Index(BABYLON_HEART_DIST_VOTES_BY_GARDEN_INDEX), garden);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(
      q.Map(
        q.Paginate(match, {
          size: 100000,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  insertGovernanceVote: async function (signature, amount, isApprove, address, proposal, insertedAt) {
    return await client.query(
      q.Create(q.Collection(BABYLON_GOVERNANCE_VOTES_COLLECTION), {
        data: {
          address: address.toLowerCase(),
          proposal,
          amount,
          isApprove,
          signature,
          insertedAt,
        },
      }),
    );
  },
  getGovernanceVoteByPair: async function (proposal, address) {
    const match = q.Match(q.Index(BABYLON_GOVERNANCE_VOTES_BY_PAIR_INDEX), [proposal, address]);
    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  getGovernanceVotesByProposal: async function (proposal) {
    const match = q.Match(q.Index(BABYLON_GOVERNANCE_VOTES_PROPOSAL_INDEX), proposal);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(
      q.Map(
        q.Paginate(match, {
          size: 10000,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  getAllStrategyStatuses: async function () {
    try {
      const match = q.Match(q.Index(STATES_ALL_INDEX));
      return client.query(
        q.Map(
          q.Paginate(match, {
            size: 100000,
          }),
          q.Lambda(['ref'], q.Get(q.Var('ref'))),
        ),
      );
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },
  getStatusByStrategy: async function (strategy) {
    const match = q.Match(q.Index(STATES_BY_STRATEGY_INDEX), strategy);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  insertProphetBid: async function (wallet, myBid, nonce, signature, ts) {
    return await client.query(
      q.Create(q.Collection(PROPHET_BIDS_COLLECTION), {
        data: {
          wallet: wallet.toLowerCase(),
          nonce: nonce,
          amount: myBid,
          signature: signature,
          insertedAt: ts,
        },
      }),
    );
  },
  getLatestProtocolMetrics: async function () {
    return (
      await client.query(
        q.Map(
          q.Paginate(q.Match(q.Index(PROTOCOL_METRICS_ALL_DESC_INDEX)), {
            size: 1,
          }),
          q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
        ),
      )
    ).data[0];
  },
  insertProtocolMetrics: async function (metrics, ts) {
    return await client.query(
      q.Create(q.Collection(PROTOCOL_METRICS_COLLECTION), {
        data: {
          ...metrics,
          insertedAt: ts,
        },
      }),
    );
  },
  updateMinted: async function (refStr, prophetId, ts) {
    await client.query(
      q.Update(refStr.ref, {
        data: {
          id: prophetId,
          updatedAt: ts,
        },
      }),
    );
  },
  getMinted: async function () {
    const match = q.Match(q.Index(PROPHET_MINTS_LATEST_INDEX));

    if (!(await client.query(q.exists(match)))) {
      return;
    }
    return await client
      .query(q.Get(q.Ref(q.Collection(PROPHET_MINTS_COLLECTION), MINTED_RECORD)))
      .then((ret) => ret)
      .catch((err) => {
        console.error('Error: Failed to fetch latest mint', err);
        return;
      });
  },
  getProphetBidsForWallet: async function (wallet) {
    const match = q.Match(q.Index(PROPHET_BIDS_BY_WALLET_INDEX), wallet);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return await client.query(
      q.Map(
        q.Paginate(match, {
          size: 1000,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  getProphetBids: async function () {
    const match = q.Match(q.Index(PROPHET_BIDS_ALL_INDEX));

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return await client.query(
      q.Map(
        q.Paginate(match, {
          size: 100000,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  getFormSubmissionByCode: async function (code) {
    const match = q.Match(q.Index(PROPHET_FORM_BY_CODE_INDEX), code);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  getFormSubmissionByEmail: async function (email) {
    const match = q.Match(q.Index(PROPHET_FORM_BY_EMAIL_INDEX), email);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  getFormSubmissionByTwitter: async function (twitter) {
    const match = q.Match(q.Index(PROPHET_FORM_BY_TWITTER_INDEX), twitter);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  getFormSubmissionByWallet: async function (wallet) {
    const match = q.Match(q.Index(PROPHET_FORM_BY_WALLET_INDEX), wallet);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  insertProphetFormSubmission: async function (twitter, wallet, email, ts) {
    return await client.query(
      q.Create(q.Collection(PROPHET_FORMS_COLLECTION), {
        data: {
          code: undefined,
          user_id: undefined,
          twitter: twitter === '' ? undefined : twitter,
          wallet: wallet,
          email: email === '' ? undefined : email,
          insertedAt: ts,
        },
      }),
    );
  },
  getProphetCodeForUser: async function (user, ts) {
    const match = q.Match(q.Index(PROPHET_CODE_BY_USER_INDEX), user);

    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return client.query(q.Get(match));
  },
  insertProphetCodeForUser: async function (user, code, ts) {
    return await client.query(
      q.Create(q.Collection(PROPHET_CODES_COLLECTION), {
        data: {
          user_id: user,
          code: code,
          burnedAt: 0,
          insertedAt: ts,
        },
      }),
    );
  },
  burnProphetCode: async function (refStr, ts) {
    await client.query(
      q.Update(refStr.ref, {
        data: {
          burnedAt: ts,
        },
      }),
    );
  },
  getStatusForTransport: async function (transportId) {
    // We only set the rows here to true, if no row found then it is false
    return await client.query(q.Exists(q.Match(q.Index(TRANSPORT_STATUS_INDEX), transportId)));
  },
  setStatusForTransport: async function (transportId) {
    return await client.query(
      q.Create(q.Collection(GARDEN_TRANSPORT_COLLECTION), {
        data: {
          transport_id: transportId,
          connected: true,
        },
      }),
    );
  },
  deleteStatusForTransport: async function (transportId) {
    if (!(await client.query(q.Exists(q.Match(q.Index(TRANSPORT_STATUS_INDEX), transportId))))) {
      return false;
    }

    const ref = await client.query(q.Get(q.Match(q.Index(TRANSPORT_STATUS_INDEX), transportId)));

    return await client.query(q.Delete(ref));
  },
  getVotesForGarden: async function (garden) {
    const match = q.Match(q.Index(GARDEN_VOTES_ALL_INDEX), garden);
    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return await client.query(q.Get(match));
  },
  getVotesForStrategy: async function (strategy) {
    const match = q.Match(q.Index(STRATEGY_VOTES_INDEX), strategy);
    if (!(await client.query(q.Exists(match)))) {
      return;
    }

    return await client.query(q.Get(match));
  },
  getFirstNAVForGardenStrategies: async function (garden) {
    const match = q.Match(q.Index(FIRST_NAV_BY_GARDEN_INDEX), garden);
    if (!(await client.query(q.Exists(match)))) {
      return;
    }
    return await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index(FIRST_NAV_BY_GARDEN_INDEX), garden), {
          size: 20,
        }),
        q.Lambda(['ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  getMetricsForGardenStrategies: async function (garden) {
    return await client.query(
      q.Map(
        q.Paginate(q.Range(q.Match(q.Index(STRATEGY_METRICS_BY_GARDEN_DESC_INDEX), garden), [], []), {
          size: METRICS_PAGE_SIZE,
        }),
        q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
      ),
    );
  },
  getMetricsForWallet: async function (wallet, garden) {
    const result = await client.query(
      q.Map(
        q.Paginate(
          q.Intersection(
            q.Match(q.Index(WALLET_METRICS_BY_WALLET_DESC_INDEX), wallet),
            q.Match(q.Index(WALLET_METRICS_BY_GARDEN_DESC_INDEX), garden),
          ),
        ),
        q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
      ),
    );
    return result;
  },
  getMetricsForWalletAll: async function (wallet) {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Range(q.Match(q.Index(WALLET_METRICS_BY_WALLET_DESC_INDEX), wallet), [], []), {
          size: METRICS_PAGE_SIZE,
        }),
        q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
      ),
    );
    return result;
  },
  getMetricsForGarden: async function (garden) {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Range(q.Match(q.Index(GARDEN_METRICS_BY_GARDEN_DESC_INDEX), garden), [], []), {
          size: METRICS_PAGE_SIZE,
        }),
        q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
      ),
    );
    return result;
  },
  getMetricsForGardensBulk: async function (gardens) {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Range(q.Match(q.Index(GARDEN_METRICS_BY_GARDEN_DESC_INDEX), gardens), [], []), {
          size: 500,
        }),
        q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
      ),
    );
    return result;
  },
  getLatestMetricForGarden: async function (garden) {
    return (
      await client.query(
        q.Map(
          q.Paginate(q.Range(q.Match(q.Index(GARDEN_METRICS_BY_GARDEN_DESC_INDEX), garden), [], []), {
            size: 1,
          }),
          q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
        ),
      )
    ).data[0];
  },
  insertLeaderboardResult: async function (results, totalNAV, totalContributors, totalPrincipal) {
    try {
      return await client.query(
        q.Create(q.Collection(LEADERBOARD_COLLECTION), {
          data: {
            totalNAV,
            totalPrincipal,
            totalContributors,
            totalGardens: results.length,
            results,
            insertedAt: Date.now(),
          },
        }),
      );
    } catch (err) {
      console.log('Failed to insert new leaderboard row', err);
      return undefined;
    }
  },
  getLatestLeaderboardResult: async function () {
    return (
      await client.query(
        q.Map(
          q.Paginate(q.Range(q.Match(q.Index(LEADERBOARD_METRICS_DESC_INDEX)), [], []), {
            size: 1,
          }),
          q.Lambda(['insertedAt', 'ref'], q.Get(q.Var('ref'))),
        ),
      )
    ).data[0];
  },
  getMembersForGarden: async function (garden, force, block) {
    const now = Date.now();
    // Check for any cached instance of members in Fauna
    const match = q.Match(q.Index(GARDEN_MEMBERS_BY_GARDEN_INDEX), garden);
    // If force OR no records in cache then grab from logs and store
    if (!(await client.query(q.Exists(match)))) {
      // If we fail to fetch here we set to empty array instead of undefined as Fauna
      // will not include the field if the value is undefined
      const members = (await _getGardenMembersFromBloxy(garden)) || [];
      console.log(`Creating new members cache record for ${garden}`);
      await client.query(
        q.Create(q.Collection(GARDEN_MEMBERS_COLLECTION), {
          data: {
            garden: garden, // string
            members: members, // array of addresses (string)
            block: block,
            updated: now,
          },
        }),
      );
      if (members.length > 0) {
        await _setLatestGardenMemberCache(members, match, block);
      }
      return members;
    } else {
      const record = await client.query(q.Get(match));
      const updatedSinceMin = (now - record.data.updated) / 1000 / 60;
      // Cache for 5 min unless force fetch is passed
      if (force === 'true' || updatedSinceMin >= 5) {
        console.log(`Fetching updated results for ${garden} after ${updatedSinceMin} minutes`);
        try {
          const members = (await _getGardenMembersFromBloxy(garden)) || [];
          if (members.length > 0) {
            await _setLatestGardenMemberCache(members, match, block, now);
          }
          return members;
        } catch (error) {
          console.error(error);
          return record.data.members;
        }
      }

      // Return result from the cache
      return record.data.members;
    }
  },
  insertIfNotExistsVote: async function (garden, strategy) {
    if (!(await client.query(q.Exists(q.Match(q.Index(STRATEGY_VOTES_INDEX), strategy))))) {
      // Create strategy document if it doesn't exist yet
      await client.query(
        q.Create(q.Collection(VOTES_COLLECTION), {
          data: {
            garden: garden,
            address: strategy,
            votes: [],
          },
        }),
      );
    }
  },
  updateVotesForStrategy: async function (refStr, str, votes, voter) {
    await client.query(
      q.Update(refStr.ref, {
        data: {
          votes: [
            ...refStr.data.votes,
            {
              voter: voter,
              amount: str.votes,
              isOpposed: str.isOpposed,
            },
          ],
        },
      }),
    );
  },
  // Used for chunked Promise resolution when rate limits must be adhered to
  parallelResolve: async function (arr, n = Infinity) {
    const results = arr.map(() => undefined);
    let i = 0;
    const worker = async () => {
      for (; i < arr.length; i++) {
        results[i] = await _delay(arr[i], i);
      }
    };

    await Promise.all(Array.from({ length: Math.min(arr.length, n) }, worker));

    return results;
  },
};

const _delay = (t) => new Promise((r) => setTimeout(r, t, t));

const _setLatestGardenMemberCache = async (members, match, block, now) => {
  const refStr = await client.query(q.Get(match));
  await client.query(
    q.Update(refStr.ref, {
      data: {
        updated: now,
        members: members,
        block: block,
      },
    }),
  );
};

const _getGardenMembersFromBloxy = async (garden) => {
  const results = await axios
    .get(`${BASE_BLOXY_URL}${BLOXY_HOLDERS_ROUTE}?key=${process.env.BLOXY_API_KEY}&token=${garden}&limit=10000`)
    .then((response) => {
      // NOTE: we attempt to filter dust here, but this can be improved
      return response.data
        .map((item) => {
          return { address: item.address, balance: item.balance };
        })
        .filter((item) => item.balance > 0.0001)
        .map((i) => i.address);
    })
    .catch((error) => {
      console.log('Failed to fetch token holders with Bloxy API', error);
      return undefined;
    });

  return results;
};
