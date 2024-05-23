import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Modal } from "antd";
const ViewVideo = (props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState({});
  useImperativeHandle(ref, () => {
    return {
      getPage,
    };
  });

  const getPage = (data) => {
    setData(data);
    setIsModalOpen(true);
  };
  //   取消
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal forceRender width="50%" maskClosable={false} title="查看视频" visible={isModalOpen} onCancel={handleCancel} destroyOnClose footer={null}>
      <div className="videoPlayer">
        <video src={data.videoUrl} width="100%" height="100%" poster={data.pictureUrl} controls></video>
      </div>
    </Modal>
  );
};

export default forwardRef(ViewVideo);
