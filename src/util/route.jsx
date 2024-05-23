import pages from "@/router/pages";

// 递归处理接口返回的菜单 整理成对应的格式
export const organizeMenuList = (data) => {
  if (!data?.length) return;
  let newRouteList = [];
  data.forEach((v) => {
    let newItem = {};
    newItem = {
      path: v.description,
      label: v.funcName,
      icon: v.funcImg,
      key: v.id || v.funcName,
      parentkey: v.parentId,
    };
    if (v.childsList && v.childsList.length) {
      newItem.children = organizeMenuList(v.childsList);
    }

    if (!v.parentId) {
      newItem.element = pages.layout;
    }

    if (pages.hasOwnProperty(v.description)) {
      newItem.element = pages[v.description];
    }

    newRouteList.push(newItem);
  });
  return newRouteList;
};

// 获取当前子模块路由下面第一个菜单的最子层path
export const getSysConfigPath = (data) => {
  if (!data) return [];
  let resArr = data.map((v, index) => {
    if (index === 0) {
      return [v.path, ...getSysConfigPath(v.children)];
    }
  });

  if (resArr.length) {
    return resArr.flat(Infinity);
  }
};
