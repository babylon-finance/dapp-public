import {
  SubmitVotesRequest,
  GetGovernanceVotesResponse,
  GetHeartGardenVotesResponse,
  GetStrategyVotesResponse,
  SubmitGovernanceVoteRequest,
  SubmitHeartGardenVoteRequest,
} from 'models';

export async function submitVotes(data: SubmitVotesRequest): Promise<unknown> {
  return (
    await fetch('/api/v1/add-vote', {
      body: JSON.stringify(data),
      method: 'POST',
    })
  ).json();
}

export async function getVotesForStrategy(address: string): Promise<GetStrategyVotesResponse | undefined> {
  return await fetch(`/api/v1/get-votes/${address}`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const result = json;
      return Object.keys(result).length > 0 ? result : undefined;
    })
    .catch((error) => {
      console.log(`Failed to fetch votes for ${address}`, error);
    });
}

export async function submitGovernanceVote(data: SubmitGovernanceVoteRequest): Promise<unknown> {
  return (
    await fetch('/api/v1/add-governance-vote', {
      body: JSON.stringify(data),
      method: 'POST',
    })
  ).json();
}

export async function submitGardenInvestmentVote(data: SubmitHeartGardenVoteRequest): Promise<unknown> {
  return (
    await fetch('/api/v1/add-heart-vote', {
      body: JSON.stringify(data),
      method: 'POST',
    })
  ).json();
}

export async function getGovernanceVotesForProposal(
  proposalId: string,
  address: string | undefined,
): Promise<GetGovernanceVotesResponse | undefined> {
  return await fetch(`/api/v1/get-governance-votes-for-proposal/${proposalId}${address ? '/' + address : ''}`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const result = json;
      return Object.keys(result).length > 0 ? result : undefined;
    })
    .catch((error) => {
      console.log(`Failed to fetch governance votes for ${proposalId}`, error);
    });
}

export async function getHeartGardenVotesByUser(address: string): Promise<GetHeartGardenVotesResponse[] | undefined> {
  return await fetch(`/api/v1/get-heart-vote-by-user/${address}`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      const result = json;
      return Object.keys(result).length > 0 ? result : undefined;
    })
    .catch((error) => {
      console.log(`Failed to fetch heart garden votes for ${address}`, error);
    });
}
