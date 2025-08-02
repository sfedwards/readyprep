export const PLANS = [ 'BASIC', 'PREMIUM' ] as const;
export type Plan = typeof PLANS[number];

export enum Plans {
  BASIC = 1,
  PREMIUM = 2,
}
