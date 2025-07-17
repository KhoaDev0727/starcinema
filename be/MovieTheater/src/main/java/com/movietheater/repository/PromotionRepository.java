package com.movietheater.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.movietheater.entity.Promotion;
import org.springframework.data.jpa.repository.Query;

public interface PromotionRepository extends JpaRepository<Promotion, String> {
    Page<Promotion> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query(value = "SELECT promotion_id FROM promotions WHERE promotion_id LIKE 'PR%' ORDER BY promotion_id DESC LIMIT 1", nativeQuery = true)
    String findMaxPromotionId();

    long count();

    long countByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(java.time.LocalDateTime now1, java.time.LocalDateTime now2);
}