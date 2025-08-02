import { Box, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Button } from './Button';

export const PLAN_DETAILS = {
  FREE: {
    description: [
      '1 Menu',
      'Up to 10 Menu Items',
      'E-mail support',
    ],
    future: false,
  },
  BASIC: {
    description: [
      'Full access to our sophisticated Recipe Management and Food Costing module',
      'Maintain accurate pricing records for each item',
      'Develop accurate PAR estimates for all ingredients',
    ],
    future: false,
  },
  PREMIUM: {
    description: [
      'All Basic Features',
      'Connect to Square POS for accurate unit sales',
      'Daily Prep List based on actual usage',
      'Scaled recipes based on prep requirements',
      'Create and send orders directly to vendors',
    ],
    future: false,
  },
};

const useStyles = makeStyles( {
  planBox: ( props: any ) => ( {
    height: '100%',
    width: 240,
    background: '#f4f4f4',
    boxShadow: '0px 1.4945px 3.62304px rgba(0, 0, 0, 0.0243888), 0px 4.13211px 10.0172px rgba(0, 0, 0, 0.035), 0px 9.94853px 24.1177px rgba(0, 0, 0, 0.0456112), 0px 33px 80px rgba(0, 0, 0, 0.07)',
    ...(
      props.deemphasize ?
        {
          background: '#fff',
          boxShadow: '0px 1.4945px 3.62304px rgba(0, 0, 0, 0.0243888), 0px 4.13211px 10.0172px rgba(0, 0, 0, 0.035), 0px 9.94853px 24.1177px rgba(0, 0, 0, 0.0456112), 0px 33px 80px rgba(0, 0, 0, 0.07)',
        }
        : {}
    ),
  } ),
} );

const DeemphasizeableButton = ( { text, deemphasized }: { text: string, deemphasized: boolean } ): ReactElement => deemphasized ? <>{text}</> : <Button text={text} />;

export const PlanDetails = (
  props: {
    planName: keyof typeof PLAN_DETAILS;
    price: string;
    yearly: boolean;
    signupLink?: boolean;
    selectButton?: boolean;
    deemphasize?: boolean

  }
): ReactElement => {
  const { planName, price, yearly, signupLink = true, deemphasize = false } = props;
  const classes = useStyles( props );

  const details = PLAN_DETAILS[ planName ];

  return (
    <Box className={ classes.planBox } display="flex" flexDirection="column" alignItems="center" pt={deemphasize ? 2 : 3} pb={deemphasize ? 1 : 2}>
      <Typography variant="h6">{ planName }</Typography>
      <Box display="flex" alignItems="stretch" pt={1}>
        <Typography color="primary" style={{ alignSelf: 'flex-start' }}>$</Typography>
        <Typography variant="h4" color="primary">{ price }</Typography>
        <Typography color="primary" style={{ alignSelf: 'flex-end' }}>{ planName === 'FREE' ? '/forever' : yearly ? '/yr' : '/mo' }</Typography>
      </Box>
      <Box pt={1} pb={2} px={1} alignItems="flex-start" justifyContent="flex-start" textAlign="left">
        <ul style={{ padding: 0, paddingLeft: 12, fontSize: '0.95em', width: '75%', margin: 'auto' }}>
          { details.description.map( detail => <li key={Math.random()}>{ detail }</li> ) }
        </ul>
      </Box>
      { signupLink && <Box mt="auto"><Link to="/signup"><DeemphasizeableButton deemphasized={deemphasize} text="Get Started" /></Link></Box> }
      { props.selectButton &&
        <Box mt="auto"><DeemphasizeableButton deemphasized={deemphasize} text={details.future ? 'Coming Soon' : 'Select'}/></Box>
      }
    </Box>
  );
};
