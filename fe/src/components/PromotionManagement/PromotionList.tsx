import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Popconfirm, Tag, Image, Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PromotionService } from '../../services/PromotionService';
import { PROMOTION_MESSAGES } from '../../constants/PromotionConst';
import type { PromotionResponseDTO } from '../../types/response/PromotionResponseDTO';
import PromotionForm from './PromotionForm';
import { getCookie } from '../../utils/auth';
import './styles/PromotionList.scss';

interface PromotionListProps {
  onRefresh?: () => void;
}

const PromotionList: React.FC<PromotionListProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionResponseDTO | undefined>();
  const [isEdit, setIsEdit] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResponseDTO | undefined>();

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await PromotionService.getAllPromotions();
      setPromotions(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('promotion.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = getCookie('role');
    if (role !== 'ADMIN') {
      message.error(t('auth.errors.forbidden'));
      navigate('/home');
      return;
    }
    fetchPromotions();
  }, [navigate]);

  const handleAdd = () => {
    setEditingPromotion(undefined);
    setIsEdit(false);
    setFormVisible(true);
  };

  const handleEdit = (record: PromotionResponseDTO) => {
    setEditingPromotion(record);
    setIsEdit(true);
    setFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await PromotionService.deletePromotion(id);
      message.success(t('promotion.messages.deleteSuccess'));
      fetchPromotions();
      onRefresh?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('promotion.messages.deleteError'));
    }
  };

  const handleViewDetail = (record: PromotionResponseDTO) => {
    setSelectedPromotion(record);
    setDetailVisible(true);
  };

  const handleFormSuccess = () => {
    fetchPromotions();
    onRefresh?.();
  };

  const getStatusTag = (startTime: string, endTime: string) => {
    const now = dayjs();
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    if (now.isBefore(start)) {
      return <Tag color="blue">{t('promotion.status.upcoming')}</Tag>;
    } else if (now.isAfter(end)) {
      return <Tag color="red">{t('promotion.status.expired')}</Tag>;
    } else {
      return <Tag color="green">{t('promotion.status.active')}</Tag>;
    }
  };

  const columns = [
    {
      title: t('promotion.table.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('promotion.table.title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('promotion.table.discount'),
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (discount: number) => `${discount}%`,
    },
    {
      title: t('promotion.table.startTime'),
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('promotion.table.endTime'),
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('promotion.table.description'),
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (description: string) => description || '-',
    },
    {
      title: t('promotion.table.image'),
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (imageUrl: string) => 
        imageUrl ? (
          <Image
            width={60}
            height={40}
            src={imageUrl}
            fallback="/images/avatar.png"
            alt="Promotion"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: t('promotion.table.status'),
      key: 'status',
      width: 100,
      render: (_: any, record: PromotionResponseDTO) => 
        getStatusTag(record.startTime, record.endTime),
    },
    {
      title: t('promotion.table.actions'),
      key: 'actions',
      width: 200,
      render: (_: any, record: PromotionResponseDTO) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title={t('promotion.table.viewDetails')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title={t('promotion.table.edit')}
          />
          <Popconfirm
            title={t('promotion.messages.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title={t('promotion.table.delete')}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="promotion-list">
      <div className="promotion-list-header">
        <h2>{t('promotion.title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          {t('promotion.addPromotion')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200 }}
      />

      <PromotionForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
        promotion={editingPromotion}
        isEdit={isEdit}
      />

      <Modal
        title={t('promotion.promotionDetails')}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            {t('auth.register.cancel')}
          </Button>
        ]}
        width={600}
      >
        {selectedPromotion && (
          <div className="promotion-detail">
            <div className="detail-row">
              <label>{t('promotion.table.id')}:</label>
              <span>{selectedPromotion.id}</span>
            </div>
            <div className="detail-row">
              <label>{t('promotion.table.title')}:</label>
              <span>{selectedPromotion.title}</span>
            </div>
            <div className="detail-row">
              <label>{t('promotion.table.discount')}:</label>
              <span>{selectedPromotion.discount}%</span>
            </div>
            <div className="detail-row">
              <label>{t('promotion.table.startTime')}:</label>
              <span>{dayjs(selectedPromotion.startTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="detail-row">
              <label>{t('promotion.table.endTime')}:</label>
              <span>{dayjs(selectedPromotion.endTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="detail-row">
              <label>{t('promotion.table.status')}:</label>
              <span>{getStatusTag(selectedPromotion.startTime, selectedPromotion.endTime)}</span>
            </div>
            {selectedPromotion.description && (
              <div className="detail-row">
                <label>{t('promotion.form.description')}:</label>
                <span>{selectedPromotion.description}</span>
              </div>
            )}
            {selectedPromotion.imageUrl && (
              <div className="detail-row">
                <label>{t('promotion.form.imageUrl')}:</label>
                <Image
                  width={200}
                  src={selectedPromotion.imageUrl}
                  fallback="/images/avatar.png"
                  alt="Promotion"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromotionList; 