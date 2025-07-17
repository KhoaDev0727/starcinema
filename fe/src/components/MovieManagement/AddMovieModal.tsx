import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, Button, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Movie } from '../types';
import MOVIE_ADMIN_CONSTANTS from '../../constants/MovieAdminConst';
import './MovieAdminStyles/MoviesAdminStyles.scss'

interface AddMovieModalProps {
  isOpen: boolean;
  genres: string[];
  onClose: () => void;
  onSubmit: (values: Partial<Movie>) => Promise<boolean>;
}

const AddMovieModal: React.FC<AddMovieModalProps> = ({
  isOpen,
  genres,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();
  const [durationError, setDurationError] = useState<string>('');
  const [releaseDateError, setReleaseDateError] = useState<string>('');

  const handleImageUpload = async (info: any) => {
    const file = info.file;
    if (!file) return;

    if (!MOVIE_ADMIN_CONSTANTS.VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      form.setFields([
        {
          name: 'posterUrl',
          errors: [t('movieAdmin.form.invalidImageType', { defaultValue: 'Only image files are allowed' })],
        },
      ]);
      return;
    }

    if (file.size > MOVIE_ADMIN_CONSTANTS.VALIDATION.MAX_IMAGE_SIZE) {
      form.setFields([
        {
          name: 'posterUrl',
          errors: [t('movieAdmin.form.imageTooLarge', { defaultValue: 'Image size exceeds limit' })],
        },
      ]);
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        form.setFieldsValue({ posterUrl: result });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      form.setFields([
        {
          name: 'posterUrl',
          errors: [t('movieAdmin.form.uploadError', { defaultValue: 'Failed to upload image' })],
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    form.setFieldsValue({ posterUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  return (
    <Modal
      title={<h2>{t('movieAdmin.addMovie')}</h2>}
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        setFormError(null);
        setDurationError('');
        setReleaseDateError('');
        onClose();
      }}
      footer={
        <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
          <Button
            className="cancel-button"
            onClick={() => {
              form.resetFields();
              setFormError(null);
              setDurationError('');
              setReleaseDateError('');
              onClose();
            }}
          >
            {t('movieAdmin.form.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            className="save-button"
            onClick={() => form.submit()}
            loading={isUploading}
            type="primary"
          >
            {t('movieAdmin.form.save', { defaultValue: 'Save' })}
          </Button>
        </div>
      }
      className="add-movie-modal custom-no-scroll wide-modal"
      width={900}
      style={{ maxWidth: '98vw' }}
    >
      {formError && <p style={{ color: 'red', marginBottom: 16 }}>{formError}</p>}
      <Form
        form={form}
        layout="vertical"
        style={{ width: '100%' }}
        noValidate
        onFinish={async (values) => {
            // Clear previous errors
            setDurationError('');
            setReleaseDateError('');
            
            // Custom validation
            let hasError = false;
            
            if (!values.duration || values.duration.toString().trim() === '') {
              setDurationError(t('movieAdmin.form.required', { defaultValue: 'This field is required' }));
              hasError = true;
            } else {
              const num = Number(values.duration);
              if (isNaN(num) || num <= 0) {
                setDurationError(t('movieAdmin.form.invalidDuration', { defaultValue: 'Duration must be a positive number' }));
                hasError = true;
              }
            }
            
            if (!values.releaseDate || values.releaseDate.toString().trim() === '') {
              setReleaseDateError(t('movieAdmin.form.required', { defaultValue: 'This field is required' }));
              hasError = true;
            } else if (!MOVIE_ADMIN_CONSTANTS.VALIDATION.RELEASE_DATE_PATTERN.test(values.releaseDate)) {
              setReleaseDateError(t('movieAdmin.form.invalidReleaseDate', { defaultValue: 'Release date must be in format yyyy-MM-dd' }));
              hasError = true;
            }
            
            if (hasError) {
              return;
            }
            
            const formattedValues = {
              ...values,
              duration: Number(values.duration),
              releaseDate: values.releaseDate,
              title: values.title.trim(),
              description: values.description.trim(),
              genre: values.genre.trim(),
              shortDescription: values.shortDescription?.trim() || '',
              director: values.director?.trim() || '',
              actors: values.actors?.trim() || '',
              language: values.language?.trim() || '',
              rated: values.rated?.trim() || '',
              posterUrl: values.posterUrl?.trim() || '',
            };
            const success = await onSubmit(formattedValues);
            if (success) {
              form.resetFields();
              setImagePreview(null);
              setFormError(null);
              setDurationError('');
              setReleaseDateError('');
              onClose();
            } else {
              setFormError(t('movieAdmin.messages.addError'));
            }
          }}
          initialValues={MOVIE_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_MOVIE}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.title')}
                name="title"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.shortDescription')}
                name="shortDescription"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={200} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('movieAdmin.form.description')}
                name="description"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
                className="description-section"
              >
                <Input.TextArea maxLength={1000} rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.director')}
                name="director"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.actors')}
                name="actors"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.genre')}
                name="genre"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Select>
                  <Select.Option value="">{t('movieAdmin.form.selectGenre', { defaultValue: 'Select Genre' })}</Select.Option>
                  {genres.map((g) => (
                    <Select.Option key={g} value={g}>
                      {g}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t('movieAdmin.form.releaseDate')}
                name="releaseDate"
                validateStatus={releaseDateError ? 'error' : ''}
                help={releaseDateError}
                className="release-date-field"
              >
                <Input type="date" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={t('movieAdmin.form.duration')}
                name="duration"
                validateStatus={durationError ? 'error' : ''}
                help={durationError}
                className="duration-field"
              >
                <Input type="number" min={1} autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.language')}
                name="language"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.rated')}
                name="rated"
                rules={[{ required: true, message: t('movieAdmin.form.required', { defaultValue: 'This field is required' }) }]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.posterUrl')}
                name="posterUrl"
                rules={[{ max: 255, message: t('movieAdmin.form.maxLength', { defaultValue: 'Maximum 255 characters' }) }]}
              >
                <Input placeholder="/images/tenfile.jpg" maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.uploadImage', { defaultValue: 'Upload Image' })}
                className="image-upload-section"
              >
                <Upload
                  beforeUpload={() => false}
                  onChange={handleImageUpload}
                  showUploadList={false}
                >
                  <Button className="upload-button" icon={<UploadOutlined />}>
                    {t('movieAdmin.form.upload', { defaultValue: 'Upload' })}
                  </Button>
                </Upload>
                {imagePreview && (
                  <div className="image-preview-section">
                    <img src={imagePreview} alt="preview" className="image-preview" />
                    <Button className="clear-image-button" onClick={clearImage}>
                      {t('movieAdmin.form.clearImage', { defaultValue: 'Clear Image' })}
                    </Button>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
    </Modal>
  );
};

export default AddMovieModal;