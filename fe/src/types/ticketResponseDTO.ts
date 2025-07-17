export interface TicketResponseDTO {
  ticketId: string;
  userId: number;
  userName: string;
  movieId: string;
  movieTitle: string;
  theaterName: string;
  theaterAddress: string;
  roomName: string;
  seatId: string;
  showtime: string; // ISO string
  price: number;
  bookingDate: string;
  status: "PAID" | "PENDING" | "CANCELLED" | string;
}
