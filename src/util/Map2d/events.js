import { uuid } from "@/util";
import { debounce } from "lodash";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Circle from "ol/geom/Circle";
import Draw from "ol/interaction/Draw";
import Polygon from "ol/geom/Polygon";
import * as olProj from "ol/proj";

export function initEvents(cm) {
  // initMapEvent(cm); //地图事件监听
  addMapPoint(cm); //添加点
  setCenter(cm); //设置中心点
  registerClickEvent(cm); //左键点击
  registerRightClickEvent(cm); //右键点击
  clearTargetFeatures(cm); //清除指定图层
  clearAllFeatures(cm); //清除所有图层
  // addCircle(cm); // 添加圆
  // addDraw(cm); //手动绘制图形
  // addGraph(cm); //图形渲染
}

// map 事件监听
function initMapEvent(cm) {
  const draphLayer = cm.prototype.draphLayer;

  cm.prototype.map.on(
    "pointermove",
    debounce(function (evt) {
      this.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        if (feature.getGeometry().getType() === "Polygon") {
          const featureId = feature.getId();
        }
      });
    })
  );
}

// 添加设备
function addMapPoint(cm) {
  cm.prototype.addMapPoint = ({
    coordinates = [],
    pointIcon = "",
    pointId = "",
    title = "",
    targetLayer = "pointLayer",
    pointName = "custom",
    customStyle = {
      text: {
        textColor: "#ffffff",
        backgroundFill: "#2E92DE",
      },
    },
  }) => {
    // 创建iconFeature
    let pointFeature = new Feature({
      geometry: new Point(coordinates),
      name: "point",
    });

    // 设置style
    let pointStyle = new Style({
      image: new Icon({
        src: pointIcon,
        rotation: 0,
        scale: 0.5,
        // cursor: "pointer",
      }),
      text: new Text({
        text: title,
        // 字体与大小
        font: "12px Microsoft YaHei",
        //文字填充色
        fill: new Fill({
          color: customStyle.text.textColor,
        }),

        // 标签背景颜色
        backgroundFill: new Fill({
          color: customStyle.text.backgroundFill,
        }),
        offsetY: -35,
        padding: [4, 4, 4, 4],
      }),
    });
    // 将坐标转换为3857
    pointFeature.getGeometry().transform("EPSG:4326", "EPSG:3857");
    // 设置id方便后续进行查找
    pointFeature.setId(pointId);
    // 设置名称
    pointFeature.name = pointName;
    pointFeature.setStyle(pointStyle);
    const pointLayer = cm.prototype[targetLayer];
    pointLayer.addFeature(pointFeature);
  };
}

// 清楚所有点
function clearAllFeatures(cm) {
  cm.prototype.clearAllFeatures = () => {
    cm.prototype.pointLayer.clear();
  };
}

// 清楚指定图层上的内容
function clearTargetFeatures(cm) {
  cm.prototype.clearTargetFeatures = (targetLayers) => {
    cm.prototype[targetLayers].clear();
  };
}

// 设置中心点及缩放比例
function setCenter(cm) {
  cm.prototype.setCenter = (position) => {
    let newposition = olProj.transform(position, "EPSG:4326", "EPSG:3857");
    let Map = cm.prototype.map;
    Map.getView().setCenter(newposition);
    Map.getView().setZoom(16);
  };
}

// 左键点击
function registerClickEvent(cm) {
  let map = cm.prototype.map;
  map.on("click", (e) => {
    e.preventDefault();
    let pixel = map.getEventPixel(e.originalEvent);
    // 找到当前点击的特征
    let feature = map.forEachFeatureAtPixel(pixel, (feature) => {
      return feature;
    });

    if (!feature) {
      return;
    }

    cm.prototype.evnets.clickEvent && cm.prototype.evnets.clickEvent(feature, pixel);

    // 因为此时时聚合图层需要进一步向下查找到我们点击的图层
    // let targetFeature = feature?.values_?.features[0];
    // cm.prototype.contextMenuEvent({
    //   id: targetFeature.id_,
    //   pixel,
    // });
  });
}

