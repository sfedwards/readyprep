import { useHistory, useLocation } from 'react-router-dom';

type QueryParams = Record<string, string|number|undefined|false>;

export function useQueryState ( defaultParams: Record<string, string> ): [ { params: Record<string, string>, queryString: string }, ( params: QueryParams ) => void ] {
  const history = useHistory();
  const location = useLocation();
  
  const params = { ...defaultParams, ...Object.fromEntries( new URLSearchParams( location.search ) ) };
  const queryString = makeQueryString( params, defaultParams );

  function setQueryState ( newParams: QueryParams ): void {
    history.replace( makeQueryString( { ...params, ...newParams }, defaultParams ), location.state );
  }

  return [ { params, queryString }, setQueryState ];
}

export const makeQueryString = ( params: QueryParams, defaultParams: Record<string, string> = { } ): string => {
  const stringifiedEntries = Object.entries( params ).flatMap(
    ( [ k, v ] ) => ( v === undefined || v === false || v === defaultParams[k] ? [ ] : [ [ k, `${v}` ] ] )
  );

  return '?' + new URLSearchParams( stringifiedEntries ).toString();
};
