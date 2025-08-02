import React, { ReactElement } from 'react';

import titleImg from '../../assets/ReadyPrep.svg';

export const Logo = ( props: React.ImgHTMLAttributes<HTMLImageElement> ): ReactElement => <img src={ titleImg } alt="ReadyPrep" {...props} />;
