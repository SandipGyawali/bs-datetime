export const chunk = <T>(arr: Array<T>, size: number) => {
  return arr.reduce(
    (a, c, i) => {
      const index = Math.floor(i / size);
      a[index] ||= [];
      a[index].push(c);
      return a;
    },
    [] as Array<Array<T>>
  );
};
