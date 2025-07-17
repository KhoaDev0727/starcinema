import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  getMovies,
  getRooms,
  getTheaters,
  getShowtimeById,
  updateShowtime,
} from '../../services/ScheduleManagementService';
import type {
  MovieResponseDTO,
  RoomResponseDTO,
  TheaterResponseDTO,
  ShowtimeResponseDTO,
  UpdateShowtimeRequestDTO,
} from '../../types/response/ScheduleManagementResponseDTO';
import { DATE_FORMATS, VALIDATION } from '../../constants/ScheduleManagementConst';
import { HTTP_STATUS } from '../../constants/ScheduleManagementApiConst';
import '../../styles/AddShowtime.scss';

interface EditShowtimeProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  scheduleId: string;
}

const EditShowtime: React.FC<EditShowtimeProps> = ({
  visible,
  onClose,
  onSuccess,
  scheduleId,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [movies, setMovies] = useState<MovieResponseDTO[]>([]);
  const [rooms, setRooms] = useState<RoomResponseDTO[]>([]);
  const [theaters, setTheaters] = useState<TheaterResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<ShowtimeResponseDTO | null>(null);
  const [isPriceValid, setIsPriceValid] = useState(true);

  useEffect(() => {
    if (visible && scheduleId) {
      fetchShowtimeData();
      fetchMovies();
      fetchRooms();
      fetchTheaters();
    }
  }, [visible, scheduleId]);

  const fetchShowtimeData = async () => {
    try {
      const response = await getShowtimeById(scheduleId);
      setInitialData(response);
      form.setFieldsValue({
        movieId: response.movieId,
        roomId: response.roomId,
        theaterId: response.theaterId,
        showtime: response.showtime ? dayjs(response.showtime) : null,
        price: response.price,
      });
      // Kiểm tra giá ban đầu
      if (response.price) {
        setIsPriceValid(
          response.price >= VALIDATION.PRICE_MIN && response.price <= VALIDATION.PRICE_MAX
        );
      }
    } catch (error) {
      console.error('Error fetching showtime:', error);
      message.error(t('scheduleManagement.errors.fetchShowtimeFailed'));
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await getMovies();
      const filteredMovies = response.filter(
        (movie) => movie.movieId && movie.title !== null
      );
      setMovies(filteredMovies);
      if (filteredMovies.length === 0) {
        message.warning(t('scheduleManagement.addShowtime.noMovies'));
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      message.error(t('scheduleManagement.errors.fetchMoviesFailed'));
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      const filteredRooms = response.filter(
        (room) => room.roomId && room.roomName !== null
      );
      setRooms(filteredRooms);
      if (filteredRooms.length === 0) {
        message.warning(t('scheduleManagement.addShowtime.noRooms'));
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error(t('scheduleManagement.errors.fetchRoomsFailed'));
    }
  };

  const fetchTheaters = async () => {
    try {
      const response = await getTheaters();
      const filteredTheaters = response.filter(
        (theater) => theater.theaterId && theater.theaterName !== null
      );
      setTheaters(filteredTheaters);
      if (filteredTheaters.length === 0) {
        message.warning(t('scheduleManagement.addShowtime.noTheaters'));
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
      message.error(t('scheduleManagement.errors.fetchTheatersFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Kiểm tra giá vé trước khi gửi
      if (values.price < VALIDATION.PRICE_MIN || values.price > VALIDATION.PRICE_MAX) {
        message.error(t('scheduleManagement.errors.priceExceedsMax', { max: VALIDATION.PRICE_MAX }));
        setLoading(false);
        return;
      }

      if (initialData && initialData.availableSeats !== initialData.totalSeats) {
        Modal.warning({
          title: t('scheduleManagement.editShowtime.hasBookingsWarning'),
          content: t('scheduleManagement.editShowtime.hasBookingsContent'),
          okText: t('scheduleManagement.addShowtime.cancel'),
          onOk: () => {
            setLoading(false);
            onClose();
          },
        });
        return;
      }

      const payload: UpdateShowtimeRequestDTO = {
        movieId: values.movieId,
        roomId: values.roomId,
        theaterId: values.theaterId,
        showtime: values.showtime.format(DATE_FORMATS.DATETIME),
        price: values.price,
      };

      await updateShowtime(scheduleId, payload);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating showtime:', error);
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        t('scheduleManagement.errors.unknown');

      if (status === HTTP_STATUS.UNAUTHORIZED) {
        message.error(t('scheduleManagement.errors.unauthorized'));
      } else if (status === HTTP_STATUS.BAD_REQUEST) {
        if (errorMessage.includes('Price must be between')) {
          message.error(t('scheduleManagement.errors.priceExceedsMax', { max: VALIDATION.PRICE_MAX }));
        } else {
          message.error(`${t('scheduleManagement.errors.invalidData')}: ${errorMessage}`);
        }
      } else if (status === HTTP_STATUS.CONFLICT) {
        if (error.response?.data?.code === 'E2006') {
          message.error(t('scheduleManagement.errors.schedulingConflict'));
        } else {
          message.error(t('scheduleManagement.errors.updateFailed'));
        }
      } else if (status === HTTP_STATUS.NOT_FOUND) {
        message.error(t('scheduleManagement.errors.notFound'));
      } else {
        message.error(t('scheduleManagement.errors.updateFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const disabledPastDates = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const validatePrice = (value: number | null) => {
    if (value === null || value < VALIDATION.PRICE_MIN) {
      message.error(t('scheduleManagement.errors.priceBelowMin', { min: VALIDATION.PRICE_MIN }));
      setIsPriceValid(false);
    } else if (value > VALIDATION.PRICE_MAX) {
      message.error(t('scheduleManagement.errors.priceExceedsMax', { max: VALIDATION.PRICE_MAX }));
      setIsPriceValid(false);
    } else {
      setIsPriceValid(true);
    }
  };

  return (
    <Modal
      title={t('scheduleManagement.editShowtime.editTitle')}
      open={visible}
      onCancel={onClose}
      onOk={async () => {
        try {
          const values = await form.validateFields();
          handleSubmit(values);
        } catch (errorInfo) {
          message.error(t('scheduleManagement.addShowtime.validationFailed'));
        }
      }}
      confirmLoading={loading}
      okButtonProps={{ disabled: !isPriceValid || loading }}
      okText={t('scheduleManagement.editShowtime.update')}
      cancelText={t('scheduleManagement.addShowtime.cancel')}
    >
      <Form form={form} layout="vertical" initialValues={{ price: VALIDATION.PRICE_MIN }}>
        <Form.Item
          name="movieId"
          label={t('scheduleManagement.addShowtime.movie')}
          rules={[{ required: true, message: t('scheduleManagement.addShowtime.selectMovie') }]}
        >
          <Select
            showSearch
            placeholder={t('scheduleManagement.addShowtime.selectMovie')}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {movies.map((movie) => (
              <Select.Option key={movie.movieId || ''} value={movie.movieId || ''}>
                {movie.title || ''}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="roomId"
          label={t('scheduleManagement.addShowtime.room')}
          rules={[{ required: true, message: t('scheduleManagement.addShowtime.selectRoom') }]}
        >
          <Select placeholder={t('scheduleManagement.addShowtime.selectRoom')}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Select.Option key={room.roomId || ''} value={room.roomId || ''}>
                  {room.roomName || ''}
                </Select.Option>
              ))
            ) : (
              <Select.Option disabled>
                {t('scheduleManagement.addShowtime.noRooms')}
              </Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="theaterId"
          label={t('scheduleManagement.addShowtime.theater')}
          rules={[{ required: true, message: t('scheduleManagement.addShowtime.selectTheater') }]}
        >
          <Select placeholder={t('scheduleManagement.addShowtime.selectTheater')}>
            {theaters.length > 0 ? (
              theaters.map((theater) => (
                <Select.Option key={theater.theaterId || ''} value={theater.theaterId || ''}>
                  {theater.theaterName || ''}
                </Select.Option>
              ))
            ) : (
              <Select.Option disabled>
                {t('scheduleManagement.addShowtime.noTheaters')}
              </Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="showtime"
          label={t('scheduleManagement.addShowtime.showtime')}
          rules={[{ required: true, message: t('scheduleManagement.addShowtime.selectShowtime') }]}
        >
          <DatePicker
            showTime
            format={DATE_FORMATS.DATETIME}
            disabledDate={disabledPastDates}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label={t('scheduleManagement.addShowtime.ticketPrice')}
          rules={[
            { required: true, message: t('scheduleManagement.addShowtime.enterPrice') },
            {
              type: 'number',
              min: VALIDATION.PRICE_MIN,
              message: t('scheduleManagement.errors.priceBelowMin', { min: VALIDATION.PRICE_MIN }),
            },
            {
              type: 'number',
              max: VALIDATION.PRICE_MAX,
              message: t('scheduleManagement.errors.priceExceedsMax', { max: VALIDATION.PRICE_MAX }),
            },
          ]}
        >
          <InputNumber
            min={VALIDATION.PRICE_MIN}
            step={0.01}
            precision={VALIDATION.PRICE_PRECISION}
            style={{ width: '100%' }}
            onChange={(value) => validatePrice(value)}
            onBlur={() => validatePrice(form.getFieldValue('price'))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditShowtime;