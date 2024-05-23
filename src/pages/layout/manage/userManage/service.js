import dao from "@/request";

export default dao.create({
  userPage: {
    url: "/police-box/user/page",
    method: "POST",
  },
  addUser: {
    url: "/police-box/user/add",
    method: "POST",
  },
  deleteUser: {
    url: "/police-box/user/delete",
    method: "POST",
  },
  changePwd: {
    url: "/police-box/user/changePwd",
    method: "POST",
  },
  resetPassword: {
    url: "/police-box/user/resetPwd/:userId",
    method: "POST",
  },
});
