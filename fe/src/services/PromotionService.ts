import axios from 'axios';
import { ENV_CONFIG } from '../config/env';
import { PROMOTION_ENDPOINTS } from '../constants/PromotionConst';
import type { PromotionRequestDTO } from '../types/request/PromotionRequestDTO';
import type { PromotionResponseDTO, PromotionListResponseDTO } from '../types/response/PromotionResponseDTO';

const API_URL = `${ENV_CONFIG.API_BASE_URL}`;

export class PromotionService {
  static async getAllPromotions(): Promise<PromotionResponseDTO[]> {
    try {
      const response = await axios.get<PromotionResponseDTO[]>(`${API_URL}${PROMOTION_ENDPOINTS.GET_ALL}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  }

  static async getPromotionById(id: string): Promise<PromotionResponseDTO> {
    try {
      const response = await axios.get<PromotionResponseDTO>(`${API_URL}${PROMOTION_ENDPOINTS.GET_BY_ID}/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  }

  static async createPromotion(promotionData: PromotionRequestDTO): Promise<PromotionResponseDTO> {
    try {
      const response = await axios.post<PromotionResponseDTO>(`${API_URL}${PROMOTION_ENDPOINTS.CREATE}`, promotionData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  static async updatePromotion(id: string, promotionData: PromotionRequestDTO): Promise<PromotionResponseDTO> {
    try {
      const response = await axios.put<PromotionResponseDTO>(`${API_URL}${PROMOTION_ENDPOINTS.UPDATE}/${id}`, promotionData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  static async deletePromotion(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}${PROMOTION_ENDPOINTS.DELETE}/${id}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }
} 