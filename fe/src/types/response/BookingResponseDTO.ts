export interface MovieResponseDTO {
  movieId: string;
  title: string;
  shortDescription: string;
  description: string;
  director: string;
  actors: string;
  genre: string;
  releaseDate: string;
  duration: number;
  language: string;
  rated: string;
  posterUrl?: string;
  ratingLabel?: string;
  ranking?: number;
  likes?: number;
}

export interface ScheduleResponseDTO {
  scheduleId: string;
  movieId: string;
  movieTitle?: string;
  roomId: string;
  theaterId: string;
  showtime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  posterUrl?: string;
}

export interface ScheduleSeatResponseDTO {
  scheduleSeatId: string;
  scheduleId: string;
  seatRow: string;
  seatColumn: number;
  seatType: string;
  seatStatus: string;
}

export interface BookingResponseDTO {
  bookingId: string;
  userId: string;
  scheduleId: string;
  seatId: string;
  bookingDate: string;
  status: string;
  promotionId?: string;
  price: number;
}

export interface BookingSuccessResponseDTO {
  bookings: BookingResponseDTO[];
  movieTitle: string;
  posterUrl: string;
} 