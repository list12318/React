import React, { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Modal, Input, Form, message } from "antd";
import md5 from "js-md5";
import userDao from "./service";

const Add = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const getPage = () => {
    setOpen(true);
    form.resetFields(); //清空form值
  };
  // 提交
  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      const requestData = {
        userName: formValidateFields.userName,
        password: md5(formValidateFields.password),
      };
      const res = await userDao.addUser({ data: requestData });

      if (res && res.status.code === 200) {
        message.success("新建成功");
        props.initData();
        setOpen(false);
      } else {
        message.error("新建失败，请重试！！！");
      }
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title="新建用户"
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
        <Form.Item label="用户名" name="userName" rules={[{ required: true, message: "请输入用户名！" }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码！" }]}>
          <Input.Password placeholder="请输入密码" />
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
export default forwardRef(Add);
