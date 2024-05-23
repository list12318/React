import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import ImgCrop from "antd-img-crop";
import { InboxOutlined } from "@ant-design/icons";
import { Modal, Upload, message, Button, Table, Tooltip, Spin } from "antd";
const { Dragger } = Upload;
import "./index.less";
import Config from "./config"; //上传配置
import ViewImage from "./viewImage"; //查看图片
import ViewVideo from "./viewVideo"; //查看视频
import useStore from "@/store";
import { toJS } from "mobx";
import SearchDao from "./service";

const SearchByImage = (props, ref) => {
  useImperativeHandle(ref, () => {
    return {
      getPage,
    };
  });

  const { userStore } = useStore(); //mobx
  const userInfo = toJS(userStore.userInfo);

  const tableRef = useRef(null); //表格ref
  const tableHeightRef = useRef(null); //table高度定时器
  const configRef = useRef(null); //配置ref
  const viewImageRef = useRef(null); //查看图片ref
  const viewVideoRef = useRef(null); //查看视频ref

  const [open, setOpen] = useState(false);

  const [uploadStatus, setUploadStatus] = useState(null);

  // 事件列表
  const [table, setTable] = useState({
    columns: [
      {
        title: "设备名",
        dataIndex: "deviceName",
        ellipsis: { showTitle: false },
        render: (text) => (
          <Tooltip placement="top" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "时间",
        dataIndex: "dateTime",
        ellipsis: { showTitle: false },
        render: (text) => (
          <Tooltip placement="top" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 160,
        render: (_, record) => (
          <>
            <Button type="link" onClick={() => viewImageRef.current.getPage(_)}>
              查看图片
            </Button>
            <Button type="link" onClick={() => viewVideoRef.current.getPage(_)}>
              查看视频
            </Button>
          </>
        ),
      },
    ],
    data: [],
    tableScrollHeight: 300,
    loading: false,
  });

  const [localFile, setLocalFile] = useState(null);
  const [file, setFile] = useState(null);

  const getPage = () => {
    setOpen(true);
    tableHeightRef.current = setTimeout(() => {
      setTableHeight();
    }, 200);
  };
  const setTableHeight = () => {
    if (tableRef.current) {
      setTable({
        ...table,
        tableScrollHeight: tableRef.current.offsetHeight - 55,
      });
    }
  };
  //   取消
  const handleCancel = () => {
    clearTimeout(tableHeightRef.current);
    tableHeightRef.current = null;
    setOpen(false);
  };

  const uploadProps = {
    name: "file",
    action: "/police-box/picture/search",
    multiple: false,
    accept: ".png,.jpg,.jpeg,.webp",
    showUploadList: false,
    headers: {
      "session-id": userInfo.sessionId,
    },
    beforeUpload: (file) => {
      setLocalFile(file);
      return false;
    },
  };

  const fileBefore = async (file) => {
    return true;
  };

  const modalOk = () => {
    configRef.current.getPage();
  };

  const uploadForm = async (formData) => {
    const { config } = formData;

    setFile(null);
    setTable({
      ...table,
      data: [],
    });
    setUploadStatus("uploading");

    const rerquestData = new FormData();
    rerquestData.append("file", localFile);
    rerquestData.append("config", config);

    const res = await SearchDao.identifyImg({
      data: rerquestData,
    });

    if (res && res.status.code === 200) {
      getBase64(localFile, (url) => {
        setFile(url);
      });
      setTable({
        ...table,
        data: res.data,
      });
      message.success("识别成功");
    } else {
      message.error(res.status.msg || "识别失败");
    }

    setUploadStatus("done");
  };

  // file转base64
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  return (
    <Modal
      width="70%"
      maskClosable={false}
      title="以图搜图"
      visible={open}
      onCancel={handleCancel}
      destroyOnClose
      style={{ top: "5%" }}
      bodyStyle={{ height: "calc(100vh - 150px)" }}
      className="searchByImage"
      footer={null}
    >
      <div className="left">
        <ImgCrop
          modalClassName="crop-modal"
          modalTitle="区域选择"
          modalWidth="600px"
          rotationSlider
          aspectSlider
          showGrid
          minZoom={1}
          maxZoom={10}
          modalProps={{ style: { top: "5%" } }}
          zoomSlider={1}
          aspect={1 / 1} //截图框形状，默认正方形，即 1 / 1
          cropperProps={{ objectFit: "contain" }}
          beforeCrop={fileBefore}
          onModalOk={modalOk}
        >
          <Dragger {...uploadProps}>
            {file ? (
              <div className="upload-img">
                <img src={file} alt="" />
              </div>
            ) : uploadStatus === "uploading" ? (
              <Spin tip="分析中..." />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖入图片</p>
                <p className="ant-upload-hint">当前上传只支持.png、.jpg、.jpeg、.webp格式的文件</p>
              </>
            )}
          </Dragger>
        </ImgCrop>
      </div>
      <div className="right">
        <div className="table" ref={tableRef}>
          <Table
            rowKey="id"
            bordered
            columns={table.columns}
            dataSource={table.data}
            loading={table.loading}
            scroll={{ y: table.tableScrollHeight }}
            pagination={false}
          />
        </div>
      </div>

      {/* 配置 */}
      <Config ref={configRef} uploadForm={uploadForm} />
      {/* 查看图片 */}
      <ViewImage ref={viewImageRef} />
      {/* 查看视频 */}
      <ViewVideo ref={viewVideoRef} />
    </Modal>
  );
};

export default forwardRef(SearchByImage);
