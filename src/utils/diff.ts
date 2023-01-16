import _ from 'lodash';

const diff = <T extends object>(
  currentObj: object,
  newObj: T,
): Partial<T> | null => {
  const getdiff = Object.entries(newObj).filter(
    ([, val]) => !Object.values(currentObj).includes(val),
  );
  const formattedObj = Object.fromEntries(getdiff);

  return _.isEmpty(formattedObj) ? null : (formattedObj as T);
};
export default diff;
