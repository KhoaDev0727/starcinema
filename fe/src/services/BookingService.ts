import axios from 'axios';
import type { 
  MovieListRequestDTO,
  ScheduleRequestDTO,
  SeatRequestDTO,
  BookingConfirmationRequestDTO,
  BookingDetailsRequestDTO
} from '../types/request/BookingRequestDTO';
import type {
  MovieResponseDTO,
  ScheduleResponseDTO,
  ScheduleSeatResponseDTO,
  BookingResponseDTO
} from '../types/response/BookingResponseDTO';
import { API_BASE_URL } from '../constants/ApiConst';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Movie APIs
export const getMovieList = async (): Promise<MovieResponseDTO[]> => {
  const response = await axiosInstance.get('/api/book/v1/movie');
  return response.data;
};

export const getMovieById = async (movieId: string): Promise<MovieResponseDTO> => {
  const response = await axiosInstance.get(`/api/book/v1/movie/${movieId}`);
  return response.data;
};

// Schedule APIs
export const getSchedulesByMovie = async (movieId: string): Promise<ScheduleResponseDTO[]> => {
  const response = await axiosInstance.get(`/api/book/v1/schedule/${movieId}`);
  return response.data;
};

export const getSchedulesByTheater = async (theaterId: string): Promise<ScheduleResponseDTO[]> => {
  const response = await axiosInstance.get(`/api/schedules/theater/${theaterId}`);
  return response.data;
};

export const getScheduleById = async (scheduleId: string): Promise<ScheduleResponseDTO> => {
  const response = await axiosInstance.get(`/api/book/v1/schedule/id/${scheduleId}`);
  return response.data;
};

// Seat APIs
export const getSeatsBySchedule = async (scheduleId: string): Promise<ScheduleSeatResponseDTO[]> => {
  const response = await axiosInstance.get(`/api/book/v1/seat/${scheduleId}`);
  return response.data;
};

// Booking APIs
export const confirmBooking = async (payload: BookingConfirmationRequestDTO): Promise<BookingResponseDTO[]> => {
  const response = await axiosInstance.post('/api/book/v1/confirm', payload);
  return Array.isArray(response.data) ? response.data : [response.data];
}; 

// Cancel Booking API
export const cancelBooking = async (bookingId: string): Promise<any> => {
  const response = await axiosInstance.delete(`/api/book/v1/bookings/${bookingId}`);
  return response.data;
}; 