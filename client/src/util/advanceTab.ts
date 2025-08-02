export const advanceTab = ( ): void => {
  const focusableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
  const focusable = ( <HTMLElement[]>[ ...document.querySelectorAll( focusableElements ) ] ).filter( el => {
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
  } );

  if ( ! document.activeElement )
    return focusable[0]?.focus();

  const index = focusable.indexOf( document.activeElement as HTMLElement );
  if ( index > -1 ) {
    const nextElement = focusable[index + 1] || focusable[0];
    nextElement.focus();
  }
};
