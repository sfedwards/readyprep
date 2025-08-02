import request from "../../../util/request";

export class IngredientsApi {

  public async convert ( 
    id: number,
    from: {
      unit: string,
      amount: number,
    },
    to?: {
      unit: string;
    },
    conversions?: {
      unitA: string,
      unitB: string,
      amountA: string|number,
      amountB: string|number,
    }[],
  ): Promise<{ body: number }> {
    return await request.post( `/ingredients/${id}/convert`,
    {
      body: {
        from,
        to,
        conversions,
      },
    } );
  }

}