import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaSave, FaBan, FaUser,
  FaEnvelope, FaPhone, FaUserShield,
  FaToggleOn, FaToggleOff, FaCheck, FaTimes as FaTimesCircle,
  FaIdCard, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave,
  FaCalendarAlt, FaVenusMars
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { EmployeeResponse } from '../../types/employee';

import './styles/EmployeeForm.scss';

interface Option {
  value: string;
  label: string;
}

interface InputFieldProps {
  label: string;
  name: keyof EmployeeResponse;
  value: string | number;
  icon?: React.ReactNode;
  readOnly?: boolean;
  error?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label, name, value, icon, readOnly = false, error, type = 'text', onChange
}) => (
  <label className="form-field">
    <span className="form-label">
      {icon && <span className="form-icon">{icon}</span>}
      {label}
    </span>
    <input
      className={`form-input ${error ? 'error' : ''}`}
      name={name}
      value={value}
      readOnly={readOnly}
      type={type}
      onChange={onChange}
    />
    {error && <span className="form-error">{error}</span>}
  </label>
);

interface SelectFieldProps {
  label: string;
  name: keyof EmployeeResponse;
  value: string;
  options: Option[];
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label, name, value, options, icon, onChange, error
}) => (
  <label className="form-field">
    <span className="form-label">
      {icon && <span className="form-icon">{icon}</span>}
      {label}
    </span>
    <select className={`form-input ${error ? 'error' : ''}`} name={name} value={value} onChange={onChange}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="form-error">{error}</span>}
  </label>
);

interface Props {
  employee: EmployeeResponse;
  onClose: () => void;
  onSave: (employee: EmployeeResponse) => void;
  serverError?: { field: string; message: string } | null;
  onClearError?: () => void;
}

const EditEmployeeForm: React.FC<Props> = ({ employee, onClose, onSave, serverError: propServerError, onClearError }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<EmployeeResponse>({ ...employee });
  const [errorField, setErrorField] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setForm({ ...employee });
    setErrorField(undefined);
    setServerError(undefined);
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof EmployeeResponse;
    
    let parsedValue: any = value;
    if (key === 'salary') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setForm(prev => ({
      ...prev,
      [key]: parsedValue,
    }));
    setErrorField(undefined);
    setServerError(undefined);
    
    // Clear server error when user starts typing
    if (propServerError?.field === key && onClearError) {
      onClearError();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate here if needed, setErrorField/setServerError if error
    onSave(form);
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(salary);
  };

  const getFieldError = (fieldName: string) => {
    return errorField === fieldName ? serverError : (propServerError?.field === fieldName ? propServerError.message : undefined);
  };

  const POSITION_OPTIONS = [
    { value: 'MANAGER', label: 'Quản lý rạp' },
    { value: 'TICKET_SELLER', label: 'Nhân viên bán vé' },
    { value: 'TICKET_CHECKER', label: 'Kiểm soát vé' },
    { value: 'CONCESSION', label: 'Phục vụ bắp nước' },
    { value: 'CLEANER', label: 'Vệ sinh' },
    { value: 'TECHNICIAN', label: 'Kỹ thuật' },
    { value: 'SECURITY', label: 'Bảo vệ' },
    { value: 'CUSTOMER_SERVICE', label: 'Chăm sóc khách hàng' },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaSave /> {t('employeeAdmin.editEmployee')}</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {propServerError?.message && (
            <div className="form-error global-error">
              <span className="error-icon">⚠️</span>
              {propServerError.message}
            </div>
          )}
          <div className="form-row">
            <InputField 
              label={t('employeeAdmin.fullName')} 
              name="fullName" 
              value={form.fullName || ''} 
              icon={<FaUser />} 
              error={getFieldError('fullName')} 
              onChange={handleChange}
            />
            <SelectField
              label={t('employeeAdmin.gender')}
              name="gender"
              value={form.gender || 'MALE'}
              icon={<FaVenusMars />}
              options={[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' }
              ]}
              onChange={handleChange}
              error={getFieldError('gender')}
            />
          </div>
          <div className="form-row">
            <InputField 
              label={t('employeeAdmin.email')} 
              name="email" 
              value={form.email || ''} 
              icon={<FaEnvelope />} 
              error={getFieldError('email')} 
              onChange={handleChange}
            />
            <InputField 
              label={t('employeeAdmin.phoneNumber')} 
              name="phoneNumber" 
              value={form.phoneNumber || ''} 
              icon={<FaPhone />} 
              error={getFieldError('phoneNumber')} 
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <InputField 
              label={t('employeeAdmin.identityCard')} 
              name="identityCard" 
              value={form.identityCard || ''} 
              icon={<FaIdCard />} 
              error={getFieldError('identityCard')} 
              onChange={handleChange}
            />
            <InputField 
              label={t('employeeAdmin.dateOfBirth')} 
              name="dateOfBirth" 
              value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''} 
              icon={<FaCalendarAlt />} 
              type="date"
              error={getFieldError('dateOfBirth')} 
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <InputField 
              label={t('employeeAdmin.address')} 
              name="address" 
              value={form.address || ''} 
              icon={<FaMapMarkerAlt />} 
              error={getFieldError('address')} 
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <SelectField
              label={t('employeeAdmin.position')}
              name="position"
              value={form.position || ''}
              icon={<FaBriefcase />}
              options={POSITION_OPTIONS}
              onChange={handleChange}
              error={getFieldError('position')}
            />
            <InputField
              label={t('employeeAdmin.salary')}
              name="salary"
              value={form.salary || ''}
              icon={<FaMoneyBillWave />}
              error={getFieldError('salary')}
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="form-actions-wrapper">
            <button type="button" className="btn-cancel" onClick={onClose}><FaBan /> {t('employeeAdmin.cancel')}</button>
            <button type="submit" className="btn-save"><FaSave /> {t('employeeAdmin.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeForm; 