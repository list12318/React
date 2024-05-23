import React, { forwardRef, useState, useImperativeHandle } from "react";
import { Modal, Form, Select } from "antd";
const { Option } = Select;

const DeviceBind = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const getPage = (data) => {
    // console.log("新增或修改哟", data);
    setOpen(true);
    setEditData(data);
    //清空form值
    form.resetFields();
    //回显
    form.setFieldsValue({
      deviceId: data.deviceId,
    });
  };

  // 提交
  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      const emitData = Object.assign(editData, formValidateFields);
      props.emitBind(emitData);
      setOpen(false);
    }
  };
  // 关闭弹窗
  const handleCancel = () => {
    props.emitBind(false);
    setOpen(false);
  };

  return (
    <Modal
      title="绑定设备"
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
        <Form.Item label="设备" name="deviceId" rules={[{ required: true, message: "请选择设备！" }]}>
          <Select allowClear placeholder="请选择">
            {props.deviceList.map((v) => (
              <Option key={v.id} value={v.id} disabled={v.disabled}>
                {v.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default forwardRef(DeviceBind);
