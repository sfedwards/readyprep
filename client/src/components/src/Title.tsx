import React from 'react';
import { useTranslation } from 'react-i18next';
import { withStyles, Typography, TypographyProps } from '@material-ui/core';

type Props =
  TypographyProps &
  {
    showCopyright?: boolean;
  
    classes: {
      main: string;
      copyright: string;
    };
  }
;

const styles = {
  main: {
    color: '#B7A5B7',
  },
  copyright: {
    fontSize: 6,
    verticalAlign: 'top',
  },
};

export const Title = withStyles( styles )( ( props: Props ) => {
  const { t } = useTranslation( );

  const { classes, showCopyright = true, ...typographyProps } = props;

  return (
    <Typography className={classes.main} {...typographyProps}>{t( 'strings.title' )}{ showCopyright && <sup className={classes.copyright}>©</sup> }</Typography>
  );
} );
