import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import axios from 'axios';
import type { TheaterResponseDTO } from '../../types/response/TheaterResponseDTO';
import type { TheaterCreateRequestDTO, TheaterUpdateRequestDTO } from '../../types/request/TheaterRequestDTO';
import { getTheaters, createTheater, updateTheater, deleteTheater, getLocations } from '../../services/TheaterService';
import THEATER_ADMIN_CONSTANTS from '../../constants/TheaterAdminConst';
import TheaterAdmin from '../../components/TheatherManagement/TheaterAdmin';
import './TheaterAdminPage.scss';

const TheaterAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [theaters, setTheaters] = useState<TheaterResponseDTO[]>([]);
  const [locations, setLocations] = useState<{ locationId: string; locationName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [theatersPerPage] = useState(THEATER_ADMIN_CONSTANTS.PAGINATION.THEATERS_PER_PAGE);
  const [newTheater, setNewTheater] = useState<Partial<TheaterResponseDTO>>(THEATER_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_THEATER);
  const [selectedTheater, setSelectedTheater] = useState<TheaterResponseDTO | null>(null);

  // Helper functions to handle both old and new theater structure
  const getLocationName = (theater: TheaterResponseDTO): string => {
    return theater.locationName || theater.location?.locationName || '';
  };

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const data = await getTheaters();
      setTheaters(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching theaters:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        setError(t('theaterAdmin.messages.fetchError', { defaultValue: 'Failed to fetch theaters' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error: any) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchTheaters();
    fetchLocations();
  }, []);

  const handleAddTheater = async (values: any) => {
    try {
      setLoading(true);
      if (!values.theaterName || !values.locationId) {
        setError(t('theaterAdmin.messages.validation.requiredFields'));
        return;
      }

      const theaterData: TheaterCreateRequestDTO = {
        theaterName: values.theaterName?.trim() || '',
        locationId: values.locationId || '',
        phoneNumber: values.phoneNumber?.trim() || '',
      };

      const response = await createTheater(theaterData);
      if (response) {
        await fetchTheaters();
        setNewTheater(THEATER_ADMIN_CONSTANTS.DEFAULT_VALUES.NEW_THEATER);
        setSuccessMessage(t('theaterAdmin.messages.addSuccess'));
        setTimeout(() => setSuccessMessage(null), THEATER_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
      }
    } catch (error: any) {
      console.error('Error adding theater:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        const errorMessage = error.response?.data?.error || error.response?.statusText || error.message || t('theaterAdmin.messages.addError');
        setError(`Server error: ${error.response?.status || 'Unknown'} - ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTheater = async (values: any) => {
    try {
      setLoading(true);
      if (!selectedTheater?.theaterId || !values.theaterName || !values.locationId) {
        setError(t('theaterAdmin.messages.updateError'));
        return;
      }

      const theaterData: TheaterUpdateRequestDTO = {
        theaterName: values.theaterName?.trim(),
        locationId: values.locationId,
        phoneNumber: values.phoneNumber?.trim() || '',
      };

      const response = await updateTheater(selectedTheater.theaterId, theaterData);
      if (response) {
        await fetchTheaters();
        setSelectedTheater(null);
        setSuccessMessage(t('theaterAdmin.messages.updateSuccess'));
        setTimeout(() => setSuccessMessage(null), THEATER_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
      }
    } catch (error: any) {
      console.error('Error updating theater:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        setError(
          error.response
            ? `Server error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`
            : t('theaterAdmin.messages.updateError')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheater = (theaterId: string, theaterName: string) => {
    Modal.confirm({
      title: t('theaterAdmin.messages.deleteConfirmTitle', { defaultValue: 'Confirm Delete' }),
      content: t('theaterAdmin.messages.deleteConfirm', { name: theaterName }),
      okText: t('theaterAdmin.form.delete', { defaultValue: 'Delete' }),
      okType: 'danger',
      cancelText: t('theaterAdmin.form.cancel', { defaultValue: 'Cancel' }),
      onOk: async () => {
        try {
          setLoading(true);
          await deleteTheater(theaterId);
          await fetchTheaters();
          setError(null);
          setSuccessMessage(t('theaterAdmin.messages.deleteSuccess', { name: theaterName }));
          setTimeout(() => setSuccessMessage(null), THEATER_ADMIN_CONSTANTS.MESSAGES.SUCCESS_TIMEOUT);
        } catch (error: any) {
          console.error('Error deleting theater:', error);
          if (error.response?.status === 401) {
            window.location.href = '/login';
          } else {
            setError(
              error.response
                ? error.response.status === 404
                  ? t('theaterAdmin.messages.theaterNotFound')
                  : `Server error: ${error.response.status} - ${error.response.data.error || error.response.statusText}`
                : t('theaterAdmin.messages.deleteFailed')
            );
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const filteredTheaters = theaters.filter((theater) =>
    theater.theaterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationName(theater).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTheaters.length / theatersPerPage);

  return (
    <div className="theater-admin-page-container">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <TheaterAdmin
        theaters={filteredTheaters}
        locations={locations}
        loading={loading}
        error={error}
        setError={setError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theatersPerPage={theatersPerPage}
        totalPages={totalPages}
        newTheater={newTheater}
        setNewTheater={setNewTheater}
        selectedTheater={selectedTheater}
        setSelectedTheater={setSelectedTheater}
        onAddTheater={handleAddTheater}
        onUpdateTheater={handleUpdateTheater}
        onDeleteTheater={handleDeleteTheater}
      />
    </div>
  );
};

export default TheaterAdminPage; 