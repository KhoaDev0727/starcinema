package com.movietheater.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.movietheater.entity.Score;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findByUserIdOrderByTransactionDateDesc(Long userId);
    List<Score> findByUserIdAndTypeOrderByTransactionDateDesc(Long userId, String type);
}
