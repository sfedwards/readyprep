import request from "../../../util/request";

export type PosStatus = 'EXPIRED' | 'ACTIVE';

export interface ListConnectedPosResponse {
  square?: {
    status: PosStatus;
  };
  clover?: {
    status: PosStatus;
  };
}

export class PosApi {

  public async listConnectedPos ( ): Promise<ListConnectedPosResponse>
  {
    const { body } = await request.get( '/pos' );
    return body;
  }
}