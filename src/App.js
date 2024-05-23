import React from "react";
//导入路由组件
import { HashRouter } from "react-router-dom";
import "./App.css";

import RouterElement from "@/router";

const App = () => {
  return (
    <HashRouter>
      <RouterElement></RouterElement>
    </HashRouter>
  );
};

export default App;
