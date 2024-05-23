import React from "react";

import Layout from "@/pages/layout";
// 主机管理
import Hostmanage from "@/pages/layout/manage/hostManage";
// 设备管理
import DeviceManage from "@/pages/layout/manage/deviceManage";
// 用户管理
import UserManage from "@/pages/layout/manage/userManage";
// 操作日志
import OperateLog from "@/pages/layout/manage/operateLog";

export default {
  layout: <Layout />,
  h_manage: <Hostmanage />,
  d_manage: <DeviceManage />,
  u_manage: <UserManage />,
  o_log: <OperateLog />,
};
