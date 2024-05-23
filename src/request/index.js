/*
 * @Author: 李永健
 * @Date: 2022-06-21 17:33:37
 * @LastEditors: 李永健
 * @LastEditTime: 2023-03-07 17:34:35
 * @Description: axios拦截器
 */
import { message } from "antd";
import loginStore from "@/store/user";
import { toJS } from "mobx";
import dao from "./dao";

import { removeLocal } from "@/util/storage";

dao.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

const getToken = () => {
  const userStore = new loginStore();
  const userInfo = toJS(userStore.getUser());
  return userInfo || {};
};
const removeUserInfo = () => {
  const userStore = new loginStore();
  userStore.setUser(null);
};
dao.defaults.timeout = 3000; //设置超时时间
// 请求拦截器
dao.interceptors.request.use(
  (config) => {
    const sessionId = getToken().sessionId;
    if (sessionId) {
      config.headers["session-id"] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 数据返回拦截器
dao.interceptors.response.use(
  (response) => {
    if (response.data.status.code === 401) {
      message.error("登录超时，3S后将自动跳转至登录页！！！");
      setTimeout(() => {
        //清空session用户信息
        removeLocal("userInfo");
        // 清空mobx
        removeUserInfo();
        // 跳转至登录页
        window.location.hash = "/login";
        window.onhashchange = function () {
          window.location.hash = "/login";
        };
      }, 3000);
    } else {
      return response.data;
    }
  },
  (error) => {
    message.error("请求错误，请联系管理员！！！");
    return Promise.reject(error);
  }
);

export default dao;
