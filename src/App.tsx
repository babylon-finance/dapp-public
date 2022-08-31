import AppHeader from './components/shared/AppHeader';
import AppFooter from './components/shared/AppFooter';
import { NotSupported } from 'components/NotSupported/';
import { ScrollToTop, GlobalLoader, NoAccess, MobileMenu } from 'components/shared';

import { HEART_GARDEN_ADDRESS } from 'config';
import { Routes, RoutesExternal } from 'constants/Routes';
import { UNDER_MAINTENANCE, BREAKPOINTS } from 'config';
import { VersionService, MetricsService, UserPreferenceService } from 'services/';
import { W3Provider, W3Context } from './context/W3Provider';
import { getAllSubgraphClients } from './utils/SubgraphClient';
import { CustomGardenDetails } from 'constants/customDetails';

import qs from 'query-string';
import * as Sentry from '@sentry/react';
import { Flex } from 'rimble-ui';
import { Redirect, Route, Switch } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import React, { lazy, Suspense } from 'react';
import './App.css';

// Code splitting
const GardenDetailPage = lazy(() =>
  import(/* webpackChunkName: 'gardendetail' */ 'components/garden/detail/').then(({ GardenDetailPage }) => ({
    default: GardenDetailPage,
  })),
);
const AdminPage = lazy(() =>
  import(/* webpackChunkName: 'adminpage' */ 'components/Admin/AdminPage').then(({ AdminPage }) => ({
    default: AdminPage,
  })),
);
const Gardens = lazy(() =>
  import(/* webpackChunkName: 'gardens' */ 'components/MyGardens/Gardens').then(({ default: Gardens }) => ({
    default: Gardens,
  })),
);
const Lander = lazy(() =>
  import(/* webpackChunkName: 'lander' */ 'components/Lander/Lander').then(({ default: Lander }) => ({
    default: Lander,
  })),
);
const CreatorLander = lazy(() =>
  import(/* webpackChunkName: 'creatorlander' */ 'components/Lander/CreatorLander').then(
    ({ default: CreatorLander }) => ({ default: CreatorLander }),
  ),
);
const DaoLander = lazy(() =>
  import(/* webpackChunkName: 'creatorlander' */ 'components/Lander/DaoLander').then(({ default: DaoLander }) => ({
    default: DaoLander,
  })),
);
const ProphetLander = lazy(() =>
  import(/* webpackChunkName: 'prophetlander' */ 'components/Lander/ProphetLander').then(
    ({ default: ProphetLander }) => ({ default: ProphetLander }),
  ),
);
const Leaderboard = lazy(() =>
  import(/* webpackChunkName: 'leaderboard' */ 'components/Leaderboard/Leaderboard').then(
    ({ default: Leaderboard }) => ({ default: Leaderboard }),
  ),
);
const ProphetMint = lazy(() =>
  import(/* webpackChunkName: 'propehtmint' */ 'components/Prophets/ProphetMint').then(({ ProphetMint }) => ({
    default: ProphetMint,
  })),
);
const ProphetsGallery = lazy(() =>
  import(/* webpackChunkName: 'prophetgallery' */ 'components/Prophets/Gallery').then(({ ProphetsGallery }) => ({
    default: ProphetsGallery,
  })),
);
const ProphetProfile = lazy(() =>
  import(/* webpackChunkName: 'prophetgallery' */ 'components/Prophets/Gallery').then(({ ProphetProfile }) => ({
    default: ProphetProfile,
  })),
);
const Seed = lazy(() =>
  import(/* webpackChunkName: 'seed' */ 'components/Seed').then(({ Seed }) => ({ default: Seed })),
);
const Heart = lazy(() =>
  import(/* webpackChunkName: 'heart' */ 'components/Heart').then(({ Heart }) => ({ default: Heart })),
);
const Terms = lazy(() =>
  import(/* webpackChunkName: 'terms' */ 'components/Terms').then(({ Terms }) => ({ default: Terms })),
);
const Privacy = lazy(() =>
  import(/* webpackChunkName: 'terms' */ 'components/Terms').then(({ Privacy }) => ({ default: Privacy })),
);

interface AppProps {}