// 右键点击
function registerRightClickEvent(cm) {
  let map = cm.prototype.map;
  map.on("contextmenu", (e) => {
    e.preventDefault();
    let pixel = map.getEventPixel(e.originalEvent);
    // 找到当前点击的特征
    let feature = map.forEachFeatureAtPixel(pixel, (feature) => {
      return feature;
    });

    if (!feature) {
      return;
    }

    cm.prototype.evnets.rightClickEvent && cm.prototype.evnets.rightClickEvent(feature, pixel);

    // 因为此时时聚合图层需要进一步向下查找到我们点击的图层
    // let targetFeature = feature?.values_?.features[0];
    // cm.prototype.contextMenuEvent({
    //   id: targetFeature.id_,
    //   pixel,
    // });
  });
}

// 添加圆
function addCircle(cm) {
  cm.prototype.addCircle = ({ targetLayer = "circleLayer", circleId = "", center = [], radius = 500 }) => {
    // 创建 以center为圆心，radius(米)为半径的圆

    const mapCenter = olProj.transform(center, "EPSG:4326", "EPSG:3857");

    let feature = new Feature({
      geometry: new Circle(mapCenter, getRadius(cm.prototype.map, radius)),
    });
    feature.setStyle(
      new Style({
        fill: new Fill({
          color: "rgba(3,37,49,0.8)",
        }),
      })
    );
    feature.setId(circleId); // 设置 feature 的ID值

    const circleLayer = cm.prototype[targetLayer];
    circleLayer.addFeature(feature);
  };
}

// 圆半径计算
function getRadius(map, radius) {
  let metersPerUnit = map.getView().getProjection().getMetersPerUnit();
  let circleRadius = radius / metersPerUnit;
  return circleRadius;
}

// 开启手动绘制围栏
function addDraw(cm) {
  cm.prototype.addDraw = ({ targetLayer = "" }) => {
    //实例化交互绘制类对象并添加到地图容器中
    let draw = new Draw({
      type: "Polygon",
      source: cm.prototype[targetLayer],
      style: new Style({
        radius: 5,
        fill: new Fill({ color: "rgba(255,255,255,0.4)" }),
        stroke: new Stroke({ color: "rgb(64, 158, 255)", width: 2 }),
      }),
    });

    cm.prototype.map.addInteraction(draw);

    // 添加监听 围栏绘制完毕后 做某些事情
    draw.on("drawend", (evt) => {
      let extent = evt.feature.getGeometry().getExtent();

      // 坐标转换为经纬度
      const lanAndLon = evt.feature
        .getGeometry()
        .getCoordinates()[0]
        .map((v) => olProj.transform(v, "EPSG:3857", "EPSG:4326"));

      // console.log("extent: ", extent, JSON.stringify(lanAndLon));

      // 调用添加图形方法，把图形渲染到地图上
      cm.prototype.addGraph({
        targetLayer: "draphLayer",
        data: lanAndLon,
      });
      // 删除当前操作Interaction
      cm.prototype.map.removeInteraction(draw);
    });
  };
}

// 图形渲染图层
function addGraph(cm) {
  cm.prototype.addGraph = ({ targetLayer = "", data = [] }) => {
    const transformedCoordinates = data.map((v) => olProj.fromLonLat(v));

    let feature = new Feature({
      geometry: new Polygon([transformedCoordinates]),
    });

    // 设置style
    let layerStyle = new Style({
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.4)", // 设置背景色
      }),
      stroke: new Stroke({
        color: "#ffcc33", // 设置边框色
        width: 4,
      }),
    });

    feature.setStyle(layerStyle); //图层样式

    feature.setId(uuid(8, 10));

    const draphLayer = cm.prototype[targetLayer];
    draphLayer.addFeature(feature);
  };
}
