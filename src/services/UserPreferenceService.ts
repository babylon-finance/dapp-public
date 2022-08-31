import { GasSpeed, UserPreferenceRecord, Currency, QuoteResult } from 'models';
import DEFAULT_QUOTES from './default_quotes.json';
import { QuoteService } from 'services/';
import { IS_DEV } from 'config';
import store from 'store2';

const PREFS_NAMESPACE = 'babylonPreferences';
const FIAT_NAMESPACE = 'fiatQuotes';
const REF_NAMESPACE = 'referral';

const DEFAULT_PREFS = {
  currency: Currency.USD.ticker,
  gasSpeed: GasSpeed.fast,
  hideAdminTour: false,
  hideChatTour: false,
  hideCreationLearner: false,
  hideDepositTour: false,
  hideStakeTour: false,
  hideNewUserTour: false,
  maxSlippage: 0.1,
  seenWelcome: false,
  signedNonUsResident: '',
  countryCheck: '',
};

enum PrefKeys {
  currency = 'currency',
  gasSpeed = 'gasSpeed',
  hideChatTour = 'hideChatTour',
  hideCreationLearner = 'hideCreationLearner',
  hideDepositTour = 'hideDepositTour',
  hideStakeTour = 'hideStakeTour',
  hideNewUserTour = 'hideNewUserTour',
  maxSlippage = 'maxSlippage',
  seenWelcome = 'seenWelcome',
  signedNonUsResident = 'signedNonUsResident',
  countryCheck = 'countryCheck',
}

class UserPreferenceService {
  private static instance: UserPreferenceService;
  private prefsStorage: any;
  private fiatQuotesStorage: any;
  private referralStorage: any;

  private constructor() {
    this.prefsStorage = store.namespace(PREFS_NAMESPACE);
    this.fiatQuotesStorage = store.namespace(FIAT_NAMESPACE);
    this.referralStorage = store.namespace(REF_NAMESPACE);
  }

  public static getInstance(): UserPreferenceService {
    if (!UserPreferenceService.instance) {
      UserPreferenceService.instance = new UserPreferenceService();
    }

    return UserPreferenceService.instance;
  }

  public getOrInitializePrefs(userAddress: string): UserPreferenceRecord {
    if (userAddress) {
      const userPrefs = this.prefsStorage.namespace(userAddress);
      // Note: If prefs keys are empty then initialize to default and return else
      // return the current prefs.
      if (Object.keys(userPrefs.getAll()).length !== 0) {
        const prefs = userPrefs.getAll();

        // Note: This allows us to introduce new keys to prefs object without migrating
        Object.keys(PrefKeys).forEach((key) => {
          if (!prefs[key]) {
            prefs[key] = DEFAULT_PREFS[key];
          }
        });

        return prefs;
      } else {
        userPrefs.setAll(DEFAULT_PREFS);
        return userPrefs.getAll();
      }
    }

    return DEFAULT_PREFS;
  }

  public async getOrUpdateFiatPrices(): Promise<QuoteResult> {
    let quotes = this.fiatQuotesStorage.getAll();

    if (IS_DEV) {
      return DEFAULT_QUOTES;
    }

    if (quotes && Object.keys(quotes).length !== 0) {
      const tenMinutes = 60 * 10 * 1000;
      if (Date.now() - quotes.updatedAt <= tenMinutes) {
        return quotes;
      }
    }

    // Get Quotes
    const quoteService = QuoteService.getInstance();
    quotes = await quoteService.fetchUpdatedPrices();

    if (quotes) {
      quotes.updatedAt = Date.now();
      this.fiatQuotesStorage.setAll(quotes);
    } else {
      quotes = DEFAULT_QUOTES;
    }

    return quotes;
  }

  public updateUserPreferences(newPrefs: UserPreferenceRecord, userAddress: string): UserPreferenceRecord {
    if (userAddress) {
      const userPrefs = this.prefsStorage.namespace(userAddress);
      const currPrefs = userPrefs.getAll();
      const updated = Object.assign({}, currPrefs, newPrefs);
      userPrefs.setAll(updated);

      return updated;
    }

    return DEFAULT_PREFS;
  }

  public updateReferral(referral: string) {
    this.referralStorage.setAll({ referral });
  }

  public getReferral(): string {
    return this.referralStorage.getAll()?.referral;
  }
}

export default UserPreferenceService;
