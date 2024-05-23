import React, { useState, useEffect } from "react";
import { Input } from "antd";
import "./index.less";

const List = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    setActive(props.active);
  }, [props.active]);

  const tapChange = () => {
    setCollapsed(!collapsed);
  };

  const search = (e) => {
    const filterData = props.data.filter((v) => v.label.toLowerCase().includes(e.toLowerCase()));
    setData(filterData);
  };
  const listClick = (v) => {
    setActive(v.id);
    props.onChange(v);
  };

  return (
    <div className={`component-list ${collapsed ? "component-list-collapsed" : ""}`}>
      <div className="tapContainer">
        <div className="tap" onClick={tapChange}></div>
      </div>
      <div className="list-content">
        {props.title ? (
          <div className="title">
            <span>{props.title}</span>
            <div className="tool">{props.renderTool ? props.renderTool() : null}</div>
          </div>
        ) : null}

        {props.filterable ? (
          <div className="search">
            <Input.Search allowClear maxLength="50" onSearch={search} placeholder="请输入" />
          </div>
        ) : null}

        <div className="list-scrollbar">
          {data && data.length ? (
            data.map((item, index) => {
              return (
                <div className={["list-item", active === item.id ? "active" : ""].join(" ")} key={item.id} title={item.label} onClick={() => listClick(item)}>
                  {props.renderList ? (
                    props.renderList(item)
                  ) : (
                    <div className="default-list">
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-block">
              <span className="empty-text">暂无数据</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;
