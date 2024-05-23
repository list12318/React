import React, { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Modal, Input, InputNumber, Form, message } from "antd";
import deviceDao from "./service";

const AddEdit = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);

  const getPage = (data) => {
    setOpen(true);
    setTitle(data ? "编辑" : "新增");
    data && setEditId(data);
    form.resetFields(); //清空form值
    form.setFieldsValue(data); //回显
  };

  // 提交
  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      let res = null;
      if (title === "新增") {
        res = await deviceDao.deviceAdd({
          data: {
            ...formValidateFields,
            longitude: Number(formValidateFields.longitude || ""),
            latitude: Number(formValidateFields.latitude || ""),
          },
        });
      } else {
        res = await deviceDao.deviceUpdate({
          data: {
            id: editId.id,
            ...formValidateFields,
            longitude: Number(formValidateFields.longitude || ""),
            latitude: Number(formValidateFields.latitude || ""),
          },
        });
      }

      if (res && res.status.code === 200) {
        message.success(`${title}成功`);
        props.initData();
        setOpen(false);
      }
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title={title}
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
        <Form.Item label="设备名称" name="name" rules={[{ required: true, message: "请输入设备名称！" }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="设备经度" name="longitude" rules={[{ required: true, message: "请输入设备经度！" }]}>
          <InputNumber style={{ width: "100%" }} placeholder="请输入" />
        </Form.Item>
        <Form.Item label="设备纬度" name="latitude" rules={[{ required: true, message: "请输入设备纬度！" }]}>
          <InputNumber style={{ width: "100%" }} placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default forwardRef(AddEdit);
