import React, { useState } from 'react';
import { Table, Input, Button, Select, Popover, Modal, Descriptions } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { FaUserEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { EmployeeResponse } from '../../types/employee';

const { Search } = Input;

interface Props {
  employees: EmployeeResponse[];
  onEdit: (employee: EmployeeResponse) => void;
  onAdd: () => void;
  onDelete: (employeeId: string) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const EmployeeListForm: React.FC<Props> = ({ employees, onEdit, onAdd, onDelete, currentPage, pageSize, total, onPageChange }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [viewEmployee, setViewEmployee] = useState<EmployeeResponse | null>(null);

  const positionOptions = ['ALL', ...Array.from(new Set(employees.map(e => e.position).filter(Boolean)))];

  const filteredEmployees = employees.filter(emp =>
    (statusFilter === 'ALL' || emp.status === statusFilter) &&
    (positionFilter === 'ALL' || emp.position === positionFilter) &&
    Object.values(emp).some(v => v?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (employeeId: string) => {
    Modal.confirm({
      title: t('employeeAdmin.deleteEmployee'),
      content: t('employeeAdmin.confirmDelete'),
      okText: t('employeeAdmin.delete'),
      cancelText: t('employeeAdmin.cancel'),
      okButtonProps: { style: { background: '#bfbfbf', color: '#fff', border: 'none' } },
      onOk: () => onDelete(employeeId)
    });
  };

  const columns = [
    {
      title: t('employeeAdmin.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      align: 'center' as const,
    },
    {
      title: t('employeeAdmin.email'),
      dataIndex: 'email',
      key: 'email',
      align: 'center' as const,
      render: (email: string, record: EmployeeResponse) => (
        <div className="email-container">
          <span>{email}</span>
          {record.emailVerified && (
            <span className="verified-badge" title="Email Verified">✓</span>
          )}
        </div>
      )
    },
    {
      title: t('employeeAdmin.position'),
      dataIndex: 'position',
      key: 'position',
      align: 'center' as const,
    },
    {
      title: t('employeeAdmin.gender'),
      dataIndex: 'gender',
      key: 'gender',
      align: 'center' as const,
      render: (gender: string) => gender === 'MALE' ? t('employeeAdmin.genderOptions.MALE', 'Nam') : gender === 'FEMALE' ? t('employeeAdmin.genderOptions.FEMALE', 'Nữ') : gender === 'OTHER' ? t('employeeAdmin.genderOptions.OTHER', 'Khác') : gender
    },
    {
      title: t('employeeAdmin.salary'),
      dataIndex: 'salary',
      key: 'salary',
      align: 'center' as const,
      render: (salary: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary)
    },
    {
      title: t('employeeAdmin.status'),
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: string) => (
        <span style={{ color: status === 'ACTIVE' ? 'green' : 'gray', fontWeight: 600 }}>
          {t(`employeeAdmin.statusOptions.${status}`)}
        </span>
      )
    },
    {
      title: t('employeeAdmin.actions'),
      key: 'actions',
      align: 'center' as const,
      render: (_: any, record: EmployeeResponse) => (
        <div className="action-buttons" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            className="btn-view"
            style={{ background: '#fff', color: '#1890ff', border: '1px solid #1890ff', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => setViewEmployee(record)}
          >
            <FaEye /> {t('employeeAdmin.view')}
          </Button>
          <Button
            className="btn-edit"
            style={{ background: '#1890ff', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => onEdit(record)}
          >
            <FaUserEdit /> {t('employeeAdmin.edit')}
          </Button>
          <Button
            className="btn-delete"
            style={{ background: '#bfbfbf', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => handleDelete(record.employeeId)}
          >
            <FaTrash /> {t('employeeAdmin.delete')}
          </Button>
        </div>
      )
    }
  ];

  const filterContent = (
    <div style={{ minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Select
        value={statusFilter}
        style={{ width: '100%' }}
        onChange={setStatusFilter}
        options={[
          { value: 'ALL', label: t('employeeAdmin.statusOptions.ALL', 'All Status') },
          { value: 'ACTIVE', label: t('employeeAdmin.statusOptions.ACTIVE', 'Active') },
          { value: 'INACTIVE', label: t('employeeAdmin.statusOptions.INACTIVE', 'Inactive') },
        ]}
      />
      <Select
        value={positionFilter}
        style={{ width: '100%' }}
        onChange={setPositionFilter}
        options={positionOptions.map(p => ({ value: p, label: p === 'ALL' ? t('employeeAdmin.positionOptions.ALL', 'All Positions') : p }))}
      />
    </div>
  );

  return (
    <div className="employee-list-form">
      <div className="employee-list-content">
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="employeeId"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: false,
            onChange: (page) => onPageChange(page)
          }}
          bordered
          className="employee-table"
          title={() => (
            <div className="employee-list-header">
              <div className="search-filter-container" style={{ flex: 1, marginRight: 16 }}>
                <Search
                  placeholder={t('employeeAdmin.search')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  prefix={<SearchOutlined />}
                  style={{ width: 220 }}
                />
                <Popover
                  content={filterContent}
                  trigger="click"
                  open={filterVisible}
                  onOpenChange={setFilterVisible}
                >
                  <Button icon={<FilterOutlined />} className="btn-filter" />
                </Popover>
              </div>
              <Button type="primary" className="add-btn" onClick={onAdd}>
                + {t('employeeAdmin.addEmployee')}
              </Button>
            </div>
          )}
        />
      </div>
      <Modal
        open={!!viewEmployee}
        title={t('employeeAdmin.detail')}
        onCancel={() => setViewEmployee(null)}
        footer={null}
      >
        {viewEmployee && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t('employeeAdmin.fullName')}>{viewEmployee.fullName}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.email')}>{viewEmployee.email}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.position')}>{viewEmployee.position}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.gender')}>{viewEmployee.gender}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.salary')}>{viewEmployee.salary}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.status')}>{viewEmployee.status}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.employeeId')}>{viewEmployee.employeeId}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.dateOfBirth')}>{viewEmployee.dateOfBirth}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.identityCard')}>{viewEmployee.identityCard}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.phoneNumber')}>{viewEmployee.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.address')}>{viewEmployee.address}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.role')}>{viewEmployee.role}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.hireDate')}>{viewEmployee.hireDate}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.provider')}>{viewEmployee.provider}</Descriptions.Item>
            <Descriptions.Item label={t('employeeAdmin.providerId')}>{viewEmployee.providerId}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeListForm;