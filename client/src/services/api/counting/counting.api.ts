import request from '../../../util/request';
import { CreateCountRequestDto, CreateCountResponseDto } from './interface/create-count.api.interface';
import { UpdateCountRequest } from './interface/update-count.api.interface';
export class CountingApi {

  public async updateCount ( 
    id: string,
    {
      ingredientId,
      actualQuantity,
    }: UpdateCountRequest
  ) {
    return await request.patch( 
      `/counts/${id}`, 
      {
        body: {
          ingredientId,
          actualQuantity,
        },
      },
    );
  }

  public async createCount (
    { countingListId, date }: CreateCountRequestDto
  ): Promise<CreateCountResponseDto> {
    console.log( { countingListId, date })
    const { body } = await request.post( '/counts', { body: { countingListId, date } } );

    
    return body;
  }
 
}