export interface MovieListRequestDTO {
  // Có thể mở rộng trong tương lai nếu cần filter
}

export interface ScheduleRequestDTO {
  movieId?: string;
  theaterId?: string;
  date?: string;
}

export interface SeatRequestDTO {
  scheduleId: string;
}

export interface BookingConfirmationRequestDTO {
  userId: string;
  scheduleId: string;
  seatIds: string[];
  promotionId?: string | null;
}

export interface BookingDetailsRequestDTO {
  movieId?: string;
  scheduleId: string;
} 