interface AppState {
  initialLoad: boolean;
  providerLoading: boolean;
  darkMode: boolean;
  version: string | null;
}

const INITIAL_STATE = {
  initialLoad: true,
  providerLoading: true,
  darkMode: false,
  version: null,
};

const GardenDetailPageWithRouter = withRouter(GardenDetailPage);
const ProphetProfileWithRouter = withRouter(ProphetProfile);
const landerRoutes = [
  Routes.index,
  Routes.terms,
  Routes.privacy,
  Routes.prophets,
  Routes.creatorLander,
  Routes.daoLander,
];
const MobileLinksLander = [
  { text: 'Home', href: Routes.index, external: false },
  { text: 'For Managers', href: Routes.creatorLander, external: false },
  { text: 'For DAOs', href: Routes.daoLander, external: false },
  { text: 'Heart', href: Routes.heart, external: false },
  { text: 'The Prophets', href: Routes.prophets, external: false },
  { text: 'My Prophets', href: Routes.prophetPortfolio, external: false },
  { text: 'Docs', href: RoutesExternal.docs, external: true },
];

const MobileLinksApp = [
  { text: 'Home', href: Routes.index, external: false },
  { text: 'Explore', href: Routes.explore, external: false },
  { text: 'Portfolio', href: Routes.portfolio, external: false },
  { text: 'Heart', href: Routes.heart, external: false },
];

class App extends React.PureComponent<AppProps, AppState> {
  subgraphClients: any;
  versionInterval: any;

  constructor(props: any) {
    super(props);
    this.state = INITIAL_STATE;
    this.subgraphClients = getAllSubgraphClients();
  }

  componentWillMount() {
    if (window.location.pathname.indexOf('prophet') !== -1) {
      document.body.style.background = 'rgb(15,10,69)';
    }
    const urlParams = qs.parse(window.location.search);
    // Referral program
    if (urlParams?.ref) {
      const userPrefService = UserPreferenceService.getInstance();
      userPrefService.updateReferral(urlParams.ref as string);
    }
  }

  async componentDidMount() {
    const versionService = VersionService.getInstance();
    const metricsService = MetricsService.getInstance();
    this.versionInterval = setInterval(async () => {
      const newVersion = await versionService.getVersion();
      if (this.state.version === null) {
        this.setState({ version: newVersion?.version || '0' });
      } else {
        if (newVersion?.version !== this.state.version && newVersion?.version && this.state.version) {
          // New version
          clearInterval(this.versionInterval);
          metricsService.clearAll();
          alert('There is a new version available. Please reload the site');
          window.location.reload();
        }
      }
    }, 30000);

    const resize = () => {
      try {
        const zoom = window.outerWidth / window.innerWidth;
        if (zoom > 1) {
          document.body.style.width = `${Math.floor(zoom * 100)}%`;
        } else {
          document.body.style.width = '100%';
        }
        // Weird retina display scale
        if (window.screen.availWidth < 1300 && window.screen.availWidth > 1000) {
          document.body.style.zoom = '0.78';
        }
      } catch (error) {
        console.error('Caught error resizing', error);
      }
    };

    window.addEventListener('resize', () => {
      resize();
    });
    resize();
  }

  setLoading = (status: boolean) => {
    this.setState({ providerLoading: status });
  };

