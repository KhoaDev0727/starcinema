package com.movietheater.promotion.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PromotionDTO {
    private String id;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double discount;
    private String description;
    private String imageUrl;
}