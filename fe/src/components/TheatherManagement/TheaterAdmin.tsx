import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Input, Button, Select, Modal, Form, Row, Col, Typography } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { ColumnsType } from 'antd/es/table';
import type { TheaterResponseDTO } from '../../types/response/TheaterResponseDTO';
import THEATER_ADMIN_CONSTANTS from '../../constants/TheaterAdminConst';
import './styles/TheaterAdmin.scss';

const { Title } = Typography;

interface TheaterAdminProps {
  theaters: TheaterResponseDTO[];
  locations: { locationId: string; locationName: string }[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  theatersPerPage: number;
  totalPages: number;
  newTheater: Partial<TheaterResponseDTO>;
  setNewTheater: (theater: Partial<TheaterResponseDTO>) => void;
  selectedTheater: TheaterResponseDTO | null;
  setSelectedTheater: (theater: TheaterResponseDTO | null) => void;
  onAddTheater: (values: any) => void;
  onUpdateTheater: (values: any) => void;
  onDeleteTheater: (id: string, name: string) => void;
}

const TheaterAdmin: React.FC<TheaterAdminProps> = ({
  theaters,
  locations,
  loading,
  error,
  setError,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  theatersPerPage,
  totalPages,
  newTheater,
  setNewTheater,
  selectedTheater,
  setSelectedTheater,
  onAddTheater,
  onUpdateTheater,
  onDeleteTheater,
}) => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  // Helper functions to handle both old and new theater structure
  const getLocationId = (theater: TheaterResponseDTO): string => {
    return theater.locationId || theater.location?.locationId || '';
  };

  const getLocationName = (theater: TheaterResponseDTO): string => {
    return theater.locationName || theater.location?.locationName || '';
  };

  const toggleAddModal = () => {
    setIsAddModalOpen((prev) => !prev);
    setNewTheater(THEATER_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_THEATER);
    setError(null);
    addForm.resetFields();
  };

