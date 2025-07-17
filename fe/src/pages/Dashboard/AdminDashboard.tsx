import React, { useEffect, useState, useRef } from "react";
import { Card, Col, Layout, Menu, Row, Statistic, Typography } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  GiftOutlined,
  LogoutOutlined,
  CalendarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminDashboard.scss";
import axios from "axios";
import Cookies from "js-cookie";
import styled from "styled-components";
import { useTranslation } from 'react-i18next';
import usflag from '../../assets/img/usflag.png';
import vietnameflag from '../../assets/img/vietnamflag.png';
import LanguageSwitcher from '../../Common/LanguageSwitcher';
import { Column } from '@ant-design/plots';

// Hàm decode giống trong Header.tsx
function decodeCookieValue(value?: string) {
  if (!value) return "";
  return decodeURIComponent(value.replace(/\+/g, " "));
}

// Đảm bảo mọi giá trị truyền vào chart là số hợp lệ
const safeValue = (v: any) => (typeof v === 'number' && !isNaN(v) ? v : 0);

const { Sider } = Layout;
const { Title } = Typography;

const PageContainer = styled(Layout)`
  display: flex;
`;

const ContentWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow-x: hidden;
`;

const StyledContent = styled.div`
  padding: 20px;
  z-index: 0;
  position: relative;
  background-color: #fff;
  min-height: 100vh;
  width: 100%;
`;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Map URL path to menu key
  const pathToKey: { [key: string]: string } = {
    user: "user",
    "movie-management": "movie",
    "employee-management": "employee",
    "promotion-management": "promotion",
    "tickets-management": "ticket",
    "showtime-management": "schedule",
  };
  const selectedKey = pathToKey[location.pathname.split("/")[2]] || "dashboard";

  const [fullName, setFullName] = useState<string>("");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const logoutRef = useRef<HTMLDivElement>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [statistics, setStatistics] = useState<{
    userCount: number;
    promotionCount: number;
    movieCount: number;
    employeeCount: number;
    scheduleCount: number;
    ticketsSold?: number;
    schedulesToday?: number;
    activePromotions?: number;
  }>({
    userCount: 0,
    promotionCount: 0,
    movieCount: 0,
    employeeCount: 0,
    scheduleCount: 0,
    ticketsSold: 0,
    schedulesToday: 0,
    activePromotions: 0,
  });

  useEffect(() => {
    const decodedName = decodeCookieValue(Cookies.get("fullName"));
    if (decodedName) setFullName(decodedName);

    // Đóng menu khi nhấp ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target as Node) && isLogoutOpen) {
        setIsLogoutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLogoutOpen]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/admin/statistics")
      .then(res => setStatistics(res.data))
      .catch(err => console.error("Error fetching statistics:", err));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/login/logout",
        {},
        {
          withCredentials: true,
        },
      );
      Cookies.remove("userId");
      Cookies.remove("fullName");
      Cookies.remove("role");
      Cookies.remove("status");
      navigate("/login");
      setIsLogoutOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleUserClick = () => {
    console.log("User button clicked");
    setIsLogoutOpen(!isLogoutOpen);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsLangDropdownOpen(false);
  };

  const toggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };

  return (
    <PageContainer style={{ overflowY: "hidden" }}>
      <Sider width={230}>
        <div className="logo">
          <Link to="/admin">
            <Title level={3} style={{ color: "white", margin: 16 }}>
              {t('adminDashboard.title')}
            </Title>
          </Link>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="user" icon={<UserOutlined />}>
            <Link to="/admin/user">{t('adminDashboard.userProfile')}</Link>
          </Menu.Item>
          <Menu.Item key="movie" icon={<VideoCameraOutlined />}>
            <Link to="/admin/movie-management">{t('adminDashboard.movieManagement')}</Link>
          </Menu.Item>
          <Menu.Item key="employee" icon={<TeamOutlined />}>
            <Link to="/admin/employee-management">{t('adminDashboard.employeeManagement')}</Link>
          </Menu.Item>
          <Menu.Item key="promotion" icon={<GiftOutlined />}>
            <Link to="/admin/promotion-management">{t('adminDashboard.promotionManagement')}</Link>
          </Menu.Item>
          <Menu.Item key="ticket" icon={<GiftOutlined />}>
            <Link to="/admin/tickets-management">{t('adminDashboard.ticketManagement')}</Link>
          </Menu.Item>
          <Menu.Item key="schedule" icon={<CalendarOutlined />}>
            <Link to="/admin/showtime-management">{t('adminDashboard.scheduleManagement')}</Link>
          </Menu.Item>
        </Menu>
        <div className="user-info-btn" onClick={handleUserClick} style={{ position: 'absolute', bottom: 24, left: 24, margin: 0, background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ color: '#fff', fontSize: 18 }} />
          <span className="user-name-display" style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>{fullName || "Admin"}</span>
        </div>
      </Sider>

      <ContentWrapper>
        <div className="admin-lang-switcher">
          <LanguageSwitcher />
        </div>
        <StyledContent>
          {selectedKey === "dashboard" ? (
            <>
              <Title level={2} style={{ marginBottom: 32 }}>{t('adminDashboard.welcome')}</Title>
              {/* Sử dụng Ant Design Card + Row/Col */}
              <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <UserOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Tổng số người dùng</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.userCount}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <TeamOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Nhân viên</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.employeeCount}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <VideoCameraOutlined style={{ fontSize: 32, color: "#faad14" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Phim</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.movieCount}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <CalendarOutlined style={{ fontSize: 32, color: "#722ed1" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Lịch chiếu</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.scheduleCount}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <GiftOutlined style={{ fontSize: 32, color: "#eb2f96" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Khuyến mãi</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.promotionCount}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <GiftOutlined style={{ fontSize: 32, color: "#13c2c2" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Khuyến mãi đang hoạt động</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.activePromotions}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <VideoCameraOutlined style={{ fontSize: 32, color: "#f5222d" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Vé đã bán</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.ticketsSold}</div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card bordered hoverable>
                    <CalendarOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
                    <div style={{ marginTop: 8, color: '#888' }}>Suất chiếu hôm nay</div>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{statistics.schedulesToday}</div>
                  </Card>
                </Col>
              </Row>
              {/* Đã xóa hình banner */}
            </>
          ) : (
            <Outlet />
          )}
        </StyledContent>
      </ContentWrapper>

      {isLogoutOpen && (
        <div className="user-logout-menu" ref={logoutRef}>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined /> {t('adminDashboard.logout')}
          </button>
        </div>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
