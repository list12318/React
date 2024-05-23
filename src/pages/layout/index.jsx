import React, { useRef, useEffect, useState } from "react";
import { useSafeState } from "ahooks";
import { organizeMenuList, getSysConfigPath } from "@/util/route";
import { Menu } from "antd";
import * as Icon from "@ant-design/icons";
import { DoubleLeftOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import logo from "@/assets/img/logo.png";
import CustionClockBaidu from "@/components/CustionClockBaidu";
import LogOut from "@/components/logout";
import "./index.less";

import { routerData } from "@/router/route";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuList = routerData;

  const geneMenuList = useRef(organizeMenuList(menuList) || []);
  // 顶部导航菜单
  const [navMenuItems, setMenuItems] = useSafeState([]);
  //  顶部选中的菜单
  const [navSelectedKey, setSelectedKey] = useState();

  // 模块导航菜单
  const [sysMenuList, setSysMenuList] = useState([]);
  // 左侧是否收起
  const [collapsed, setCollapsed] = useState(false);

  // 子模块选中key
  const [sysSelectedKeys, setSysSelectedKeys] = useState([]);

  // 设置默认选中
  let { pathname: url } = location;
  let targetPathArr = url.split("/");
  let turePathArr = targetPathArr.filter((v) => v !== "");
  const [firstModulePath, ...otherModulePath] = turePathArr;
  const defaultOpenKeys = useRef([...otherModulePath]);

  useEffect(() => {
    // console.log(geneMenuList.current, "geneMenuList.current");
    let navItems = geneMenuList.current.map((v) => ({
      label: v.label,
      key: v.path,
      icon: iconToElement(v.icon),
    }));

    navItems.unshift({
      label: "首页",
      key: "home",
      icon: <DoubleLeftOutlined />,
    });
    setMenuItems(navItems);
    // 设置菜单选中
    getModulePathFromRouterPath();
  }, []);

  // 设置子模块菜单图标
  const iconToElement = (name) => {
    if (Icon[name]) {
      return React.createElement(Icon && Icon[name], { style: { fontSize: "16px" } });
    } else {
      return "";
    }
  };

  // 子模块菜单整理
  const loopGeneMenuList = (data) => {
    if (!data.length) return;
    data.forEach((v) => {
      if (v.icon && typeof v.icon === "string") {
        v.icon = iconToElement(v.icon);
      }

      if (v.path) {
        v.label = v.label;
        v.key = v.path;
      }
      if (v?.children) {
        loopGeneMenuList(v.children);
      }
    });
  };

  // 顶部导航菜单点击
  const onNavMenuClick = (v) => {
    if (v.key === "home") {
      navigate("/home");
      return;
    }

    let activeModuleMenus = geneMenuList.current.find((item) => item.path === v.key);
    let menuPathList = getSysConfigPath([activeModuleMenus]);
    menuPathList = menuPathList.filter((v) => v);

    // 设置一级导航选中
    setSelectedKey(v.key);
    // 设置子模块菜单选中
    setSysSelectedKeys(menuPathList);
    navigate(`/${menuPathList.join("/")}`);

    // 查找当前子模块
    getModuleMenuByPath(v.key);
  };

  const getModuleMenuByPath = (firstPath) => {
    // 查找当前子模块
    let activeModuleMenus = geneMenuList.current.find((v) => v.path === firstPath);

    // 子模块菜单
    let moduleMenus = activeModuleMenus?.children || [];

    // console.log(moduleMenus, "moduleMenusmoduleMenus");
    // 整理菜单数据
    loopGeneMenuList(moduleMenus);

    // 添加子模块菜单
    setSysMenuList(moduleMenus);
  };

  //根据路由地址 获取模块path
  const getModulePathFromRouterPath = () => {
    let { pathname: url } = location;
    let targetPathArr = url.split("/");
    let turePathArr = targetPathArr.filter((v) => v !== "");
    const [firstModulePath, ...otherModulePath] = turePathArr;
    getModuleMenuByPath(firstModulePath);
    setSelectedKey(firstModulePath);
    setSysSelectedKeys(otherModulePath || []);
  };

  // 子模块菜单点击
  const onSysMenuClick = (v) => {
    setSysSelectedKeys(v.keyPath);
    let pathList = [navSelectedKey, ...v.keyPath.reverse()];
    // console.log(pathList, "pathList");
    let path = "";
    pathList.forEach((v) => {
      path += "/" + v;
    });
    // 点击路由跳转
    navigate(path);
  };

  return (
    <div className="layout">
      <div className="header">
        <div className="left">
          <img src={logo} alt="" />
          <span>边缘计算终端</span>
        </div>

        <div className="center">
          <Menu className="navMenu" theme="dark" onClick={onNavMenuClick} selectedKeys={[navSelectedKey]} mode="horizontal" items={navMenuItems} />
        </div>

        <div className="right">
          <CustionClockBaidu></CustionClockBaidu>
          <LogOut></LogOut>
        </div>
      </div>
      <div className="pages">
        <div className="sysMenu">
          <Menu
            inlineCollapsed={collapsed}
            forceSubMenuRender={true}
            selectedKeys={sysSelectedKeys}
            defaultOpenKeys={defaultOpenKeys.current}
            items={sysMenuList}
            onClick={onSysMenuClick}
            theme="dark"
            mode="inline"
          ></Menu>
          <div className="collapsed">
            {collapsed ? <MenuUnfoldOutlined onClick={() => setCollapsed(!collapsed)} /> : <MenuFoldOutlined onClick={() => setCollapsed(!collapsed)} />}
          </div>
        </div>

        <div className="page-content">
          <div className="page-content-box">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
