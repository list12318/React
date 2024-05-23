import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSafeState } from "ahooks";
import { Button, message, Tooltip, Spin, Switch } from "antd";
import { EditOutlined, DeleteOutlined, CheckOutlined, DragOutlined } from "@ant-design/icons";
import { Resizable } from "react-resizable";
import Draggable from "react-draggable";
import "react-resizable/css/styles.css";
import "./index.less";
import List from "@/components/list";
import { uuid } from "@/util";
import { cloneDeep, uniqBy } from "lodash";
import DeviceBind from "./deviceBind";
import hostDao from "./service";
import noState from "@/assets/img/noData.svg";

const HostManage = () => {
  const timeInterRef = useRef(null); //轮询ref
  const imgRef = useRef(null); //图片ref
  const boxRef = useRef(null); //画布ref
  const deviceBindRef = useRef(null); //绑定设备ref

  const [deviceList, setDeviceList] = useState([]); //设备列表
  // 左侧list列表
  const [list, setList] = useState([]);
  const [listActive, setListActive] = useState(null); //列表选中

  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState(null); //图片地址
  // 框列表
  const [frameList, setFrameList] = useState([
    // {
    //   frontId: "21291339",
    //   deviceId: 26,
    //   range: {
    //     width: 279,
    //     height: 127,
    //     left: 50,
    //     top: 42,
    //   },
    // },
    // {
    //   frontId: "52429620",
    //   deviceId: 22,
    //   range: {
    //     width: 368,
    //     height: 226,
    //     left: 200,
    //     top: 188,
    //   },
    // },
  ]);

  const [boxStyle, setBoxStyle] = useState({ width: 0, height: 0 }); // 画布style，与img大小永远保持一致
  const [frameStyle, setFrameStyle] = useState(null); //绘制元素 style
  const [itemActive, setItemActive] = useState(null); //选中框

  useEffect(() => {
    initDeviceList(); //获取设备列表
    getHostList(); //获取主机列表

    // 画布与图片大小永远保持一致
    const observer = new ResizeObserver((entries) => {
      const lastEntry = entries[entries.length - 1];
      const { width, height } = lastEntry.contentRect;

      setBoxStyle({ width, height }); // 修改画布宽高
    });
    // 启用图片宽度监听
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    return () => {
      // 轮询查主机列表状态定时器
      if (timeInterRef.current) {
        clearInterval(timeInterRef.current);
      }

      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  // 画布 大小变化后，框的大小及其位置也要等比例改变,useLayoutEffect会在render前执行，故使用此Hooks
  useLayoutEffect(() => {
    if (boxRef.current) {
      const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();

      const mapList = frameList.map((v) => {
        const [left, top, width, height] = v.proportion;

        const L = left * boxWidth; //距离左侧距离
        const T = top * boxHeight; //距离顶部距离
        const W = width * boxWidth; //元素宽度
        const H = height * boxHeight; //元素高度

        return {
          ...v,
          range: { left: L, top: T, width: W, height: H },
        };
      });
      setFrameList(mapList);
    }
  }, [boxStyle]);

  // 轮询查主机状态
  useEffect(() => {
    if (!timeInterRef.current && list.length) {
      timeInterRef.current = setInterval(() => {
        forHostList(); //5s循环请求一次
      }, 5000);
    }
  }, [list]);

  // 获取主机列表
  const getHostList = async () => {
    const res = await hostDao.hostList();
    if (res && res.status.code === 200 && res.data.length) {
      const mapList = res.data.map((v) => {
        return {
          ...v,
          label: v.name,
        };
      });
      setList(mapList);
      slideChange(mapList[0]);
    }
  };

  // 轮询查主机列表
  const forHostList = async () => {
    const res = await hostDao.hostList();
    if (res && res.status.code === 200 && res.data.length) {
      const mapList = cloneDeep(list).map((v) => {
        const thisData = res.data.find((h) => h.id === v.id);
        return {
          ...v,
          state: thisData.state,
          connectionState: thisData.connectionState,
        };
      });
      setList(mapList);
    }
  };

  // 主机列表切换
  const slideChange = (data) => {
    setListActive(data.id); //设置左侧列表选中
    setImgUrl(data.pictureUrl); //设置图片地址
    getBoxList(data.id); //查询框列表
  };

  // 获取框列表
  const getBoxList = async (id) => {
    setLoading(true);
    const res = await hostDao.boxList({ pathParams: { hostId: id } });
    if (res && res.status.code === 200) {
      const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();
      const mapList = res.data.map((v) => {
        const [left, top, width, height] = v.coordinate.split(",");
        const L = left * boxWidth; //距离左侧距离
        const T = top * boxHeight; //距离顶部距离
        const W = width * boxWidth; //元素宽度
        const H = height * boxHeight; //元素高度

        return {
          frontId: uuid(8, 10),
          deviceId: v.deviceId,
          range: {
            left: L,
            top: T,
            width: W,
            height: H,
          },
          proportion: v.coordinate.split(","), //存储比例，图片缩放时使用
        };
      });
      setFrameList(mapList);
    }
    setLoading(false);
  };

  // 获取设备列表
  const initDeviceList = async () => {
    const requestData = {
      name: "",
      latitude: "",
      longitude: "",
      pageNum: 0,
      pageSize: 0,
    };
    const res = await hostDao.deviceList({ data: requestData });
    if (res && res.status.code === 200) {
      setDeviceList(res.data.list);
    }
  };

  // 点击开始
  const startDraw = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = boxRef.current.getBoundingClientRect();
    const range = {
      left: clientX - left,
      top: clientY - top,
      width: 0,
      height: 0,
    };
    // 开始画框
    const mousemove = (evt) => {
      let { clientX: x, clientY: y } = evt;
      if (x < left) {
        x = left;
      }
      if (y < top) {
        y = top;
      }

      if (x > left + width) {
        x = left + width;
      }
      if (y > top + height) {
        y = top + height;
      }

      const distanceX = clientX - x;
      const distanceY = clientY - y;
      range.width = Math.abs(distanceX);
      range.height = Math.abs(distanceY);
      if (distanceX >= 0) {
        range.left = clientX - left - Math.abs(distanceX);
      }
      if (distanceY >= 0) {
        range.top = clientY - top - Math.abs(distanceY);
      }

      // console.log(range);

      setFrameStyle(cloneDeep(range));
    };
    // 松手，结束画框
    const mouseup = (e) => {
      if (range.width >= 60 && range.height >= 60) {
        // 打开绑定设备弹窗
        bindDevice(range);
      } else {
        setFrameStyle(null);
        message.warning("最小绘制宽高为60x60，请拖拽绘制");
      }

      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    };

    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
  };
  // 新增绑定设备
  const bindDevice = (data) => {
    const { left, top, width, height } = data;
    const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();

    const addItem = {
      frontId: null,
      deviceId: null,
      range: data,
      proportion: [left / boxWidth, top / boxHeight, width / boxWidth, height / boxHeight],
    };
    setDeviceDisabled(); //设备选择disabled设置
    deviceBindRef.current.getPage(addItem);
  };
  // 编辑框
  const editItem = (e, data) => {
    e.stopPropagation();

    setDeviceDisabled(data.deviceId); //设备选择disabled设置
    deviceBindRef.current.getPage(data);
  };
  //设备只允许绑定一次，如已绑定则设置为disabled
  const setDeviceDisabled = (deviceId) => {
    let disabledData = frameList.map((v) => v.deviceId);

    // 编辑
    if (deviceId) {
      disabledData = disabledData.filter((h) => h !== deviceId);
    }
    const mapList = deviceList.map((v) => ({ ...v, disabled: disabledData.includes(v.id) }));

    setDeviceList(mapList);
  };
  // 新增/编辑 完成绑定设备
  const emitBind = (data) => {
    // 弹窗点确定
    if (data) {
      const { frontId } = data;
      const mapList = cloneDeep(frameList);
      // 新增
      if (!frontId) {
        mapList.push({
          ...data,
          frontId: uuid(8, 10),
        });
      }
      // 编辑
      else {
        const editIndex = mapList.findIndex((v) => v.frontId === frontId);
        mapList[editIndex] = {
          ...mapList[editIndex],
          ...data,
        };
      }
      setFrameList(mapList);
    }
    setFrameStyle(null);
  };
  // 删除框
  const deleteItem = (e, data) => {
    e.stopPropagation();
    const { frontId } = data;

    const mapList = cloneDeep(frameList).filter((v) => v.frontId !== frontId);

    setFrameList(mapList);
  };
  // 框点击
  const itemChange = (v) => {
    setItemActive(v.frontId);
  };
  // 拖拽完毕
  const boxDrag = (e, data, item) => {
    const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();

    const { x, y } = data;
    // console.log("拖位置呢---", x, y);
    const { frontId } = item;
    const dragIndex = frameList.findIndex((v) => v.frontId === frontId);
    const mapList = cloneDeep(frameList);

    mapList[dragIndex] = {
      ...mapList[dragIndex],
      range: {
        ...mapList[dragIndex].range,
        left: x,
        top: y,
      },
      proportion: [x / boxWidth, y / boxHeight, ...mapList[dragIndex].proportion.slice(2)],
    };
    setFrameList(mapList);
  };
  // 框大小正在拖拽
  const onResize = (event, { size }, item) => {
    event.stopPropagation();

    const { width, height } = size;
    const { frontId } = item;

    const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();

    const mapList = cloneDeep(frameList).map((v) => {
      if (v.frontId === frontId) {
        v = {
          ...v,
          range: {
            ...v.range,
            width,
            height,
          },
          proportion: [...v.proportion.slice(0, 2), width / boxWidth, height / boxHeight],
        };
      }
      return v;
    });

    setFrameList(mapList);
  };
  //  保存
  const save = async (e, activeData) => {
    e.stopPropagation();

    if (isOverlap()) {
      return; //框重叠了
    }

    const boxData = assemble();
    // console.log("boxData", boxData);

    const res = await hostDao.saveBox({ data: { hostId: listActive, screens: boxData } });
    if (res && res.status.code === 200) {
      slideChange(activeData); //刷新数据
      message.success("保存成功");
    } else {
      message.error("保存失败，请重试");
    }
  };
  //  启用/禁用
  const enable = async (checked, e) => {
    e.stopPropagation();
    // 是否重叠
    if (isOverlap()) {
      return;
    }
    const boxData = assemble();

    const stateCn = checked ? "启用" : "禁用";

    const res = await hostDao.saveBox({ data: { hostId: listActive, screens: boxData } });
    if (res && res.status.code === 200) {
      const statusRes = await hostDao.enableHost({ data: { id: listActive, state: checked ? 1 : 0 } });
      if (statusRes && statusRes.status.code === 200) {
        // 修改开关状态
        const mapList = cloneDeep(list);
        const checkIndex = mapList.findIndex((v) => v.id === listActive);
        mapList[checkIndex].state = checked;
        setList(mapList);

        slideChange(mapList[checkIndex]); //刷新数据
        message.success(`${stateCn}成功`);
      } else {
        message.error(`${stateCn}失败，请重试`);
      }
    } else {
      message.error(`${stateCn}失败，请重试`);
    }
  };
  // 入参数据组装
  const assemble = () => {
    // console.log("list-------", frameList, v);
    const { width: boxWidth, height: boxHeight } = boxRef.current.getBoundingClientRect();
    const boxData = frameList.map((v) => {
      const {
        deviceId,
        range: { left, top, width, height },
      } = v;

      const L = left / boxWidth; //距离左侧距离
      const T = top / boxHeight; //距离顶部距离
      const W = width / boxWidth; //元素宽度
      const H = height / boxHeight; //元素高度
      const coordinates = [L, T, W, H].join(",");

      return {
        hostId: listActive,
        deviceId,
        coordinate: coordinates,
      };
    });
    return boxData;
  };
  // 框防重叠
  const isOverlap = () => {
    const list = cloneDeep(frameList);
    const overlappingElements = [];

    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const rect1 = list[i].range;
        const rect2 = list[j].range;

        if (
          rect1.left < rect2.left + rect2.width &&
          rect1.left + rect1.width > rect2.left &&
          rect1.top < rect2.top + rect2.height &&
          rect1.top + rect1.height > rect2.top
        ) {
          // 发生重叠
          overlappingElements.push(list[i], list[j]);
        }
      }
    }

    const overlap = uniqBy(overlappingElements.map((v) => v.frontId));
    // 如果框之间有位置重叠，则边框标红
    if (overlap.length) {
      const mapList = cloneDeep(frameList).map((v) => ({ ...v, isOverlap: overlap.includes(v.frontId) }));
      setFrameList(mapList);
      message.warning("您绘制的框之间有重叠，已为您标为红色，请编辑后重试");
      return true;
    }
    return false;
  };

  // DOM渲染

  // 左侧列表render
  const listRender = (v) => {
    const disabledCondition = listActive !== v.id || v.connectionState !== 1;
    const connectionStateCn = v.connectionState === 1 ? "已连接" : "未连接";
    const connectionStateColor = v.connectionState === 1 ? "#67c23a" : "#F56C6C";
    return (
      <div className="left-render">
        <div className="item-left">
          <p title={v.label}>{v.label}</p>
        </div>
        <div className="item-right">
          <Tooltip title={connectionStateCn}>
            <span className="state" style={{ backgroundColor: connectionStateColor }}></span>
          </Tooltip>
          <Tooltip title="保存">
            <Button
              type="primary"
              shape="circle"
              icon={<CheckOutlined />}
              disabled={disabledCondition}
              onClick={(e) => {
                save(e, v);
              }}
            />
          </Tooltip>
          <Tooltip title="启用/禁用">
            <Switch size="small" disabled={disabledCondition} checked={v.state} onChange={enable} />
          </Tooltip>
        </div>
      </div>
    );
  };

  // 框style
  const boxItemStyle = (v) => ({
    ...v.range,
    left: 0, //由Draggeable接管位置渲染，故box-item类不需要渲染left和top
    top: 0,
    borderWidth: itemActive === v.frontId ? "2px" : "1px", //边框宽度
    borderColor: v.isOverlap ? "#F56C6C" : "#409eff", //边框色，重叠时将变为红色
    zIndex: itemActive === v.frontId ? 500 : 100,
  });

  return (
    <div className="host-manage">
      <div className="manage-list">
        <List title="图像采集" filterable renderList={listRender} active={listActive} data={list} onChange={slideChange}></List>
      </div>
      <div className="manage-img">
        <Spin spinning={loading} tip="正在加载中...">
          <img src={imgUrl} ref={imgRef} alt="" />
          <div className="canvas" style={boxStyle} ref={boxRef} onMouseDown={startDraw}>
            {/* 绘制div */}
            {frameStyle && (
              <div className="drag-box" style={frameStyle}>
                <div className="border-box"></div>
              </div>
            )}
            {/* 绘制完毕展示的div */}
            {frameList.map((v) => {
              const {
                frontId,
                deviceId,
                range: { width, height, left, top },
              } = v;
              const deviceName = deviceList.find((h) => h.id === deviceId)?.name;
              const isCurrent = itemActive === v.frontId;
              const resizeHandles = isCurrent ? ["s", "w", "e", "sw", "nw", "se", "ne"] : [];

              return (
                <Draggable
                  key={frontId}
                  bounds="parent"
                  handle={".anticon-drag"}
                  position={{ x: left, y: top }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onStop={(e, data) => boxDrag(e, data, v)}
                >
                  <Resizable
                    width={width}
                    height={height}
                    minConstraints={[60, 60]}
                    maxConstraints={[boxStyle.width - left, boxStyle.height - top]} //最大宽度和高度，实时减
                    resizeHandles={resizeHandles}
                    onResize={(event, { size }) => onResize(event, { size }, v)}
                  >
                    <div className="box-item" style={boxItemStyle(v)} onClick={() => itemChange(v)}>
                      <Tooltip placement="topLeft" title={deviceName}>
                        <p className="text">{deviceName && width > deviceName.length * 18 ? deviceName : null}</p>
                      </Tooltip>
                      <div className="dragger" style={{ display: isCurrent ? "flex" : "none" }}>
                        <DragOutlined />
                      </div>
                      <div className="config" style={{ display: isCurrent ? "flex" : "none" }}>
                        <EditOutlined title="编辑" onClick={(e) => editItem(e, v)} />
                        <DeleteOutlined title="删除" onClick={(e) => deleteItem(e, v)} />
                      </div>
                    </div>
                  </Resizable>
                </Draggable>
              );
            })}
          </div>
        </Spin>
        {/* 暂无数据 */}
        {list.length && list.find((h) => h.id === listActive)?.connectionState === 0 && (
          <div className="no-state" style={{ height: boxStyle.height ? boxStyle.height : "100%" }}>
            <img src={noState} alt="" />
            <p>当前主机未连接，请先连接...</p>
          </div>
        )}
      </div>

      {/* 设备绑定 */}
      <DeviceBind ref={deviceBindRef} deviceList={deviceList} emitBind={emitBind}></DeviceBind>
    </div>
  );
};

export default HostManage;
