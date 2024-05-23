import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import "./index.less";
import Detail from "./detail";
import methodsDao from "./service";
import dayjs from "dayjs";
import { BorderBox10 } from "@jiaminghi/data-view-react";

const Methods = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({}));
  const detailRef = useRef(null);
  const timeInterRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [list, setList] = useState([]);

  // 获取
  useEffect(() => {
    if (!timeInterRef.current) {
      //默认请求一次
      initData();
      timeInterRef.current = setInterval(() => {
        initData(); //5s循环请求一次
      }, 5000);
    }
    return () => {
      clearInterval(timeInterRef.current);
    };
  }, []);

  const initData = async () => {
    const requestData = {
      pageNum: 1,
      pageSize: 50,
    };
    const res = await methodsDao.eventPage({ data: requestData });
    if (res && res.status.code === 200) {
      const {
        data: { list },
      } = res;
      const dataList = list.map((v) => {
        return {
          ...v,
          createTime: dayjs(v.createTime).format("YYYY-MM-DD HH:mm:ss"),
        };
      });

      setList(dataList);
    }
  };

  const tapChange = () => {
    setCollapsed(!collapsed);
  };

  const listChange = (v) => {
    detailRef.current.getPage(v);
  };

  return (
    <div className={`video-box ${collapsed ? "video-box-collapsed" : ""}`}>
      <div className="tapContainer">
        <div className="tap" onClick={tapChange}></div>
      </div>
      <BorderBox10 className="video-list-box" color={["#1e49be", "#2e83e3"]}>
        <div className="video-list">
          <p className="methods-title">事件列表</p>
          <ul className="list">
            {list.map((v, i) => (
              <li
                key={i}
                onClick={() => {
                  listChange(v);
                }}
              >
                <img src={v.pictureUrl} alt="" />
                <p>{v.deviceName}</p>
              </li>
            ))}
          </ul>
        </div>
      </BorderBox10>
      <Detail ref={detailRef}></Detail>
    </div>
  );
};
export default forwardRef(Methods);
