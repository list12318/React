import dao from "@/request";

export default dao.create({
  devicePage: {
    url: "/police-box/device/page",
    method: "POST",
  },
  deviceAdd: {
    url: "/police-box/device/add",
    method: "POST",
  },
  deviceUpdate: {
    url: "/police-box/device/update",
    method: "POST",
  },
  deviceDelete: {
    url: "/police-box/device/delete/:deviceId",
    method: "POST",
  },
  // 分析内容事件类型列表
  eventTypeList: {
    url: "/police-box/device/event-type-list",
    method: "POST",
  },
  // 分析内容图片地址
  getImgUrl: {
    url: "/police-box/device/screen/:deviceId",
    method: "POST",
  },
  // 保存分析内容框
  saveDeviceEventRs: {
    url: "/police-box/device/add/device-event-rs",
    method: "POST",
  },
  // 回显分析内容框
  getDeviceEventRs: {
    url: "/police-box/device/event-rs-list/:deviceId",
    method: "POST",
  },
});
