import { UserPreferenceService, GasStationService, ViewerService, getMintedImages } from 'services/';
import { UserPreferenceRecord, QuoteResult, GasPrices, ProphetImageUri } from 'models';
import { getProvider, getNotifyOptions, walletsSupported, ACCOUNTANT_ADDRESS, ADMIN_ADDRESSES } from 'config';
import { Routes } from 'constants/Routes';

import { API as OnboardApi, Wallet } from 'bnc-onboard/dist/src/interfaces';
import { AddressZero } from '@ethersproject/constants';
import { BaseProvider, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Mixpanel } from 'Mixpanel';
import { useLocation } from 'react-router';
import Notify from 'bnc-notify';
import Onboard from 'bnc-onboard';
import React, { useCallback, useEffect, useState } from 'react';

import gnosisABI from './gnosis.json';

interface W3ProviderProps {
  children: React.ReactNode[];
  setLoading(status: boolean): void;
}

interface W3Context {
  initialized: boolean;
  accountantBalance: BigNumber;
  address?: string;
  signatureSupported?: boolean;
  admin: boolean;
  betaAccess: boolean | undefined;
  blockTimestamp?: number;
  canSubmitTx: boolean;
  gasPrices?: GasPrices;
  mintedImages?: any[];
  network?: number;
  notify: any;
  provider: BaseProvider;
  quotes?: QuoteResult;
  txProvider?: Web3Provider;
  userPrefs?: UserPreferenceRecord;
  wallet?: Wallet;
  walletBalance?: BigNumber;
  checkInitialized(): Promise<boolean>;
  connect(e: any): void;
  disconnect(e: any): void;
  fetchMintedImages(force?: boolean): void;
  fetchNewGasPrices(force?: boolean): void;
  fetchQuotes(): void;
  switchWallet(e: any): void;
  updateUserPrefs(newPrefs: UserPreferenceRecord): UserPreferenceRecord;
}

const options = getNotifyOptions();
// @ts-ignore
const notify = Notify(options);
const W3Context = React.createContext<W3Context | undefined>(undefined);

