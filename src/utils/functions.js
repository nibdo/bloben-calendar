import { parseISO, format, formatISO,  } from 'date-fns';
import { BASE_URL } from 'bloben-common/globals/url';

export const fetchData = async (path) => {
  return new Promise(async (resolve, reject) => {
    const url = BASE_URL + path;
    let response = await fetch(url, { method: 'GET', credentials: 'include' });
    let data = await response.json();
    resolve(data);
  });
};

export const exportData = async (data) => {
  const fileName = 'file';
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const href = await URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const changeStatusbarColor = (color) => {
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute('content', color);
};


export const sortData = (data, rule) => {
  let sortedData;
  if (rule === 'created') {
    sortedData = data.sort((a, b) => {
      return parseISO(a.created) - parseISO(b.created);
    });
  } else if (rule === 'updated') {
    sortedData = data.sort((a, b) => {
      return parseISO(a.updated) - parseISO(b.updated);
    });
  } else if (rule === 'name') {
    sortedData = data.sort((a, b) => {
      let aItem = a.text
        ? a.text.slice(0, 1).toUpperCase()
        : a.list.slice(0, 1).toUpperCase();
      let bItem = b.text
        ? b.text.slice(0, 1).toUpperCase()
        : b.list.slice(0, 1).toUpperCase();
      return aItem.localeCompare(bItem);
    });
  }
  return sortedData;
};
export const sortDataPromise = (data, rule) => {
  return new Promise((resolve) => {
    let sortedData;
    if (rule === 'created') {
      resolve(
        data.sort((a, b) => {
          return parseISO(b.created) - parseISO(a.created);
        })
      );
    } else if (rule === 'updated') {
      resolve(
        data.sort((a, b) => {
          return parseISO(b.updated) - parseISO(a.updated);
        })
      );
    } else if (rule === 'name') {
      resolve(
        data.sort((a, b) => {
          let aItem = a.text.slice(0, 1).toUpperCase();
          let bItem = b.text.slice(0, 1).toUpperCase();
          return aItem.localeCompare(bItem);
        })
      );
    }
  });
};

export const renderIcon = (icon) => {
  return icon;
};
