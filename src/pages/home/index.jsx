import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import "./index.less";
import Map2d from "@/util/Map2d";
import HeadComponent from "@/pages/HeadComponent";
import Methods from "@/pages/methods";
import DeviceDetail from "./deviceDetail";
import homeDao from "./service";
import pointIcon from "@/assets/img/pointIcon.svg";

const Home = () => {
  const mapRef = useRef(null);
  const methodRef = useRef(null);
  const deviceDetailRef = useRef(null);
  const deviceData = useRef([]); //设备数据

  // 获取
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new Map2d({
        target: "homeMapcontainer",
        mapUrl: "/MapTiles/{z}/{x}/{y}.png",
        mapCenter: [113.885701, 34.560156],
        rotation: 0,
        events: {
          clickEvent: deviceClick,
          // rightClickEvent: deviceRightClick,
        },
      });

      // console.log(111, mapRef.current);

      initData();
    }
  }, []);
  // 获取设备点位
  const initData = async () => {
    const requestData = {
      name: "",
      latitude: "",
      longitude: "",
      pageNum: 0,
      pageSize: 0,
    };
    const res = await homeDao.deviceList({ data: requestData });
    if (res && res.status.code === 200) {
      const {
        data: { list },
      } = res;

      // 添加圆
      // mapRef.current.addCircle({
      //   targetLayer: "circleLayer",
      //   circleId: "1111",
      //   center: [113.885701, 34.560156],
      //   radius: 1200,
      // });

      // 添加图形
      // mapRef.current.addGraph({
      //   targetLayer: "draphLayer",
      //   data: [
      //     [113.84827881982413, 34.5753332686963],
      //     [113.88576966350297, 34.57425936534183],
      //     [113.87931519992048, 34.559562419600766],
      //     [113.84937745289858, 34.560014671615036],
      //     [113.84827881982413, 34.5753332686963],
      //   ],
      // });
      // 设备数组
      deviceData.current = list;

      // 往地图添加设备点
      list.forEach((item) => {
        mapRef.current.addMapPoint({
          coordinates: [Number(item.longitude), Number(item.latitude)],
          pointIcon,
          pointId: item.id + "_community",
          title: `${item.name}`,
          targetLayer: "pointLayer",
          pointName: "community",
        });
      });
    }
  };
  // 设备点击
  const deviceClick = (feature, pixel) => {
    let deviceIdStr = feature.id_;
    let deviceId = deviceIdStr.split("_")[0];
    const singleDeviceData = deviceData.current.find((v) => v.id == deviceId);

    // console.log(111, deviceId, feature, pixel);
    deviceDetailRef.current.getPage(singleDeviceData);
  };
  // 设备右键点击
  const deviceRightClick = (feature, pixel) => {
    // mapRef.current.setCenter([113.872701, 34.560156]);
  };
  // 开启绘制
  const openDraw = () => {
    mapRef.current.addDraw({
      targetLayer: "draphLayer",
    });
  };
  // 编辑绘制
  const editDraw = () => {
    // mapRef.current.addDraw({
    //   targetLayer: "draphLayer",
    // });
  };

  return (
    <div className="home">
      {/* 标题组件 */}
      <HeadComponent></HeadComponent>
      {/* 地图 */}
      <div className="home-map-container" id="homeMapcontainer"></div>

      {/* 手动绘制图形测试按钮 */}
      {/* <div className="test-draw">
        <Button onClick={openDraw}>开启绘制</Button>
        <Button onClick={editDraw}>编辑</Button>
      </div> */}

      {/* 视频列表 */}
      <Methods ref={methodRef}></Methods>
      {/* 设备详情 */}
      <DeviceDetail ref={deviceDetailRef}></DeviceDetail>
    </div>
  );
};
export default Home;
