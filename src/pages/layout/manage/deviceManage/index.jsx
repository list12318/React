import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSafeState } from "ahooks";
import { Input, Button, Table, message, Popconfirm, Tooltip } from "antd";
import { SearchOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import "./index.less";
import AddEdit from "./addEdit";
import Analysis from "./analysis";
import Identify from "./identify";
import deviceDao from "./service";

const DeviceManage = (props) => {
  const tableRef = useRef(null);
  const addEditRef = useRef(null);
  const analysisRef = useRef(null);
  const identifyRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [table, setTable] = useSafeState({
    columns: [
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: { showTitle: false },
        render: (text) => (
          <Tooltip placement="top" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "设备经度",
        dataIndex: "longitude",
        ellipsis: { showTitle: false },
        render: (text) => (
          <Tooltip placement="top" title={text}>
            {text}
          </Tooltip>
        ),
      },
      {
        title: "设备纬度",
        dataIndex: "latitude",
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
        width: 250,
        render: (_, record) => (
          <>
            <Button type="link" onClick={() => editData(record)}>
              编辑
            </Button>
            <Button type="link" onClick={() => analysisData(record)}>
              事件配置
            </Button>
            <Button type="link" onClick={() => identify(record)}>
              识别配置
            </Button>
            <Popconfirm title="此操作不可逆，是否删除？" onConfirm={() => deleteData(record)} okText="确认" cancelText="取消" okButtonProps={{ danger: true }}>
              <Button type="link">删除</Button>
            </Popconfirm>
          </>
        ),
      },
    ],
    data: [],
    loading: false,
    current: 1,
    size: 50,
    total: 0,
  });

  const [tableHeight, setTableHeight] = useState(0);

  useEffect(() => {
    initData();
  }, []);

  useLayoutEffect(() => {
    setTableHeight(tableRef.current.offsetHeight - 64 - 55); //设置table最大滚动高度，64为分页，55为表头
  }, []);

  useEffect(() => {
    initData();
  }, [table.current, table.size]);

  const initData = async (data) => {
    setTable({
      ...table,
      loading: true,
    });
    const requestData = {
      name: searchValue,
      latitude: "",
      longitude: "",
      pageNum: table.current,
      pageSize: table.size,
      ...data, //hooks先清空后重置无法确认先后顺序
    };
    const res = await deviceDao.devicePage({ data: requestData });
    if (res && res.status.code === 200) {
      setTable({
        ...table,
        data: res.data.list,
        total: res.data.count,
        loading: false,
      });
    }
  };
  const search = () => {
    initData();
  };
  const reset = () => {
    setSearchValue("");
    initData({
      name: "",
    });
  };
  const pageChange = (pageNum, pageSize) => {
    setTable({
      ...table,
      current: pageNum,
      size: pageSize,
    });
  };

  const addData = () => {
    addEditRef.current.getPage();
  };
  const editData = (data) => {
    addEditRef.current.getPage(data);
  };
  const deleteData = async (data) => {
    const res = await deviceDao.deviceDelete({
      pathParams: {
        deviceId: data.id,
      },
    });
    if (res && res.status.code === 200) {
      message.success("删除成功");
      initData();
    }
  };
  const analysisData = async (data) => {
    analysisRef.current.getPage(data);
  };
  const identify = async (data) => {
    identifyRef.current.getPage(data);
  };

  return (
    <div className="device-manage">
      <div className="search">
        <div className="left">
          <span className="text"> 设备名称：</span>
          <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} allowClear placeholder="请输入" />
        </div>
        <div className="right">
          <Button type="primary" icon={<SearchOutlined />} onClick={search}>
            查询
          </Button>
          <Button icon={<DeleteOutlined />} onClick={reset}>
            重置
          </Button>
          <Button icon={<PlusCircleOutlined />} type="primary" onClick={addData}>
            新增
          </Button>
        </div>
      </div>
      <div className="table" ref={tableRef}>
        <Table
          rowKey="id"
          bordered
          columns={table.columns}
          dataSource={table.data}
          loading={table.loading}
          scroll={{ y: tableHeight }}
          pagination={{
            showSizeChanger: true,
            current: table.current,
            pageSize: table.size,
            total: table.total,
            showTotal: () => <span>共 {table.total} 条</span>,
            onChange: pageChange,
          }}
        />
      </div>

      <AddEdit ref={addEditRef} initData={initData}></AddEdit>
      <Analysis ref={analysisRef}></Analysis>
      <Identify ref={identifyRef}></Identify>
    </div>
  );
};
export default DeviceManage;
