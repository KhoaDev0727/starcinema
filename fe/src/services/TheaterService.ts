import axios from 'axios';
import type { TheaterResponseDTO, LocationDTO } from '../types/response/TheaterResponseDTO';
import type { TheaterCreateRequestDTO, TheaterUpdateRequestDTO } from '../types/request/TheaterRequestDTO';
import THEATER_ADMIN_CONSTANTS from '../constants/TheaterAdminConst';

// Get all theaters
export const getTheaters = async (): Promise<TheaterResponseDTO[]> => {
  const response = await axios.get(THEATER_ADMIN_CONSTANTS.API.BASE_URL, {
    withCredentials: true,
  });
  return response.data.content || response.data;
};

// Get all locations
export const getLocations = async (): Promise<LocationDTO[]> => {
  const response = await axios.get(THEATER_ADMIN_CONSTANTS.API.LOCATIONS_URL, {
    withCredentials: true,
  });
  return response.data;
};

// Create new theater
export const createTheater = async (theaterData: TheaterCreateRequestDTO): Promise<TheaterResponseDTO> => {
  const response = await axios.post(THEATER_ADMIN_CONSTANTS.API.BASE_URL, theaterData, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return response.data;
};

// Update theater
export const updateTheater = async (theaterId: string, theaterData: TheaterUpdateRequestDTO): Promise<TheaterResponseDTO> => {
  const response = await axios.put(`${THEATER_ADMIN_CONSTANTS.API.BASE_URL}/${theaterId}`, theaterData, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return response.data;
};

// Delete theater
export const deleteTheater = async (theaterId: string): Promise<void> => {
  await axios.delete(`${THEATER_ADMIN_CONSTANTS.API.BASE_URL}/${theaterId}`, {
    withCredentials: true,
  });
}; 