import React, { useState } from 'react';
import { Table, Input, Button, Select, Popover, message } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserResponseDTO } from '../../types/response/UserResponseDTO';
import EditMemberForm from './EditMemberForm';
import { FaUserEdit } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './UserProfileAdminStyles/MemberList.scss';

const { Search } = Input;

interface MemberListFormProps {
  users: UserResponseDTO[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (value: string) => void;
  onEditUser: (user: UserResponseDTO) => void;
  onUpdateUser: (updatedUser: UserResponseDTO) => Promise<void>;
}

const MemberListForm: React.FC<MemberListFormProps> = ({
  users,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onEditUser,
  onUpdateUser
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);

  // Lấy danh sách provider duy nhất từ users
  const providerOptions = ['ALL', ...Array.from(new Set(users.map(u => u.provider).filter(Boolean)))];

  const filteredUsers = users.filter(user =>
    (statusFilter === 'ALL' || user.status === statusFilter) &&
    (providerFilter === 'ALL' || user.provider === providerFilter) &&
    (emailVerifiedFilter === 'ALL' || (emailVerifiedFilter === 'VERIFIED' ? user.emailVerified : !user.emailVerified)) &&
    Object.values(user).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleEditUser = (user: UserResponseDTO) => {
    setSelectedUser(user);
    onEditUser(user);
  };

  const handleSaveUser = async (updatedUser: UserResponseDTO) => {
    try {
      await onUpdateUser(updatedUser);
      setSelectedUser(null);
      message.success(t('auth.success.dataUpdated'));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || t('auth.errors.saveFailed');
      message.error(msg);
    }
  };

  const columns: ColumnsType<UserResponseDTO> = [
    { 
      title: t('registerAdmin.fullName'), 
      dataIndex: 'fullName',
      key: 'fullName'
    },
    { 
      title: t('registerAdmin.email'), 
      dataIndex: 'email',
      key: 'email'
    },
    { 
      title: t('registerAdmin.phoneNumber'), 
      dataIndex: 'phoneNumber',
      key: 'phoneNumber'
    },
    { 
      title: t('registerAdmin.role'), 
      dataIndex: 'role',
      key: 'role',
      render: role => role ? t(`registerAdmin.roleOptions.${role}`) : '-'
    },
    {
      title: t('registerAdmin.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span style={{ color: status === 'ACTIVE' ? 'green' : 'gray' }}>
          {t(`registerAdmin.statusOptions.${status}`)}
        </span>
      )
    },
    { 
      title: t('registerAdmin.provider'), 
      dataIndex: 'provider', 
      key: 'provider',
      render: p => p ?? '-'
    },
    {
      title: t('registerAdmin.emailVerified'),
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: verified => (
        <span className="email-container">
          {verified ? (
            <span className="verified-badge" title="Email Verified">✓</span>
          ) : (
            <span className="not-verified-badge" title="Email Not Verified" style={{ color: 'red', fontWeight: 'bold', fontSize: '1.2em' }}>✗</span>
          )}
        </span>
      )
    },
    {
      title: t('registerAdmin.actions'),
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            className="btn-edit"
            style={{ background: '#1890ff', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => handleEditUser(record)}
          >
            <FaUserEdit /> {t('registerAdmin.edit')}
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
          { value: 'ALL', label: t('registerAdmin.statusOptions.ALL', 'All Status') },
          { value: 'ACTIVE', label: t('registerAdmin.statusOptions.ACTIVE', 'Active') },
          { value: 'INACTIVE', label: t('registerAdmin.statusOptions.INACTIVE', 'Inactive') },
        ]}
      />
      <Select
        value={providerFilter}
        style={{ width: '100%' }}
        onChange={setProviderFilter}
        options={providerOptions.map(p => ({ value: p, label: p === 'ALL' ? t('registerAdmin.providerOptions.ALL', 'All Providers') : p }))}
      />
      <Select
        value={emailVerifiedFilter}
        style={{ width: '100%' }}
        onChange={setEmailVerifiedFilter}
        options={[
          { value: 'ALL', label: t('registerAdmin.emailVerifiedOptions.ALL', 'All') },
          { value: 'VERIFIED', label: t('registerAdmin.emailVerifiedOptions.VERIFIED', 'Verified') },
          { value: 'NOT_VERIFIED', label: t('registerAdmin.emailVerifiedOptions.NOT_VERIFIED', 'Not Verified') },
        ]}
      />
    </div>
  );

  return (
    <div className="member-list-form">
      <div className="search-filter-container">
        <Search
          placeholder={t('registerAdmin.search')}
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: 220 }}
          prefix={<SearchOutlined />}
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

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage + 1,
          total: totalPages * 6,
          pageSize: 6,
          onChange: page => onPageChange(page - 1),
        }}
        bordered
        className="member-table"
      />

      {selectedUser && (
        <EditMemberForm
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default MemberListForm; 