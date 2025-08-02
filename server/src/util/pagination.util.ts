export const getSkipTake = (page: number, pageSize = 10) => {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};
