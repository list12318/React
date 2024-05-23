import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Input, Button, Table, message, Tooltip, DatePicker } from "antd";
import { useUpdateEffect, useSafeState } from "ahooks";
import dayjs from "dayjs";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import "./index.less";
import logDao from "./service";
import { cloneDeep } from "lodash";

const OperateLog = (props) => {
  const tableRef = useRef(null);

  const [searchValue, setSearchValue] = useState({
    operator: "",
    searchTime: "",
    timeKey: new Date(),
  });

  const columnRender = (text) => {
    return (
      <Tooltip placement="top" title={text}>
        {text}
      </Tooltip>
    );
  };

  const [table, setTable] = useSafeState({
    columns: [
      {
        title: "操作人",
        dataIndex: "operator",
        ellipsis: { showTitle: false },
        render: columnRender,
      },
      {
        title: "操作模块",
        dataIndex: "moduleName",
        ellipsis: { showTitle: false },
        render: columnRender,
      },
      {
        title: "操作类型",
        dataIndex: "type",
        ellipsis: { showTitle: false },
        render: columnRender,
      },
      {
        title: "操作时间",
        dataIndex: "createTimeCn",
        ellipsis: { showTitle: false },
        render: columnRender,
      },
    ],
    data: [],
    loading: false,
    current: 1,
    size: 50,
    total: 0,
  });
  const [tableHeight, setTableHeight] = useState(0);

  useLayoutEffect(() => {
    setTableHeight(tableRef.current.offsetHeight - 64 - 55); //设置table最大滚动高度，64为分页，55为表头
  }, []);

  useEffect(() => {
    initData();
  }, []);

  // 忽略首次执行，依赖更新时才执行
  useUpdateEffect(() => {
    initData();
  }, [table.current, table.size]);

  const initData = async (data) => {
    setTable({
      ...table,
      loading: true,
    });
    const requestData = {
      operator: searchValue.operator || null,
      searchTime: searchValue.searchTime,
      pageNum: table.current,
      pageSize: table.size,
      ...data, //hooks先清空后重置无法确认先后顺序
    };
    const res = await logDao.logPage({ data: requestData });
    if (res && res.status.code === 200) {
      setTable({
        ...table,
        data: res.data.list.map((v) => {
          return {
            ...v,
            createTimeCn: dayjs(v.createTime).format("YYYY-MM-DD HH:mm:ss"),
          };
        }),
        total: res.data.count,
        loading: false,
      });
    }
  };
  const search = () => {
    initData();
  };
  const reset = () => {
    setSearchValue({
      operator: "",
      searchTime: "",
      timeKey: new Date(),
    });
    initData({ operator: null, searchTime: "" });
  };

  const pageChange = (pageNum, pageSize) => {
    setTable({
      ...table,
      current: pageNum,
      size: pageSize,
    });
  };

  return (
    <div className="operate-log">
      <div className="search">
        <div className="left">
          <div className="search-item">
            <span className="text"> 操作人：</span>
            <Input
              value={searchValue.operator}
              onChange={(e) =>
                setSearchValue({
                  ...searchValue,
                  operator: e.target.value,
                })
              }
              allowClear
              placeholder="请输入"
            />
          </div>
          <div className="search-item">
            <span className="text"> 操作时间：</span>
            <DatePicker
              key={searchValue.timeKey}
              onChange={(date, dateString) =>
                setSearchValue({
                  ...searchValue,
                  searchTime: dateString,
                })
              }
            />
          </div>
        </div>
        <div className="right">
          <Button type="primary" icon={<SearchOutlined />} onClick={search}>
            查询
          </Button>
          <Button icon={<DeleteOutlined />} onClick={reset}>
            重置
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
    </div>
  );
};
export default OperateLog;
