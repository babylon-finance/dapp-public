import { joinSignature } from '@ethersproject/bytes';
import { GovernanceVoteResult, HeartVoteResult } from 'models';

class ProtocolVoteService {
  private static instance: ProtocolVoteService;

  private constructor() {}

  public static getInstance(): ProtocolVoteService {
    if (!ProtocolVoteService.instance) {
      ProtocolVoteService.instance = new ProtocolVoteService();
    }

    return ProtocolVoteService.instance;
  }

  public async getGovernanceVoteForPair(proposal: string, address: string): Promise<any> {
    try {
      return await this.doGetGovernanceVoteForPair(proposal, address);
    } catch (error) {
      console.log('Failed to get votes for user/proposal pair', error);
      return undefined;
    }
  }

  public async getGovernanceVotesForProposal(proposal: string): Promise<any> {
    try {
      return await this.doGetGovernanceVotesForProposal(proposal);
    } catch (error) {
      console.log('Failed to get votes for proposal', error);
      return undefined;
    }
  }

  public async submitGovernanceVote(signer: any, payload: GovernanceVoteResult): Promise<any> {
    try {
      const signature = joinSignature(await signer.signMessage(payload.message));
      return await this.doSubmitGovernanceVote(signature, payload);
    } catch (error) {
      console.log('Failed to submit governance vote', error);
    }
  }

  public async submitHeartVote(signer: any, payload: HeartVoteResult): Promise<any> {
    try {
      const signature = joinSignature(await signer.signMessage(payload.message));
      return await this.doSubmitHeartVote(signature, payload);
    } catch (error) {
      console.log('Failed to submit Heart vote', error);
    }
  }

  private async doSubmitHeartVote(signature: any, payload: HeartVoteResult): Promise<any> {
    await fetch('/api/v1/add-heart-vote', {
      body: JSON.stringify({ signature, payload }),
      method: 'POST',
    });
  }

  private async doSubmitGovernanceVote(signature: any, payload: GovernanceVoteResult): Promise<any> {
    await fetch('/api/v1/add-governance-vote', {
      body: JSON.stringify({ signature, payload }),
      method: 'POST',
    });
  }

  private async doGetGovernanceVotesForProposal(proposal: string): Promise<any> {
    await fetch(`/api/v1/get-governance-votes-for-proposal/${proposal}`, {
      method: 'GET',
    });
  }

  private async doGetGovernanceVoteForPair(proposal: string, address: string): Promise<any> {
    await fetch('/api/v1/get-governance-vote-pair', {
      body: JSON.stringify({ proposal, address }),
      method: 'POST',
    });
  }
}

export default ProtocolVoteService;
