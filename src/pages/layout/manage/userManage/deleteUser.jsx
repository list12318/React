import React, { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Modal, Input, Form, message } from "antd";
import {} from "@ant-design/icons";
import userDao from "./service";
import md5 from "js-md5";

const ChangePwd = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [id, setId] = useState(null);

  const getPage = (data) => {
    setOpen(true);
    setId(data.id);
    form.resetFields(); //清空form值
  };

  // 提交
  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      const res = await userDao.deleteUser({
        data: {
          id,
          password: md5(formValidateFields.password),
        },
      });
      if (res && res.status.code === 200) {
        message.success("删除成功");
        props.initData();
        setOpen(false);
      } else {
        message.error(res.status.msg);
      }
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title="确认删除"
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
        <Form.Item label="管理员密码" name="password" rules={[{ required: true, message: "请输入管理员密码！" }]}>
          <Input.Password placeholder="请输入管理员密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default forwardRef(ChangePwd);
