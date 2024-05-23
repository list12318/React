import React from "react";
import { useSafeState } from "ahooks";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import "./index.less";
import { Form, Input, Button } from "antd";
import useStore from "@/store";
import { setLocal } from "@/util/storage";
import loginLogo from "@/assets/img/login/login_logo.png";
import loginUser from "@/assets/img/login/login_user.png";
import loginPassword from "@/assets/img/login/login_password.png";
import md5 from "js-md5";

const Login = () => {
  const navigate = useNavigate();
  const { userStore } = useStore(); //mobx

  const [loading, setLoading] = useSafeState(false);

  const submitSuccess = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        ...values,
        password: md5(values.password),
      };

      const res = await userStore.login(requestData);
      if (res && res?.status?.code === 200) {
        userStore.setUser(res.data);
        setLocal({ key: "userInfo", value: res.data }); //存储到local
        navigate("/home", { replace: true });
        message.success("登录成功");
      } else {
        message.error(res.status.msg);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login_container">
        <img className="login_logo" src={loginLogo} alt="" />
        <div className="title">边缘计算终端</div>
        <div className="login_box">
          <Form onFinish={submitSuccess} autoComplete="off">
            <Form.Item name="userName" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input placeholder="用户名" prefix={<img src={loginUser} />} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password placeholder="密码" prefix={<img src={loginPassword} />} />
            </Form.Item>
            <Form.Item className="submit">
              <Button type="primary" htmlType="submit" loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
