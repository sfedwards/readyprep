export class GetUsageRequest {}

export class GetUsageResponse {
  constructor(usage: any) {
    Object.assign(this, usage);
  }
}