  render() {
    const { providerLoading } = this.state;
    const isLander = (() => {
      return landerRoutes.indexOf(window.location.pathname) > -1;
    })();

    const vanityGardenRoutes = Object.keys(CustomGardenDetails)
      .map((address: string) => {
        return {
          name: CustomGardenDetails[address]?.vanityUrl,
          address,
        };
      })
      .filter((obj) => !!obj.name);
    return (
      <W3Provider setLoading={this.setLoading}>
        <ScrollToTop />
        <WholeWrapper>
          {isMobile && (
            <MobileMenuWrapper>
              <MobileMenu links={isLander ? MobileLinksLander : MobileLinksApp} />
            </MobileMenuWrapper>
          )}
          <AppWrapper className="App">
            <Helmet>
              <meta name="description" content="Community-led Asset Management. DeFi Together." />
              <meta property="og:url" content="https://babylon.finance/heart" />
              <meta property="og:title" content="Babylon Finance - DeFi Together" />
              <meta
                property="og:description"
                content="Split fees, share profits, and earn rewards via DeFi investment clubs."
              />
              <meta property="og:image" content="http://babylon.finance/garden.png" />
              <title>Crypto investing, simplified. DeFi Together</title>
            </Helmet>
            <W3Context.Consumer>
              {(context) => (
                <ContentWrapper>
                  <AppHeader isMobile={isMobile} />
                  {!isLander && UNDER_MAINTENANCE && <NoAccess maintenance />}
                  {(isLander || !UNDER_MAINTENANCE) && (
                    <>
                      <Suspense fallback={<GlobalLoader size={isMobile ? 300 : 400} />}>
                        {!providerLoading && (
                          <Switch>
                            <Route exact path={`/garden/${HEART_GARDEN_ADDRESS}`}>
                              {!isMobile ? <Redirect to={Routes.heart} /> : <NotSupported />}
                            </Route>
                            {vanityGardenRoutes.map((gardenRoute) => (
                              <Route exact key={`/garden/${gardenRoute.name}`} path={`/garden/${gardenRoute.name}`}>
                                <Redirect to={`/garden/${gardenRoute.address}`} />
                              </Route>
                            ))}
                            <Route exact path={Routes.heart} render={() => <Heart />} />
                            <Route
                              path={Routes.garden}
                              render={() => (
                                <>
                                  <GardenDetailPageWithRouter subgraphClients={this.subgraphClients} />
                                </>
                              )}
                            />
                            <Route
                              exact
                              path={[Routes.explore, Routes.portfolio, Routes.me]}
                              render={() => <Gardens />}
                            />
                            <Route
                              exact
                              path={Routes.seed}
                              render={() => (
                                <>
                                  {!isMobile && <Seed />}
                                  {isMobile && <NotSupported />}
                                </>
                              )}
                            />
                            <Route
                              exact
                              path={Routes.leaderboard}
                              render={() => (
                                <>
                                  {!isMobile && <Leaderboard />}
                                  {isMobile && <NotSupported />}
                                </>
                              )}
                            />
                            <Route exact path={Routes.index} component={Lander} />
                            <Route exact path={Routes.creatorLander} component={CreatorLander} />
                            <Route exact path={Routes.daoLander} component={DaoLander} />
                            <Route exact path={Routes.admin} component={AdminPage} />
                            <Route exact path={Routes.terms} component={Terms} />
                            <Route exact path={Routes.privacy} component={Privacy} />
                            <Route exact path={Routes.prophets} component={ProphetLander} />
                            <Route
                              exact
                              path={Routes.prophetsGallery}
                              render={() => <ProphetsGallery isMobile={isMobile} />}
                            />
                            <Route exact path={Routes.prophetProfile} render={() => <ProphetProfileWithRouter />} />
                            <Route exact path={[Routes.prophetMint, Routes.prophetPortfolio]} component={ProphetMint} />
                            <Redirect to={Routes.index} />
                          </Switch>
                        )}
                      </Suspense>
                    </>
                  )}
                  {providerLoading && !isMobile && !isLander && <GlobalLoader />}
                  <AppFooter isMobile={isMobile} />
                </ContentWrapper>
              )}
            </W3Context.Consumer>
          </AppWrapper>
        </WholeWrapper>
      </W3Provider>
    );
  }
}

const AppWrapper = styled(Flex)`
  flex-flow: column nowrap;
  height: auto;
  align-items: center;
  width: 100%;
  display: flex;
  min-height: 85vh;
  min-width: 100vw;
  background-color: var(--blue);

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    min-height: 90vh;
  }
`;

const WholeWrapper = styled(Flex)`
  flex-flow: column nowrap;
  height: auto;
  align-items: center;
  width: 100%;
  display: flex;
  min-height: 100vh;
  min-width: 100vw;
  position: relative;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  height: auto;
  min-height: 100vh;
  width: 100%;
`;

const MobileMenuWrapper = styled.div`
  position: absolute;
  background: transparent;
  z-index: 10;
  width: 80vw;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
`;

export default Sentry.withProfiler(App);
