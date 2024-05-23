import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from "react";
import { Modal, Tabs, Button, Select, DatePicker, Table, Tooltip } from "antd";
const { RangePicker } = DatePicker;
import Detail from "@/pages/methods/detail";
import "./device-detail.less";
import dayjs from "dayjs";
import deviceDetailDao from "./service";

const DeviceDetail = (props, ref) => {
  // 使用了forwardRef，事件需抛出给父组件，父组件才可以调用
  useImperativeHandle(ref, () => ({
    getPage,
  }));

  const tableRef = useRef(null); //表格ref
  const detailRef = useRef(null);
  const historyVideRef = useRef(null); //历史录像ref

  const [open, setOpen] = useState(false); //弹窗是否显示
  const [tabs, setTabs] = useState("1");
  const [deviceData, setDeviceData] = useState({}); //设备信息
  // 历史录像
  const [history, setHistory] = useState({
    time: [],
    timeClear: null,
    data: [],
  });
  // 历史录像播放下标
  const [videoIndex, setVideoIndex] = useState(null);
  // 事件列表
  const [methods, setMethods] = useState({
    time: [],
    timeClear: null,
    type: null,
    typeList: [],
    columns: [
      {
        title: "事件类型",
        dataIndex: "eventType",
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "设备名称",
        dataIndex: "deviceName",
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "时间",
        dataIndex: "createTimeCn",
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        render: (_, record) => (
          <>
            <Button type="link" onClick={() => detailRef.current.getPage(_)}>
              详情
            </Button>
          </>
        ),
      },
    ],
    data: [],
    tableScrollHeight: 200,
    loading: false,
    current: 1,
    size: 50,
    total: 0,
  });
  // 设置table最大高度
  useEffect(() => {
    if (open && tabs === "3") {
      setTableHeight();
      // 查询事件类型
      getMethodType();
    }
  }, [open, tabs]);

  // 历史录像自动播放
  useEffect(() => {
    const videoRef = historyVideRef.current;
    const { data } = history;

    const handleVideoEnded = () => {
      if (videoIndex < data.length - 1) {
        setVideoIndex(videoIndex + 1);
        // 清空监听器
        videoRef.removeEventListener("ended", handleVideoEnded);
      }
    };
    // 添加播放完毕监听器
    if (videoRef) {
      videoRef.addEventListener("ended", handleVideoEnded);
    }

    // 如果数据都存在，则自动播放下一个
    if (videoRef && data.length && videoIndex !== null) {
      videoRef.src = data[videoIndex].videoUrl;
      videoRef.play();
    }

    return () => {
      if (videoRef) {
        videoRef.removeEventListener("ended", handleVideoEnded);
      }
    };
  }, [videoIndex]);

  // 事件列表分页切换
  useEffect(() => {
    initData();
  }, [methods.type, methods.current, methods.size]);

  const setTableHeight = () => {
    if (tableRef.current) {
      setMethods({
        ...methods,
        tableScrollHeight: tableRef.current.offsetHeight - 64 - 55,
      });
    }
  };

  const getPage = (data) => {
    // console.log(111, data);
    setOpen(true);
    setDeviceData(data);
    // 查询事件列表
    initData({
      deviceId: data.id,
    });
  };

  // 关闭弹窗
  const handleCancel = () => {
    setOpen(false);
  };
  // tab change
  const tabChange = (key) => {
    setTabs(key);
  };
  // 查询时间类型数据
  const getMethodType = async () => {
    const res = await deviceDetailDao.getMethodsTpe();
    if (res && res.status.code === 200) {
      setMethods({
        ...methods,
        typeList: res.data,
      });
    }
  };

  // 查询历史录像
  const searchHistory = async (clear) => {
    const time = clear ? [] : history.time;

    const requestData = {
      deviceId: deviceData.id,
      startTime: time.length ? time[0] : "",
      endTime: time.length ? time[1] : "",
    };

    const res = await deviceDetailDao.playBackList({ data: requestData });
    if (res && res.status.code === 200) {
      const { data } = res;
      setHistory({
        ...history,
        data: data.map((v) => {
          return {
            ...v,
            createTimeCn: dayjs(v.createTime).format("YYYY-MM-DD HH:mm:ss"),
          };
        }),
      });

      setVideoIndex(0);
    }
  };
  // 重置历史录像
  const resetHistory = () => {
    setHistory({
      ...history,
      time: [],
      timeClear: new Date(),
    });
    searchHistory(true);
  };

  // 事件列表查询
  const searchMethods = () => {
    initData();
  };
  // 重置
  const resetMethods = () => {
    setMethods({
      ...methods,
      type: null,
      time: [],
      timeClear: new Date(),
    });
  };

  const initData = async (data) => {
    setMethods({
      ...methods,
      loading: true,
    });
    const requestData = {
      deviceId: deviceData.id,
      startTime: methods.time.length ? methods.time[0] : "",
      endTime: methods.time.length ? methods.time[1] : "",
      type: methods.type,
      pageNum: methods.current,
      pageSize: methods.size,
      ...data,
    };

    const res = await deviceDetailDao.singleList({ data: requestData });
    if (res && res.status.code === 200) {
      setMethods({
        ...methods,
        data: res.data.list.map((v) => ({ ...v, createTimeCn: dayjs(v.createTime).format("YYYY-MM-DD HH:mm:ss") })),
        total: res.data.count,
        loading: false,
      });
    }
  };
  // 分页
  const pageChange = (pageNum, pageSize) => {
    setMethods({
      ...methods,
      current: pageNum,
      size: pageSize,
    });
  };

  return (
    <Modal
      className="device-detail"
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
      <Tabs defaultActiveKey="1" centered onChange={tabChange}>
        <Tabs.TabPane tab="实时视频" key="1">
          <div className="current">
            <video src={deviceData.rtvUrl} width="100%" height="100%" controls></video>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="历史录像" key="2">
          <div className="history">
            <div className="search">
              <div className="left">
                <span>起止时间：</span>
                <RangePicker
                  key={history.timeClear}
                  showTime
                  placeholder={["开始时间", "结束时间"]}
                  onChange={(date, dateString) => setHistory({ ...history, time: date })}
                />
              </div>
              <div className="right">
                <Button
                  type="primary"
                  onClick={() => {
                    searchHistory(false);
                  }}
                >
                  查询
                </Button>
                <Button onClick={resetHistory}>重置</Button>
              </div>
            </div>
            <p className="video-title">视频片段</p>
            <div className="videoPlayer">
              <video ref={historyVideRef} width="100%" height="100%" controls autoPlay></video>
            </div>
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="事件列表" key="3">
          <div className="methods">
            <div className="search">
              <div className="left">
                <span>起止时间：</span>
                <RangePicker
                  key={methods.timeClear}
                  showTime
                  placeholder={["开始时间", "结束时间"]}
                  onChange={(date, dateString) => setMethods({ ...methods, time: date })}
                />
                <span style={{ marginLeft: "20px" }}>事件类型：</span>
                <Select
                  style={{ width: 120 }}
                  allowClear
                  fieldNames={{ value: "id", label: "name" }}
                  placeholder="请选择"
                  value={methods.type}
                  onChange={(value) => {
                    setMethods({ ...methods, type: value });
                  }}
                  options={methods.typeList}
                />
              </div>
              <div className="right">
                <Button type="primary" onClick={searchMethods}>
                  查询
                </Button>
                <Button onClick={resetMethods}>重置</Button>
              </div>
            </div>
            <div className="table" ref={tableRef}>
              <Table
                rowKey="id"
                bordered
                columns={methods.columns}
                dataSource={methods.data}
                loading={methods.loading}
                scroll={{ y: methods.tableScrollHeight }}
                pagination={{
                  showSizeChanger: true,
                  current: methods.current,
                  pageSize: methods.size,
                  total: methods.total,
                  showTotal: () => <span>共 {methods.total} 条</span>,
                  onChange: pageChange,
                }}
              />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
      <Detail ref={detailRef}></Detail>
    </Modal>
  );
};
export default forwardRef(DeviceDetail);
