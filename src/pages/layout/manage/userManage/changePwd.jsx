import React, { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Input, Form, message } from "antd";
import {} from "@ant-design/icons";
import userDao from "./service";
import useStore from "@/store";
import { toJS } from "mobx";
import { removeLocal } from "@/util/storage";
import md5 from "js-md5";

const ChangePwd = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));
  const navigate = useNavigate();
  const { userStore } = useStore(); //mobx
  const userInfo = toJS(userStore.userInfo);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [id, setId] = useState(null);

  const getPage = (data) => {
    setOpen(true);
    setId(data);
    form.resetFields(); //清空form值
  };

  // 提交
  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      const requestData = {
        id,
        oldPwd: md5(formValidateFields.oldPwd),
        password: md5(formValidateFields.password),
      };
      const res = await userDao.changePwd({ data: requestData });

      if (res && res.status.code === 200) {
        // 如果是当前用户，需要退出重新登录
        if (userInfo.id === id) {
          message.success("您已修改当前用户密码，请重新登录");
          navigate("/login", { replace: true });
          userStore.setUser(null);
          removeLocal("userInfo"); //清空用户信息
        } else {
          message.success("修改成功");
          props.initData();
          setOpen(false);
        }
      } else {
        message.error(res ? res.status.msg : "未知错误，请联系管理员");
      }
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title="修改密码"
      width="500px"
      maskClosable={false}
      keyboard={false}
      visible={open}
      destroyOnClose
      okText="确定"
      cancelText="取消"
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Form name="add" form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} autoComplete="off">
        <Form.Item label="旧密码" name="oldPwd" rules={[{ required: true, message: "请输入旧密码！" }]}>
          <Input.Password placeholder="请输入旧密码" />
        </Form.Item>
        <Form.Item label="新密码" name="password" rules={[{ required: true, message: "请输入新密码！" }]}>
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmpwd"
          rules={[
            { required: true, message: "请输入确认密码！" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("您输入的两个密码不匹配！"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请输入确认密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default forwardRef(ChangePwd);
