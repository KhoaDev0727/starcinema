import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, Button, message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { createShowtime, getMovies, getRooms, getTheaters } from '../../services/ScheduleManagementService';
import type { 
  MovieResponseDTO, 
  RoomResponseDTO, 
  TheaterResponseDTO,
  CreateShowtimeRequestDTO 
} from '../../types/response/ScheduleManagementResponseDTO';
import { DATE_FORMATS, VALIDATION } from '../../constants/ScheduleManagementConst';
import { HTTP_STATUS } from '../../constants/ScheduleManagementApiConst';
import '../../styles/AddShowtime.scss';

interface AddShowtimeProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddShowtime: React.FC<AddShowtimeProps> = ({ visible, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [movies, setMovies] = useState<MovieResponseDTO[]>([]);
  const [rooms, setRooms] = useState<RoomResponseDTO[]>([]);
  const [theaters, setTheaters] = useState<TheaterResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPriceValid, setIsPriceValid] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchMovies();
      fetchRooms();
      fetchTheaters();
    }
  }, [visible]);

  const fetchMovies = async () => {
    try {
      const response = await getMovies();
      const filteredMovies = response.filter(
        (movie: MovieResponseDTO) => movie.movieId && movie.title && movie.movieId !== null && movie.title !== null
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
        (room: RoomResponseDTO) => room.roomId && room.roomName && room.roomId !== null && room.roomName !== null
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
        (theater: TheaterResponseDTO) => theater.theaterId && theater.theaterName && theater.theaterId !== null && theater.theaterName !== null
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

      const payload: CreateShowtimeRequestDTO = {
        movieId: values.movieId,
        roomId: values.roomId,
        theaterId: values.theaterId,
        showtime: values.showtime.format(DATE_FORMATS.DATETIME),
        price: values.price,
      };
      console.log('Payload sent:', JSON.stringify(payload, null, 2));

      await createShowtime(payload);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating showtime:', error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Unknown error';
      console.error('Server error details:', JSON.stringify(error.response?.data, null, 2));
      
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        message.error(t('scheduleManagement.errors.unauthorized'));
      } else if (status === HTTP_STATUS.BAD_REQUEST) {
        if (errorMessage.includes('Price must be between')) {
          message.error(t('scheduleManagement.errors.priceExceedsMax', { max: VALIDATION.PRICE_MAX }));
        } else {
          message.error(`${t('scheduleManagement.errors.invalidData')}: ${errorMessage}`);
        }
      } else if (status === HTTP_STATUS.CONFLICT) {
        if (error.response?.data?.code === 'E2008') {
          message.error(t('scheduleManagement.errors.maxShowtimesReached'));
        } else if (error.response?.data?.code === 'E2009') {
          message.error(t('scheduleManagement.errors.pastShowtime'));
        } else {
          message.error(t('scheduleManagement.errors.schedulingConflict'));
        }
      } else {
        message.error(t('scheduleManagement.errors.createFailed'));
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
      title={t('scheduleManagement.addShowtime.title')}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ price: VALIDATION.PRICE_MIN }}
      >
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
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
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
              <Select.Option disabled>{t('scheduleManagement.addShowtime.noRoomsAvailable')}</Select.Option>
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
              <Select.Option disabled>{t('scheduleManagement.addShowtime.noTheatersAvailable')}</Select.Option>
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

        <Form.Item style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!isPriceValid || loading}
          >
            {t('scheduleManagement.addShowtime.addShowtime')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onClose}>
            {t('scheduleManagement.addShowtime.cancel')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddShowtime;