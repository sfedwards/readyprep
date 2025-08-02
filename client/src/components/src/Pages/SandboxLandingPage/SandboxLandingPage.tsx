import { Box, CircularProgress, Link as MuiLink, Paper, Typography } from '@material-ui/core';
import React, { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../../UI/Button';
import { SquareConnectionButton } from '../../../UI/PosButtons/SquareButton';
import { UploadButton } from '../../../UI/UploadButton';

export const SandboxLandingPage = ( ): ReactElement => {

  const [ isUploading, setUploading ] = useState( false );

  const handleUploadStarted = (): void => {
    setUploading( true );
  };

  const handleUploadFinished = (): void => {
    setUploading( false );
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box mt={2}>
        <Typography variant="h1" style={{ fontSize: '3.75rem', fontWeight: 'normal', color: '#333' }}>Getting Started</Typography>
      </Box>
      <Box mt={6}>
        <MuiLink href="https://readyprep.io/faq"><Button style={{ padding: '8px 54px', fontWeight: 'bold' }}>Read the FAQ</Button></MuiLink>
      </Box>
      <Box mt={6} width="90%" maxWidth={960}>
        <Paper square>
          <Box display="flex" py={3} flexDirection="row">
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Box maxWidth={'80%'} textAlign="center">
                <Typography variant="h2" style={{ fontWeight: 'normal' }}>Get dirty in the Sandbox working with sample recipes and ingredients.</Typography>
              </Box>
            </Box>
            <Box flex={'0 1 30%'} display="flex" justifyContent="center" alignItems="center">
              <Link to="/items"><Button>Go to the Sandbox</Button></Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Box mt={4} width="90%" maxWidth={960}>
        <Paper square>
          <Box display="flex" flexDirection="row">
            <Box flex={1} py={3} display="flex" justifyContent="center" alignItems="center">
              <Box maxWidth={'80%'} textAlign="center">
                <Typography variant="h2" style={{ fontWeight: 'normal' }}>Connect to Square and automatically load your menu items</Typography>
              </Box>
            </Box>
            <Box flex={'0 1 30%'}>
              <SquareConnectionButton />
            </Box>
          </Box>
        </Paper>
      </Box>
      <Box mt={4} width="90%" maxWidth={960}>
        <Paper square>
          <Box display="flex" py={3} flexDirection="row">
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              <Box maxWidth={'80%'} textAlign="center">
                <Typography variant="h2" style={{ fontWeight: 'normal' }}>Import menu items, pantry and prep ingredients from a file.</Typography>
              </Box>
            </Box>
            <Box flex={'0 1 30%'} display="flex" justifyContent="center" alignItems="center">
              <Box width={190}>
                { isUploading
                  ? <CircularProgress />
                  : <UploadButton onUploadStarted={handleUploadStarted} onUploadFinished={handleUploadFinished} />
                }
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
