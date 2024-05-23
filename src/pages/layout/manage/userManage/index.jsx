import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSafeState } from "ahooks";
import { Input, Button, Table, message, Popconfirm, Tooltip } from "antd";
import { SearchOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import "./index.less";
import Add from "./add";
import ChangePwd from "./changePwd";
import DeleteUser from "./deleteUser";
import userDao from "./service";
import useStore from "@/store";
import { toJS } from "mobx";

const UserManage = (props) => {
  //mobx
  const { userStore } = useStore();
  const userInfo = toJS(userStore.userInfo);
  // ref
  const tableRef = useRef(null);
  const addRef = useRef(null);
  const changePwdRef = useRef(null);
  const deleteUserRef = useRef(null);
  // state
  const [searchValue, setSearchValue] = useState(null);
  const [table, setTable] = useSafeState({
    columns: [
      {
        title: "用户名",
        dataIndex: "userName",
        ellipsis: { showTitle: false },
        render: (record) => (
          <Tooltip placement="top" title={record}>
            {record}
          </Tooltip>
        ),
      },
      {
        title: "角色",
        dataIndex: "id",
        ellipsis: { showTitle: false },
        render: (record) => {
          const recordCn = record === 1 ? "管理员" : "普通用户";
          return (
            <Tooltip placement="top" title={recordCn}>
              {recordCn}
            </Tooltip>
          );
        },
      },
      {
        title: "操作",
        key: "action",
        width: 210,
        render: (_, record) => {
          const isAdmin = userInfo.id === 1;
          const disabledBtn = record.id === 1;
          return (
            <>
              <Button type="link" onClick={() => changePwd(record)}>
                修改密码
              </Button>
              {isAdmin && !disabledBtn && (
                <>
                  <Popconfirm
                    title="密码将被重置为 123456 ，是否重置？"
                    onConfirm={() => resetPwd(record)}
                    okText="确认"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link">重置密码</Button>
                  </Popconfirm>
                  <Button type="link" onClick={() => deleteUserRef.current.getPage(record)}>
                    删除
                  </Button>
                </>
              )}
            </>
          );
        },
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
  }, [table.current, table.size]);

  const initData = async (data) => {
    setTable({
      ...table,
      loading: true,
    });
    const requestData = {
      userName: searchValue || null,
      pageNum: table.current,
      pageSize: table.size,
      ...data, //hooks先清空后重置无法确认先后顺序
    };
    const res = await userDao.userPage({ data: requestData });
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
    initData({ userName: null });
  };
  // 新增
  const addData = () => {
    addRef.current.getPage();
  };
  // 修改密码
  const changePwd = (data) => {
    changePwdRef.current.getPage(data.id);
  };
  // 重置密码
  const resetPwd = async (data) => {
    const res = await userDao.resetPassword({
      pathParams: {
        userId: data.id,
      },
    });
    if (res && res.status.code === 200) {
      message.success("重置成功，密码被重置为 123456");
      initData();
    } else {
      message.error(res ? res.status.msg : "未知错误，请联系管理员");
    }
  };

  const pageChange = (pageNum, pageSize) => {
    setTable({
      ...table,
      current: pageNum,
      size: pageSize,
    });
  };

  return (
    <div className="user-manage">
      <div className="search">
        <div className="left">
          <span className="text"> 用户名：</span>
          <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} allowClear placeholder="请输入" />
        </div>
        <div className="right">
          <Button type="primary" icon={<SearchOutlined />} onClick={search}>
            查询
          </Button>
          <Button icon={<DeleteOutlined />} onClick={reset}>
            重置
          </Button>
          {userInfo.id === 1 && (
            <Button icon={<PlusCircleOutlined />} type="primary" onClick={addData}>
              新增
            </Button>
          )}
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

      <Add ref={addRef} initData={initData}></Add>
      <ChangePwd ref={changePwdRef} initData={initData}></ChangePwd>
      <DeleteUser ref={deleteUserRef} initData={initData}></DeleteUser>
    </div>
  );
};
export default UserManage;
