package com.movietheater.score.controller;

import com.movietheater.score.dto.ScoreHistoryDTO;
import com.movietheater.score.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @GetMapping("/history")
    public ResponseEntity<Page<ScoreHistoryDTO>> getScoreHistory(
            @RequestParam Long userId,
            @RequestParam(required = false) String type,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(scoreService.getScoreHistory(userId, type, pageable));
    }

    @GetMapping("/history/count")
    public ResponseEntity<Long> countScoreHistory(
            @RequestParam Long userId,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(scoreService.countScoreHistory(userId, type));
    }
}
