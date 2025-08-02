import request from "../../../util/request";

export class ProfileApi {

  public async getProfile ( ) {
    const { body } = await request.get( '/profile', { noAuth: true } );
    return body;
  }
}