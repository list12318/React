import React from "react";
import ReactDOM from "react-dom";
// 根组件
import App from "./App";
// antd desgin
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "antd/dist/antd.css";
import "./normal.css";

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
  document.getElementById("root")
);
