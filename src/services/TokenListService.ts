import { Token } from 'models';
import { tokens as CoreTokens } from 'constants/addresses';
import { ZERO_ADDRESS, ETH_CURVE_ADDRESS, PRIMARY_TOKENS } from 'config';

class TokenListService {
  private static instance: TokenListService;
  private tokenList: Token[];
  private tokenMapAddress: Map<string, Token>;
  private tokenMapSymbol: Map<string, Token>;

  private constructor() {
    this.tokenList = [];
    this.tokenMapAddress = new Map();
    this.tokenMapSymbol = new Map();

    this.setTokenList();
  }

  public static getInstance(): TokenListService {
    if (!TokenListService.instance) {
      TokenListService.instance = new TokenListService();
    }

    return TokenListService.instance;
  }

  private setTokenList(): void {
    try {
      const tokens = require('../babylon-token-list.json').concat(PRIMARY_TOKENS);

      this.buildTokenMapByAddress(tokens);
      this.buildTokenMapBySymbol(tokens);

      // Note: the reason we don't just dump the list into memory here is we want to dedupe so
      // we unwind the memoized address map to get a deduplicated list.

      // Removes synths
      const tokenArray = Array.from(this.tokenMapAddress.values()).filter((t: Token) => t.integration !== 'synthetix');

      const commonBaseSymbols = ['DAI', 'USDC', 'USDT', 'WETH', 'WBTC', 'BABL'];
      const commonBaseTokens = commonBaseSymbols.map((symbol) => {
        return this.getTokenBySymbol(symbol) as Token;
      });
      const filteredMainList = tokenArray.filter((t: Token) => !commonBaseSymbols.includes(t.symbol));

      // Used to force ordering of common tokens first
      this.tokenList = [...commonBaseTokens, ...filteredMainList].filter((t) => t !== undefined);
    } catch (error) {
      console.log('Failed to load token list:', error);
    }
  }

  private buildTokenMapByAddress(tokens: Token[]) {
    this.tokenMapAddress = new Map(tokens.map((token) => [token.address.toLowerCase(), token]));
  }

  private buildTokenMapBySymbol(tokens: Token[]) {
    this.tokenMapSymbol = new Map(tokens.map((token) => [token.symbol.toUpperCase(), token]));
  }

  public getTokenList(): Token[] {
    return this.tokenList;
  }

  public getTokenByAddress(address: string): Token | undefined {
    const cleanedAddress = address.toLowerCase();
    if (cleanedAddress === ZERO_ADDRESS || cleanedAddress === ETH_CURVE_ADDRESS || cleanedAddress === '0x') {
      return {
        chainId: 1,
        address: '0x',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        logoURI: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
        liquidity: 1000000,
        integration: 'none',
        lastUpdatedAt: -1,
        swappable: true,
      };
    }

    return this.tokenMapAddress.get(cleanedAddress);
  }

  public getTokenBySymbol(symbol: string): Token | undefined {
    return this.tokenMapSymbol.get(symbol.toUpperCase());
  }

  public getInputSymbol(address: string): string {
    return address.toLowerCase() === CoreTokens.WETH.toLowerCase()
      ? 'Ξ'
      : this.getTokenByAddress(address)?.symbol || 'Ξ';
  }

  public getReserveTokens(): any[] {
    return ['DAI', 'WETH', 'USDC', 'WBTC', 'AAVE', 'BABL'].map((s) => {
      const { symbol, address, name, decimals, chainId, logoURI } = this.getTokenBySymbol(s) as Token;
      return {
        address,
        chainId,
        decimals,
        logoURI,
        name,
        symbol,
      };
    });
  }
}

export default TokenListService;
