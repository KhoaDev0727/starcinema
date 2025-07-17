// pages/EmployeeAdminPage.tsx
import React, { useEffect, useState } from 'react';
import { Typography, message, Modal, Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import type { EmployeeResponse } from '../../types/employee';
import { employeeService } from '../../services/EmployeeService';
import EmployeeListForm from '../../components/Employee/EmployeeListForm';
import EditEmployeeForm from '../../components/Employee/EditEmployeeForm';
import AddEmployeeForm from '../../components/Employee/AddEmployeeForm';
import { getCookie } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import '../../components/Employee/styles/EmployeeForm.scss';

const { Title } = Typography;

const EmployeeAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState<{ field: string; message: string } | null>(null);
  const [editError, setEditError] = useState<{ field: string; message: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const role = getCookie('role');
    if (role !== 'ADMIN') {
      message.error(t('auth.errors.forbidden'));
      navigate('/home');
      return;
    }
    fetchEmployees(page, pageSize);
  }, [navigate, page, pageSize, t]);

  const normalizeGender = (gender: string): string => {
    if (!gender) return 'MALE';
    
    const genderLower = gender.toLowerCase();
    if (genderLower === 'nam' || genderLower === 'male') return 'MALE';
    if (genderLower === 'nữ' || genderLower === 'female') return 'FEMALE';
    if (genderLower === 'khác' || genderLower === 'other') return 'OTHER';
    
    return 'MALE'; // default
  };

  const fetchEmployees = async (pageNum = page, size = pageSize) => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployees(pageNum - 1, size);
      setEmployees(data.content || []);
      setTotal(data.totalElements || 0);
      setPage(data.number + 1);
      setPageSize(data.size);
    } catch (error) {
      message.error(t('employeeAdmin.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleDelete = async (employeeId: string) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      fetchEmployees(); // Gọi lại API để lấy danh sách mới nhất
      message.success(t('employeeAdmin.success.deleteSuccess'));
    } catch (error: any) {
      message.error(t('employeeAdmin.errors.deleteFailed'));
    }
  };

  // Xóa toàn bộ logic Modal.confirm trong handleRestore, chỉ giữ lại gọi API
  const handleRestore = async (employeeId: string) => {
    try {
      await employeeService.restoreEmployee(employeeId);
      fetchEmployees();
      message.success(t('employeeAdmin.success.restoreSuccess'));
    } catch (error) {
      message.error(t('employeeAdmin.errors.restoreFailed'));
    }
  };

  const handleSaveEdit = async (updatedEmployee: EmployeeResponse) => {
    try {
      // Remove userId and other fields that shouldn't be sent to backend
      const { userId, emailVerified, role, hireDate, provider, providerId, ...updateData } = updatedEmployee;
      
      // Ensure date format is correct and gender is in correct format
      const employeeData = {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth).toISOString().split('T')[0] : updateData.dateOfBirth,
        gender: normalizeGender(updateData.gender)
      };
      
      await employeeService.updateEmployee(employeeData);
      setEmployees(employees.map(emp => 
        emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp
      ));
      setSelectedEmployee(null);
      message.success(t('employeeAdmin.success.updateSuccess'));
    } catch (error: any) {
      handleEmployeeError(error, setEditError);
    }
  };

  const handleSaveAdd = async (newEmployee: any) => {
    try {
      // Convert date format to match backend expectation and normalize gender
      const employeeData = {
        ...newEmployee,
        dateOfBirth: newEmployee.dateOfBirth, // Backend expects YYYY-MM-DD format which is what HTML date input provides
        gender: normalizeGender(newEmployee.gender)
      };
      
      await employeeService.addEmployee(employeeData);
      // Refresh the employee list after adding
      fetchEmployees();
      setShowAddModal(false);
      message.success(t('employeeAdmin.success.addSuccess'));
    } catch (error: any) {
      handleEmployeeError(error, setAddError);
    }
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setAddError(null);
  };

  const handleCloseEdit = () => {
    setSelectedEmployee(null);
    setEditError(null);
  };

  const handleClearAddError = () => {
    setAddError(null);
  };

  const handleClearEditError = () => {
    setEditError(null);
  };

  // Thêm hàm xử lý lỗi dùng chung cho add/edit
  const handleEmployeeError = (error: any, setError: (err: { field: string; message: string }) => void) => {
    const errorMessage = error.message || t('employeeAdmin.errors.addFailed');
    // Map message tiếng Anh sang tiếng Việt
    let displayMessage = errorMessage;
    if (errorMessage.includes('Email already exists')) {
      displayMessage = 'Email đã tồn tại trong hệ thống';
    } else if (errorMessage.includes('Phone number already exists')) {
      displayMessage = 'Số điện thoại đã tồn tại trong hệ thống';
    } else if (errorMessage.includes('Identity card already exists')) {
      displayMessage = 'CMND/CCCD đã tồn tại trong hệ thống';
    }
    // Nếu là lỗi trùng email/sdt/cccd thì chỉ hiển thị alert trên form, không hiển thị popup
    let fieldError = '';
    let fieldName = '';
    if (
      displayMessage.includes('Email đã tồn tại') ||
      displayMessage.includes('Số điện thoại đã tồn tại') ||
      displayMessage.includes('CMND/CCCD đã tồn tại')
    ) {
      setError({ field: '', message: displayMessage });
      return; // Không gọi message.error nữa
    }
    // Parse error message để xác định trường lỗi khác
    if (displayMessage.toLowerCase().includes('email')) {
      fieldName = 'email';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('số điện thoại') || displayMessage.toLowerCase().includes('phone')) {
      fieldName = 'phoneNumber';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('cmnd') || displayMessage.toLowerCase().includes('identity card')) {
      fieldName = 'identityCard';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('password')) {
      fieldName = 'password';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('full name')) {
      fieldName = 'fullName';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('date of birth')) {
      fieldName = 'dateOfBirth';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('gender')) {
      fieldName = 'gender';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('address')) {
      fieldName = 'address';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('position')) {
      fieldName = 'position';
      fieldError = displayMessage;
    } else if (displayMessage.toLowerCase().includes('salary')) {
      fieldName = 'salary';
      fieldError = displayMessage;
    }
    setError({ field: fieldName, message: fieldError });
    // Chỉ gọi message.error nếu không phải lỗi trùng email/sdt/cccd
    if (!fieldName) {
      message.error(displayMessage);
    }
  };

  if (loading) {
    return (
      <div className="ul-page-overlay">
        <div className="ul-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ul-page-overlay">
      <div className="ul-container">
        <Title level={2} className="admin-section-title">
          {t('employeeAdmin.employeeList')}
        </Title>

        <EmployeeListForm
          employees={employees}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          currentPage={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
        {/* Xóa phân trang dư thừa bên ngoài Table */}
        {/* <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={(p) => setPage(p)}
          />
        </div> */}

        {selectedEmployee && (
          <EditEmployeeForm
            employee={selectedEmployee}
            onClose={handleCloseEdit}
            onSave={handleSaveEdit}
            serverError={editError}
            onClearError={handleClearEditError}
          />
        )}

        {showAddModal && (
          <AddEmployeeForm
            onClose={handleCloseAdd}
            onSave={handleSaveAdd}
            serverError={addError}
            onClearError={handleClearAddError}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeAdminPage;