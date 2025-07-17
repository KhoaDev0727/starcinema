import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Typography, message, Button, Select, Popover } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserResponseDTO } from '../../types/response/UserResponseDTO';
import { getAllUsers, updateUserById } from '../../services/AuthService';
import EditUserModal from '../../components/UserProfileAdmin/EditMemberForm';
import '../../components/UserProfileAdmin/UserProfileAdminStyles/MemberList.scss';
import { getCookie } from '../../utils/auth';
import { useTranslation } from 'react-i18next';
import { FaUserEdit } from 'react-icons/fa';

const { Title } = Typography;

const MemberListPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserResponseDTO | null>(null);
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const role = getCookie('role');
    if (role !== 'ADMIN') {
      message.error(t('auth.errors.forbidden'));
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers(page, 6);
        setUsers(response.content);
        setTotalPages(response.totalPages);
      } catch {
        message.error(t('auth.errors.loadingFailed'));
      }
    };
    fetchUsers();
  }, [page]);

  const handleSave = async (updatedUser: UserResponseDTO) => {
    try {
      const { role, ...userWithoutRole } = updatedUser;
      const response = await updateUserById(userWithoutRole);
      if (response.emailVerified !== updatedUser.emailVerified) {
        throw new Error('Failed to update email verification status.');
      }
      setUsers((prev: UserResponseDTO[]) => prev.map(u => u.id === response.id ? response : u));
      setSelectedUser(null);
      message.success(t('auth.success.dataUpdated'));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || t('auth.errors.saveFailed');
      const field = msg.toLowerCase().includes('email') ? 'email'
                  : msg.toLowerCase().includes('phone') ? 'phoneNumber'
                  : 'serverError';
      setSelectedUser(prev => prev ? { ...prev, serverError: msg, errorField: field } : null);
      message.error(msg);
    }
  };

  const providerOptions = ['ALL', ...Array.from(new Set(users.map(u => u.provider).filter(Boolean)))]

  const filtered = users.filter(user =>
    (statusFilter === 'ALL' || user.status === statusFilter) &&
    (providerFilter === 'ALL' || user.provider === providerFilter) &&
    (emailVerifiedFilter === 'ALL' || (emailVerifiedFilter === 'VERIFIED' ? user.emailVerified : !user.emailVerified)) &&
    Object.values(user).some(val =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns: ColumnsType<UserResponseDTO> = [
    { title: t('registerAdmin.fullName'), dataIndex: 'fullName' },
    { title: t('registerAdmin.email'), dataIndex: 'email' },
    { title: t('registerAdmin.phoneNumber'), dataIndex: 'phoneNumber' },
    { 
      title: t('registerAdmin.role'), 
      dataIndex: 'role',
      render: role => role ? t(`registerAdmin.roleOptions.${role}`) : '-'
    },
    {
      title: t('registerAdmin.status'),
      dataIndex: 'status',
      render: status => (
        <span style={{ color: status === 'ACTIVE' ? 'green' : 'gray' }}>
          {t(`registerAdmin.statusOptions.${status}`)}
        </span>
      )
    },
    { title: t('registerAdmin.provider'), dataIndex: 'provider', render: p => p ?? '-' },
    {
      title: t('registerAdmin.emailVerified'),
      dataIndex: 'emailVerified',
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
      render: (_, record) => (
        <Button
          className="btn-edit"
          style={{ background: '#1890ff', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setSelectedUser(record)}
        >
          <FaUserEdit /> {t('registerAdmin.edit')}
        </Button>
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
    <div className="ul-page-overlay">
      <div className="ul-container">
        <Title level={2} className="admin-section-title">{t('registerAdmin.memberList')}</Title>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('registerAdmin.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{
            current: page + 1,
            total: totalPages * 6,
            pageSize: 6,
            onChange: p => setPage(p - 1),
          }}
          bordered
          className="ul-table"
        />

        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

export default MemberListPage; 