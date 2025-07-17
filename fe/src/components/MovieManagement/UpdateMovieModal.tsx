import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Select, Button, Upload, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Movie } from '../types';
import MOVIE_ADMIN_CONSTANTS from '../../constants/MovieAdminConst';
import './MovieAdminStyles/MoviesAdminStyles.scss'

interface UpdateMovieModalProps {
  isOpen: boolean;
  movie: Movie | null;
  genres: string[];
  onClose: () => void;
  onSubmit: (values: Movie) => Promise<boolean>;
}

const UpdateMovieModal: React.FC<UpdateMovieModalProps> = ({
  isOpen,
  movie,
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

  console.log('UpdateMovieModal received movie:', movie);
  if (!movie) return null;



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
      title={<h2>{t('movieAdmin.updateMovie')}</h2>}
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
            {t('movieAdmin.form.update', { defaultValue: 'Update' })}
          </Button>
        </div>
      }
      className="update-movie-modal custom-no-scroll wide-modal"
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
              setDurationError(t('movieAdmin.form.durationRequired', { defaultValue: 'Duration is required' }));
              hasError = true;
            } else {
              const num = Number(values.duration);
              if (isNaN(num) || num <= 0) {
                setDurationError(t('movieAdmin.form.invalidDuration', { defaultValue: 'Duration must be a positive number' }));
                hasError = true;
              }
            }
            
            if (!values.releaseDate || values.releaseDate.toString().trim() === '') {
              setReleaseDateError(t('movieAdmin.form.releaseDateRequired', { defaultValue: 'Release date is required' }));
              hasError = true;
            } else if (!MOVIE_ADMIN_CONSTANTS.VALIDATION.RELEASE_DATE_PATTERN.test(values.releaseDate)) {
              setReleaseDateError(t('movieAdmin.form.invalidReleaseDate', { defaultValue: 'Release date must be in format yyyy-MM-dd' }));
              hasError = true;
            }
            
            if (hasError) {
              return;
            }
            
            const formattedValues = {
              ...movie,
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
            console.log('Updating movie:', formattedValues);
            const success = await onSubmit(formattedValues);
            if (success) {
              form.resetFields();
              setImagePreview(null);
              setFormError(null);
              setDurationError('');
              setReleaseDateError('');
              onClose();
            } else {
              setFormError(t('movieAdmin.messages.updateError'));
            }
          }}
          key={movie.movieId} // Force re-render when movie changes
          initialValues={{
            title: movie.title || '',
            shortDescription: movie.shortDescription || '',
            description: movie.description || '',
            director: movie.director || '',
            actors: movie.actors || '',
            genre: movie.genre || '',
            releaseDate: movie.releaseDate || '',
            duration: movie.duration !== undefined ? movie.duration.toString() : '',
            language: movie.language || '',
            rated: movie.rated || '',
            posterUrl: movie.posterUrl || '',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.title')}
                name="title"
                rules={[
                  { required: true, message: t('movieAdmin.form.titleRequired', { defaultValue: 'Title is required' }) },
                  { max: 255, message: t('movieAdmin.form.titleTooLong', { defaultValue: 'Title cannot exceed 255 characters' }) }
                ]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.shortDescription')}
                name="shortDescription"
                rules={[
                  { required: true, message: t('movieAdmin.form.shortDescriptionRequired', { defaultValue: 'Short description is required' }) },
                  { max: 500, message: t('movieAdmin.form.shortDescriptionTooLong', { defaultValue: 'Short description cannot exceed 500 characters' }) }
                ]}
              >
                <Input maxLength={500} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('movieAdmin.form.description')}
                name="description"
                rules={[
                  { required: true, message: t('movieAdmin.form.descriptionRequired', { defaultValue: 'Description is required' }) },
                  { max: 1000, message: t('movieAdmin.form.descriptionTooLong', { defaultValue: 'Description cannot exceed 1000 characters' }) }
                ]}
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
                rules={[
                  { required: true, message: t('movieAdmin.form.directorRequired', { defaultValue: 'Director is required' }) },
                  { max: 100, message: t('movieAdmin.form.directorTooLong', { defaultValue: 'Director cannot exceed 100 characters' }) }
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.actors')}
                name="actors"
                rules={[
                  { required: true, message: t('movieAdmin.form.actorsRequired', { defaultValue: 'Actors is required' }) },
                  { max: 1000, message: t('movieAdmin.form.actorsTooLong', { defaultValue: 'Actors cannot exceed 1000 characters' }) }
                ]}
              >
                <Input maxLength={1000} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.genre')}
                name="genre"
                rules={[
                  { required: true, message: t('movieAdmin.form.genreRequired', { defaultValue: 'Genre is required' }) },
                  { max: 100, message: t('movieAdmin.form.genreTooLong', { defaultValue: 'Genre cannot exceed 100 characters' }) }
                ]}
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
                rules={[
                  { required: true, message: t('movieAdmin.form.languageRequired', { defaultValue: 'Language is required' }) },
                  { max: 50, message: t('movieAdmin.form.languageTooLong', { defaultValue: 'Language cannot exceed 50 characters' }) }
                ]}
              >
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.rated')}
                name="rated"
                rules={[
                  { required: true, message: t('movieAdmin.form.ratedRequired', { defaultValue: 'Rated is required' }) },
                  { max: 10, message: t('movieAdmin.form.ratedTooLong', { defaultValue: 'Rated cannot exceed 10 characters' }) }
                ]}
              >
                <Input maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('movieAdmin.form.posterUrl')}
                name="posterUrl"
                rules={[
                  { max: 255, message: t('movieAdmin.form.posterUrlTooLong', { defaultValue: 'Poster URL cannot exceed 255 characters' }) },
                  {
                    pattern: /^\/images\/.*\.(png|jpg|jpeg)$/,
                    message: t('movieAdmin.form.posterUrlInvalid', { defaultValue: 'Poster URL must be in format /images/filename.jpg' })
                  }
                ]}
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

export default UpdateMovieModal;