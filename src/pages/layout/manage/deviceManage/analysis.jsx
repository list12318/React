import React, { forwardRef, useState, useImperativeHandle, useEffect, useRef } from "react";
import { Modal, Checkbox, message, Tooltip, Switch, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import List from "@/components/list";
import "./analysis.less";
import deleteIcon from "@/assets/img/delete-icon.svg";
import noCheckedEvent from "@/assets/img/noData.svg";
import { cloneDeep, uniqBy } from "lodash";
import { fabric } from "fabric";
import { uuid, imgUrlEffective } from "@/util";
import { isIntersect, convertFormat } from "@/util/lines";
import { polygonPositionHandler, anchorWrapper, actionHandler, onMoving } from "./fabric";
import deviceDao from "./service";

const Analysis = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const imgRef = useRef(null); //图片dom ref

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [list, setList] = useState([]); //列表
  const [listActive, setListActive] = useState(null); //列表选中
  const [allowDraw, setAllowDraw] = useState(false); //是否允许编辑

  const [imgUrl, setImgUrl] = useState(null); //图片
  const [boxStyle, setBoxStyle] = useState({ width: 0, height: 0 }); // 画布宽高

  // 框相关
  const canvas = useRef(null); //画布实例
  const canvasPolygon = useRef(null); //当前绘制控件
  const pointList = useRef(null); //点集合

  useEffect(() => {
    //初始化画布
    const { width, height } = boxStyle;
    if (width && height) {
      initCanvas();
    }
  }, [boxStyle]);

  useEffect(() => {
    // 判断图片是否有效
    const checkImgUrl = async () => {
      if (imgUrl) {
        try {
          await imgUrlEffective(imgUrl);
          setAllowDraw(true);
        } catch {
          setAllowDraw(false);
        }
      }
    };
    checkImgUrl();
  }, [imgUrl]);

  // 框回显
  useEffect(() => {
    const { width, height } = boxStyle;

    if (listActive !== null && width && height && list.length) {
      const findObj = cloneDeep(list).find((v) => v.id === listActive);
      if (findObj) {
        const relationList = findObj.relationList.map((v) => {
          return {
            ...v,
            points: findObj.isService ? v.points.map((h) => ({ x: h.x * width, y: h.y * height })) : v.points,
          };
        });

        // console.log("列表切换", relationList);

        // 先清空画布已有框
        canvas.current.clear();

        pointList.current = relationList;

        //回显框
        generatePolygon(relationList);
      }
    }
  }, [listActive, boxStyle, list]);

  // 打开弹窗
  const getPage = (data) => {
    setOpen(true);
    setEditData(data); //当前表格数据
    getList(data); //查询事件类型列表
    getImgUrl(data); //查询图片地址
  };
  //查询底图地址
  const getImgUrl = async (data) => {
    const res = await deviceDao.getImgUrl({ pathParams: { deviceId: data.id } });
    if (res && res.status.code === 200) {
      setImgUrl(res.data);
    }
  };
  // 查询列表数据
  const getList = async (data) => {
    const res = await deviceDao.eventTypeList();
    if (res && res.status.code === 200) {
      const mapList = res.data.map((v) => ({ id: v.id, label: v.name }));
      // 查询所有列表数据的框
      getBox(data, mapList);
    }
  };
  // 查询所有框
  const getBox = async (data, typeList) => {
    const res = await deviceDao.getDeviceEventRs({
      pathParams: { deviceId: data.id },
    });
    if (res && res.status.code === 200) {
      const boxList = res.data.map((v) => ({ ...v, relationList: JSON.parse(v.relationJson || "[]") }));

      const eventList = typeList.map((v) => {
        const typeBox = boxList.find((h) => h.eventTypeId === v.id);
        return {
          ...v,
          isService: true,
          state: typeBox?.state === 1 ?? false,
          relationList: typeBox ? typeBox.relationList : [],
        };
      });

      setList(eventList);
      slideChange(eventList[0]);
    }
  };

  // 列表选中切换
  const slideChange = (data) => {
    setListActive(data.id); //设置左侧列表选中
  };

  // 开关切换
  const enable = (id, checked) => {
    const editIndex = list.findIndex((v) => v.id === id);
    const mapList = cloneDeep(list);
    mapList[editIndex].state = checked;
    setList(mapList);
  };
  // 单个保存
  const save = async (e, activeData) => {
    e.stopPropagation();

    const points = cloneDeep(pointList.current || []);

    const { intersectResult: isIntersect, overlapIds } = hasIntersect(points);

    // 线段相交后边框变为红色且不允许保存,否则为默认蓝色
    if (isIntersect) {
      const allPolygons = canvas.current.getObjects();
      allPolygons.forEach((v) => {
        const isOverlap = overlapIds.includes(v.id); //是否单个多边形内有线段相交
        const color = isOverlap ? "#D32F2F" : "#409eff"; //如果相交，则改变边框颜色
        v.set({
          stroke: color, //线颜色
          cornerColor: color, //拖拽控件颜色
        });
      });

      canvas.current.requestRenderAll(); // 重新渲染canvas

      return message.error("单个多边形不允许线段相交，已为您标为红色，请修改后重试！！！");
    }

    const mapList = cloneDeep(list);
    const editIndex = mapList.findIndex((v) => v.id === activeData.id);

    mapList[editIndex].relationList = pointList.current;
    mapList[editIndex].isService = false;

    setList(mapList);
    message.success("保存成功");
  };
  // 判断线段是否相交
  const hasIntersect = (data = []) => {
    const points = cloneDeep(data);
    const overlapIds = [];

    points.forEach(({ id, points }) => {
      const lines = convertFormat(points);
      // 将起点和终点连接，形成闭合多边形
      lines.push({ start: lines[0].start, end: lines[lines.length - 1].end });

      // 使用标记变量来跟踪是否存在相交线段
      let linesOverlap = lines.some((line, i) => {
        return lines.slice(i + 1).some((otherLine) => isIntersect(line, otherLine));
      });

      // 如果存在相交线段，记录多边形ID
      if (linesOverlap) {
        overlapIds.push(id);
      }
    });

    return { intersectResult: overlapIds.length > 0, overlapIds };
  };

  // 初始化画布
  const initCanvas = () => {
    canvas.current = new fabric.Canvas("canvasRef", {
      defaultCursor: "pointer", //画布默认cursor
      selectionColor: "transparent", //选择时颜色
      selectionBorderColor: "transparent", //选择时边框色
      hoverCursor: "transparent", //鼠标在画布上的样式
      FX_DURATION: 100, //删除元素的动画时长
      fireRightClick: true, // 启用右键
      stopContextMenu: true, // 禁止默认右键菜单
      hasBorders: false,
    });

    canvas.current.on("mouse:down", onMouseDown); //鼠标点击，打点开始绘制
    canvas.current.on("mouse:move", onMouseMove); //鼠标移动，开始绘制
    canvas.current.on("object:moving", onMoving); //边界处理，防止拖出去
    canvas.current.on("mouse:dblclick", finishPolygon); //双击结束绘制
    canvas.current.on("object:added", onObjectAdded); //监听canvas新增框
    canvas.current.on("object:modified", dragPllygon); //拖动位置结束，更新数据
  };
  // 监听鼠标按下事件，打点
  const onMouseDown = (opt) => {
    var target = canvas.current.findTarget(opt.e);

    // 在已有框点击而不是空白区域
    if (target && target.id) {
      canvas.current.setActiveObject(target); //当前控件设置为活跃状态
      opt.e.stopPropagation(); // 阻止事件冒泡
      return;
    }
    if (canvasPolygon.current === null) {
      createPolygon(opt); //新画框
    } else {
      changeCurrentPolygon(opt); //已点击过一次，连点更新框
    }
  };
  // 监听鼠标移动事件,开始绘制
  const onMouseMove = (opt) => {
    if (canvasPolygon.current) {
      changePolygonBelt(opt);
    }
  };
  // 创建多边形
  const createPolygon = (opt) => {
    canvasPolygon.current = new fabric.Polygon(
      [
        { x: opt.absolutePointer.x, y: opt.absolutePointer.y },
        { x: opt.absolutePointer.x, y: opt.absolutePointer.y },
      ],
      {
        fill: "rgba(255, 255, 255, 0.2)", //绘制时背景色
        stroke: "#409eff", //绘制时边框色
        objectCaching: false, //不使用缓存
        hasControls: false, //绘制时不添加control控件
      }
    );
    canvas.current.add(canvasPolygon.current);
  };
  // 线
  const changePolygonBelt = (opt) => {
    let points = canvasPolygon.current.points;
    // console.log("正在移动", points);
    points[points.length - 1].x = opt.absolutePointer.x;
    points[points.length - 1].y = opt.absolutePointer.y;
    canvas.current.requestRenderAll();
  };
  // 连续画线
  const changeCurrentPolygon = (opt) => {
    let points = canvasPolygon.current.points;
    // 右键撤销
    if (opt.button === 3) {
      if (points.length) {
        points.pop(); //从后边删一个
      }
    }
    // 默认新增
    else {
      points.push({
        x: opt.absolutePointer.x,
        y: opt.absolutePointer.y,
      });
    }

    canvas.current.requestRenderAll();
  };
  // 绘制完成元素事件
  const onObjectAdded = (opt) => {
    const target = opt.target;
    const mapList = cloneDeep(pointList.current || []);

    const points = target.points;
    // 至少三个点，否则是一条线或一个点
    if (points.length > 2) {
      const newBox = {
        id: target.id,
        points,
      };
      mapList.push(newBox);
      const unibyList = uniqBy(mapList, "id");
      pointList.current = unibyList;
    }
  };
  // 完成多边形绘制
  const finishPolygon = (opt) => {
    let points = canvasPolygon.current.points;

    points[points.length - 1].x = opt.absolutePointer.x;
    points[points.length - 1].y = opt.absolutePointer.y;

    points.pop();
    points.pop();

    // console.log("绘制完了2", points);

    canvas.current.remove(canvasPolygon.current);
    if (points.length > 2) {
      const data = [
        {
          id: uuid(8, 10),
          points: points,
        },
      ];
      generatePolygon(data);
    } else {
      message.warning("请绘制至少三个点！！！");
    }
    canvasPolygon.current = null;
    canvas.current.requestRenderAll();
  };
  // 生成多边形并绑定事件
  const generatePolygon = (data) => {
    if (!data || !data.length) {
      return;
    }
    // 以数组为基础，渲染框
    data.forEach((v) => {
      // 创建多边形
      const polygon = new fabric.Polygon(v.points, {
        id: v.id,
        stroke: "#409eff", //渲染边框色
        fill: "rgba(255, 255, 255, 0.2)", //背景色
        selectable: false, //禁用位置及大小修改
        hoverCursor: "move", //鼠标移入显示拖拽位置手势
        transparentCorners: false, //操作顶点填充
        padding: 0, // 多边形距离外侧基准框距离
        cornerStyle: "circle", //控件类型(圆)
        cornerColor: "#409eff", //控件颜色(蓝色)
        hasBorders: false, //不显示控件边框
        objectCaching: false, //不使用缓存，此属性如为true，则拖拽顶点时边框不会实时更新边框位置
      });
      // 添加多边形控件
      const lastControl = polygon.points.length - 1;
      // 拖拽大小控件
      polygon.controls = polygon.points.reduce(function (acc, point, index) {
        acc["p" + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
          actionName: "modifyPolygon",
          pointIndex: index,
        });
        return acc;
      }, {});
      // 删除控件
      polygon.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: -16,
        offsetX: 16,
        cornerSize: 24, //图标大小
        cursorStyle: "pointer", // 移入鼠标样式
        mouseUpHandler: deleteObject, // 点击鼠标抬起事件
        render: deleteRenderIcon, //渲染红色叉号
      });

      canvas.current.add(polygon);
    });

    // 刷新画布
    canvas.current.requestRenderAll();
  };
  // 多边形位置拖动
  const dragPllygon = (options) => {
    const polygon = options.target;
    const { id } = polygon;
    // 获取最新值
    const matrix = polygon.calcTransformMatrix();
    const newPoints = polygon
      .get("points")
      .map(function (p) {
        return new fabric.Point(p.x - polygon.pathOffset.x, p.y - polygon.pathOffset.y);
      })
      .map(function (p) {
        return fabric.util.transformPoint(p, matrix);
      })
      .map((h) => {
        return {
          x: h.x < 0 ? 0 : h.x,
          y: h.y < 0 ? 0 : h.y,
        };
      });

    // console.log("拖完了", newPoints);

    // 修改位置数据
    const mapList = cloneDeep(pointList.current).map((v) => {
      return {
        ...v,
        points: v.id === id ? newPoints : v.points,
      };
    });

    const uniByList = uniqBy(mapList, "id");

    pointList.current = uniByList;
  };
  // 删除图标
  const deleteRenderIcon = (ctx, left, top, styleOverride, fabricObject) => {
    const img = document.createElement("img");
    const size = 24;

    img.src = deleteIcon;

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  };
  // 以ID为唯一标识，删除框
  const deleteObject = (eventData, transform) => {
    let target = transform.target;
    let canvas = target.canvas;
    const { id } = target;

    // 更新数据
    const mapList = cloneDeep(pointList.current).filter((v) => v.id !== id);
    pointList.current = mapList;

    // 删除元素，带动画
    canvas.fxRemove(target, {
      onChange() {
        // console.log("在动画的每一步调用");
      },
      onComplete() {
        // console.log("删除成功后调用");
      },
    });

    // canvas.requestRenderAll();
  };
  // 图片加载完毕
  const imgLoad = (e) => {
    e.persist();
    const { offsetWidth, offsetHeight } = e.target;
    setBoxStyle({
      width: offsetWidth,
      height: offsetHeight,
    });
  };

  // 提交
  const handleSubmit = async () => {
    const { width, height } = boxStyle;

    const requestData = {
      deviceId: editData.id,
      deviceEventRsList: cloneDeep(list).map((v) => {
        const mapList = v.isService
          ? v.relationList
          : v.relationList.map((k) => {
              return {
                ...k,
                points: k.points.map((h) => {
                  return { x: h.x / width, y: h.y / height };
                }),
              };
            });

        return {
          deviceId: editData.id,
          eventTypeId: v.id,
          state: v.state ? 1 : 0,
          relationJson: JSON.stringify(mapList),
        };
      }),
    };

    // console.log("request", requestData);

    const res = await deviceDao.saveDeviceEventRs({ data: requestData });

    if (res && res.status.code === 200) {
      message.success("保存成功");

      handleCancel(); //清除数据
    } else {
      message.error("保存失败，请重试");
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    // 销毁state
    canvas.current == null;
    canvasPolygon.current = null;
    pointList.current = null;
    setAllowDraw(false);
    setImgUrl(null);
    setBoxStyle({ width: 0, height: 0 });
    // 关闭弹窗
    setOpen(false);
  };

  // 左侧列表render
  const listRender = (v) => {
    return (
      <div className="left-render">
        <div className="item-left">
          <p title={v.label}>{v.label}</p>
        </div>
        <div className="item-right">
          <Tooltip title="启用/禁用">
            <Switch
              size="small"
              checked={v.state}
              onChange={(checked) => {
                enable(v.id, checked);
              }}
            />
          </Tooltip>
          <Tooltip title="保存">
            <Button
              type="primary"
              shape="circle"
              icon={<CheckOutlined />}
              disabled={!allowDraw}
              onClick={(e) => {
                save(e, v);
              }}
            />
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title="事件配置"
      className="analysis"
      width="100vw"
      style={{
        maxWidth: "100vw",
        top: 0,
        paddingBottom: 0,
        margin: 0,
      }}
      bodyStyle={{
        height: "calc(100vh - 108px )",
        overflowY: "auto",
      }}
      maskClosable={false}
      keyboard={false}
      visible={open}
      destroyOnClose
      okText="确定"
      cancelText="取消"
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <div className="content">
        <div className="content-top">
          <List title="事件类型" filterable renderList={listRender} active={listActive} data={list} onChange={slideChange}></List>
        </div>
        <div className="content-bottom-box">
          <div className="content-bottom">
            <img src={imgUrl} ref={imgRef} alt="" onLoad={imgLoad} />
            <div className="canvas-box" style={boxStyle}>
              <canvas id="canvasRef" width={boxStyle.width} height={boxStyle.height} />
            </div>
          </div>
          {/* 图片无效则不允许画框 */}
          {(!allowDraw || !list.length) && (
            <div className="no-img" style={{ height: boxStyle.height ? boxStyle.height : "100%" }}>
              <img src={noCheckedEvent} alt="" />
              <p>{!list.length ? "暂无事件类型" : "暂无设备图片"}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
export default forwardRef(Analysis);
