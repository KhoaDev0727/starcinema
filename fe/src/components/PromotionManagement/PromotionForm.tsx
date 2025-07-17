import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Modal, Image } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PromotionService } from '../../services/PromotionService';
import { PROMOTION_MESSAGES, PROMOTION_VALIDATION } from '../../constants/PromotionConst';
import type { PromotionRequestDTO } from '../../types/request/PromotionRequestDTO';
import type { PromotionResponseDTO } from '../../types/response/PromotionResponseDTO';
import './styles/PromotionForm.scss';
import { SaveOutlined, CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface PromotionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  promotion?: PromotionResponseDTO;
  isEdit?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  promotion,
  isEdit = false,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (visible && promotion && isEdit) {
      form.setFieldsValue({
        ...promotion,
        startTime: promotion.startTime ? dayjs(promotion.startTime) : null,
        endTime: promotion.endTime ? dayjs(promotion.endTime) : null,
      });
      setImageUrl(promotion.imageUrl || '');
    } else if (visible && !isEdit) {
      form.resetFields();
      setImageUrl('');
    }
  }, [visible, promotion, isEdit, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    setMessageText('');
    setMessageType('');

    try {
      const promotionData: PromotionRequestDTO = {
        ...values,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DDTHH:mm:ss') : '',
        endTime: values.endTime ? values.endTime.format('YYYY-MM-DDTHH:mm:ss') : '',
      };

      if (isEdit && promotion) {
        await PromotionService.updatePromotion(promotion.id, promotionData);
        setMessageText(t('promotion.messages.updateSuccess'));
      } else {
        await PromotionService.createPromotion(promotionData);
        setMessageText(t('promotion.messages.createSuccess'));
      }

      setMessageType('success');
      setTimeout(() => {
        onSuccess();
        onCancel();
      }, 1500);
    } catch (error: any) {
      setMessageText(
        error?.response?.data?.message || 
        (isEdit ? t('promotion.messages.updateError') : t('promotion.messages.createError'))
      );
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setMessageText('');
    setMessageType('');
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEdit ? <SaveOutlined style={{ color: '#2563eb', fontSize: 22 }} /> : <PlusCircleOutlined style={{ color: '#2563eb', fontSize: 22 }} />}
          <span style={{ color: '#2563eb', fontWeight: 700, fontSize: 20 }}>
            {isEdit ? t('promotion.editPromotion') : t('promotion.addPromotion')}
          </span>
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
      className="promotion-modal-custom"
    >
      <div className="promotion-form">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{
            discount: 0,
          }}
        >
          <Form.Item
            label={t('promotion.form.title')}
            name="title"
            rules={[
              { required: true, message: t('promotion.validation.titleRequired') },
              { min: PROMOTION_VALIDATION.TITLE_MIN_LENGTH, message: t('promotion.validation.titleMinLength', { minLength: PROMOTION_VALIDATION.TITLE_MIN_LENGTH }) },
              { max: PROMOTION_VALIDATION.TITLE_MAX_LENGTH, message: t('promotion.validation.titleMaxLength', { maxLength: PROMOTION_VALIDATION.TITLE_MAX_LENGTH }) },
            ]}
          >
            <Input placeholder={t('promotion.form.titlePlaceholder')} />
          </Form.Item>

          <div className="form-row">
            <Form.Item
              label={t('promotion.form.startTime')}
              name="startTime"
              rules={[{ required: true, message: t('promotion.validation.startTimeRequired') }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={t('promotion.form.startTimePlaceholder')}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label={t('promotion.form.endTime')}
              name="endTime"
              dependencies={['startTime']}
              rules={[
                { required: true, message: t('promotion.validation.endTimeRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value.isAfter(getFieldValue('startTime'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('promotion.validation.endTimeAfterStart')));
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={t('promotion.form.endTimePlaceholder')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={t('promotion.form.discount')}
            name="discount"
            rules={[
              { required: true, message: t('promotion.validation.discountRequired') },
              { type: 'number', min: PROMOTION_VALIDATION.DISCOUNT_MIN, message: t('promotion.validation.discountMin', { min: PROMOTION_VALIDATION.DISCOUNT_MIN }) },
              { type: 'number', max: PROMOTION_VALIDATION.DISCOUNT_MAX, message: t('promotion.validation.discountMax', { max: PROMOTION_VALIDATION.DISCOUNT_MAX }) },
            ]}
          >
            <InputNumber
              min={PROMOTION_VALIDATION.DISCOUNT_MIN}
              max={PROMOTION_VALIDATION.DISCOUNT_MAX}
              placeholder={t('promotion.form.discountPlaceholder')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('promotion.form.description')}
            name="description"
            rules={[
              { max: PROMOTION_VALIDATION.DESCRIPTION_MAX_LENGTH, message: t('promotion.validation.descriptionMaxLength', { maxLength: PROMOTION_VALIDATION.DESCRIPTION_MAX_LENGTH }) },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t('promotion.form.descriptionPlaceholder')}
              maxLength={PROMOTION_VALIDATION.DESCRIPTION_MAX_LENGTH}
              showCount
            />
          </Form.Item>

          <Form.Item
            label={t('promotion.form.imageUrl')}
            name="imageUrl"
          >
            <Input 
              placeholder={t('promotion.form.imageUrlPlaceholder')} 
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Item>
          
          {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500, color: '#262626' }}>
                {t('promotion.form.imagePreview')}:
              </div>
              <Image
                width={200}
                src={imageUrl}
                fallback="/images/avatar.png"
                alt="Promotion Preview"
                style={{ borderRadius: '6px' }}
              />
            </div>
          )}

          <div className="form-actions-wrapper" style={{ justifyContent: 'center' }}>
            <Form.Item style={{ margin: 0 }}>
              <Button onClick={handleCancel} icon={<CloseCircleOutlined />} style={{ background: '#888', color: '#fff', border: 'none', marginRight: 8, minWidth: 100, fontWeight: 600 }}>
                {t('auth.register.cancel')}
              </Button>
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} style={{ background: '#2563eb', border: 'none', minWidth: 100, fontWeight: 600 }}>
                {isEdit ? t('promotion.editPromotion') : t('promotion.addPromotion')}
              </Button>
            </Form.Item>
            {messageText && (
              <span
                style={{
                  color: messageType === 'success' ? '#2e7d32' : '#c62828',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {messageText}
              </span>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PromotionForm; 