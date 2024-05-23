import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Modal } from "antd";
import "./index.less";
const ViewImage = (props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(null);
  useImperativeHandle(ref, () => {
    return {
      getPage,
    };
  });

  const getPage = (data) => {
    setPictureUrl(data.pictureUrl);
    setIsModalOpen(true);
  };
  //   取消
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal forceRender width="50%" maskClosable={false} title="查看图片" visible={isModalOpen} onCancel={handleCancel} destroyOnClose footer={null}>
      <div className="viewImage">
        <img src={pictureUrl} alt="" />
      </div>
    </Modal>
  );
};

export default forwardRef(ViewImage);
