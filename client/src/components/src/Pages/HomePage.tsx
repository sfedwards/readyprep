import { Box, Container, Switch, Typography, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React, { ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import * as backgroundImg from '../../../assets/background.png';
import * as headerImg from '../../../assets/header.jpg';
import screenshotImg from '../../../assets/menu-item-editor-screenshot.png';
import restaurantImg from '../../../assets/restaurant.jpg';
import spoonsImg from '../../../assets/spoons.jpg';
import request from '../../../util/request';
import { Button } from '../../UI/Button';
import { DemoWidget } from '../../UI/DemoWidget';
import { Footer } from '../../UI/Footer';
import { BuoyIcon, SuitcaseIcon, WrenchIcon } from '../../UI/Icons';
import { PLAN_DETAILS, PlanDetails } from '../../UI/PlanDetails';
import { Header } from '../Header';

const useStyles = makeStyles( {
  root: {
  },
} );

export const HomePage = ( ): ReactElement => {
  const classes = useStyles();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery( theme.breakpoints.up( 'md' ) );

  const [ allPlans, setAllPlans ] = useState<any>( {} );
  const [ yearly, setYearly ] = useState( false );
  const [ showingDemo, setShowingDemo ] = useState( false );

  const planNames = [ ...new Set( Object.keys( allPlans || {} ).map( key => key.replace( /_[^_]*$/, '' ) ) ) ] as ( keyof typeof PLAN_DETAILS )[];

  useEffect( () => {
    ( async () => {
      const { body: { plans } } = await request.get( '/billing/plans', { noAuth: true, noThrow: true } );
      setAllPlans( plans );

      // Sumo Code
      if ( process.env.NODE_ENV === 'production' && ! ( window as any ).hasLoadedSumo ) {
        ( window as any ).hasLoadedSumo = true;
        const sumoScriptEl = document.createElement( 'script' );
        const currentScriptEl = document.getElementsByTagName( 'script' )[0];
        sumoScriptEl.async=true;
        sumoScriptEl.src='//load.sumo.com/';
        sumoScriptEl.dataset.sumoSiteId='308a3cfba511808a8990dfa6d86fa5f5039a257836ba839a79b4c05b3ec4ddfe';
        currentScriptEl.parentNode?.insertBefore( sumoScriptEl, currentScriptEl );
      }
    } )();
  }, [] );


  return (
    <Box className={ classes.root } display="flex" flexDirection="column">
      <Box flex={'0 1 88vh'}>
        <Header />

        <Box margin="auto">
          <Box py={8} style={{ background: `#333 url( ${headerImg} )`, backgroundRepeat: 'no-repeat', backgroundSize: '100%', backgroundPosition: 'center' }}>
            <Container maxWidth="md">
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" px={isLargeScreen ? 11 : 2}>
                <Box>
                  <Typography variant="h2" style={{ fontSize: isLargeScreen ? '4rem' : '2rem', color: '#fff', textShadow: '#00000022 -1px 0px 2px, #00000022 0px -1px 2px, #00000022 1px 0px 2px, #00000022 0px 1px 2px' }}>Your search for a simple way to manage food costs ends here.</Typography>
                </Box>

                <Box py={2}>
                  <Typography style={{ fontSize: isLargeScreen ? '1.3rem' : '1rem', color: '#fff', textShadow: '#00000055 -4px 0px 8px, #00000055 0px -4px 8px, #00000055 4px 0px 8px, #00000055 0px 4px 8px' }}>
                    ReadyPrep helps you build and cost recipes<br />
                    simply and accurately - no calculator required.
                  </Typography>
                </Box>

                <Box pb={2}>
                  <Typography style={{ fontSize: isLargeScreen ? '1.3rem' : '1rem', color: '#fff', textShadow: '#00000055 -2px 0px 4px, #00000055 0px -2px 4px, #00000055 2px 0px 4px, #00000055 0px 2px 4px' }}>Sign up for our beta and start your day ready for success.</Typography>
                </Box>

                <Link to="/signup"><Button text="Get Started" /></Link>
              </Box>
            </Container>
          </Box>

          <Container maxWidth="md">
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" px={isLargeScreen ? 14 : 2} py={8}>
              <Box>
                <Typography variant="h3" style={{ fontSize: '3rem', fontWeight: 600, color: '#fff', textShadow: '0px 2.76726px 2.21381px rgba(0, 0, 0, 0.0196802), 0px 6.6501px 5.32008px rgba(0, 0, 0, 0.0282725), 0px 12.5216px 10.0172px rgba(0, 0, 0, 0.035), 0px 22.3363px 17.869px rgba(0, 0, 0, 0.0417275), 0px 41.7776px 33.4221px rgba(0, 0, 0, 0.0503198), 0px 100px 80px rgba(0, 0, 0, 0.07)' }}>
                  How well do you know your prep requirements?
                </Typography>
              </Box>
              <Box py={2} px={6}>
                <Typography style={{ color: '#000', fontWeight: 300 }}>ReadyPrep calculates estimated PAR levels for your prep recipes and pantry ingredients.</Typography>
              </Box>
            </Box>
          </Container>

          <div id="product"></div>

          <Box style={{ background: '#fcfcfc' }} >
            <Box style={{ background: `url( ${backgroundImg} )`, backgroundSize: '100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center bottom' }}>
              <Container maxWidth="lg" disableGutters>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box flex={1}>
                    <img alt="Restaurant spoons" src={ spoonsImg } style={{ maxWidth: '100%', margin: 'auto' }} />
                  </Box>
                
                  <Box>
                    <Typography align="center" variant="h3" style={{ fontSize: '2rem', color: '#373F41' }}>
                      { 'Designed and developed for ease of use.' }
                    </Typography>
                  </Box>
                  <Box py={2} px={6}>
                    <Typography>We help independent restaurants optimize their menus.</Typography>
                  </Box>
                </Box>

                <Box m="auto" maxWidth={1082} display="flex" flexWrap="wrap" justifyContent="space-around" textAlign="center" pt={2}>
                  <Box flex={1.2} px={2} pt={2}>
                    <Box color="#5C325C">
                      <SuitcaseIcon />
                    </Box>
                    <Typography variant="h3" color="textSecondary" style={{ fontSize: '1.4rem', fontWeight: 500 }}>{'Plate\u00a0Cost\u00a0Calculator'}</Typography>
                    <Box pt={1.5}><Typography>Upload and quickly assemble ingredients.<br />Customize units of measure.</Typography></Box>
                  </Box>
                  <Box flex={1} px={2} pt={2}>
                    <Box color="#5C325C">
                      <WrenchIcon />
                    </Box>
                    <Typography variant="h3" color="textSecondary" style={{ fontSize: '1.4rem', fontWeight: 500 }}>{'Easy\u00a0to\u00a0Use'}</Typography>
                    <Box pt={1.5}><Typography>Designed for simplicity.<br />Forgiving and customizable.</Typography></Box>
                  </Box>
                  <Box flex={1.2} px={2} pt={2}>
                    <Box color="#5C325C">
                      <BuoyIcon />
                    </Box>
                    <Typography variant="h3" color="textSecondary" style={{ fontSize: '1.4rem', fontWeight: 500 }}>{'Par\u00a0Level\u00a0Estimator'}</Typography>
                    <Box pt={1.5}><Typography>Stock what you need.<br />Make what you need.</Typography></Box>
                  </Box>
                </Box>

                <Box id="demo-container" display="flex" justifyContent="center" alignItems="center" px={isLargeScreen ? 4 : 0} pt={8}>
                  {
                    showingDemo
                      ? <DemoWidget />
                      : <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <img src={ screenshotImg } alt="ReadyPrep Demo" style={{ width: '100%' }}/>
                        <a style={{ cursor: 'pointer' }} onClick={
                          () => {
                            setShowingDemo( true );
                            const scrollTarget = document.getElementById( 'demo-container' );
                            scrollTarget && window.scrollTo( { top: scrollTarget.offsetTop, behavior: 'smooth' } );
                          }
                        }>Switch to Interactive Demo</a>
                      </Box>
                  }
                </Box>

              </Container>

              <Box style={{ }} display="flex" justifyContent="center" alignItems="center" pt={6} pb={16}>
                <Link to="/signup"><Button text="Get Started" /></Link>
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" p={4}>
              <Box flex={1} minWidth={300} p={4}><img alt="ReadyPrep - Restaurant" src={ restaurantImg } style={{ width: '100%' }}/></Box>
              <Box flex={1} pt={4} px={isLargeScreen ? 8 : 0}>
                <Typography variant="h4">Founded by restaurant owners, just like you.</Typography>
                <Box pt={4}>
                  <Typography>
                    As restaurant owners, we had important questions to answer.
                    How much does it cost to make my recipes?
                    How much do I buy and prepare to serve my customers?
                    The questions were simple, but important.
                    We needed a way to crunch the data, but spreadsheets were either too limiting or too complicated, and large, bulky software systems were too difficult to maintain.
                  </Typography>
                  <br />
                  <Typography>
                    ReadyPrep was developed by restaurant owners to help independent operators answer these important questions.
                    A simple, yet informative solution that helps us be better, more informed owners and operators.
                    Give it a try today.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <div id="pricing"></div>

            <Box display="flex" justifyContent="center" alignItems="center" pt={2} pb={1}>
              <Typography color="textSecondary" { ... ( ! yearly && { style: { fontWeight: 'bold' } } ) }>Monthly</Typography>
              <Switch color="primary" checked={yearly} onChange={ () => setYearly( ! yearly ) } />
              <Typography color="textSecondary" { ... ( yearly && { style: { fontWeight: 'bold' } } ) }>Yearly</Typography>
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" pb={18}>
              { planNames?.map( ( planName: keyof typeof PLAN_DETAILS ) => {
                const plans = {
                  monthly: allPlans[ planName + '_MONTHLY' ] || allPlans[ planName ],
                  yearly: allPlans[ planName + '_YEARLY' ] || allPlans[ planName ],
                };

                const price = ( plans[ yearly ? 'yearly' : 'monthly' ].amount/100 ).toFixed( 2 ).replace( /\.00$/, '' );
                return (
                  <PlanDetails { ... { planName, price, yearly, signupLink: true, deemphasize: planName === 'FREE' } } />
                );
              }
              )
              }
            </Box>
          </Box>
        </Box>
      </Box>
      <Box flex={'1 0 12vh'} display="flex"><Footer /></Box>
    </Box>
  );
};
