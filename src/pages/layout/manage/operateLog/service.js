import dao from "@/request";

export default dao.create({
  logPage: {
    url: "/police-box/operation-log/page",
    method: "POST",
  },
});
