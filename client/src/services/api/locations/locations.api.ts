import request from "../../../util/request";

export class LocationsApi {

  public async addLocation (
    data: {
      name: string,
      address: string,
      phoneNumber: string
    },
  ) {
    return await request.post( 
      `/locations`, 
      {
        body: data,
      },
    );
  }

  public async updateLocationDetails (
    id: string,
    data: {
      name: string,
      address: string,
      phoneNumber: string
    },
  ) {
    return await request.patch( 
      `/locations/${id}`, 
      {
        body: data,
      },
    );
  }
 
}