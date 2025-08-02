export const ORDER_METHODS = [ 'email', 'manual' ] as const;
export type OrderMethod = typeof ORDER_METHODS[number];