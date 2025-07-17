import React, { useState, useEffect } from 'react';
import { DatePicker, Button, message, Modal, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';
import AddShowtime from './AddShowtime';
import EditShowtime from './EditShowtime';
import { getShowtimes, deleteShowtime } from '../../services/ScheduleManagementService';
import type { ShowtimeResponseDTO } from '../../types/response/ScheduleManagementResponseDTO';
import { 
  SCHEDULE_MANAGEMENT, 
  UI_CONSTANTS, 
  DATE_FORMATS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES
} from '../../constants/ScheduleManagementConst';
import { HTTP_STATUS } from '../../constants/ScheduleManagementApiConst';
import '../../styles/ShowtimesAdmin.scss';

// Set dayjs locale to English
dayjs.locale('en');

const { Text } = Typography;

const ShowtimesAdmin: React.FC = () => {
  const { t } = useTranslation();
  const [showtimes, setShowtimes] = useState<ShowtimeResponseDTO[]>([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState<ShowtimeResponseDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [movieTitle, setMovieTitle] = useState('');
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageGroup, setPageGroup] = useState(1);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);

  const MAX_PAGE_BUTTONS = 10;

  const fetchShowtimes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading showtime list...');
      const response = await getShowtimes(0, 100);
      console.log('API Response:', response);

      let allShowtimes: ShowtimeResponseDTO[] = [];
      if (response && response.content && Array.isArray(response.content)) {
        allShowtimes = response.content;
      } else if (Array.isArray(response)) {
        allShowtimes = response as ShowtimeResponseDTO[];
      } else {
        console.log('No showtimes found in response, setting empty array');
        allShowtimes = [];
      }

      allShowtimes.sort((a, b) => dayjs(b.showtime).valueOf() - dayjs(a.showtime).valueOf());

      console.log('Processed showtimes:', allShowtimes);
      setShowtimes(allShowtimes);
      setFilteredShowtimes(allShowtimes);
      setTotalPages(Math.ceil(allShowtimes.length / SCHEDULE_MANAGEMENT.ITEMS_PER_PAGE));
      setError(null);
    } catch (error: any) {
      console.error('Error loading showtimes:', error);
      console.error('Error response:', error.response);
      
      const status = error.response?.status;
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
      
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        setError(t('scheduleManagement.errors.unauthorized'));
      } else if (status === HTTP_STATUS.BAD_REQUEST) {
        setError(`${t('scheduleManagement.errors.invalidData')}: ${errorMessage}`);
      } else if (status === HTTP_STATUS.NOT_FOUND) {
        setError('API endpoint not found. Please check if backend is running.');
      } else {
        setError(`Failed to load showtimes: ${errorMessage}`);
      }
      
      setShowtimes([]);
      setFilteredShowtimes([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  useEffect(() => {
    const filtered = showtimes.filter((showtime) => {
      const matchesMovieTitle = movieTitle.trim()
        ? showtime.movieTitle.toLowerCase().includes(movieTitle.trim().toLowerCase())
        : true;
      const matchesDate = date
        ? dayjs(showtime.showtime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD') === date.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD')
        : true;
      const matchesRoomName = roomName.trim()
        ? showtime.roomName.toLowerCase().includes(roomName.trim().toLowerCase())
        : true;
      return matchesMovieTitle && matchesDate && matchesRoomName;
    });

    setFilteredShowtimes(filtered);
    setTotalPages(Math.ceil(filtered.length / SCHEDULE_MANAGEMENT.ITEMS_PER_PAGE));
    setCurrentPage(1);
    setPageGroup(1);
  }, [movieTitle, date, roomName, showtimes]);

  const handleResetFilters = () => {
    setMovieTitle('');
    setDate(null);
    setRoomName('');
    setFilteredShowtimes(showtimes);
    setTotalPages(Math.ceil(showtimes.length / SCHEDULE_MANAGEMENT.ITEMS_PER_PAGE));
    setCurrentPage(1);
    setPageGroup(1);
  };

  const handleDelete = async () => {
    if (!deletingScheduleId) return;
    try {
      await deleteShowtime(deletingScheduleId);
      message.success(t(SUCCESS_MESSAGES.DELETE_SUCCESS));
      fetchShowtimes();
    } catch (error: any) {
      console.error('Error deleting showtime:', error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      if (status === HTTP_STATUS.CONFLICT && errorMessage.includes('Cannot delete future showtime with active bookings')) {
        message.error(t('scheduleManagement.errors.hasFutureBookings'));
      } else {
        message.error(t(ERROR_MESSAGES.DELETE_FAILED));
      }
    } finally {
      setIsDeleteModalVisible(false);
      setDeletingScheduleId(null);
    }
  };

  const showDeleteConfirm = (scheduleId: string) => {
    setDeletingScheduleId(scheduleId);
    setIsDeleteModalVisible(true);
  };

  const handleAddSuccess = () => {
    message.success(t('scheduleManagement.success.addSuccess'));
    setMovieTitle('');
    setDate(null);
    setRoomName('');
    setCurrentPage(1);
    setPageGroup(1);
    setTimeout(() => {
      fetchShowtimes();
    }, 500);
  };

  const handleEditSuccess = () => {
    message.success(t('scheduleManagement.success.updateSuccess'));
    setMovieTitle('');
    setDate(null);
    setRoomName('');
    setCurrentPage(1);
    setPageGroup(1);
    setTimeout(() => {
      fetchShowtimes();
    }, 500);
  };

  const handleEdit = (scheduleId: string) => {
    setEditScheduleId(scheduleId);
    setIsEditModalVisible(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page < pageGroup) {
      setPageGroup(page);
    } else if (page > pageGroup + MAX_PAGE_BUTTONS - 1) {
      setPageGroup(page - MAX_PAGE_BUTTONS + 1);
    }
  };

  const handlePrevPageGroup = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (newPage < pageGroup) {
        setPageGroup(pageGroup - 1);
      }
    }
  };

  const handleNextPageGroup = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (newPage > pageGroup + MAX_PAGE_BUTTONS - 1) {
        setPageGroup(pageGroup + 1);
      }
    }
  };

  const handleScroll = (to: 'top' | 'bottom') => {
    if (to === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollButtonVisible(window.scrollY > SCHEDULE_MANAGEMENT.SCROLL_THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const paginatedShowtimes = filteredShowtimes.slice(
    (currentPage - 1) * SCHEDULE_MANAGEMENT.ITEMS_PER_PAGE,
    currentPage * SCHEDULE_MANAGEMENT.ITEMS_PER_PAGE
  );

  const startPage = pageGroup;
  const endPage = Math.min(pageGroup + MAX_PAGE_BUTTONS - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="showtimes-admin-page-container">
      {error && <p className="error">{error}</p>}
      <div className="showtimes-admin">
        <h2 className="admin-section-title">{t('scheduleManagement.title')}</h2>
        <div className="filters">
          <input
            type="text"
            placeholder={t('scheduleManagement.searchByMovie')}
            value={movieTitle}
            onChange={(e) => setMovieTitle(e.target.value)}
          />
          <DatePicker
            value={date}
            onChange={(date) => setDate(date)}
            format={DATE_FORMATS.DISPLAY_DATE}
            placeholder={t('scheduleManagement.selectDate')}
          />
          <input
            type="text"
            placeholder={t('scheduleManagement.searchByRoom')}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button onClick={handleResetFilters}>
            {t('scheduleManagement.reset')}
          </Button>
          <Button
            className="add-button"
            onClick={() => setIsAddModalVisible(true)}
          >
            {t('scheduleManagement.addNew')}
          </Button>
          <Button
            className="refresh-button"
            onClick={fetchShowtimes}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </Button>
        </div>
        {isLoading ? (
          <div className="loading-message">
            <p>{t('scheduleManagement.loading')}</p>
          </div>
        ) : paginatedShowtimes.length === 0 && !error ? (
          <div className="no-data-message">
            <p>{t('scheduleManagement.noShowtimes')}</p>
            <p className="hint">{t('scheduleManagement.hint')}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t('scheduleManagement.tableHeaders.movie')}</th>
                <th>{t('scheduleManagement.tableHeaders.date')}</th>
                <th>{t('scheduleManagement.tableHeaders.time')}</th>
                <th>{t('scheduleManagement.tableHeaders.room')}</th>
                <th>{t('scheduleManagement.tableHeaders.status')}</th>
                <th>{t('scheduleManagement.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedShowtimes.map((showtime) => (
                <tr key={showtime.scheduleId}>
                  <td>{showtime.movieTitle}</td>
                  <td>{dayjs(showtime.showtime).tz('Asia/Ho_Chi_Minh').format(DATE_FORMATS.DISPLAY_DATE)}</td>
                  <td>{dayjs(showtime.showtime).tz('Asia/Ho_Chi_Minh').format(DATE_FORMATS.DISPLAY_TIME)}</td>
                  <td>{showtime.roomName}</td>
                  <td>{showtime.status}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(showtime.scheduleId)}
                      >
                        {t('scheduleManagement.edit')}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => showDeleteConfirm(showtime.scheduleId)}
                      >
                        {t('scheduleManagement.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          {totalPages > MAX_PAGE_BUTTONS && (
            <button
              onClick={handlePrevPageGroup}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'disabled' : ''}
            >
              ←
            </button>
          )}
          {visiblePages.map((page) => (
            <button
              key={page}
              className={page === currentPage ? 'active' : ''}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          {totalPages > MAX_PAGE_BUTTONS && (
            <button
              onClick={handleNextPageGroup}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'disabled' : ''}
            >
              →
            </button>
          )}
        </div>
      </div>
      {isScrollButtonVisible && (
        <div className="scroll-buttons">
          <button className="scroll-up" onClick={() => handleScroll('top')}>
            ↑
          </button>
          <button className="scroll-down" onClick={() => handleScroll('bottom')}>
            ↓
          </button>
        </div>
      )}
      <AddShowtime
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
      <EditShowtime
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setEditScheduleId(null);
        }}
        onSuccess={handleEditSuccess}
        scheduleId={editScheduleId || ''}
      />
      <Modal
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setDeletingScheduleId(null);
        }}
        okText={t('scheduleManagement.delete')}
        cancelText={t('scheduleManagement.addShowtime.cancel')}
        className="delete-confirmation-modal"
        okButtonProps={{ className: 'delete-confirm-button' }}
        cancelButtonProps={{ className: 'delete-cancel-button' }}
      >
        <div className="delete-modal-content">
          <Text strong>{t('scheduleManagement.confirmDelete')}</Text>
        </div>
      </Modal>
    </div>
  );
};

export default ShowtimesAdmin;