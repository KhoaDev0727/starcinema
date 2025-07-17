// src/pages/Dashboard/EmployeeDashboard.tsx

import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Row, Statistic } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import "./EmployeeDashboard.scss";
import LanguageSwitcher from '../../Common/LanguageSwitcher';

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="employee-layout">
      <div className="sidebar">
        <Link to="/employee/dashboard" className="sidebar-title">
          Employee Panel
        </Link>
        <ul className="sidebar-menu">
          <li><Link to="/employee/profile"><UserOutlined /> My Profile</Link></li>
          <li><Link to="/employee/assigned-movies"><VideoCameraOutlined /> Assigned Movies</Link></li>
          <li><Link to="/employee/promotions"><GiftOutlined /> Promotions</Link></li>
        </ul>
      </div>

      <div className="content" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 32, zIndex: 10 }}>
          <LanguageSwitcher />
        </div>
        <h2 className="dashboard-title">Welcome to Employee Dashboard</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="My Tasks" value={12} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Handled Movies" value={8} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Active Promotions" value={4} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
