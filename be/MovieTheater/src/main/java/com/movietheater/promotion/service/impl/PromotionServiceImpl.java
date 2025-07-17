package com.movietheater.promotion.service.impl;

import com.movietheater.promotion.dto.PromotionDTO;
import com.movietheater.entity.Promotion;
import com.movietheater.repository.PromotionRepository;
import com.movietheater.promotion.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Autowired
    public PromotionServiceImpl(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @Override
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll(Sort.by("startTime").ascending());
    }

    @Override
    public Promotion getPromotionById(String id) {
        return promotionRepository.findById(id)
        		.orElseThrow(() -> new RuntimeException("Promotion not found"));
    }

    @Override
    public Promotion addPromotion(PromotionDTO dto) {
        Promotion promotion = new Promotion();
        String maxId = promotionRepository.findMaxPromotionId();
        String newId = "PR001";
        if (maxId != null && maxId.matches("PR\\d{3}")) {
            int num = Integer.parseInt(maxId.substring(2));
            newId = String.format("PR%03d", num + 1);
        }
        promotion.setId(newId);
        promotion.setTitle(dto.getTitle());
        promotion.setStartTime(dto.getStartTime());
        promotion.setEndTime(dto.getEndTime());
        promotion.setDiscount(dto.getDiscount());
        promotion.setDescription(dto.getDescription());
        promotion.setImageUrl(dto.getImageUrl());
        return promotionRepository.save(promotion);
    }

    @Override
    public Promotion updatePromotion(String id, PromotionDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotion.setTitle(dto.getTitle());
        promotion.setStartTime(dto.getStartTime());
        promotion.setEndTime(dto.getEndTime());
        promotion.setDiscount(dto.getDiscount());
        promotion.setDescription(dto.getDescription());
        promotion.setImageUrl(dto.getImageUrl());
        return promotionRepository.save(promotion);
    }

    @Override
    public void deletePromotion(String id) {
        try {
            promotionRepository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new RuntimeException("Không thể xóa khuyến mãi vì đang được sử dụng ở nơi khác.");
        }
    }
}
