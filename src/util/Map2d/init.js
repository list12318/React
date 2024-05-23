import Map from "ol/Map";
import View from "ol/View";
import * as olProj from "ol/proj";
import { defaults } from "ol/interaction";
import { initBaseLayer, initPointLayer, initCircleLayer, initDrawLayer } from "./baseLayers";

export function initMixin(CustomMap) {
  // 挂载_init方法
  CustomMap.prototype._init = function (options) {
    const cm = CustomMap;
    cm._mapUrl = options.mapUrl;
    cm._target = options.target;
    cm.prototype.mapCenter = options.mapCenter;
    cm.prototype.rotation = options.rotation;
    cm.prototype.map = options.map;
    cm.prototype.evnets = options.events;

    // Map 地图实例用来承载我们的配置
    initMap(cm);
  };
}

export function initMap(cm) {
  // 已经初始化就不需要再次初始化了
  if (cm.prototype.map) return;
  //初始化底图
  const baseLayer = initBaseLayer(cm);
  // 点位图层
  const pointLayer = initPointLayer(cm);
  // 圆图层
  const circleLayer = initCircleLayer(cm);
  // 手动绘制图形层
  const draphLayer = initDrawLayer(cm);

  cm.prototype.map = new Map({
    // 让id为map的div作为地图的容器
    target: cm._target,
    // 图层容器
    layers: [baseLayer, pointLayer, circleLayer, draphLayer],
    // 设置显示地图的视图: 对我们的地图进行一些配置
    view: new View({
      projection: "EPSG:3857",
      // zoom: 12,
      // minZoom: 14,
      // maxZoom: 18,
      zoom: 14,
      minZoom: 14,
      maxZoom: 18,
      interactions: defaults({
        altShiftDragRotate: false, //禁用旋转功能
        pinchRotate: false,
      }),

      center: olProj.transform(cm.prototype.mapCenter, "EPSG:4326", "EPSG:3857"), // 定义地图显示中心
      // rotation: (27 * Math.PI) / 180,
      rotation: cm.prototype.rotation,
    }),
  });
}
