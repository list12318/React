import dao from "@/request";

export default dao.create({
  login: {
    url: "/police-box/user/login",
    method: "POST",
  },
  logout: {
    url: "/police-box/user/logout",
    method: "POST",
  },
});
