import React, { useState } from 'react';
import {
  FaTimes, FaSave, FaBan, FaUser,
  FaEnvelope, FaPhone, FaUserShield,
  FaIdCard, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave,
  FaCalendarAlt, FaVenusMars, FaLock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { AddEmployeeRequest } from '../../types/employee';
import { EMPLOYEE_CONSTANTS } from '../../constants/employeeConstants';
import './styles/EmployeeForm.scss';

interface Option {
  value: string;
  label: string;
}

interface InputFieldProps {
  label: string;
  name: keyof AddEmployeeRequest;
  value: string | number;
  icon?: React.ReactNode;
  error?: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label, name, value, icon, error, type = 'text', onChange
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
      type={type}
      onChange={onChange}
    />
    {error && <span className="form-error">{error}</span>}
  </label>
);

interface SelectFieldProps {
  label: string;
  name: keyof AddEmployeeRequest;
  value: string;
  options: Option[];
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label, name, value, options, icon, onChange, error
}) => {
  const { t } = useTranslation();
  return (
    <label className="form-field">
      <span className="form-label">
        {icon && <span className="form-icon">{icon}</span>}
        {label}
      </span>
      <select className={`form-input ${error ? 'error' : ''}`} name={name} value={value} onChange={onChange}>
        <option value="">{t('employeeAdmin.selectOption')}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </label>
  );
};

interface Props {
  onClose: () => void;
  onSave: (employee: AddEmployeeRequest) => void;
  serverError?: { field: string; message: string } | null;
  onClearError?: () => void;
}

