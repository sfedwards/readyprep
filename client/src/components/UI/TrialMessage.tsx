import React, { ReactElement, useState } from 'react';

import ChangePlanDialog from '../src/ChangePlanDialog';
import { Message } from './Message';

const HOURS_TO_HIDE_FOR = 22;

export const TrialMessage = ( props: { trialEnd: Date } ): ReactElement => {
  const supressedUntil = new Date( window.localStorage.getItem( 'SUPRESS_TRIAL_END_MESSAGE_UNTIL' ) || 0 );

  const [ showing, setShowing ] = useState( +supressedUntil < Date.now() );
  const [ showingDialog, setShowingDialog ] = useState( false );

  const trialHoursRemaining = ( +props.trialEnd - Date.now() )/1000/60/60;
  const trialRemainingMessage = trialHoursRemaining <= 18
    ? 'Your trial ends today. '
    : <>You have <strong>{ Math.round( trialHoursRemaining/24 ) } days</strong> remaining in your trial. </>
  ;

  const handleClose = ( ): void => {
    const supressUntil = new Date( Date.now() + 1000*60*60*HOURS_TO_HIDE_FOR );
    window.localStorage.setItem( 'SUPRESS_TRIAL_END_MESSAGE_UNTIL', supressUntil.toISOString() );
    setShowing( false );
  };

  return ( <>
    <Message showing={showing} onClose={ handleClose }>
      { trialRemainingMessage }
      <a href="#" onClick={ () => setShowingDialog( true ) }>Subscribe Now.</a>
    </Message>
    <ChangePlanDialog
      showing={showingDialog}
      message={ false }
      allowClose={ true }
      onConfirm={ () => setShowingDialog( false ) }
      onClose={ () => setShowingDialog( false ) }
    />
  </> );
};

export default TrialMessage;
