import axios from 'axios';
import type {
  ShowtimeResponseDTO,
  MovieResponseDTO,
  RoomResponseDTO,
  TheaterResponseDTO,
  ShowtimeListResponseDTO,
  CreateShowtimeRequestDTO,
  UpdateShowtimeRequestDTO
} from '../types/response/ScheduleManagementResponseDTO';
import { SCHEDULE_API_ENDPOINTS, API_QUERY_PARAMS } from '../constants/ScheduleManagementApiConst';
import { API_BASE_URL } from '../constants/ApiConst';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Showtime Management APIs
export const getShowtimes = async (page: number = API_QUERY_PARAMS.DEFAULT_PAGE, size: number = API_QUERY_PARAMS.DEFAULT_SIZE): Promise<ShowtimeListResponseDTO> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_SHOWTIMES, {
    params: { 
      [API_QUERY_PARAMS.PAGE_PARAM]: page, 
      [API_QUERY_PARAMS.SIZE_PARAM]: size 
    }
  });
  return response.data;
};

export const getShowtimeById = async (scheduleId: string): Promise<ShowtimeResponseDTO> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_SHOWTIME_BY_ID(scheduleId));
  return response.data;
};

export const createShowtime = async (payload: CreateShowtimeRequestDTO): Promise<ShowtimeResponseDTO> => {
  const response = await axiosInstance.post(SCHEDULE_API_ENDPOINTS.CREATE_SHOWTIME, payload);
  return response.data;
};

export const deleteShowtime = async (scheduleId: string): Promise<void> => {
  await axiosInstance.delete(SCHEDULE_API_ENDPOINTS.DELETE_SHOWTIME(scheduleId));
};

export const updateShowtime = async (scheduleId: string, payload: UpdateShowtimeRequestDTO): Promise<ShowtimeResponseDTO> => {
  const response = await axiosInstance.put(SCHEDULE_API_ENDPOINTS.UPDATE_SHOWTIME(scheduleId), payload);
  return response.data;
};

// Movie Management APIs
export const getMovies = async (): Promise<MovieResponseDTO[]> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_MOVIES, {
    params: { all: true }
  });
  // Handle both array and paginated responses
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.content)) {
    return data.content;
  } else {
    return [];
  }
};

export const getMovieById = async (movieId: string): Promise<MovieResponseDTO> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_MOVIE_BY_ID(movieId));
  return response.data;
};

// Room Management APIs
export const getRooms = async (): Promise<RoomResponseDTO[]> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_ROOMS);
  // Handle both array and paginated responses
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.content)) {
    return data.content;
  } else {
    return [];
  }
};

export const getRoomById = async (roomId: string): Promise<RoomResponseDTO> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_ROOM_BY_ID(roomId));
  return response.data;
};

// Theater Management APIs
export const getTheaters = async (): Promise<TheaterResponseDTO[]> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_THEATERS);
  // Handle both array and paginated responses
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.content)) {
    return data.content;
  } else {
    return [];
  }
};

export const getTheaterById = async (theaterId: string): Promise<TheaterResponseDTO> => {
  const response = await axiosInstance.get(SCHEDULE_API_ENDPOINTS.GET_THEATER_BY_ID(theaterId));
  return response.data;
};