import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col } from "antd";
import errImg from "@/assets/img/404.png";
import "./index.less";

const NotFound = () => {
  const navigate = useNavigate();
  const goHome = () => navigate(-1);
  return (
    <Row className="not-found">
      <Col span={12}>
        <img src={errImg} alt="404" />
      </Col>
      <Col span={12} className="right">
        <h1>404</h1>
        <h2>抱歉，你访问的页面不存在</h2>
        <div>
          <Button type="primary" onClick={goHome}>
            返回上一级
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default NotFound;