  const toggleUpdateModal = (theater?: TheaterResponseDTO) => {
    setIsUpdateModalOpen((prev) => !prev);
    if (theater) {
      setSelectedTheater(theater);
      updateForm.setFieldsValue({
        theaterName: theater.theaterName,
        locationId: getLocationId(theater),
        phoneNumber: theater.phoneNumber || '',
      });
    } else {
      setSelectedTheater(null);
    }
    setError(null);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedTheater(null);
    setError(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollButtonVisible(window.scrollY > THEATER_ADMIN_CONSTANTS.PAGINATION.SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = (to: 'top' | 'bottom') => {
    if (to === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const filteredTheaters = theaters.filter((theater) =>
    theater.theaterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationName(theater).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnsType<TheaterResponseDTO> = [
    {
      title: t('theaterAdmin.table.name', { defaultValue: 'Theater Name' }),
      dataIndex: 'theaterName',
      key: 'theaterName',
    },
    {
      title: t('theaterAdmin.table.location', { defaultValue: 'Location' }),
      key: 'locationName',
      render: (_, record) => getLocationName(record),
    },
    {
      title: t('theaterAdmin.table.phone', { defaultValue: 'Phone Number' }),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phoneNumber) => phoneNumber || 'N/A',
    },
    {
      title: t('theaterAdmin.table.action', { defaultValue: 'Action' }),
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="link"
            onClick={() => toggleUpdateModal(record)}
            icon={<EditOutlined />}
            className="action-button"
          />
          <Button
            type="link"
            danger
            onClick={() => onDeleteTheater(record.theaterId, record.theaterName)}
            icon={<DeleteOutlined />}
            className="action-button"
          />
        </div>
      ),
    },
  ];

  const validatePhoneNumber = (_: any, value: string) => {
    if (value && !THEATER_ADMIN_CONSTANTS.VALIDATION.PHONE_NUMBER_PATTERN.test(value)) {
      return Promise.reject(t('theaterAdmin.form.invalidPhoneNumber', { defaultValue: 'Invalid phone number format' }));
    }
    return Promise.resolve();
  };

  return (
    <div className="theater-admin-container">
      <Title level={2} className="theater-admin-title">
        {t('theaterAdmin.title', { defaultValue: 'Theater Management' })}
      </Title>
      
      <div className="theater-admin-search">
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('theaterAdmin.searchPlaceholder', { defaultValue: 'Search theaters...' })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={toggleAddModal}
          className="add-theater-button"
        >
          {t('theaterAdmin.form.add', { defaultValue: 'Add Theater' })}
        </Button>
      </div>

      {loading ? (
        <p>{t('theaterAdmin.loading', { defaultValue: 'Loading...' })}</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredTheaters}
          rowKey="theaterId"
          pagination={{
            current: currentPage,
            total: filteredTheaters.length,
            pageSize: theatersPerPage,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
          className="theater-table"
        />
      )}

      {isScrollButtonVisible && (
        <div className="scroll-buttons">
          <motion.button
            className="scroll-button scroll-top"
            onClick={() => handleScroll('top')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
          <motion.button
            className="scroll-button scroll-bottom"
            onClick={() => handleScroll('bottom')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↓
          </motion.button>
        </div>
      )}

      {/* Add Theater Modal */}
      <Modal
        title={t('theaterAdmin.form.addTheater', { defaultValue: 'Add New Theater' })}
        open={isAddModalOpen}
        onCancel={toggleAddModal}
        footer={null}
        width={600}
      >
                 <Form
           form={addForm}
           layout="vertical"
           onFinish={(values) => onAddTheater(values)}
         >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.theaterName', { defaultValue: 'Theater Name' })}
                name="theaterName"
                rules={[
                  { required: true, message: t('theaterAdmin.form.theaterNameRequired', { defaultValue: 'Theater name is required' }) },
                  { max: THEATER_ADMIN_CONSTANTS.VALIDATION.THEATER_NAME_MAX_LENGTH, message: t('theaterAdmin.form.theaterNameTooLong', { defaultValue: 'Theater name cannot exceed 255 characters' }) }
                ]}
              >
                <Input maxLength={THEATER_ADMIN_CONSTANTS.VALIDATION.THEATER_NAME_MAX_LENGTH} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.location', { defaultValue: 'Location' })}
                name="locationId"
                rules={[
                  { required: true, message: t('theaterAdmin.form.locationRequired', { defaultValue: 'Location is required' }) }
                ]}
              >
                <Select placeholder={t('theaterAdmin.form.selectLocation', { defaultValue: 'Select Location' })}>
                  {locations.map((location) => (
                    <Select.Option key={location.locationId || ''} value={location.locationId || ''}>
                      {location.locationName || ''}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.phoneNumber', { defaultValue: 'Phone Number' })}
                name="phoneNumber"
                rules={[
                  { validator: validatePhoneNumber }
                ]}
              >
                <Input maxLength={THEATER_ADMIN_CONSTANTS.VALIDATION.PHONE_NUMBER_MAX_LENGTH} />
              </Form.Item>
            </Col>
          </Row>
          <div className="modal-buttons">
            <Button onClick={toggleAddModal}>
              {t('theaterAdmin.form.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('theaterAdmin.form.add', { defaultValue: 'Add' })}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Update Theater Modal */}
             <Modal
         title={t('theaterAdmin.form.updateTheater', { defaultValue: 'Update Theater' })}
         open={isUpdateModalOpen}
         onCancel={closeUpdateModal}
         footer={null}
         width={600}
       >
                 <Form
           form={updateForm}
           layout="vertical"
           onFinish={(values) => onUpdateTheater(values)}
         >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.theaterName', { defaultValue: 'Theater Name' })}
                name="theaterName"
                rules={[
                  { required: true, message: t('theaterAdmin.form.theaterNameRequired', { defaultValue: 'Theater name is required' }) },
                  { max: THEATER_ADMIN_CONSTANTS.VALIDATION.THEATER_NAME_MAX_LENGTH, message: t('theaterAdmin.form.theaterNameTooLong', { defaultValue: 'Theater name cannot exceed 255 characters' }) }
                ]}
              >
                <Input maxLength={THEATER_ADMIN_CONSTANTS.VALIDATION.THEATER_NAME_MAX_LENGTH} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.location', { defaultValue: 'Location' })}
                name="locationId"
                rules={[
                  { required: true, message: t('theaterAdmin.form.locationRequired', { defaultValue: 'Location is required' }) }
                ]}
              >
                <Select placeholder={t('theaterAdmin.form.selectLocation', { defaultValue: 'Select Location' })}>
                  {locations.map((location) => (
                    <Select.Option key={location.locationId || ''} value={location.locationId || ''}>
                      {location.locationName || ''}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('theaterAdmin.form.phoneNumber', { defaultValue: 'Phone Number' })}
                name="phoneNumber"
                rules={[
                  { validator: validatePhoneNumber }
                ]}
              >
                <Input maxLength={THEATER_ADMIN_CONSTANTS.VALIDATION.PHONE_NUMBER_MAX_LENGTH} />
              </Form.Item>
            </Col>
          </Row>
                     <div className="modal-buttons">
             <Button onClick={closeUpdateModal}>
               {t('theaterAdmin.form.cancel', { defaultValue: 'Cancel' })}
             </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('theaterAdmin.form.update', { defaultValue: 'Update' })}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TheaterAdmin;