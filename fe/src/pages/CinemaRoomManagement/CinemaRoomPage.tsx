import { Card, Typography } from 'antd';
import React from 'react';
import { CinemaRoomList } from '../../components/CinemaRoomManagement/CinemaRoomList';
import { PageWrapper } from './CinemaRoomPage.styled';

const { Title } = Typography;

const CinemaRoomPage: React.FC = () => {
  return (
    <PageWrapper>
      <Title level={2} className="admin-section-title">Cinema Room Management</Title>
      <Card>
        <CinemaRoomList />
      </Card>
    </PageWrapper>
  );
};

export default CinemaRoomPage;
