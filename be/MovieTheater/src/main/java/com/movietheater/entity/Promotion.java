package com.movietheater.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "PROMOTIONS") 
@Data
public class Promotion {
    @Id
    @Column(name = "PROMOTION_ID") 
    @NotBlank(message = "Promotion ID cannot be empty") 
    private String id; 

    @NotBlank(message = "Title cannot be empty")
    @Column(name = "TITLE")
    private String title;

    @NotNull(message = "Start time cannot be empty")
    @Column(name = "START_TIME")
    private LocalDateTime startTime;

    @NotNull(message = "End time cannot be empty")
    @Column(name = "END_TIME")
    private LocalDateTime endTime; 

    @Positive(message = "Discount must be positive")
    @Column(name = "DISCOUNT")
    private Double discount; 

    @Column(name = "DESCRIPTION")
    private String description; 
    @Column(name = "IMAGE_URL")
    private String imageUrl;
}