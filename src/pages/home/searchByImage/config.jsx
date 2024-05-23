import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Modal, Form, Select } from "antd";
const { Option } = Select;
import "./index.less";
const Config = (props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      getPage,
    };
  });

  const [open, setOpen] = useState(false);
  const [list, setList] = useState([
    {
      id: 1,
      name: "呵呵",
    },
  ]);

  const [form] = Form.useForm();

  const getPage = (data) => {
    setOpen(true);

    form.resetFields();
  };

  const handleSubmit = async () => {
    const formValidateFields = await form.validateFields();
    if (formValidateFields) {
      props.uploadForm(formValidateFields);
      setOpen(false);
    }
  };
  //   取消
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      forceRender
      width="500px"
      maskClosable={false}
      title="识别配置"
      visible={open}
      destroyOnClose
      okText="确定"
      cancelText="取消"
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Form name="config" form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} autoComplete="off">
        <Form.Item label="识别配置" name="config" rules={[{ required: true, message: "请选择识别配置" }]}>
          <Select allowClear placeholder="请选择">
            {list.map((v) => (
              <Option key={v.id} value={v.id}>
                {v.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(Config);
