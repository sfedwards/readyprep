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

export const TermsOfServicePage = ( ): ReactElement => {
  const classes = useStyles();

  return (
    <Box className={ classes.root } display="flex" flexDirection="column">
      <Box flex={'0 1 88vh'} pb={2}>

        <Container maxWidth="lg" style={{ paddingTop: 8 }}>

          <h2>Terms of Service</h2>

          <p>This website, ReadyPrep.io, (collectively referred to as the "Site" in these Terms of Service) is owned and operated by ReadyPrep, Inc. ("we", "us" or "Company"). By using and accessing our Site, you ("you", "user" or, "end user") agree to these Terms of Service (collectively, the "Terms of Service" or "Agreement").</p>
          
          <p>IF YOU DO NOT AGREE TO THE TERMS OF THIS AGREEMENT, IMMEDIATELY STOP ACCESSING THIS SITE.</p>
   
    
          <h3>Intellectual Property</h3>

          <p>You acknowledge and agree that all content and information on the Site is protected by proprietary rights and laws.</p>
          

          <h3>Disclaimer of Warranty</h3>
          
          <p>You expressly agree that use of the Site is at your sole risk and discretion. The Site and all content and other information contained on the Site is provided on an "AS IS" and "AS AVAILABLE" basis without warranty of any kind, whether express or implied. Company shall use reasonable commercial efforts consistent with prevailing industry standards to maintain the Services in a manner which minimizes errors and interruptions in the Services, however Company makes no warranty that (I) the Site and content or information will be uninterrupted, timely, secure or error-free, (II) the results that may be obtained from use of this Site will be effective, accurate or reliable. The Site may include technical mistakes, inaccuracies, or typographical errors. Company reserves the right to change the Site content and information at any time without notice. Company strives to make the nutrition labeling process as seamless as possible, but the Customer is ultimately responsible for the accuracy and compliance of Customer's food product labeling, costing, recipe management, and inventory management.</p>
          

          <h3>Limitation of Liability</h3>
          
          <p>In no event shall Company or its affiliates be liable for any indirect, incidental, special, punitive damages or consequential damages of any kind, or any damages whatsoever arising out of or related to your use of the Site, the content and other information obtained therein.</p>
          
          <p>Certain jurisdictions prohibit the exclusion or limitation of liability for consequential or incidental damages; thus, the above limitations may not apply to you.</p>
          

          <h3>Third-party Sites</h3>

          <p>The Site may contain links to other websites maintained by third-parties. These links are provided solely as a convenience and does not imply endorsement of, or association with, the party by Company.</p>
          

          <h3>Modifications to this Agreement</h3>
          
          <p>Company reserves the right to change or modify any of the terms and conditions contained in this Agreement at any time. You acknowledge and agree that it is your responsibility to review the Site and these Terms of Service from time to time. Your continued use of the Site after such modifications to this Agreement will constitute acknowledgment of the modified Terms of Service and agreement to abide and be bound by the modified Terms of Service.</p>
          
          
          <h3>Restrictions and Responsibilities</h3>
          
          <p>Customer will not, directly or indirectly: reverse engineer, decompile, disassemble or otherwise attempt to discover the source code, object code or underlying structure, ideas or algorithms of the Services or any software (including any Free Trial, live demo, and online tutorials), documentation or data related to the Services ("Software") in order to (A) build a competitive product or service, (B) build a product or service using similar ideas, features, functions or graphics of the Services, or (C) copy any ideas, features, functions or graphics of the Services; modify, translate, or create derivative works based on the Services or any Software; or license, sub-license, copy, rent, resell, distribute, lease, distribute, pledge, assign, or otherwise transfer or encumber rights to or commercially exploit the Services or any Software.</p>
          
          <p>Customer represents, covenants, and warrants that Customer will use the Services only in compliance with these terms and conditions and only in compliance with all applicable laws (including but not limited to policies and laws related to spamming, privacy, obscenity or defamation). Customer hereby agrees to indemnify and hold harmless Company against any damages, losses, liabilities, settlements and expenses (including without limitation costs and attorneys' fees) in connection with any claim or action that arises from an alleged violation of theforegoing or any other breach of this Agreement, or otherwise from Customer's use of the Services, or alleging that the Customer data infringes the intellectual property rights of, or has otherwise harmed, a third party. Although Company has no obligation to monitor the data or content provided by Customer or Customer's use of the Services, Company may do so and may remove any such content or immediately prohibit and terminate any use of the Services it believes may be (or alleged to be) in violation of the foregoing. Customer shall have sole responsibility for the accuracy, quality, integrity, legality, reliability, and appropriateness of all Customer data, including Customer data entered into any Company database, and shall not negligently or intentionally enter incorrect data into any Company database.</p>
          
          <p>Customer shall not create multiple free trial accounts.</p>


          <h3>Termination of Use</h3>
          
          <p>Company shall have the right to immediately terminate or suspend, in its discretion, your access to all or part of the Site if:</p>
          
          <ul>
            <li>Customer's payment for services has expired</li>
            <li>Customer is in probable breach of any of these Terms and Conditions or operating outsideof authorized use, determined solely at the discretion of Company</li>
          </ul>


          <h3>Governing Law</h3>
          
          <p>Any disputes arising out of or related to these Terms of Service and/or any use by you of the Site shall be governed by the laws of New York, USA, without regard to the conflicts of a laws provision therein.</p>

          
          <h3>Date of Last Update</h3>
          
          <p>This agreement was last updated on May 1, 2020.</p>

        </Container>
      </Box>
      <Box flex={'1 0 12vh'} display="flex"><Footer /></Box>
    </Box>
  );
};
