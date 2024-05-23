import React, { forwardRef, useState, useImperativeHandle } from "react";
import { Modal, Row, Col } from "antd";
import "./detail.less";

const Detail = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const [open, setOpen] = useState(false); //弹窗是否显示
  const [data, setData] = useState({});

  const getPage = (data) => {
    console.log("这是事件详情页---", data);
    setOpen(true);
    setData(data);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      className="detail"
      title="详情"
      width="60%"
      maskClosable={false}
      keyboard={false}
      style={{
        top: "8%",
      }}
      bodyStyle={{
        height: "calc(90vh - 100px)",
      }}
      visible={open}
      destroyOnClose
      footer={null}
      onCancel={handleCancel}
    >
      <Row>
        <Col span={12}>
          <span>发生时间：</span>
          {data.createTime}
        </Col>
        <Col span={12}>
          <span>事件类型：</span>
          {data.eventType}
        </Col>
      </Row>

      <p className="video-title">视频片段</p>
      <div className="videoPlayer">
        <video src={data.videoUrl} width="100%" height="100%" poster={data.pictureUrl} controls></video>
      </div>
    </Modal>
  );
};
export default forwardRef(Detail);
