export interface ShowtimeResponseDTO {
  scheduleId: string;
  movieTitle: string;
  showtime: string;
  roomName: string;
  status: string;
  movieId?: string;
  roomId?: string;
  theaterId?: string;
  price?: number;
  totalSeats?: number;
  availableSeats?: number;
}

export interface MovieResponseDTO {
  movieId: string;
  title: string;
  shortDescription?: string;
  description?: string;
  director?: string;
  actors?: string;
  genre?: string;
  releaseDate?: string;
  duration?: number;
  language?: string;
  rated?: string;
  posterUrl?: string;
  ratingLabel?: string;
  ranking?: number;
  likes?: number;
}

export interface RoomResponseDTO {
  roomId: string;
  roomName: string;
  theaterId?: string;
  totalSeats?: number;
  roomType?: string;
  status?: string;
}

export interface TheaterResponseDTO {
  theaterId: string;
  theaterName: string;
  phoneNumber?: string;
  location?: {
    locationId: string;
    locationName: string;
  };
  locationId?: string; // For backward compatibility
  locationName?: string; // For backward compatibility
  address?: string;
  email?: string;
  status?: string;
}

export interface ShowtimeListResponseDTO {
  content: ShowtimeResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreateShowtimeRequestDTO {
  movieId: string;
  roomId: string;
  theaterId: string;
  showtime: string;
  price: number;
}

export interface UpdateShowtimeRequestDTO {
  movieId: string;
  roomId: string;
  theaterId: string;
  showtime: string;
  price: number;
}