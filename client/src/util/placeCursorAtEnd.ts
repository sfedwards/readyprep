export const placeCursorAtEnd = function ( el: Element ): void {
  // https://stackoverflow.com/a/3866442/772035
  const range = document.createRange();
  range.selectNodeContents( el );
  range.collapse( false );
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange( range );
};
