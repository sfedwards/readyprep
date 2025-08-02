import { Box, Container, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

import { Footer } from '../../UI/Footer';

const useStyles = makeStyles( {
  root: {
    '& h2, & h3, & p': {
      color: '#111',
    },
  },
} );

export const PrivacyPolicyPage = ( ): ReactElement => {
  const classes = useStyles();

  return (
    <Box className={ classes.root } display="flex" flexDirection="column">
      <Box flex={'0 1 88vh'} pb={2}>

        <Container maxWidth="lg" style={{ paddingTop: 8 }}>

          <h2>Privacy Policy</h2>

          <p>ReadyPrep, Inc. (“we”, “us” or “Company”) is committed to protecting your privacy.</p>
          
          <p>The Company’s privacy policy ("Privacy Policy") describes the privacy practices for ReadyPrep.io (the “Site”), located at https://readyprep.io.  The Company owns and operates this Site. This Privacy Policy is part of, and herby incorporated into, the Terms and Conditions. If you do not agree with the Terms and Conditions in their entirety, please do not use the Site.</p>


          <h3>Information we collect</h3>

          <p>We may collect the following information when you register on or fill out a form on our site:</p>

          <ul>
            <li>Name</li>
            <li>E-mail address</li>
          </ul>


          <h3>Collected information uses</h3>

          <p>Any information provided by you is used solely to provide access to the Site and provide a betterservice. We may use your information for the following reasons:</p>

          <ul>
            <li>To communicate with you regarding your account and to provide you with the services you request</li>
            <li>To respond to your inquiries</li>
            <li>To send periodic e-mails and to contact you for market research purposes</li>
            <li>To improve our products or services based on your needs</li>
          </ul>

          <p>In addition, the Company may disclose information we maintain (A) if in good faith we believe that such disclosure is necessary to (1) comply with the law or legal process; (2) protect and defend our rights and property; (3) protect against misuse or unauthorized use of the Site; or (4) protect the personal safety, property, or rights of our users or the public, or (B) in connection with a corporate transaction, such as a divestiture, merger, consolidation, or asset sale.</p>


          <h3>Collected information security and confidentiality</h3>

          <p>To prevent any unauthorized access or disclosure of the personal information that we gather, we have in place electronic and managerial procedures to secure and guard this information. When our Site is accessed using a modern web browser Transport Layer Security (TLS) technology protects
information using both server authentication and data encryption to help ensure that your data is safe, secure, and available only to you.</p>

          <p>The Company agrees not to use the confidential information disclosed to it by you for any purpose other than to carry out its internal features such as recipe cost calculations, par level calculations and future features. Specifically, the Company agrees not to disclose a user’s ingredients, recipes, menu items and sales frequency.</p>


          <h3>Usage of cookies</h3>

          <p>A cookie is a small file which asks permission to be placed on your computer hard drive. Cookies allows websites to respond to you as an individual. We currently use cookies to allow you to "stay signed in", remember certain settings on your account, and track certain navigation behavior.</p>

          <p>You may choose to accept or decline cookies. Disabling cookies preferences may limit the full experience of our site.</p>


          <h3>Links to other websites</h3>

          <p>The Site may contain links to other websites of interest. We cannot be responsible for the protection and privacy of any information which you provide while visiting such sites; such sites are not governed by this privacy statement.</p>

        </Container>
      </Box>
      <Box flex={'1 0 12vh'} display="flex"><Footer /></Box>
    </Box>
  );
};
