// 操作localStorage
export const getLocal = (key) => {
  // console.log(111, isKey);
  return window.localStorage.getItem(key) ? JSON.parse(window.localStorage.getItem(key)) : null;
};
export const setLocal = (data) => {
  const { key, value } = data;
  window.localStorage.setItem(key, JSON.stringify(value));
};
export const removeLocal = (key) => {
  window.localStorage.removeItem(key);
};

// 操作sessionStorage
export const getSession = (key) => {
  return window.sessionStorage.getItem(key) ? JSON.parse(window.sessionStorage.getItem(key)) : null;
};
export const setSession = (data) => {
  const { key, value } = data;
  window.sessionStorage.setItem(key, JSON.stringify(value));
};
export const removeSession = (key) => {
  window.sessionStorage.removeItem(key);
};
