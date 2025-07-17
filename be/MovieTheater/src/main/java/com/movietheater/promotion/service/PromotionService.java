package com.movietheater.promotion.service;

import com.movietheater.promotion.dto.PromotionDTO;
import com.movietheater.entity.Promotion;

import java.util.List;

public interface PromotionService {
    List<Promotion> getAllPromotions();
    Promotion getPromotionById(String id);
    Promotion addPromotion(PromotionDTO dto);
    Promotion updatePromotion(String id, PromotionDTO dto);
    void deletePromotion(String id);
}
