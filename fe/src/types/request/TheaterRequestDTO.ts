export interface TheaterCreateRequestDTO {
  theaterName: string;
  locationId: string;
  phoneNumber?: string;
}

export interface TheaterUpdateRequestDTO {
  theaterName?: string;
  locationId?: string;
  phoneNumber?: string;
} 