import { message } from "antd";
import { makeAutoObservable } from "mobx";
import { getLocal } from "@/util/storage";
import loginDao from "@/pages/login/service";

class LoginStore {
  constructor() {
    makeAutoObservable(this);
  }

  userInfo = getLocal("userInfo") || null; //获取用户信息

  getUser() {
    return this.userInfo;
  }
  setUser(data) {
    this.userInfo = data;
  }

  // 登录
  login(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await loginDao.login({ data });
        if (res) {
          resolve(res);
        } else {
          message.error("未知异常，请联系管理员！！！");
          reject(new Error("错误！！"));
        }
      } catch {
        message.error("未知异常，请联系管理员！！！");
        reject(new Error("错误！！"));
      }
    });
  }
  // 退出登录
  logout() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await loginDao.logout();
        if (res) {
          resolve(res);
        } else {
          message.error("未知异常，请联系管理员！！！");
          reject(new Error("错误！！"));
        }
      } catch {
        message.error("未知异常，请联系管理员！！！");
        reject(new Error("错误！！"));
      }
    });
  }
}

export default LoginStore;
