import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getSeatsBySchedule } from '../../services/BookingService';
import type { ScheduleSeatResponseDTO } from '../../types/response/BookingResponseDTO';
import { SEAT_TYPES, SEAT_STATUS, UI_CONSTANTS } from '../../constants/BookingConst';
import defaultScreen from '../../assets/img/bg-screen.png';

interface SeatSelectionProps {
  scheduleId: string;
  onSelectSeats: (seatIds: string[]) => void;
  onProceed: () => void;
}

const ToastNotification: React.FC<{
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showButtons?: boolean;
}> = ({ message, onClose, onConfirm, showButtons = false }) => {
  useEffect(() => {
    if (!showButtons) {
      const timer = setTimeout(onClose, UI_CONSTANTS.TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [onClose, showButtons]);

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <span className="toast-icon">⚠</span>
        <span className="toast-message">{message}</span>
        {showButtons ? (
          <div className="toast-buttons flex gap-2">
            <button
              className="toast-button bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
            >
              Proceed
            </button>
            <button
              className="toast-button bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className="toast-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const SeatSelection: React.FC<SeatSelectionProps> = ({
  scheduleId,
  onSelectSeats,
  onProceed,
}) => {
  const { t } = useTranslation();
  const [seats, setSeats] = useState<ScheduleSeatResponseDTO[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showConfirmButtons, setShowConfirmButtons] = useState<boolean>(false);

  useEffect(() => {
    // Fetch seats for the given schedule
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await getSeatsBySchedule(scheduleId);
        setSeats(response);
        setError(null);
      } catch (error) {
        console.error('Error loading seats:', error);
        setError(t('booking.errors.loadingFailed'));
      } finally {
        setLoading(false);
      }
    };
    
    if (scheduleId) {
      fetchSeats();
    } else {
      setError('No schedule selected.');
      setLoading(false);
    }
  }, [scheduleId, t]);

  const rows = Array.from(new Set(seats.map((seat) => seat.seatRow))).sort();
  const seatsByRow: { [key: string]: ScheduleSeatResponseDTO[] } = {};
  rows.forEach((row) => {
    seatsByRow[row] = seats
      .filter((seat) => seat.seatRow === row)
      .sort((a, b) => a.seatColumn - b.seatColumn);
  });

  // Validate seat selection for gaps or isolated seats
  const validateSeatSelection = useCallback(() => {
    if (selectedSeats.length === 0) return false;

    const selectedByRow = rows.reduce((acc, row) => {
      const rowSeats = seatsByRow[row].filter((seat) =>
        selectedSeats.includes(seat.scheduleSeatId)
      );
      if (rowSeats.length > 0) acc[row] = rowSeats;
      return acc;
    }, {} as { [key: string]: ScheduleSeatResponseDTO[] });

    for (const row in selectedByRow) {
      const rowSeats = selectedByRow[row].sort((a, b) => a.seatColumn - b.seatColumn);
      const columns = rowSeats.map((seat) => seat.seatColumn);
      const minCol = Math.min(...columns);
      const maxCol = Math.max(...columns);

      // Check for two seats with a gap in the middle
      if (rowSeats.length === 2 && maxCol - minCol > 1) {
        setToastMessage(
          t('booking.seatSelection.twoSeatGap', {
            defaultValue:
              'Your selection of 2 seats leaves a gap in the middle. This may inconvenience other customers. Do you want to proceed?',
          })
        );
        setShowConfirmButtons(true);
        return false; // Wait for user confirmation
      }

      // Check for gaps in other cases
      for (let col = minCol; col <= maxCol; col++) {
        if (!columns.includes(col)) {
          setToastMessage(t('booking.seatSelection.consecutiveSeats'));
          setShowConfirmButtons(false);
          return true; // Allow proceeding with warning
        }
      }

      // Check for isolated seats
      for (let i = 0; i < rowSeats.length; i++) {
        const currentCol = rowSeats[i].seatColumn;
        const prevCol = i > 0 ? rowSeats[i - 1].seatColumn : null;
        const nextCol = i < rowSeats.length - 1 ? rowSeats[i + 1].seatColumn : null;

        if (
          prevCol &&
          nextCol &&
          currentCol !== prevCol + 1 &&
          currentCol !== nextCol - 1
        ) {
          setToastMessage(t('booking.seatSelection.noIsolatedSeats'));
          setShowConfirmButtons(false);
          return true; // Allow proceeding with warning
        }
      }
    }
    return true;
  }, [selectedSeats, seatsByRow, rows, t]);

  const handleSeatClick = useCallback(
    (seatId: string, seatStatus: string) => {
      if (seatStatus !== SEAT_STATUS.AVAILABLE) return;

      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          const newSelection = prev.filter((id) => id !== seatId);
          onSelectSeats(newSelection);
          return newSelection;
        }

        const newSelection = [...prev, seatId];
        onSelectSeats(newSelection);
        return newSelection;
      });
    },
    [onSelectSeats]
  );

  const closeToast = () => {
    setSelectedSeats([]);
    onSelectSeats([]);
    setToastMessage(null);
    setShowConfirmButtons(false);
  };

  const handleProceed = () => {
    if (!validateSeatSelection()) {
      return;
    }
    onProceed();
  };

  const handleConfirm = () => {
    onProceed();
  };

  const getSeatClass = (seat: ScheduleSeatResponseDTO) => {
    if (selectedSeats.includes(seat.scheduleSeatId)) {
      return 'seat bg-blue-500';
    }
    
    if (seat.seatStatus === SEAT_STATUS.AVAILABLE) {
      return `seat ${seat.seatType.toLowerCase()} ${
        seat.seatType === SEAT_TYPES.VIP ? 'bg-pink-500' : 'bg-green-500'
      }`;
    }
    
    return 'seat bg-gray-600';
  };

  return (
    <main className="max-w-[960px] mx-auto px-4 pb-10">
      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          onClose={closeToast}
          onConfirm={showConfirmButtons ? handleConfirm : undefined}
          showButtons={showConfirmButtons}
        />
      )}
      <div className="header-main">
        <h1 className="text-xl font-normal m-0">{t('booking.seatSelection.title')}</h1>
      </div>
      <hr className="border-t border-black mb-6" />
      
      {loading && (
        <p className="text-[#666666] text-center animate-pulse">
          {t('booking.seatSelection.loading')}
        </p>
      )}
      
      {error && (
        <p className="text-[#b91c1c] text-center font-medium">{error}</p>
      )}
      
      {!loading && seats.length === 0 && !error && (
        <p className="text-[#666666] text-center">
          {t('booking.seatSelection.noSeats')}
        </p>
      )}
      
      {seats.length > 0 && (
        <>
          <img
            src={defaultScreen}
            alt={t('booking.seatSelection.screen')}
            className="screen w-full max-w-3xl h-12 object-cover mb-8"
          />
          <div className="seat-grid max-w-3xl mx-auto">
            {rows.map((row) => (
              <div key={row} className="seat-row flex items-center gap-2 mb-2">
                <span className="w-8 text-right font-bold text-[#666666]">{row}</span>
                {seatsByRow[row].map((seat) => (
                  <div
                    key={seat.scheduleSeatId}
                    className={`${getSeatClass(seat)} w-10 h-10 flex items-center justify-center text-sm font-medium rounded-md cursor-pointer`}
                    onClick={() => handleSeatClick(seat.scheduleSeatId, seat.seatStatus)}
                    title={`${seat.seatType} Seat ${seat.seatRow}${seat.seatColumn}`}
                  >
                    {seat.seatStatus !== SEAT_STATUS.AVAILABLE ? 'X' : seat.seatColumn}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="legend flex justify-center gap-4 mt-6 flex-wrap">
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color bg-blue-500 w-6 h-6 rounded-md"></div>
              <span className="text-[#666666]">{t('booking.seatSelection.selected')}</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color bg-green-500 w-6 h-6 rounded-md"></div>
              <span className="text-[#666666]">{t('booking.seatSelection.normal')}</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color bg-pink-500 w-6 h-6 rounded-md"></div>
              <span className="text-[#666666]">{t('booking.seatSelection.vip')}</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <div className="legend-color bg-gray-600 w-6 h-6 rounded-md flex items-center justify-center text-white">
                X
              </div>
              <span className="text-[#666666]">{t('booking.seatSelection.booked')}</span>
            </div>
          </div>
          <div className="btns justify-center mt-6">
            <button
              className="btn-ticket"
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
            >
              {t('booking.seatSelection.proceedToBooking')}
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default SeatSelection;