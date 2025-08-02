const BASE_PATH = '/api';

const methods = {
  get: <T> ( path: string, options: any = {} ): Promise<any> => request<T>( path, { method: 'GET', ...options } ),
  post: <T> ( path: string, options: any = {} ): Promise<any> => request<T>( path, { method: 'POST', ...options } ),
  patch: <T> ( path: string, options: any = {} ): Promise<any> => request<T>( path, { method: 'PATCH', ...options } ),
  put: <T> ( path: string, options: any = {} ): Promise<any> => request<T>( path, { method: 'PUT', ...options } ),
  delete: <T> ( path: string, options: any = {} ): Promise<any> => request<T>( path, { method: 'DELETE', ...options } ),
};

export default methods;

async function request<T> ( path: string, options: any ): Promise<any> {
  const { headers: extraHeaders, body: requestBody, parseBody = true, noThrow = false, noAuth = false, ...otherOptions } = options;
  const token = document.cookie.match( /CSRF=([^ ;]*)/ )?.[1];

  const res = await fetch( `${BASE_PATH}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': token,
      ...extraHeaders,
    },
    body: JSON.stringify( requestBody ),
    ...otherOptions,
  } );

  const { status } = res;

  if ( status === 403 && ! noAuth ) {
    // TODO: Don't check token, check response and send message
    window.location.replace( `/login${token ? '?expired&next=' + window.location.href : ''}` );
    await new Promise( () => {} );
  }
  
  const result: { status: number, res: Response, body?: T } = { status, res };
  
  if ( parseBody )
    result.body = await res.json();

  if ( ! noThrow && 400 <= status )
    throw Object.assign( new Error( '' ), result.body );

  return result;
}
