import React from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, message } from "antd";
import { PoweroffOutlined } from "@ant-design/icons";
import "./index.less";
import useStore from "@/store";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import { removeLocal } from "@/util/storage";

const LogOut = () => {
  const navigate = useNavigate();
  const { userStore } = useStore(); //mobx
  const userInfo = toJS(userStore.userInfo);
  // 退出登录
  const logout = async () => {
    const res = await userStore.logout();
    if (res && res.status.code === 200) {
      userStore.setUser(null);
      removeLocal("userInfo"); //清空local用户信息

      navigate("/login", { replace: true });
      message.success("退出成功");
    } else {
      message.error("退出失败，请重试！！！");
    }
  };

  return (
    <div className="logout">
      <p>{userInfo?.userName || "未登录"}</p>
      <Tooltip title="退出登录">
        <PoweroffOutlined onClick={logout} />
      </Tooltip>
    </div>
  );
};

export default observer(LogOut);
