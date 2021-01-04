export default (a: any) => {
  if (Array.isArray(a)) {
    return a;
  }
  if (typeof a !== 'undefined') {
    return [a];
  }
  return [];
};

