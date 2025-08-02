export const formatDate = ( date: string|number|Date ): string => {
  const [ , dayOfMonth, month, year ] = new Date( date ).toUTCString().split( ' ' );
  return `${month} ${+dayOfMonth}, ${year}`;
};

export default formatDate;
