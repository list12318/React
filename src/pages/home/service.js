import dao from "@/request";

export default dao.create({
  deviceList: {
    url: "/police-box/device/page",
    method: "POST",
  },
  // 历史录像
  playBackList: {
    url: "/police-box/device-video/list",
    method: "POST",
  },
  // 事件列表
  singleList: {
    url: "/police-box/device-event/page",
    method: "POST",
  },
  // 事件类型下拉
  getMethodsTpe: {
    url: "/police-box/device/event-type-list",
    method: "POST",
  },
});