const AddEmployeeForm: React.FC<Props> = ({ onClose, onSave, serverError: propServerError, onClearError }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<AddEmployeeRequest>({
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    identityCard: '',
    email: '',
    phoneNumber: '',
    address: '',
    position: '',
    salary: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localServerError, setLocalServerError] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Password validation
    if (!form.password) {
      newErrors.password = t('employeeAdmin.errors.passwordRequired');
    } else if (form.password.length < EMPLOYEE_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = t('employeeAdmin.errors.passwordMinLength', { min: EMPLOYEE_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH });
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = t('employeeAdmin.errors.confirmPasswordRequired');
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = t('employeeAdmin.errors.passwordMismatch');
    }

    // Full name validation
    if (!form.fullName) {
      newErrors.fullName = t('employeeAdmin.errors.fullNameRequired');
    } else if (form.fullName.length < EMPLOYEE_CONSTANTS.VALIDATION.FULL_NAME_MIN_LENGTH) {
      newErrors.fullName = t('employeeAdmin.errors.fullNameMinLength', { min: EMPLOYEE_CONSTANTS.VALIDATION.FULL_NAME_MIN_LENGTH });
    }

    // Date of birth validation
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = t('employeeAdmin.errors.dateOfBirthRequired');
    } else {
      const birthDate = new Date(form.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < EMPLOYEE_CONSTANTS.VALIDATION.MIN_AGE) {
        newErrors.dateOfBirth = t('employeeAdmin.errors.minAge', { min: EMPLOYEE_CONSTANTS.VALIDATION.MIN_AGE });
      }
    }

    // Gender validation
    if (!form.gender) {
      newErrors.gender = t('employeeAdmin.errors.genderRequired');
    }

    // Identity card validation
    if (!form.identityCard) {
      newErrors.identityCard = t('employeeAdmin.errors.identityCardRequired');
    } else if (!/^[0-9]{9,12}$/.test(form.identityCard)) {
      newErrors.identityCard = t('employeeAdmin.errors.identityCardInvalid');
    }

    // Email validation
    if (!form.email) {
      newErrors.email = t('employeeAdmin.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('employeeAdmin.errors.emailInvalid');
    }

    // Phone number validation
    if (!form.phoneNumber) {
      newErrors.phoneNumber = t('employeeAdmin.errors.phoneNumberRequired');
    } else if (!/^[0-9]{10,11}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = t('employeeAdmin.errors.phoneNumberInvalid');
    }

    // Address validation
    if (!form.address) {
      newErrors.address = t('employeeAdmin.errors.addressRequired');
    } else if (form.address.length < EMPLOYEE_CONSTANTS.VALIDATION.ADDRESS_MIN_LENGTH) {
      newErrors.address = t('employeeAdmin.errors.addressMinLength', { min: EMPLOYEE_CONSTANTS.VALIDATION.ADDRESS_MIN_LENGTH });
    }

    // Position validation
    if (!form.position) {
      newErrors.position = t('employeeAdmin.errors.positionRequired');
    } else if (form.position.length < EMPLOYEE_CONSTANTS.VALIDATION.POSITION_MIN_LENGTH) {
      newErrors.position = t('employeeAdmin.errors.positionMinLength', { min: EMPLOYEE_CONSTANTS.VALIDATION.POSITION_MIN_LENGTH });
    }

    // Salary validation
    if (!form.salary || form.salary <= 0) {
      newErrors.salary = t('employeeAdmin.errors.salaryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof AddEmployeeRequest;
    
    let parsedValue: any = value;
    if (key === 'salary') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setForm(prev => ({
      ...prev,
      [key]: parsedValue,
    }));

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    setLocalServerError(undefined);
    
    // Clear server error when user starts typing
    if (propServerError?.field === key && onClearError) {
      onClearError();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalServerError(undefined);

    if (!validateForm()) {
      return;
    }

    onSave(form);
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
          <h3><FaSave /> {t('employeeAdmin.addEmployee')}</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          {(propServerError?.message || localServerError) && (
            <div className="form-error global-error">
              <span className="error-icon">⚠️</span>
              {propServerError?.message || localServerError}
            </div>
          )}
          {/* Email và PhoneNumber lên đầu */}
          <div className="form-row">
            <InputField
              label={t('employeeAdmin.email')}
              name="email"
              value={form.email}
              icon={<FaEnvelope />}
              error={errors.email}
              onChange={handleChange}
            />
            <InputField
              label={t('employeeAdmin.phoneNumber')}
              name="phoneNumber"
              value={form.phoneNumber}
              icon={<FaPhone />}
              error={errors.phoneNumber}
              onChange={handleChange}
            />
          </div>
          {/* Password và ConfirmPassword có icon xem/ẩn */}
          <div className="form-row">
            <label className="form-field">
              <span className="form-label">
                <span className="form-icon"><FaLock /></span>
                {t('employeeAdmin.password')}
              </span>
              <div className="input-password-wrapper">
                <input
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  name="password"
                  value={form.password}
                  type={showPassword ? 'text' : 'password'}
                  onChange={handleChange}
                />
                <span className="password-toggle" onClick={() => setShowPassword(v => !v)} style={{ cursor: 'pointer' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </label>
            <label className="form-field">
              <span className="form-label">
                <span className="form-icon"><FaLock /></span>
                {t('employeeAdmin.confirmPassword')}
              </span>
              <div className="input-password-wrapper">
                <input
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={handleChange}
                />
                <span className="password-toggle" onClick={() => setShowConfirmPassword(v => !v)} style={{ cursor: 'pointer' }}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </label>
          </div>
          {/* Các trường còn lại */}
          <div className="form-row">
            <InputField
              label={t('employeeAdmin.fullName')}
              name="fullName"
              value={form.fullName}
              icon={<FaUser />}
              error={errors.fullName}
              onChange={handleChange}
            />
            <SelectField
              label={t('employeeAdmin.gender')}
              name="gender"
              value={form.gender}
              icon={<FaVenusMars />}
              options={[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'other', label: 'Khác' }
              ]}
              onChange={handleChange}
              error={errors.gender}
            />
          </div>
          <div className="form-row">
            <InputField
              label={t('employeeAdmin.dateOfBirth')}
              name="dateOfBirth"
              value={form.dateOfBirth}
              icon={<FaCalendarAlt />}
              type="date"
              error={errors.dateOfBirth}
              onChange={handleChange}
            />
            <InputField
              label={t('employeeAdmin.identityCard')}
              name="identityCard"
              value={form.identityCard}
              icon={<FaIdCard />}
              error={errors.identityCard}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <InputField
              label={t('employeeAdmin.address')}
              name="address"
              value={form.address}
              icon={<FaMapMarkerAlt />}
              error={errors.address}
              onChange={handleChange}
            />
            <SelectField
              label={t('employeeAdmin.position')}
              name="position"
              value={form.position}
              icon={<FaBriefcase />}
              options={POSITION_OPTIONS}
              onChange={handleChange}
              error={errors.position}
            />
          </div>
          <div className="form-row">
            <InputField
              label={t('employeeAdmin.salary')}
              name="salary"
              value={form.salary}
              icon={<FaMoneyBillWave />}
              error={errors.salary}
              onChange={handleChange}
              type="number"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}><FaBan /> {t('employeeAdmin.cancel')}</button>
            <button type="submit" className="btn btn-primary"><FaSave /> {t('employeeAdmin.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeForm; 