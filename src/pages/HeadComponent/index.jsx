import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SettingOutlined, SearchOutlined } from "@ant-design/icons";
import "./index.less";
import logo from "@/assets/img/logo.png";
import { Decoration7, Decoration2 } from "@jiaminghi/data-view-react";
import CustionClockBaidu from "@/components/CustionClockBaidu";
import LogOut from "@/components/logout";
import { organizeMenuList } from "@/util/route";
import { routerData } from "@/router/route";
import SearchByImage from "@/pages/home/searchByImage";

const HeadComponent = () => {
  const menuList = routerData;
  const navigate = useNavigate();
  const searchByImageRef = useRef(null);
  // 点击控制台
  const configClick = () => {
    let newRouterList = organizeMenuList(menuList);

    let firstArrPathList = getSysConfigPath(newRouterList);
    firstArrPathList = firstArrPathList.filter((v) => v);
    let navigateUrl = "";
    firstArrPathList.forEach((v) => {
      navigateUrl += "/" + v;
    });
    // 跳转进入系统
    navigate(navigateUrl);
  };
  // 点击以图搜图
  const searchByImageClick = () => {
    searchByImageRef.current.getPage();
  };

  // 获取第一个系统配置的菜单路由
  const getSysConfigPath = (data) => {
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

  return (
    <>
      <div className="head-component">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>

        <div className="title">
          <Decoration7>
            <span className="text">边缘计算终端</span>
          </Decoration7>
        </div>

        {/* 控制台 */}
        <div className="time-config">
          <div onClick={searchByImageClick} className="config">
            <span className="config-box config-box-img">
              <SearchOutlined className="config-icon" />
              以图搜图
            </span>
          </div>
          <div onClick={configClick} className="config">
            <span className="config-box">
              <SettingOutlined className="config-icon" />
              控制台
            </span>
          </div>
          <CustionClockBaidu style={{ width: "280px" }}></CustionClockBaidu>
          <LogOut></LogOut>
        </div>

        {/* 上部装饰线 */}
        <div className="top-line">
          <Decoration2 style={{ width: "100%", height: "5px" }}></Decoration2>
        </div>

        {/* 底部装饰线 */}
        <div className="bottom-line">
          <Decoration2 style={{ width: "100%", height: "5px" }}></Decoration2>
        </div>
      </div>
      {/* 以图搜图 */}
      <SearchByImage ref={searchByImageRef} />
    </>
  );
};

export default HeadComponent;
