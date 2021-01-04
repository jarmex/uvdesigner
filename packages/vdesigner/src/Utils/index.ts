export const ensureArray = <T>(a: any): Array<T> => {
  if (Array.isArray(a)) return a;
  if (a !== undefined) {
    return [a];
  }
  return [];
};
