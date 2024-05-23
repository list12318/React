import Tile from "ol/layer/Tile";
import * as olSource from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

// 初始化底图
export function initBaseLayer(cm) {
  return new Tile({
    source: new olSource.XYZ({
      url: cm._mapUrl,
      tileLoadFunction: (imageTile, src) => {
        // 使用滤镜 将白色修改为深色
        let img = new Image();
        img.crossOrigin = "";
        // 设置图片不从缓存取，从缓存取可能会出现跨域，导致加载失败
        img.setAttribute("crossOrigin", "anonymous");
        (img.onload = () => {
          let canvas = document.createElement("canvas");
          let w = img.width;
          let h = img.height;
          canvas.width = w;
          canvas.height = h;
          let context = canvas.getContext("2d");
          context.filter = "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
          context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
          imageTile.getImage().src = canvas.toDataURL("image/png");
        }),
          (img.src = src);
      },
    }),
  });
}

// 设备点图层
export function initPointLayer(cm) {
  cm.prototype.pointLayer = new VectorSource();
  return new VectorLayer({
    source: cm.prototype.pointLayer,
    zIndex: 2, //图层层级
  });
}

// 圆图层
export function initCircleLayer(cm) {
  cm.prototype.circleLayer = new VectorSource();
  return new VectorLayer({
    source: cm.prototype.circleLayer,
    zIndex: 0, //图层层级
  });
}

// 手动绘制图形
export function initDrawLayer(cm) {
  cm.prototype.draphLayer = new VectorSource();
  return new VectorLayer({
    source: cm.prototype.draphLayer,
    zIndex: 1, //图层层级
  });
}
