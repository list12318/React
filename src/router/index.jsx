import React, { useState, useEffect } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { organizeMenuList } from "@/util/route";
import Login from "@/pages/login";
import Home from "@/pages/home";
import NotFound from "@/components/NotFound";
import { routerData } from "./route";
import useStore from "@/store";
import { toJS } from "mobx";

const RouterElement = () => {
  const { userStore } = useStore(); //mobx
  const userInfo = toJS(userStore.userInfo);

  const menuList = routerData;

  const [routerList, setRouterList] = useState([
    {
      path: "/",
      element: <Navigate to={userInfo ? "/home" : "/login"} />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/home",
      element: <Home />,
    },
  ]);

  useEffect(() => {
    if (menuList.length) {
      let newRouterList = organizeMenuList(menuList);

      setRouterList((data) => {
        return [
          ...data,
          ...newRouterList,
          {
            path: "/*",
            element: <NotFound />,
          },
        ];
      });
    }
  }, [menuList]);

  return <>{useRoutes(routerList)}</>;
};

export default RouterElement;
