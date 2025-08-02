import './App.css';
import './i18n';

import { Box, Container, CircularProgress, CssBaseline, ThemeProvider, Typography } from '@material-ui/core';
import { BrowserRouter, Link, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { CountingLogPage, CountingPage, DailyPrepPage, InvoicesPage, ViewOrderPage, OrdersPage, InvoicePage, SandboxLandingPage, VendorCatalogPage, VendorPage, VendorsPage, CountingListsPage, CountingListPage, ViewPurchaseOrderPage, SetupRestaurantDetailsPage, NewOrderPage } from './components/src/Pages';
import React, { FunctionComponent, ReactElement, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { BlockNavigationDialog } from './components/UI/BlockNavigationDialog';
import ChangePlanDialog from './components/src/ChangePlanDialog';
import DayJsUtils from "@date-io/dayjs";
import { FaqPage } from './components/src/Pages/FaqPage';
import { Footer } from './components/UI/Footer';
import { Header } from './components/src/Header';
import { HomePage } from './components/src/Pages/HomePage';
import { LoginPage } from './components/src/Pages/LoginPage';
import { MainLayout } from './components/Layouts';
import { MenuItemPage } from './components/src/Pages/MenuItemPage';
import { MenuItemsListPage } from './components/src/Pages/MenuItemsListPage';
import { MenuPage } from './components/src/Pages/MenuPage';
import { MenusListPage } from './components/src/Pages/MenusListPage';
import { Message } from './components/UI/Message';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { PantryListPage } from './components/src/Pages/PantryListPage';
import { PantryPage } from './components/src/Pages';
import { PasswordResetPage } from './components/src/Pages/PasswordResetPage';
import { Plan } from './enum/plans.enum';
import { PosMenuItemAssociationsPage } from './components/src/Pages/PosAssociationsPage/PosMenuItemAssociationsPage';
import { PrepListPage } from './components/src/Pages/PrepListPage';
import PrepLogPage from './components/src/Pages/PrepLogPage';
import { PrepPage } from './components/src/Pages/PrepPage';
import { PrivacyPolicyPage } from './components/src/Pages/PrivacyPolicyPage';
import ReactDOM from 'react-dom';
import { atom, RecoilRoot, useRecoilCallback, useRecoilState } from 'recoil';
import { SWRConfig } from 'swr';
import { SandboxDialog } from './components/UI';
import { SettingsPage } from './components/src/Pages/SettingsPage';
import { SignUpPage } from './components/src/Pages/SignUpPage';
import { SnackbarProvider } from 'notistack';
import { TermsOfServicePage } from './components/src/Pages/TermsOfServicePage';
import { TrialMessage } from './components/UI/TrialMessage';
import { UnitsPage } from './components/src/Pages/UnitsPage';
import { User } from './models/User';
import dayjs from "dayjs";
import request from './util/request';
import log from 'loglevel';
import theme from './theme';
import utc from "dayjs/plugin/utc";
import { useIsFullWidth } from './hooks';

dayjs.extend(utc);
const utcDayJs = (...args: any[]) => dayjs(...args).utc();

export const planUpgradeRequiredDialogState = atom( {
  key: 'PlanUpgradeRequiredDialog',
  default: {
    message: null as string|null,
    plan: 'BASIC' as Plan,
  }
} );

export const saveAndContinueCallbackState = atom( {
  key: 'SaveAndContinueCallback',
  default: async () => { console.log( 'DEFAULT' ) },
} );

declare global {
  interface Window {
    gtag: any;
    pendo: any;
    analytics: any;
  }
}

export const AppContext = React.createContext( {
  handlePlanUpgradeRequired: ( plan: Plan ) => { },
  locationId: null,
} );

const NotFoundPage = ( { user }: { user?: User } ): ReactElement =>
  <MainLayout>
    Not Found
  </MainLayout>
;

const Loading: FunctionComponent<{ loading: boolean }> = ( { loading, children } ) => {
  if ( ! loading )
    return <>{ children }</>;

  return (
    <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
      <CircularProgress />
    </Box>
  );
};

export const Main = ( ): ReactElement => {
  const [ user, setUser ] = useState( null as any );
  const [ loading, setLoading ] = useState( true );
  const [ planDialog, setPlanDialog ] = useRecoilState( planUpgradeRequiredDialogState );
  const { message: planDialogMessage, plan: planDialogPlan } = planDialog;
  const [ isShowingSandboxDialog, setShowingSandboxDialog ] = useState( false );
  const [ isSandboxDialogLoading, setSandboxDialogLoading ] = useState( false );

  const location = useLocation();
  const history = useHistory();

  const handlePlanUpgradeRequired = useCallback( async ( plan: Plan ) => {
    setPlanDialog({
      message: 'A plan upgrade is required' as string|null,
      plan,
    });
  }, [] );

  const appContextValue = useMemo( () => (
    { 
      handlePlanUpgradeRequired,
      locationId: user?.location?.id,
    }
  ), [ handlePlanUpgradeRequired, user ] );

  const handleConfirmLeaveSandbox = async ( reset: boolean ): Promise<void> => {
    const body = {
      reset,
    };
    setSandboxDialogLoading( true );
    try {
      await request.post( '/sandbox/leave', { body } );
      await loadUser();
    } catch ( e ) {
      // Do nothing
    }
    setSandboxDialogLoading( false );
    setShowingSandboxDialog( false );

    history.go( 0 );
  };

  history.listen(location => {
    window.analytics?.page(location.pathname);
  })

  useEffect( () => {
    ( async () => {
      if ( [ '/', '/login', '/signup', '/signup/confirm' ].includes( location.pathname ) )
        return;
      
      const user = await loadUser();
      
      if ( process.env.REACT_APP_ENV === 'production' && user) {
        try {
          window.pendo.initialize({
            visitor: {
              id: user.id,
              email: user.email,
              full_name: user.name
            },
            account: {
              id: user.accountId,
              plan: user.plan.plan,
              planState: user.plan.state,
              trialEnd: user.plan.trialEnd,
            },
          })
        } catch ( e ) {
          log.error( e );
        }
      }

      try { 
        if ( user )
          window.analytics.identify( user.id );
      } catch ( e ) {
        log.error( e );
      }
    } )();
  }, [ location ] );

  const handleLogIn = async ( ): Promise<void> => {
    const user = await loadUser();
    history.push( user?.isInSandboxMode ? '/getting-started' : '/items', { previousTitle: document.title } );
  };

  const loadUser = async ( ): Promise<User|undefined> => {
    try {
      const { status, body } = await request.get( '/profile', { noAuth: true } );

      if ( status === 200 ) {
        if ( ! body.location?.id && history.location.pathname !== '/setup' ) {
          history.replace( '/setup' );
        }
        setUser( body );
        window.gtag?.( 'set', { user_id: body.id } );
      }
      
      return body;
    } catch {
      // Do nothing
    } finally {
      setLoading( false );
    }

  };

  const isSmallScreen = ! useIsFullWidth();
  const isFullWidthPage = location.pathname === '/orders/new';

  return ( <>
    <Switch>
      <Route path="/" exact render={ () => {
        if ( ! [ 'staging.readyprep.io' ].includes( window.location.hostname ) )
          window.location.href = '/items';
        return <HomePage />;
      } } />
      <Route path="/privacy-policy" exact render={ () => window.location.href = 'https://readyprep.io/privacy' } />
      <Route path="/terms-of-service" exact render={ () => window.location.href = 'https://readyprep.io/terms-of-service' } />
      <Route path="/login" exact>
        <LoginPage onLogIn={ handleLogIn } />
      </Route>
      <Route path="/signup/confirm" exact>
        <Box display="flex" flexDirection="column" alignItems="stretch">
          <Box flex={'0 1 88vh'} display="flex" flexDirection="column">
            <Box flex={'1 1'}><Header /></Box>
            <Box flex={1} textAlign="center">
              <Typography>Thank you. Please check your email to complete your registration.</Typography>
            </Box>
          </Box>
          <Box flex={'1 0 12vh'} display="flex"><Footer /></Box>
        </Box>
      </Route>
      <Route path="/po/:id" exact>
        <ViewPurchaseOrderPage />
      </Route>
      <Route path="/signup" exact>
        <SignUpPage />
      </Route>
      <Route path="/password/reset/:token?">
        <PasswordResetPage />
      </Route>
      <Route path="/privacy-policy">
        <Loading loading={loading}>
          <Header user={user} />
          <PrivacyPolicyPage />
        </Loading>
      </Route>
      <Route path="/terms-of-service">
        <Loading loading={loading}>
          <Header user={user} />
          <TermsOfServicePage />
        </Loading>
      </Route>
      <Route path="/faq">
        <Loading loading={loading}>
          <Header user={user} />
          <FaqPage />
        </Loading>
      </Route>
      <Route path="/404" exact>
        <NotFoundPage user={user} />
      </Route>
      <Route path="/setup" exact>
        <SetupRestaurantDetailsPage />
      </Route>
      <Route path="*">
        <AppContext.Provider value={ appContextValue }>
          <MainLayout>
            <Box marginRight={isFullWidthPage && ! isSmallScreen ? '360px' : 0}>
              <Container maxWidth="lg" disableGutters>
                <Box px={isFullWidthPage ? 2 : 0}>
                  { user?.plan.state === 'trialing' &&
                    <TrialMessage trialEnd={ new Date( user?.plan.trialEnd ) } />
                  }
                  { user?.hasNewPosItems &&
                    <Message showing={location.pathname !== '/pos/associations'}>New POS Items detected. <Link to="/pos/associations">Click here to manage mapping</Link></Message>
                  }
                  { user?.isInSandboxMode &&
                    <Message>You are in Sandbox mode. <a href="#" onClick={ () => setShowingSandboxDialog( true ) }>Click here to leave the sandbox</a></Message>
                  }
                </Box>
              </Container>
            </Box>
            <Switch>
              { /* Render auth'd landing page if the user has no data */ }
              <Route path="/" exact render={ () => window.location.href = user?.isInSandboxMode ? '/getting-started' : '/items' } />
              <Route path="/getting-started" exact>
                <SandboxLandingPage />
              </Route>
              <Route path="/counting-lists" exact>
                <CountingListsPage />
              </Route>
              <Route path="/counting-list/:id" exact>
                <CountingListPage />
              </Route>
              <Route path="/counts" exact>
                <CountingLogPage />
              </Route>
              <Route path="/count/:id" exact>
                <CountingPage />
              </Route>
              <Route path="/pantry" exact>
                <PantryListPage />
              </Route>
{   
  /*           
              <Route path="/pantry/log" exact>
                <PantryLogPage />
              </Route>
              <Route path="/pantry/log/:date" exact>
                <PantryStockPage />
              </Route>
  */
}
              <Route path="/pantry/:id" exact>
                <PantryPage />
              </Route>
              <Route path="/prep" exact>
                <PrepListPage />
              </Route>
              <Route path="/prep/log" exact>
                <PrepLogPage />
              </Route>
              <Route path="/prep/log/:date" exact>
                <DailyPrepPage />
              </Route>
              <Route path="/prep/:id" exact>
                <PrepPage />
              </Route>
              <Route path="/items" exact>
                <MenuItemsListPage />
              </Route>
              <Route path="/items/:id" exact>
                <MenuItemPage />
              </Route>
              <Route path="/menus" exact>
                <MenusListPage />
              </Route>
              <Route path="/menus/:id" exact>
                <MenuPage />
              </Route>
              <Route path="/units" exact>
                <UnitsPage />
              </Route>
              <Route path="/settings" exact render={ () => <SettingsPage /> } />
              <Route path="/vendors" exact render={ () => <VendorsPage /> } />
              <Route path="/vendor/:id" exact>
                <VendorPage />
              </Route>
              <Route path="/vendor/:id/catalog" exact>
                <VendorCatalogPage />
              </Route>
              <Route path="/orders" exact>
                <OrdersPage />
              </Route>
              <Route path="/orders/new" exact>
                <NewOrderPage />
              </Route>
              <Route path="/orders/:id" exact>
                <ViewOrderPage />
              </Route>
              <Route path="/invoices" exact>
                <InvoicesPage />
              </Route>
              <Route path="/invoices/:id" exact>
                <InvoicePage />
              </Route>
              <Route path="/pos/associations" exact render={ () => <PosMenuItemAssociationsPage /> } />
              <Route path="*" render={ () => window.location.href = '/404' } />
            </Switch>
          </MainLayout>
        </AppContext.Provider>
      </Route>
    </Switch>
    { planDialogMessage !== null &&
      <ChangePlanDialog allowClose={ true } message={ planDialogMessage } plan={ planDialogPlan } showing={ planDialogMessage !== null } onConfirm={ () => {
        setPlanDialog({ message: null, plan: planDialogPlan });
      } } onClose={ () => {
        setPlanDialog({ message: null, plan: planDialogPlan });
      } } />
    }
    {
      user?.isInSandboxMode &&
      <SandboxDialog showing={isShowingSandboxDialog} loading={isSandboxDialogLoading} onConfirm={handleConfirmLeaveSandbox} onClose={() => setShowingSandboxDialog( false )}></SandboxDialog>
    }
  </> );
};

const container = document.getElementById( 'nav-block' ) as HTMLElement;

const WithRecoil = () => {
  const [ planDialog, setPlanDialog ] = useRecoilState( planUpgradeRequiredDialogState );
  const getSaveAndContinueCallback = useRecoilCallback(({ snapshot }) => async () => {
    const callback = await snapshot.getPromise( saveAndContinueCallbackState );
    return callback;
  });

  return (
    <SnackbarProvider maxSnack={2} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} autoHideDuration={3260}>
      <SWRConfig 
        value={
          {
            fetcher: async <T extends never, P extends Parameters<T>>(
              key: string | ( ( ...args: P ) => Promise<T> ),
              ...args: P
            ) => {
              if ( typeof key === 'string' ) {
                const url = key;
                const res = await request.get( url, { noThrow: true } );

                if ( res.status >= 400 ) {
                  if ( res.body.message === 'PLAN_UPGRADE_REQUIRED' ) {
                    setPlanDialog({
                      message: 'A plan upgrade is required',
                      plan: res.body.plan as Plan,
                    });
                  }
                  return null;
                }
                
                return res.body;
              }

              return await key( ...args );
            },
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshInterval: 0,
          }
        }
      >
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <MuiPickersUtilsProvider libInstance={utcDayJs} utils={DayJsUtils}>
              <BrowserRouter
                getUserConfirmation={
                  ( message, callback ) => {
                    ReactDOM.render(
                      <>
                        <CssBaseline />
                        <ThemeProvider theme={theme}>
                          <BlockNavigationDialog
                            message={message}
                            onClickCancel={ () => {
                              callback( false ); ReactDOM.unmountComponentAtNode( container );
                            } }
                            onClickSave={ async () => {
                              const save = await getSaveAndContinueCallback();
                              await save();
                              callback( true );
                              ReactDOM.unmountComponentAtNode( container );
                            } }
                            onClickDiscardChanges={ () => {
                              callback( true ); ReactDOM.unmountComponentAtNode( container );
                            } }
                          />
                        </ThemeProvider>
                      </>,
                      container
                    );
                  }
                }
              >
                <Route path="/" render={ ( { location } ) => {
                  if ( typeof window.gtag === 'function' ) {
                    window.gtag( 'config', window.gtag.id, {
                      page_path: location.pathname + location.search,
                    } );
                  }
                  return null;
                }} />
                <Main />
              </BrowserRouter>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </SWRConfig>
    </SnackbarProvider>
  )
};

// eslint-disable-next-line import/no-anonymous-default-export
export default ( ): ReactElement => {
  
  return (
    <Suspense fallback={<></>}>
      <RecoilRoot>
        <WithRecoil />
      </RecoilRoot>
    </Suspense>
  );
};
