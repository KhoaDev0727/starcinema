export interface LocationDTO {
  locationId: string;
  locationName: string;
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