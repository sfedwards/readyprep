import request from "../../../util/request";

export class CountingListsApi {

  public async create (
    data: {
      name: string,
      ingredients: {
        id: number;
        unit: string;
      }[],
    },
  ) {
    return await request.post( 
      `/counting-lists`, 
      {
        body: data,
      },
    );
  }
 
  public async save (
    id: string,
    data: {
      name: string,
      ingredients: {
        id: number;
        unit: string;
      }[],
    },
  ) {
    await request.put( 
      `/counting-lists/${id}`, 
      {
        body: data,
      },
    );
  }

  public async delete (
    id: string,
  ) {
    await request.delete(
      `/counting-lists/${id}`,
    );
  }

  public async append (
    id: string,
    data: {
      ingredients: {
        id: number;
        unit?: string;
      }[],
    }, 
  ) {
    await request.post( 
      `/counting-lists/${id}/add`, 
      {
        body: data,
      },
    );
  }

  public async getListSummaryForIngredient (
    scopedId: number,
  ) {
    return await request.get(
      `/ingredients/${scopedId}/counting-list`,
      {
        noThrow: true,
      },
    );
  }

}