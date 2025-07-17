export interface PromotionResponseDTO {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  discount: number;
  description?: string;
  imageUrl?: string;
}

export interface PromotionListResponseDTO {
  data: PromotionResponseDTO[];
  message?: string;
  status?: string;
} 