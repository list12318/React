import dao from "@/request";

export default dao.create({
  // 搜索对象下拉数据
  searchList: {
    url: "/police-box/picture/search-types",
    method: "POST",
  },
  // 以图搜图
  identifyImg: {
    url: "/police-box/picture/search",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  },
  //

});
