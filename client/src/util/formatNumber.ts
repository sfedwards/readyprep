export const formatNumber = ( x: number ): string => {
  return x.toFixed( 2 ).replace( /(\..[^0]*)0*/, '$1' );
};

export default formatNumber;
