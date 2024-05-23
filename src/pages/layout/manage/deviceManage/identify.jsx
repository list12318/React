import React, { forwardRef, useState, useImperativeHandle, useEffect, useRef } from "react";
import { Modal, Checkbox, message, Row, Col } from "antd";
import "./identify.less";
import { cloneDeep } from "lodash";

const Identify = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false);
  const [list, setList] = useState([
    {
      id: 1,
      data: [
        {
          label: "测试1",
          value: "1",
        },
        {
          label: "测试2",
          value: "2",
        },
        {
          label: "测试3",
          value: "3",
        },
      ],
      checked: [],
    },
    {
      id: 2,
      data: [
        {
          label: "测试4",
          value: "4",
        },
        {
          label: "测试5",
          value: "5",
        },
        {
          label: "测试6",
          value: "6",
        },
      ],
      checked: [],
    },
  ]);
  const [checked, setChecked] = useState([]); // 已选数据

  // 打开弹窗
  const getPage = (data) => {
    setOpen(true);
  };

  const checkboxChange = (checkValues, id) => {
    console.log("checked", checkValues);
    const mapList = cloneDeep(list);
    const editIndex = mapList.findIndex((v) => v.id === id);
    mapList[editIndex].checked = checkValues;
    setList(mapList);
  };

  // 提交
  const handleSubmit = () => {
    console.log(list);
  };

  // 关闭弹窗
  const handleCancel = () => {
    // 数据初始化
    setOpen(false);
  };

  return (
    <Modal
      title="识别配置"
      className="identify"
      width="100vw"
      style={{
        maxWidth: "100vw",
        top: 0,
        paddingBottom: 0,
        margin: 0,
      }}
      bodyStyle={{
        height: "calc(100vh - 108px )",
        overflowY: "auto",
      }}
      maskClosable={false}
      keyboard={false}
      visible={open}
      destroyOnClose
      okText="确定"
      cancelText="取消"
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <div className="content">
        <ul className="box">
          {list.map((v) => (
            <li className="list" key={v.id}>
              <Checkbox.Group style={{ width: "100%" }} onChange={(e) => checkboxChange(e, v.id)}>
                <Row>
                  {(v.data || []).map((h) => (
                    <Col key={h.value} span={3}>
                      <Checkbox value={h.value}>{h.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};
export default forwardRef(Identify);