const W3Provider = ({ children, setLoading }: W3ProviderProps) => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [signatureSupported, setSignatureSupported] = useState<boolean | undefined>(true);
  const [walletBalance, setWalletBalance] = useState<BigNumber | undefined>(undefined);
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [userPrefs, setPreferences] = useState<UserPreferenceRecord | undefined>(undefined);
  const [gasPrices, setGasPrices] = useState<GasPrices | undefined>(undefined);
  const [quotes, setQuotes] = useState<QuoteResult | undefined>(undefined);
  const [network, setNetwork] = useState<number | undefined>(undefined);
  const [provider, setProvider] = useState<BaseProvider>(getProvider(true));
  const [onboard, setOnboard] = useState<OnboardApi | undefined>(undefined);
  const [initialized, setContextReady] = useState<boolean>(false);
  const [canSubmitTx, setCanSubmitTx] = useState<boolean>(false);
  const [txProvider, setTxProvider] = useState<Web3Provider | undefined>(undefined);
  const [blockTimestamp, setBlockTimestamp] = useState<number | undefined>(undefined);
  const [accountantBalance, setAccountantBalance] = useState<BigNumber>(BigNumber.from(0));
  const [betaAccess, setBetaAccess] = useState<boolean | undefined>(undefined);
  const [mintedImages, setMintedImages] = useState<ProphetImageUri[]>([]);

  const location = useLocation();
  const gasStationService = GasStationService.getInstance();
  const userPrefsService = UserPreferenceService.getInstance();
  const viewerService = ViewerService.getInstance();

  const isLander = (() => {
    return (
      [Routes.index, Routes.terms, Routes.privacy, Routes.creatorLander, Routes.daoLander].indexOf(location.pathname) >
      -1
    );
  })();

  const isProphets = (() => {
    return (
      [Routes.prophets, Routes.prophetMint, Routes.prophetProfile, Routes.prophetsGallery].indexOf(location.pathname) >
      -1
    );
  })();

  const initProvider = (force: boolean = false) => {
    const reset = () => {
      const provider = getProvider(force);
      setProvider(provider);
    };
    reset();
  };

  useEffect(() => {
    const grabLatestBlock = async () => {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      if (block) {
        setBlockTimestamp(block.timestamp);
      } else {
        console.error('Invalid block', blockNumber);
        setBlockTimestamp(Date.now() / 1000);
      }
    };

    const initRoutine = async () => {
      await fetchQuotes();
      initProvider();
      await initialize();
      grabLatestBlock();
      fetchAccountantBalance();
      setInitialLoad(false);
      setLoading(false);
    };

    const initLanderOnly = async () => {
      await fetchQuotes();
      setLoading(false);
    };

    if (!onboard && initialLoad && !isLander) {
      setLoading(true);
      initRoutine();
    }

    if (isLander) {
      setLoading(true);
      initLanderOnly();
    }
  }, [isLander]);

  const fetchMintedImages = async (force: boolean = false) => {
    setMintedImages(await getMintedImages(force));
  };

  const fetchNewGasPrices = async (force: boolean = false) => {
    setGasPrices(await gasStationService.fetchUpdatedPrices(force));
  };

  const fetchQuotes = async () => {
    !isProphets && setQuotes(await userPrefsService.getOrUpdateFiatPrices());
  };

  const fetchAccountantBalance = async () => {
    setAccountantBalance((await provider.getBalance(ACCOUNTANT_ADDRESS)) || BigNumber.from(0));
  };

  const fetchUserPermissions = async (address: string) => {
    const perms = await viewerService.getUserPermissionsGlobal(address);
    setBetaAccess(!!perms.hasGate);
  };

  const handleSignatureSupported = useCallback(
    async (address: string) => {
      if (address) {
        const maybeContract = new Contract(address, gnosisABI.abi, provider);
        if (maybeContract) {
          maybeContract
            .getOwners()
            .then((owners) => {
              setSignatureSupported(owners ? owners.length === 1 : true);
            })
            .catch((error) => {
              // do nothing since it is not a Gnosis Safe contract
            });
        }
      }
    },
    [address],
  );

  const initializeUserAddress = async (address: string) => {
    if (address) {
      Mixpanel.identify(address);
      setPreferences(userPrefsService.getOrInitializePrefs(address));
      setAddress(address);
      setWalletBalance(await provider.getBalance(address));
      await fetchUserPermissions(address);
    }
  };

  const initialize = async () => {
    const checks = [
      { checkName: 'accounts' },
      { checkName: 'connect' },
      { checkName: 'network' },
      { checkName: 'derivationPath' },
    ];
    const onboard = Onboard({
      dappId: process.env.REACT_APP_BLOCKNATIVE_DAPPID,
      networkId: parseInt(process.env.REACT_APP_CHAIN_ID || '1'),
      darkMode: true,
      walletCheck: checks,
      walletSelect: {
        wallets: walletsSupported,
      },
      subscriptions: {
        address: async (address) => {
          if (address) {
            initializeUserAddress(address);
            handleSignatureSupported(address);
          }
        },
        network: (network) => {
          onboard.config({ networkId: parseInt(process.env.REACT_APP_CHAIN_ID || '1') });
          if (wallet?.provider) {
            setTxProvider(new Web3Provider(wallet.provider, 'any'));
            setCanSubmitTx(true);
          }
          setNetwork(network);
        },
        wallet: async (wallet) => {
          if (wallet.provider) {
            setWallet(wallet);
            if (wallet.name) {
              localStorage.setItem('onboard.selectedWallet', wallet.name);
            }
            initializeUserAddress(wallet.provider.selectedAddress);
            setTxProvider(new Web3Provider(wallet.provider, 'any'));
            setCanSubmitTx(true);
          }
        },
      },
    });

    const cachedWallet = localStorage.getItem('onboard.selectedWallet');

    if (cachedWallet) {
      await onboard.walletSelect(cachedWallet);
      checkInitialized(onboard);
    }

    await fetchNewGasPrices();
    await fetchMintedImages();
    setOnboard(onboard);
    setLoading(false);
  };

  const updateUserPrefs = (newPrefs: UserPreferenceRecord): UserPreferenceRecord => {
    const updated = userPrefsService.updateUserPreferences(newPrefs, address || AddressZero);
    setPreferences(updated);

    return updated;
  };

  const checkInitialized = async (onboardProp?: any) => {
    if (onboard) {
      const isReady = await onboardProp?.walletCheck();
      setContextReady(isReady);
      return isReady;
    }
  };

  const resetOnboard = () => {
    localStorage.setItem('onboard.selectedWallet', '');
    setProvider(getProvider());
    setCanSubmitTx(false);
    setAddress(undefined);
    setWallet(undefined);
    onboard?.walletReset();
  };

  const connect = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (onboard) {
      const selected = await onboard.walletSelect();
      selected && onboard.walletCheck();
    }
  };

  const disconnect = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (onboard) {
      resetOnboard();
    }
  };

  const switchWallet = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (onboard) {
      await onboard.walletSelect();
    }
  };

  const isAdmin = address !== undefined && ADMIN_ADDRESSES.includes(address);

  return (
    <W3Context.Provider
      value={{
        accountantBalance,
        address,
        admin: isAdmin,
        betaAccess,
        blockTimestamp,
        canSubmitTx,
        checkInitialized,
        connect,
        disconnect,
        fetchMintedImages,
        fetchNewGasPrices,
        fetchQuotes,
        gasPrices,
        initialized,
        signatureSupported,
        mintedImages,
        network,
        notify,
        provider,
        quotes,
        switchWallet,
        txProvider,
        updateUserPrefs,
        userPrefs,
        wallet,
        walletBalance,
      }}
    >
      {children}
    </W3Context.Provider>
  );
};

const useW3Context = () => {
  const context = React.useContext(W3Context);
  if (context === undefined) {
    throw new Error('useW3Context must be called within a W3Provider');
  }

  return context;
};

export { W3Provider, useW3Context, W3Context };
