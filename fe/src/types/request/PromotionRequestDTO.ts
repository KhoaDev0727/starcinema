export interface PromotionRequestDTO {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  discount: number;
  description?: string;
  imageUrl?: string;
} 