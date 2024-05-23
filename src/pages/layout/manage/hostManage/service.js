import dao from "@/request";

export default dao.create({
  // 设备列表
  deviceList: {
    url: "/police-box/device/page",
    method: "POST",
  },
  // 主机列表
  hostList: {
    url: "/police-box/host/list",
    method: "POST",
  },
  // 框列表
  boxList: {
    url: "/police-box/host-screen/list/:hostId",
    method: "POST",
  },
  // 保存框
  saveBox: {
    url: "/police-box/host-screen/add",
    method: "POST",
    loading: true,
    loadingContent: "正在加载中...",
  },
  // 启用主机
  enableHost: {
    url: "/police-box/host/update",
    method: "POST",
    loading: true,
    loadingContent: "正在加载中...",
  },
});
