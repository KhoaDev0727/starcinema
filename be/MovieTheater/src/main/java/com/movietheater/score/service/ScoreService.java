package com.movietheater.score.service;

import com.movietheater.score.dto.ScoreHistoryDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ScoreService {
    Page<ScoreHistoryDTO> getScoreHistory(Long userId, String type, Pageable pageable);
    long countScoreHistory(Long userId, String type);
}
