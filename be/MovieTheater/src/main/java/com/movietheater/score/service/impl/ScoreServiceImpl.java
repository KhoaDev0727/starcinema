package com.movietheater.score.service.impl;

import com.movietheater.score.dto.ScoreHistoryDTO;
import com.movietheater.score.service.ScoreService;
import com.movietheater.entity.Score;
import com.movietheater.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;

@Service
@RequiredArgsConstructor
public class ScoreServiceImpl implements ScoreService {

    private final ScoreRepository scoreRepository;

    @Override
    public Page<ScoreHistoryDTO> getScoreHistory(Long userId, String type, Pageable pageable) {
        List<Score> scores;
        if (type == null || type.isEmpty()) {
            scores = scoreRepository.findByUserIdOrderByTransactionDateDesc(userId);
        } else {
            scores = scoreRepository.findByUserIdAndTypeOrderByTransactionDateDesc(userId, type);
        }
        List<ScoreHistoryDTO> dtos = scores.stream().map(this::toDto).collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());
        List<ScoreHistoryDTO> pageContent = dtos.subList(start, end);
        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    private ScoreHistoryDTO toDto(Score score) {
        return new ScoreHistoryDTO(
            score.getScoreId(),
            score.getUser().getId(),
            score.getTicket() != null ? score.getTicket().getTicketId() : null,
            score.getPoints(),
            score.getTransactionDate(),
            score.getType()
        );
    }

    @Override
    public long countScoreHistory(Long userId, String type) {
        if (type == null || type.isEmpty()) {
            return scoreRepository.findByUserIdOrderByTransactionDateDesc(userId).size();
        } else {
            return scoreRepository.findByUserIdAndTypeOrderByTransactionDateDesc(userId, type).size();
        }
    }
}
