import { initMixin } from "./init";
import { initEvents } from "./events";

function CustomMap(options) {
  // 初始化参数
  initMixin(CustomMap);
  // 执行初地图
  this._init(options);

  // 初始化事件
  initEvents(CustomMap);
}
export default CustomMap;
