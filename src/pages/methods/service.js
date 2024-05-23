import dao from "@/request";

export default dao.create({
  eventPage: {
    url: "/police-box/device-event/page",
    method: "POST",
  },
});
