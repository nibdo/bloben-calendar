export const findInArray = (array, item, arrayValue) => {
  return new Promise((resolve) => {
    array.filter((children) => {
      if (arrayValue ? children[arrayValue] : children === item) {
        resolve(children);
      }
    });
  });
};
export const findInArrayWithIndex = (array, item, arrayValue) => {
  return new Promise((resolve) => {
    if (array.length === 0) {
      resolve({ children: undefined, index: undefined });
    }
    for (let i = 0; i < array.length; i++) {
      const children = array[i];
      if (arrayValue ? children[arrayValue] : children.id === item.id) {
        resolve({ children, index: i });
      }
      if (i + 1 === array.length) {
        resolve({ children: undefined, index: undefined });
      }
    }
  });
};
