import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaBan, FaUser, FaEnvelope, FaPhone, FaUserShield, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { UserResponseDTO } from '../../types/response/UserResponseDTO';
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS, EMAIL_VERIFIED_OPTIONS, FORM_LABELS } from '../../constants/UserFormConst';
import './UserProfileAdminStyles/EditMember.scss';

interface Option {
  value: string;
  label: string;
}

interface InputFieldProps {
  label: string;
  name: keyof UserResponseDTO;
  value: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label, name, value, icon, readOnly = false, error
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
    />
    {error && <span className="form-error">{error}</span>}
  </label>
);

interface SelectFieldProps {
  label: string;
  name: keyof UserResponseDTO;
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
  user: UserResponseDTO;
  onClose: () => void;
  onSave: (user: UserResponseDTO) => void;
}

const EditMemberForm: React.FC<Props> = ({ user, onClose, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<UserResponseDTO>({ ...user });
  const [errorField, setErrorField] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setForm({ ...user });
    setErrorField(undefined);
    setServerError(undefined);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof UserResponseDTO;
    const parsedValue = key === 'emailVerified' ? value === 'true' : value;
    setForm(prev => ({
      ...prev,
      [key]: parsedValue,
    }));
    setErrorField(undefined);
    setServerError(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate here if needed, setErrorField/setServerError if error
    onSave(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaSave /> {t('registerAdmin.editMember', FORM_LABELS.editMember)}</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <InputField label={t('registerAdmin.fullName', FORM_LABELS.fullName)} name="fullName" value={form.fullName || ''} icon={<FaUser />} readOnly error={errorField === 'fullName' ? serverError : undefined} />
          <InputField label={t('registerAdmin.email', FORM_LABELS.email)} name="email" value={form.email || ''} icon={<FaEnvelope />} readOnly error={errorField === 'email' ? serverError : undefined} />
          <InputField label={t('registerAdmin.phoneNumber', FORM_LABELS.phoneNumber)} name="phoneNumber" value={form.phoneNumber || ''} icon={<FaPhone />} readOnly error={errorField === 'phoneNumber' ? serverError : undefined} />
          <InputField label={t('registerAdmin.provider', FORM_LABELS.provider)} name="provider" value={form.provider ?? '-'} icon={<FaEnvelope />} readOnly error={errorField === 'provider' ? serverError : undefined} />
          <InputField label={t('registerAdmin.role', FORM_LABELS.role)} name="role" value={form.role ? t(`registerAdmin.roleOptions.${form.role}`) : '-'} icon={<FaUserShield />} readOnly error={errorField === 'role' ? serverError : undefined} />

          {/* Xoá trường chọn role */}
          {/*
          <SelectField
            label={t('registerAdmin.role', FORM_LABELS.role)}
            name="role"
            value={form.role || 'USER'}
            icon={<FaUserShield />}
            options={USER_ROLE_OPTIONS.map(opt => ({ ...opt, label: t(`registerAdmin.roleOptions.${opt.value}`, opt.label) }))}
            onChange={handleChange}
            error={errorField === 'role' ? serverError : undefined}
          />
          */}

          <SelectField
            label={t('registerAdmin.status', FORM_LABELS.status)}
            name="status"
            value={form.status || 'INACTIVE'}
            icon={form.status === 'ACTIVE' ? <FaToggleOn /> : <FaToggleOff />}
            options={USER_STATUS_OPTIONS.map(opt => ({ ...opt, label: t(`registerAdmin.statusOptions.${opt.value}`, opt.label) }))}
            onChange={handleChange}
            error={errorField === 'status' ? serverError : undefined}
          />

          <SelectField
            label={t('registerAdmin.emailVerified', FORM_LABELS.emailVerified)}
            name="emailVerified"
            value={form.emailVerified ? 'true' : 'false'}
            options={EMAIL_VERIFIED_OPTIONS.map(opt => ({ ...opt, label: t(`registerAdmin.emailVerifiedOptions.${opt.value}`) }))}
            onChange={handleChange}
            error={errorField === 'emailVerified' ? serverError : undefined}
          />

          <div className="form-actions">
            <button type="button" className="btn cancel" onClick={onClose}><FaBan /> {t('registerAdmin.cancel', FORM_LABELS.cancel)}</button>
            <button type="submit" className="btn save"><FaSave /> {t('registerAdmin.save', FORM_LABELS.save)}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberForm; 